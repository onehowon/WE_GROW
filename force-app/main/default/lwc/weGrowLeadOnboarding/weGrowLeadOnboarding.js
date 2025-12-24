import { LightningElement, track } from 'lwc';
import findOffices from '@salesforce/apex/WeGrowController.findOffices';
import KOREA_MAP from '@salesforce/resourceUrl/koreaMap';

export default class WeGrowOnboarding extends LightningElement {
    @track step = 1;
    @track currentPage = 'home';
    @track userPrompt = '';
    @track selectedSpaces = [];
    @track recommendations = [];

    get koreaMapUrl() { return KOREA_MAP; }

    get isHomePage() { return this.currentPage === 'home'; }
    get isLocationsPage() { return this.currentPage === 'locations'; }
    get isProductsPage() { return this.currentPage === 'products'; }
    get isAboutPage() { return this.currentPage === 'about'; }

    get isStep1() { return this.isHomePage && this.step === 1; }
    get isStep2() { return this.isHomePage && this.step === 2; }
    get isStep3() { return this.isHomePage && this.step === 3; }
    get isStep4() { return this.isHomePage && this.step === 4; }
    get isStep5() { return this.isHomePage && this.step === 5; }
    get isStep7() { return this.isHomePage && this.step === 7; }
    
    get isDetailView() { return this.isHomePage && this.step === 4; }
    get showAIStatus() { return this.isHomePage && this.step >= 1 && this.step <= 3; }
    
    get locationsNavClass() { return `nav-btn ${this.currentPage === 'locations' ? 'active' : ''}`; }
    get productsNavClass() { return `nav-btn ${this.currentPage === 'products' ? 'active' : ''}`; }
    get aboutNavClass() { return `nav-btn ${this.currentPage === 'about' ? 'active' : ''}`; }
    
    get hasResults() { return this.recommendations && this.recommendations.length > 0; }
    
    get selectedCount() { return this.selectedSpaces.length; }
    
    get hasSelection() { return this.selectedSpaces.length > 0; }
    
    get applyButtonText() {
        if (this.selectedSpaces.length === 0) return '오피스를 선택해주세요';
        return `선택한 ${this.selectedSpaces.length}개 오피스 신청하기`;
    }

    isSpaceSelected(spaceId) {
        return this.selectedSpaces.some(s => s.id === spaceId);
    }

    handleTagClick(event) {
        this.userPrompt = event.currentTarget.dataset.tag;
    }

    handlePromptInput(event) {
        this.userPrompt = event.target.value;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.goToStep2();
        }
    }

    extractCapacity(capacityField, assetName) {
        if (capacityField) {
            return capacityField;
        }
        
        if (assetName) {
            const match = assetName.match(/\((\d+)인실/);
            if (match && match[1]) {
                return parseInt(match[1], 10);
            }
        }
        
        const fallbackOptions = [6, 8];
        return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    }

    goToStep2() {
        if (!this.userPrompt) this.userPrompt = '강남';
        this.step = 2;

        const OFFICE_IMAGES = [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80'
        ];

        findOffices({ keyword: this.userPrompt })
            .then(result => {
                this.recommendations = result.map((asset, index) => {
                    return {
                        id: asset.Id,
                        name: asset.Name,
                        location: asset.Branch_Account__r ? asset.Branch_Account__r.Name : '위치 정보 없음',
                        priceNumber: asset.Price ? asset.Price.toLocaleString() : '문의',
                        capacityNumber: this.extractCapacity(asset.Capacity__c, asset.Name),
                        matchRate: 99 - index,
                        imageUrl: OFFICE_IMAGES[index % OFFICE_IMAGES.length],
                        description: asset.Description || '상세 설명이 준비되지 않았습니다.',
                        branchAccountId: asset.Branch_Account__r ? asset.Branch_Account__r.Id : null,
                        amenities: [{name:'24시간 보안'}, {name:'초고속 인터넷'}, {name:'라운지 이용'}],
                        isSelected: false,
                        cardClass: 'space-card'
                    };
                });
                
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => { 
                    this.step = 3; 
                }, 1500);
            })
            .catch(error => {
                console.error('Search Error:', error);
                this.recommendations = [];
                this.step = 3;
            });
    }

    handleCardClick(event) {
        const spaceId = event.currentTarget.dataset.id;
        const index = this.selectedSpaces.findIndex(s => s.id === spaceId);
        
        if (index > -1) {
            this.selectedSpaces = this.selectedSpaces.filter(s => s.id !== spaceId);
        } else if (this.selectedSpaces.length < 3) {
            const space = this.recommendations.find(s => s.id === spaceId);
            this.selectedSpaces = [...this.selectedSpaces, space];
        }
        
        this.recommendations = this.recommendations.map(rec => {
            const selected = this.selectedSpaces.some(s => s.id === rec.id);
            return {
                ...rec,
                isSelected: selected,
                cardClass: selected ? 'space-card selected' : 'space-card'
            };
        });
    }

    stopPropagation(event) { event.stopPropagation(); }
    
    goBackToStep3() { this.step = 3; }
    goToStep4() { this.step = 4; }

    goToStep5() { this.step = 5; }

    get flowInputVariables() {
        const variables = [];
        
        for (let i = 0; i < 3; i++) {
            const space = this.selectedSpaces[i];
            variables.push({
                name: `AssetId${i + 1}`,
                type: 'String',
                value: space ? space.id : ''
            });
            variables.push({
                name: `BranchId${i + 1}`,
                type: 'String',
                value: space ? space.branchAccountId : ''
            });
        }
        
        return variables;
    }

    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.step = 7;
        }
    }

    resetProcess() {
        window.location.href = '/Lead/s/';
    }

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

    handleBranchClick(event) {
        const branchId = event.currentTarget.dataset.branch;
        console.log('Branch selected:', branchId);
        
        const branchMapping = {
            'gangnam': '강남',
            'euljiro': '을지로',
            'pangyo': '판교'
        };
        
        this.userPrompt = branchMapping[branchId] || branchId;
        this.currentPage = 'home';
        this.goToStep2();
    }

    handleProductClick(event) {
        const productType = event.currentTarget.dataset.product;
        console.log('Product selected:', productType);
        
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