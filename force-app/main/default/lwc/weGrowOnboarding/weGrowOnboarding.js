import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowOnboarding extends NavigationMixin(LightningElement) {
    
    logoUrl = WEGROW_LOGO;
    email = '';
    password = '';

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleLogin() {
        // 입력 검증
        if (!this.email) {
            const evt = new ShowToastEvent({
                title: '입력 확인',
                message: '이메일 주소를 입력해주세요.',
                variant: 'warning',
            });
            this.dispatchEvent(evt);
            return;
        }

        if (!this.password) {
            const evt = new ShowToastEvent({
                title: '입력 확인',
                message: '비밀번호를 입력해주세요.',
                variant: 'warning',
            });
            this.dispatchEvent(evt);
            return;
        }

        // Mock 로그인 검증
        if (this.email === 'onehowon' && this.password === '123') {
            // 로그인 성공
            const evt = new ShowToastEvent({
                title: '로그인 성공',
                message: 'WeGrow 고객사 포털로 이동합니다.',
                variant: 'success',
            });
            this.dispatchEvent(evt);

            // 고객사 메인 대시보드로 이동
            // Experience Cloud의 Named Page로 이동 (home 또는 특정 페이지명)
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Home' // 또는 고객사 대시보드 페이지명
                }
            });
        } else {
            // 로그인 실패
            const evt = new ShowToastEvent({
                title: '로그인 실패',
                message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }
}