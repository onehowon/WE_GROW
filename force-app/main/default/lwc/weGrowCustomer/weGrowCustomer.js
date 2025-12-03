import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowCustomerLanding extends LightningElement {
    
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

        // 실제로는 여기서 Experience Cloud 로그인 로직이 수행됩니다.
        const evt = new ShowToastEvent({
            title: '로그인 시도',
            message: `${this.email} 계정으로 입주사 포털에 접속합니다.`,
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }
}