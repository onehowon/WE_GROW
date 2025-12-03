import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowOnboarding extends LightningElement {
    
    logoUrl = WEGROW_LOGO;
    email = '';

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    handleGetStarted() {
        if (!this.email) {
             const evt = new ShowToastEvent({
                title: '잠시만요!',
                message: '이메일 주소를 입력해주세요.',
                variant: 'warning',
            });
            this.dispatchEvent(evt);
            return;
        }

        // 성공 토스트 메시지
        // 추후 여기에 내부 직원이면 '홈'으로, 고객이면 '포털 메인'으로 이동하는 로직 추가 가능
        const evt = new ShowToastEvent({
            title: 'WeGrow에 오신 것을 환영합니다.',
            message: `${this.email} 님, 스마트 오피스 환경으로 연결 중입니다...`,
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }
}