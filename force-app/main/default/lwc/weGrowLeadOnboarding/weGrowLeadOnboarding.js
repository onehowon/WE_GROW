import { LightningElement, track } from 'lwc';

export default class WeGrowOnboarding extends LightningElement {
    @track step = 1;
    @track userPrompt = '';
    @track selectedSpace = {};
    @track customerInfo = { company: '', name: '', phone: '', email: '' };
    @track isMeeting = false;

    // 단계별 Getter (HTML에서 if:true로 사용)
    get isStep1() { return this.step === 1; }
    get isStep2() { return this.step === 2; }
    get isStep3() { return this.step === 3; }
    get isStep4() { return this.step === 4; }
    get isStep5() { return this.step === 5; }
    get isStep6() { return this.step === 6; }
    get isStep7() { return this.step === 7; }

    // Mock Data: 추천 공간 리스트
    recommendations = [
        {
            id: '1', name: '강남 1호점 301호', location: '서울 강남구 역삼로',
            price: '월 550만원', size: '20인실', capacity: '20~25명',
            matchRate: 98, tags: ['창가', '개별냉난방', '즉시입주'],
            bgStyle: 'background-image: url("https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80");'
        },
        {
            id: '2', name: '성수 2호점 201호', location: '서울 성동구 아차산로',
            price: '월 500만원', size: '25인실', capacity: '20~30명',
            matchRate: 95, tags: ['높은 층고', '스튜디오', '카페테리아'],
            bgStyle: 'background-image: url("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80");'
        },
        {
            id: '3', name: '판교 1호점 505호', location: '경기 성남시 분당구',
            price: '월 520만원', size: '20인실', capacity: '20명',
            matchRate: 92, tags: ['IT특화', '보안철저', '주차편리'],
            bgStyle: 'background-image: url("https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=500&q=80");'
        }
    ];

    // [STEP 1 -> 2] 프롬프트 입력 및 AI 로딩 시작
    handlePromptInput(event) {
        this.userPrompt = event.target.value;
    }

    goToStep2() {
        if (!this.userPrompt) {
            // 간단한 유효성 검사 (실제론 Toast 사용 권장)
            // alert('원하시는 조건을 입력해주세요.'); // UX상 생략 가능
            this.userPrompt = '강남역 근처, 20명...'; // Default 값
        }
        this.step = 2;
        
        // 2초 후 자동으로 결과 페이지(Step 3)로 이동 (AI 분석 시뮬레이션)
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.step = 3;
        }, 2500);
    }

    // [STEP 3 -> 4] 카드 클릭 시 상세 페이지 이동
    handleCardClick(event) {
        const spaceId = event.currentTarget.dataset.id;
        this.selectedSpace = this.recommendations.find(s => s.id === spaceId);
        this.step = 4;
    }

    // [STEP 4 -> 3] 뒤로 가기
    goBackToStep3() {
        this.step = 3;
    }

    // [STEP 4 -> 5] 견적 신청
    goToStep5() {
        this.step = 5;
    }

    // [STEP 5] 입력 핸들링
    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.customerInfo[field] = event.target.value;
    }

    goToStep6() {
        // 유효성 검사 생략 (블랙박스 테스트용 빠른 진행)
        this.step = 6;
    }

    // [STEP 6 -> 7] 최종 선택 (이메일 vs 미팅)
    handleFinalChoice(event) {
        const type = event.currentTarget.dataset.type;
        this.isMeeting = (type === 'meeting');
        this.step = 7;
    }

    // [STEP 7] 리셋
    resetProcess() {
        this.step = 1;
        this.userPrompt = '';
        this.customerInfo = { company: '', name: '', phone: '', email: '' };
    }
}