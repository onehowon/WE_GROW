import { LightningElement, api, track } from 'lwc';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowMessagingPrechat extends LightningElement {
    logoUrl = WEGROW_LOGO;
    
    @track selectedType = '';
    
    // 로그인한 사용자 정보 (Embedded Messaging에서 자동 제공)
    @api prechatFields;
    
    get isStartDisabled() {
        return !this.selectedType;
    }
    
    get facilityBtnClass() {
        return `type-btn ${this.selectedType === 'Facility' ? 'selected' : ''}`;
    }
    
    get contractBtnClass() {
        return `type-btn ${this.selectedType === 'Contract' ? 'selected' : ''}`;
    }
    
    get generalBtnClass() {
        return `type-btn ${this.selectedType === 'General' ? 'selected' : ''}`;
    }
    
    handleSelectFacility() {
        this.selectedType = 'Facility';
    }
    
    handleSelectContract() {
        this.selectedType = 'Contract';
    }
    
    handleSelectGeneral() {
        this.selectedType = 'General';
    }
    
    handleStartChat() {
        if (!this.selectedType) return;
        
        // Messaging API를 통해 채팅 시작
        // prechatFields에 문의 유형 추가
        const prechatData = {
            type: this.selectedType
        };
        
        // Embedded Messaging의 startConversation 이벤트 발생
        this.dispatchEvent(new CustomEvent('startconversation', {
            detail: {
                prechatFields: prechatData
            }
        }));
    }
}
