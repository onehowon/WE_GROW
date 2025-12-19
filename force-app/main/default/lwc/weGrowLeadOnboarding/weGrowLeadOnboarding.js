import { LightningElement, track } from 'lwc';
// Apex 메서드 import (클래스명: WeGrowController, 메서드명: findOffices)
import findOffices from '@salesforce/apex/WeGrowController.findOffices';
// 한국 지도 Static Resource
import KOREA_MAP from '@salesforce/resourceUrl/koreaMap';

export default class WeGrowOnboarding extends LightningElement {
    @track step = 1;
    @track currentPage = 'home'; // home, locations, products, about
    @track userPrompt = '';
    @track selectedSpace = {};
    @track recommendations = [];

    // 한국 지도 이미지 URL
    get koreaMapUrl() { return KOREA_MAP; }

    // ============================================
    // 페이지 표시 Getters
    // ============================================
    get isHomePage() { return this.currentPage === 'home'; }
    get isLocationsPage() { return this.currentPage === 'locations'; }
    get isProductsPage() { return this.currentPage === 'products'; }
    get isAboutPage() { return this.currentPage === 'about'; }

    // [Getter] 단계별 화면 표시 여부 (홈 페이지 내에서만)
    get isStep1() { return this.isHomePage && this.step === 1; } // 검색어 입력
    get isStep2() { return this.isHomePage && this.step === 2; } // 로딩 중
    get isStep3() { return this.isHomePage && this.step === 3; } // 결과 목록
    get isStep4() { return this.isHomePage && this.step === 4; } // 상세 보기
    get isStep5() { return this.isHomePage && this.step === 5; } // Flow(신청) 모달
    // Step 6는 건너뜀 (Flow 내부 처리)
    get isStep7() { return this.isHomePage && this.step === 7; } // 완료 화면
    
    get isDetailView() { return this.isHomePage && this.step === 4; }
    get showAIStatus() { return this.isHomePage && this.step >= 1 && this.step <= 3; }
    
    // 네비게이션 활성화 클래스
    get locationsNavClass() { return `nav-btn ${this.currentPage === 'locations' ? 'active' : ''}`; }
    get productsNavClass() { return `nav-btn ${this.currentPage === 'products' ? 'active' : ''}`; }
    get aboutNavClass() { return `nav-btn ${this.currentPage === 'about' ? 'active' : ''}`; }
    
    // 결과가 있는지 확인 (결과 없으면 안내 문구 표시용)
    get hasResults() { return this.recommendations && this.recommendations.length > 0; }

    // [STEP 1] 태그 클릭 핸들러
    handleTagClick(event) {
        this.userPrompt = event.currentTarget.dataset.tag;
    }

    // [STEP 1] 검색어 입력 핸들러
    handlePromptInput(event) {
        this.userPrompt = event.target.value;
    }

    // [STEP 1] Enter 키 입력 핸들러
    handleKeyPress(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.goToStep2();
        }
    }

    // [HELPER] 인원수 추출 - Capacity__c 필드 또는 이름에서 파싱
    // 예: "강남본점 301호 (4인실 오피스)" → 4
    // 예: "1001호 (14인실 중형)" → 14
    extractCapacity(capacityField, assetName) {
        // 1. Capacity__c 필드가 있으면 사용
        if (capacityField) {
            return capacityField;
        }
        
        // 2. 이름에서 (n인실) 패턴 추출
        if (assetName) {
            const match = assetName.match(/\((\d+)인실/);
            if (match && match[1]) {
                return parseInt(match[1], 10);
            }
        }
        
        // 3. 못 찾으면 랜덤하게 6 또는 8 할당
        const fallbackOptions = [6, 8];
        return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    }

    // [STEP 1 -> 2 -> 3] 검색 실행 (Apex 연결)
    goToStep2() {
        // 검색어가 비어있으면 기본값으로 '강남' 설정 (테스트 편의성)
        if (!this.userPrompt) this.userPrompt = '강남';
        this.step = 2; // 로딩 화면으로 전환

        // ★ 요청하신 5개 목업 이미지 (순서대로 순환)
        const OFFICE_IMAGES = [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80'
        ];

        // Apex 호출
        findOffices({ keyword: this.userPrompt })
            .then(result => {
                // 가져온 Asset 데이터를 화면에 맞게 변환 (Mapping)
                this.recommendations = result.map((asset, index) => {
                    return {
                        id: asset.Id,
                        name: asset.Name,
                        
                        // [중요] 지점명: Asset(자산) -> Account(지점) 관계 필드 참조
                        location: asset.Branch_Account__r ? asset.Branch_Account__r.Name : '위치 정보 없음',
                        
                        // 가격: Asset의 Price 필드 (3자리 콤마 포맷팅)
                        priceNumber: asset.Price ? asset.Price.toLocaleString() : '문의',
                        
                        // 인원: Capacity__c 또는 이름에서 추출
                        // 예: "강남본점 301호 (4인실 오피스)" → 4 추출
                        capacityNumber: this.extractCapacity(asset.Capacity__c, asset.Name),
                        
                        // 매칭률: 데모용으로 순서대로 조금씩 낮춤
                        matchRate: 99 - index,
                        
                        // 이미지: 5개 이미지를 순환해서 할당 (index % 5)
                        imageUrl: OFFICE_IMAGES[index % OFFICE_IMAGES.length],
                        
                        // 설명
                        description: asset.Description || '상세 설명이 준비되지 않았습니다.',
                        
                        // 편의시설 (현재는 하드코딩, 필요시 Product 옵션과 연동 가능)
                        amenities: [{name:'24시간 보안'}, {name:'초고속 인터넷'}, {name:'라운지 이용'}]
                    };
                });
                
                // 로딩 느낌을 주기 위해 1.5초 딜레이 후 결과 화면(Step 3)으로 이동
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => { 
                    this.step = 3; 
                }, 1500);
            })
            .catch(error => {
                console.error('Search Error:', error);
                this.recommendations = []; // 에러 시 빈 결과
                this.step = 3; // 결과 화면으로 이동하여 "결과 없음" 표시
            });
    }

    // [STEP 3 -> 4] 카드 클릭 시 상세 보기
    handleCardClick(event) {
        const spaceId = event.currentTarget.dataset.id;
        // 클릭한 ID에 해당하는 오피스 정보를 찾아서 selectedSpace에 저장
        this.selectedSpace = this.recommendations.find(s => s.id === spaceId);
        this.step = 4;
    }

    // 이벤트 전파 방지 (모달 배경 클릭 시 닫기 방지 등)
    stopPropagation(event) { event.stopPropagation(); }
    
    // 뒤로 가기
    goBackToStep3() { this.step = 3; }
    goToStep4() { this.step = 4; }

    // [STEP 4 -> 5] 신청하기 버튼 (Flow 모달 열기)
    goToStep5() { this.step = 5; }

    // [Flow 연동] Flow에 넘겨줄 변수 설정
    get flowInputVariables() {
        return [
            {
                // Flow 내부에 'InterestAsset'이라는 '입력 전용 텍스트 변수'가 있어야 함
                name: 'InterestAsset', 
                type: 'String',
                value: this.selectedSpace.name // 예: "강남점 101호"
            }
        ];
    }

    // [Flow 상태 감지] Flow가 완료(FINISHED)되면 완료 화면(Step 7)으로 이동
    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.step = 7;
        }
    }

    // [초기화] 처음으로 돌아가기
    resetProcess() {
        this.step = 1;
        this.currentPage = 'home';
        this.userPrompt = '';
        this.recommendations = [];
        this.selectedSpace = {};
    }

    // ============================================
    // 페이지 네비게이션 메서드
    // ============================================
    goToHome() {
        this.currentPage = 'home';
        this.step = 1;
    }

    goToLocations() {
        this.currentPage = 'locations';
    }

    goToProducts() {
        this.currentPage = 'products';
    }

    goToAbout() {
        this.currentPage = 'about';
    }

    // ============================================
    // 지점 위치 페이지 핸들러
    // ============================================
    handleBranchClick(event) {
        const branchId = event.currentTarget.dataset.branch;
        console.log('Branch selected:', branchId);
        
        // 해당 지점으로 검색 실행
        const branchMapping = {
            'gangnam': '강남',
            'euljiro': '을지로',
            'pangyo': '판교'
        };
        
        this.userPrompt = branchMapping[branchId] || branchId;
        this.currentPage = 'home';
        this.goToStep2();
    }

    // ============================================
    // 상품 안내 페이지 핸들러
    // ============================================
    handleProductClick(event) {
        const productType = event.currentTarget.dataset.product;
        console.log('Product selected:', productType);
        
        // 해당 상품 유형으로 검색 실행
        const productMapping = {
            '1person': '1인실',
            '4person': '4인실',
            '8person': '8인실',
            'enterprise': '10인실'
        };
        
        this.userPrompt = productMapping[productType] || productType;
        this.currentPage = 'home';
        this.goToStep2();
    }

    // ============================================
    // 지도 마커 클릭 핸들러
    // ============================================
    goToGangnam() {
        this.userPrompt = '강남';
        this.currentPage = 'home';
        this.goToStep2();
    }

    goToEuljiro() {
        this.userPrompt = '을지로';
        this.currentPage = 'home';
        this.goToStep2();
    }

    goToPangyo() {
        this.userPrompt = '판교';
        this.currentPage = 'home';
        this.goToStep2();
    }
}