import { LightningElement, track } from 'lwc';
import findOffices from '@salesforce/apex/WeGrowController.findOffices';

export default class WeGrowOnboarding extends LightningElement {
    @track step = 1;
    @track userPrompt = '';
    @track selectedSpace = {};
    @track recommendations = [];

    // 단계별 Getter
    get isStep1() { return this.step === 1; }
    get isStep2() { return this.step === 2; }
    get isStep3() { return this.step === 3; }
    get isStep4() { return this.step === 4; }
    get isStep5() { return this.step === 5; }
    // Step 6는 플로 내부 로직으로 대체되므로 건너뜀.
    get isStep7() { return this.step === 7; } 
    
    get isDetailView() { return this.step === 4; }
    get showHeader() { return this.step >= 1 && this.step <= 3; }
    
    // 결과가 있는지 확인
    get hasResults() { return this.recommendations && this.recommendations.length > 0; }

    // [STEP 1] 태그 클릭
    handleTagClick(event) {
        this.userPrompt = event.currentTarget.dataset.tag;
    }

    // [STEP 1] 입력 감지
    handlePromptInput(event) {
        this.userPrompt = event.target.value;
    }

    // [STEP 1 -> 2 -> 3] 검색 실행 (Apex 연결)
    goToStep2() {
    if (!this.userPrompt) this.userPrompt = '강남';
    this.step = 2;

    // ★ 안정적인 오피스 이미지 URL 모음 (무료 이미지 사이트 Pexels/Unsplash 고정 링크)
    const OFFICE_IMAGES = [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', // 깔끔한 오피스
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', // 로프트 스타일
        'https://images.unsplash.com/photo-1504384308090-c54be3852f33?auto=format&fit=crop&w=800&q=80', // CEO실 느낌
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80', // 밝은 회의실
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80'  // 모던한 라운지
    ];

    findOffices({ keyword: this.userPrompt })
        .then(result => {
            this.recommendations = result.map((asset, index) => {
                return {
                    id: asset.Id,
                    name: asset.Name,
                    location: asset.Branch_Account__r ? asset.Branch_Account__r.Name : '위치 정보 없음',
                    priceNumber: asset.Price ? asset.Price.toLocaleString() : '문의',
                    capacityNumber: asset.Capacity__c ? asset.Capacity__c : '-',
                    matchRate: 99 - index,
                    
                    // ★ 핵심 수정: 순서대로 이미지 가져오기 (index % 길이)
                    imageUrl: OFFICE_IMAGES[index % OFFICE_IMAGES.length],
                    
                    description: asset.Description || '상세 설명이 준비되지 않았습니다.',
                    amenities: [{name:'24시간 보안'}, {name:'초고속 인터넷'}, {name:'라운지 이용'}]
                };
            });
            
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this.step = 3; }, 1500);
        })
        .catch(error => {
            console.error('Search Error:', error);
            this.recommendations = [];
            this.step = 3;
        });
}

    // [STEP 3 -> 4] 상세 보기
    handleCardClick(event) {
        const spaceId = event.currentTarget.dataset.id;
        this.selectedSpace = this.recommendations.find(s => s.id === spaceId);
        this.step = 4;
    }

    stopPropagation(event) { event.stopPropagation(); }
    goBackToStep3() { this.step = 3; }
    goToStep4() { this.step = 4; }

    // [STEP 4 -> 5] 신청하기 (플로 열기)
    goToStep5() { this.step = 5; }

    //플로에 넘겨줄 변수 (오피스 이름)
    get flowInputVariables() {
        return [
            {
                name: 'InterestAsset', // 플로의 입력 변수 API 이름
                type: 'String',
                value: this.selectedSpace.name // 현재 보고 있는 오피스 이름
            }
        ];
    }

    //플로 완료 감지 (Step 5 -> 7)
    // Step 6(추가 옵션) 기능은 Flow가 데이터를 처리하므로 생략하고 성공 화면으로 갑니다.
    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.step = 7;
        }
    }

    // 처음으로
    resetProcess() {
        this.step = 1;
        this.userPrompt = '';
        this.recommendations = [];
    }
}