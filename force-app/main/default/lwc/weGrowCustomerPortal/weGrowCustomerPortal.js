import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowCustomerPortal extends NavigationMixin(LightningElement) {
    logoUrl = WEGROW_LOGO;
    
    // 현재 활성 탭
    @track currentTab = 'dashboard';
    
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
    
    connectedCallback() {
        console.log('Customer Portal loaded');
        // URL에서 탭 파라미터 확인 (선택적)
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['dashboard', 'myoffice', 'charge', 'service'].includes(tabParam)) {
            this.currentTab = tabParam;
        }
    }
    
    // 탭 전환 메서드
    navigateToDashboard() {
        this.currentTab = 'dashboard';
    }
    
    navigateToMyOffice() {
        this.currentTab = 'myoffice';
    }
    
    navigateToCharge() {
        this.currentTab = 'charge';
    }
    
    navigateToService() {
        this.currentTab = 'service';
    }
    
    // 로그아웃
    handleLogout() {
        window.location.href = '/members/login';
    }
}
