import { LightningElement, api } from 'lwc';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowMessagingHeader extends LightningElement {
    logoUrl = WEGROW_LOGO;
    
    // Embedded Messaging에서 제공하는 API
    @api recordId;
    @api conversationId;
    
    handleMinimize() {
        // Messaging API로 최소화 이벤트 전달
        this.dispatchEvent(new CustomEvent('minimize'));
    }
    
    handleClose() {
        // Messaging API로 종료 이벤트 전달
        this.dispatchEvent(new CustomEvent('close'));
    }
}
