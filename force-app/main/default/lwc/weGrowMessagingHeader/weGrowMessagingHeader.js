import { LightningElement, api } from 'lwc';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowMessagingHeader extends LightningElement {
    logoUrl = WEGROW_LOGO;
    
    @api recordId;
    @api conversationId;
    
    handleMinimize() {
        this.dispatchEvent(new CustomEvent('minimize'));
    }
    
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}