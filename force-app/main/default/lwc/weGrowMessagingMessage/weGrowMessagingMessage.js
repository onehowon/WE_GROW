import { LightningElement, api } from 'lwc';

export default class WeGrowMessagingMessage extends LightningElement {
    @api messageType;
    @api timestamp;
    @api messageContent;
    
    get isAgentMessage() {
        return this.messageType === 'agent' || this.messageType === 'bot';
    }
    
    get messageContainerClass() {
        return `message-container ${this.isAgentMessage ? 'agent' : 'user'}`;
    }
    
    get bubbleClass() {
        return `message-bubble ${this.isAgentMessage ? 'agent-bubble' : 'user-bubble'}`;
    }
    
    get formattedTime() {
        if (!this.timestamp) return '';
        
        const date = new Date(this.timestamp);
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        
        return `${ampm} ${displayHours}:${minutes}`;
    }
}
