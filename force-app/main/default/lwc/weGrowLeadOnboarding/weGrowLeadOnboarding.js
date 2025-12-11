import { LightningElement, track } from 'lwc';

export default class WeGrowOnboarding extends LightningElement {
    @track step = 1;
    @track userPrompt = '';
    @track selectedSpace = {};
    @track customerInfo = { company: '', name: '', phone: '', email: '' };
    @track isMeeting = false;
    
    // Step 6 라디오 버튼 상태
    @track isEmailSelected = true;
    @track isMeetingSelected = false;

    // 단계별 Getter (HTML에서 if:true로 사용)
    get isStep1() { return this.step === 1; }
    get isStep2() { return this.step === 2; }
    get isStep3() { return this.step === 3; }
    get isStep4() { return this.step === 4; }
    get isStep5() { return this.step === 5; }
    get isStep6() { return this.step === 6; }
    get isStep7() { return this.step === 7; }
    
    // Step 4~7에서 상세 배경 표시 여부
    get isDetailView() {
        return this.step >= 4 && this.step <= 7;
    }
    
    // 헤더 표시 여부 (Step 1, 2, 3에서만)
    get showHeader() {
        return this.step >= 1 && this.step <= 3;
    }

    // Mock Data: 추천 공간 리스트 (새로운 디자인에 맞게 업데이트)
    recommendations = [
        {
            id: '1',
            name: '강남 본점 프라임 스위트',
            location: '서울 강남구 테헤란로',
            priceNumber: '2,400,000',
            capacityNumber: '4',
            matchRate: 99,
            tags: ['도심 전망', '프라이빗', '스마트 보안'],
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            description: '테헤란로의 스카이라인을 독점하는 4인 전용 프라이빗 오피스입니다. 24시간 스마트 보안 시스템과 시디즈 에르고노믹 가구가 완비되어 있어, 팀의 몰입을 위한 최적의 환경을 제공합니다. 강남역 1번 출구와 직통 연결됩니다.',
            amenities: [
                { name: '도심 전망' },
                { name: '프라이빗' },
                { name: '스마트 보안' },
                { name: '24시간 보안' }
            ]
        },
        {
            id: '2',
            name: '성수 크리에이티브 로프트',
            location: '서울 성동구 연무장길',
            priceNumber: '3,200,000',
            capacityNumber: '6',
            matchRate: 98,
            tags: ['4m 층고', '스튜디오', '반려동물 동반'],
            imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
            description: '성수동 핫플레이스에 위치한 크리에이티브 스튜디오입니다. 4m의 높은 층고와 대형 창문으로 자연광이 풍부하며, 반려동물과 함께 출근할 수 있는 펫프렌들리 공간입니다.',
            amenities: [
                { name: '4m 층고' },
                { name: '스튜디오' },
                { name: '반려동물 동반' },
                { name: '자연광' }
            ]
        },
        {
            id: '3',
            name: '여의도 이그제큐티브 허브',
            location: '서울 영등포구 여의대로',
            priceNumber: '5,500,000',
            capacityNumber: '10',
            matchRate: 97,
            tags: ['한강 뷰', '임원실 포함', '프리미엄'],
            imageUrl: 'https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=800&q=80',
            description: '여의도 금융 중심가에 위치한 프리미엄 이그제큐티브 오피스입니다. 한강 파노라마 뷰와 임원 전용 회의실이 포함되어 있으며, VIP 고객 응대를 위한 최상의 환경을 제공합니다.',
            amenities: [
                { name: '한강 뷰' },
                { name: '임원실 포함' },
                { name: '프리미엄' },
                { name: 'VIP 라운지' }
            ]
        }
    ];

    // [STEP 1] 태그 클릭 핸들러
    handleTagClick(event) {
        const tag = event.currentTarget.dataset.tag;
        this.userPrompt = tag;
    }

    // [STEP 1 -> 2] 프롬프트 입력 및 AI 로딩 시작
    handlePromptInput(event) {
        this.userPrompt = event.target.value;
    }

    goToStep2() {
        if (!this.userPrompt) {
            this.userPrompt = '강남역 채광 좋은 4인실 찾아줘';
        }
        this.step = 2;
        
        // 2.5초 후 자동으로 결과 페이지(Step 3)로 이동 (AI 분석 시뮬레이션)
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

    // 모달 클릭 전파 중지
    stopPropagation(event) {
        event.stopPropagation();
    }

    // [STEP 4 -> 3] 뒤로 가기
    goBackToStep3() {
        this.step = 3;
    }
    
    // [STEP 5 -> 4] 뒤로 가기
    goToStep4() {
        this.step = 4;
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
        this.step = 6;
    }
    
    // [STEP 6] 라디오 버튼 선택
    selectEmailOption() {
        this.isEmailSelected = true;
        this.isMeetingSelected = false;
    }
    
    selectMeetingOption() {
        this.isEmailSelected = false;
        this.isMeetingSelected = true;
    }

    // [STEP 6 -> 7] 폼 제출
    submitForm() {
        this.isMeeting = this.isMeetingSelected;
        this.step = 7;
    }

    // [STEP 7] 리셋
    resetProcess() {
        this.step = 1;
        this.userPrompt = '';
        this.customerInfo = { company: '', name: '', phone: '', email: '' };
        this.isEmailSelected = true;
        this.isMeetingSelected = false;
    }
}