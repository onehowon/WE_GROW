import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowCustomerLanding extends NavigationMixin(LightningElement) {
    
    logoUrl = WEGROW_LOGO;
    email = '';

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleLogin() {
        if (!this.email) {
            const evt = new ShowToastEvent({
                title: '입력 확인',
                message: '이메일 주소를 입력해주세요.',
                variant: 'warning',
            });
            this.dispatchEvent(evt);
            return;
        }

        // 로그인 성공 시 대시보드로 리다이렉트
        const evt = new ShowToastEvent({
            title: '로그인 성공',
            message: `${this.email} 계정으로 입주사 포털에 접속합니다.`,
            variant: 'success',
        });
        this.dispatchEvent(evt);

        // Dashboard로 리다이렉트
        setTimeout(() => {
            window.location.href = '/members/dashboard';
        }, 500); // 토스트 메시지를 보여준 후 리다이렉트
    }
}