import { LightningElement } from 'lwc';

export default class WeGrowAutoRedirect extends LightningElement {
    connectedCallback() {
        // 컴포넌트가 로드되면 즉시 실행
        this.checkAndRedirect();
    }

    checkAndRedirect() {
        // 현재 URL 확인
        const currentPath = window.location.pathname;
        
        // Home 페이지이거나 members 루트일 경우
        if (currentPath === '/members/Home' || currentPath === '/members' || currentPath === '/members/') {
            // 로그인 여부 확인 (Experience Cloud에서는 guest user가 아니면 로그인된 것)
            // userId가 있는지 확인
            const isGuest = this.isGuestUser();
            
            if (!isGuest) {
                // 로그인된 사용자라면 dashboard로 리다이렉트
                console.log('Authenticated user detected, redirecting to dashboard...');
                window.location.href = '/members/dashboard';
            } else {
                // Guest 사용자는 로그인 페이지에 유지
                console.log('Guest user, staying on login page');
            }
        }
    }

    isGuestUser() {
        // Salesforce Experience Cloud에서 guest 여부 확인
        // guest user는 일반적으로 특정 클래스를 가지고 있음
        const bodyClasses = document.body.className;
        return bodyClasses.includes('guest') || bodyClasses.includes('unauthenticated');
    }
}