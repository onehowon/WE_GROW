import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

// 허용된 사용자 정보 (하드코딩)
const VALID_USER = {
    email: 'that04@naver.com',
    password: '12345678p',
    name: '고객사'
};

export default class WeGrowCustomerLanding extends NavigationMixin(LightningElement) {
    
    logoUrl = WEGROW_LOGO;
    @track email = '';
    @track password = '';
    @track loginError = '';

    handleEmailChange(event) {
        this.email = event.target.value;
        this.loginError = ''; // 입력 시 에러 메시지 초기화
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        this.loginError = ''; // 입력 시 에러 메시지 초기화
    }

    handleLogin() {
        // 입력 검증
        if (!this.email) {
            this.loginError = '이메일 주소를 입력해주세요.';
            return;
        }
        
        if (!this.password) {
            this.loginError = '비밀번호를 입력해주세요.';
            return;
        }

        // 사용자 인증
        if (this.email === VALID_USER.email && this.password === VALID_USER.password) {
            // 로그인 성공
            const evt = new ShowToastEvent({
                title: '로그인 성공',
                message: `${VALID_USER.name}님, 환영합니다!`,
                variant: 'success',
            });
            this.dispatchEvent(evt);

            // Dashboard로 리다이렉트 (NavigationMixin 사용)
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                // Experience Cloud 기본 URL을 사용하여 네비게이션
                const baseUrl = window.location.origin;
                const communityPath = '/members'; // Experience Cloud 사이트 경로
                
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: `${baseUrl}${communityPath}/customer-portal`
                    }
                });
            }, 500);
        } else {
            // 로그인 실패
            this.loginError = '이메일 또는 비밀번호가 올바르지 않습니다.';
            
            const evt = new ShowToastEvent({
                title: '로그인 실패',
                message: '입력한 정보를 다시 확인해주세요.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        }
    }
}