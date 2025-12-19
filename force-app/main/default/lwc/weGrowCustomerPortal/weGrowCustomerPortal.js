import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';
import getPortalData from '@salesforce/apex/CustomerPortalController.getPortalData';
import getInvoices from '@salesforce/apex/CustomerPortalController.getInvoices';
import createCase from '@salesforce/apex/CustomerPortalController.createCase';

export default class WeGrowCustomerPortal extends NavigationMixin(LightningElement) {
    logoUrl = WEGROW_LOGO;
    
    // 현재 활성 탭
    @track currentTab = 'dashboard';
    @track isLoading = true;
    @track dataLoaded = false;
    
    // 사용자 정보 (sessionStorage에서 로드)
    contactId = '';
    accountId = '';
    
    // 포털 데이터
    @track portalData = {};
    @track invoices = [];
    
    // 민원 접수 폼
    @track caseSubject = '';
    @track caseDescription = '';
    @track caseType = '';
    @track casePriority = 'Low';
    @track isUrgent = false;
    
    // 탭별 Getter
    get isDashboardTab() { return this.currentTab === 'dashboard'; }
    get isMyOfficeTab() { return this.currentTab === 'myoffice'; }
    get isChargeTab() { return this.currentTab === 'charge'; }
    get isServiceTab() { return this.currentTab === 'service'; }
    
    // 사이드바 네비게이션 CSS 클래스
    get dashboardNavClass() {
        return `nav-item ${this.currentTab === 'dashboard' ? 'active' : ''}`;
    }
    get myOfficeNavClass() {
        return `nav-item ${this.currentTab === 'myoffice' ? 'active' : ''}`;
    }
    get chargeNavClass() {
        return `nav-item ${this.currentTab === 'charge' ? 'active' : ''}`;
    }
    get serviceNavClass() {
        return `nav-item ${this.currentTab === 'service' ? 'active' : ''}`;
    }
    
    // 오피스 배너 스타일
    get bannerStyle() {
        return "background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'); background-size: cover; background-position: center;";
    }
    
    // 포털 데이터 Getters
    get userName() { return this.portalData.contactName || '사용자'; }
    get companyName() { return this.portalData.accountName || '회사명'; }
    get branchName() { return this.portalData.branchName || '지점명'; }
    get officeName() { return this.portalData.assetName || '호실'; }
    get officeFullName() { return `${this.branchName} - ${this.officeName}`; }
    get capacity() { return this.portalData.capacity || 0; }
    get productName() { return this.portalData.productName || '오피스'; }
    get doorLockPw() { return this.portalData.doorLockPw || '******'; }
    get wifiSsid() { return this.portalData.wifiSsid || 'WiFi 정보 없음'; }
    get wifiPassword() { return this.portalData.wifiPassword || '******'; }
    
    // 계약 정보 Getters
    get contractNumber() { return this.portalData.contractNumber || '-'; }
    get contractStartDate() { return this.formatDate(this.portalData.contractStartDate); }
    get contractEndDate() { return this.formatDate(this.portalData.contractEndDate); }
    get monthlyPayment() { return this.formatCurrency(this.portalData.monthlyPayment); }
    get depositAmount() { return this.formatCurrency(this.portalData.depositAmount); }
    get moveInDate() { return this.formatDate(this.portalData.moveInDate); }
    
    // D-Day 계산
    get daysUntilMoveIn() {
        if (!this.portalData.moveInDate) return 0;
        const moveIn = new Date(this.portalData.moveInDate);
        const today = new Date();
        const diffTime = moveIn - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    get daysUntilContractEnd() {
        if (!this.portalData.contractEndDate) return 0;
        const endDate = new Date(this.portalData.contractEndDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    // 케이스 목록
    get recentCases() { return this.portalData.recentCases || []; }
    get hasCases() { return this.recentCases.length > 0; }
    
    connectedCallback() {
        console.log('[CustomerPortal] connectedCallback started');
        
        // sessionStorage에서 로그인 정보 확인
        this.contactId = sessionStorage.getItem('contactId');
        this.accountId = sessionStorage.getItem('accountId');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        
        console.log('[CustomerPortal] contactId:', this.contactId);
        console.log('[CustomerPortal] accountId:', this.accountId);
        console.log('[CustomerPortal] isLoggedIn:', isLoggedIn);
        
        if (!isLoggedIn || !this.contactId) {
            console.log('[CustomerPortal] Not logged in, redirecting to login...');
            // 로그인 페이지로 리다이렉트
            window.location.href = '/members/home';
            return;
        }
        
        // URL에서 탭 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['dashboard', 'myoffice', 'charge', 'service'].includes(tabParam)) {
            this.currentTab = tabParam;
        }
        
        // 데이터 로드
        this.loadPortalData();
    }
    
    async loadPortalData() {
        console.log('=== [CustomerPortal] loadPortalData START ===');
        console.log('[CustomerPortal] contactId:', this.contactId);
        console.log('[CustomerPortal] accountId:', this.accountId);
        this.isLoading = true;
        
        try {
            const result = await getPortalData({ contactId: this.contactId });
            console.log('[CustomerPortal] Raw result:', result);
            console.log('[CustomerPortal] result.success:', result.success);
            
            if (result.success) {
                this.portalData = result;
                this.dataLoaded = true;
                
                // 상세 데이터 로그
                console.log('[CustomerPortal] === DATA CHECK ===');
                console.log('[CustomerPortal] contactName:', result.contactName || '(null)');
                console.log('[CustomerPortal] accountName:', result.accountName || '(null)');
                console.log('[CustomerPortal] assetId:', result.assetId || '(null)');
                console.log('[CustomerPortal] assetName:', result.assetName || '(null)');
                console.log('[CustomerPortal] branchName:', result.branchName || '(null)');
                console.log('[CustomerPortal] capacity:', result.capacity || '(null)');
                console.log('[CustomerPortal] doorLockPw:', result.doorLockPw ? '(exists)' : '(null)');
                console.log('[CustomerPortal] wifiSsid:', result.wifiSsid || '(null)');
                console.log('[CustomerPortal] contractId:', result.contractId || '(null)');
                console.log('[CustomerPortal] contractNumber:', result.contractNumber || '(null)');
                console.log('[CustomerPortal] monthlyPayment:', result.monthlyPayment || '(null)');
                console.log('[CustomerPortal] recentCases count:', result.recentCases?.length || 0);
                console.log('[CustomerPortal] === END DATA CHECK ===');
                
                // 청구 내역도 로드
                if (this.accountId) {
                    this.loadInvoices();
                }
            } else {
                console.error('[CustomerPortal] API returned failure');
                console.error('[CustomerPortal] errorMessage:', result.errorMessage);
                this.showToast('오류', result.errorMessage || '데이터를 불러오는데 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('=== [CustomerPortal] EXCEPTION ===');
            console.error('[CustomerPortal] error:', error);
            console.error('[CustomerPortal] error.message:', error?.message);
            console.error('[CustomerPortal] error.body:', error?.body);
            console.error('[CustomerPortal] error.body?.message:', error?.body?.message);
            this.showToast('오류', '포털 데이터 로드 중 오류가 발생했습니다: ' + (error?.body?.message || error?.message || '알 수 없는 오류'), 'error');
        } finally {
            this.isLoading = false;
            console.log('=== [CustomerPortal] loadPortalData END ===');
        }
    }
    
    async loadInvoices() {
        console.log('[CustomerPortal] Loading invoices for accountId:', this.accountId);
        try {
            this.invoices = await getInvoices({ accountId: this.accountId });
            console.log('[CustomerPortal] Invoices loaded:', this.invoices?.length || 0);
        } catch (error) {
            // Invoice__c 오브젝트가 없으면 에러 발생 - graceful하게 처리
            console.warn('[CustomerPortal] Failed to load invoices (Invoice__c may not exist yet)');
            console.warn('[CustomerPortal] Invoice error:', error?.body?.message || error?.message);
            this.invoices = []; // 빈 배열로 fallback
        }
    }
    
    // 탭 전환 메서드
    navigateToDashboard() { this.currentTab = 'dashboard'; }
    navigateToMyOffice() { this.currentTab = 'myoffice'; }
    navigateToCharge() { 
        this.currentTab = 'charge'; 
        if (this.accountId && this.invoices.length === 0) {
            this.loadInvoices();
        }
    }
    navigateToService() { this.currentTab = 'service'; }
    
    // 민원 폼 핸들러
    handleCaseTypeChange(event) { this.caseType = event.target.value; }
    handleSubjectChange(event) { this.caseSubject = event.target.value; }
    handleDescriptionChange(event) { this.caseDescription = event.target.value; }
    handleUrgentChange(event) { 
        this.isUrgent = event.target.checked;
        this.casePriority = this.isUrgent ? 'High' : 'Low';
    }
    
    async handleSubmitCase() {
        console.log('[CustomerPortal] Submitting case...');
        
        if (!this.caseSubject || !this.caseDescription || !this.caseType) {
            this.showToast('입력 오류', '제목, 유형, 상세 내용을 모두 입력해주세요.', 'warning');
            return;
        }
        
        this.isLoading = true;
        
        try {
            const result = await createCase({
                accountId: this.accountId,
                assetId: this.portalData.assetId,
                subject: this.caseSubject,
                description: this.caseDescription,
                caseType: this.caseType,
                priority: this.casePriority
            });
            
            console.log('[CustomerPortal] Case created:', result);
            this.showToast('성공', '민원이 성공적으로 접수되었습니다.', 'success');
            
            // 폼 초기화
            this.caseSubject = '';
            this.caseDescription = '';
            this.caseType = '';
            this.isUrgent = false;
            this.casePriority = 'Low';
            
            // 데이터 새로고침
            this.loadPortalData();
            
            // 대시보드로 이동
            this.currentTab = 'dashboard';
            
        } catch (error) {
            console.error('[CustomerPortal] Failed to create case:', error);
            this.showToast('오류', '민원 접수 중 오류가 발생했습니다.', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    handleCancelCase() {
        this.caseSubject = '';
        this.caseDescription = '';
        this.caseType = '';
        this.isUrgent = false;
        this.casePriority = 'Low';
        this.currentTab = 'dashboard';
    }
    
    // 로그아웃
    handleLogout() {
        sessionStorage.clear();
        window.location.href = '/members/home';
    }
    
    // 유틸리티 메서드
    formatDate(dateValue) {
        if (!dateValue) return '-';
        const date = new Date(dateValue);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
    
    formatCurrency(amount) {
        if (!amount) return '0 원';
        return new Intl.NumberFormat('ko-KR').format(amount) + ' 원';
    }
    
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }
}
