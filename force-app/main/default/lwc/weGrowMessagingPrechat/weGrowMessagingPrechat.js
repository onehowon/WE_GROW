import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';
import getAgentSessionInfo from '@salesforce/apex/CustomerPortalController.getAgentSessionInfo';

export default class WeGrowMessagingPrechat extends LightningElement {
    logoUrl = WEGROW_LOGO;
    
    @track selectedType = '';
    @track isLoading = true;
    @track sessionInfo = null;
    
    @api prechatFields;
    
    contactId = '';
    
    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef && pageRef.state) {
            this.contactId = pageRef.state.contactId || '';
        }
    }
    
    connectedCallback() {
        console.log('WeGrowMessagingPrechat connectedCallback');
        this.loadSessionInfo();
    }
    
    async loadSessionInfo() {
        try {
            const storedContactId = sessionStorage.getItem('contactId');
            console.log('Stored contactId:', storedContactId);
            
            if (storedContactId) {
                this.contactId = storedContactId;
                
                const result = await getAgentSessionInfo({ contactId: this.contactId });
                console.log('Agent Session Info:', JSON.stringify(result));
                
                if (result.success) {
                    this.sessionInfo = result;
                    console.log('Session loaded - Branch:', result.branchName, 'Asset:', result.assetName);
                } else {
                    console.error('Failed to load session info:', result.errorMessage);
                }
            } else {
                console.log('No contactId found in session storage');
            }
        } catch (error) {
            console.error('Error loading session info:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
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
    
    get userName() {
        return this.sessionInfo?.contactName || '고객';
    }
    
    get branchName() {
        return this.sessionInfo?.branchName || '';
    }
    
    get locationName() {
        return this.sessionInfo?.assetName || '';
    }
    
    get hasSessionInfo() {
        return this.sessionInfo !== null;
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
        
        const prechatData = {
            type: this.selectedType,
            contactId: this.sessionInfo?.contactId || '',
            contactName: this.sessionInfo?.contactName || '',
            contactEmail: this.sessionInfo?.contactEmail || '',
            contactPhone: this.sessionInfo?.contactPhone || '',
            accountId: this.sessionInfo?.accountId || '',
            accountName: this.sessionInfo?.accountName || '',
            assetId: this.sessionInfo?.assetId || '',
            assetName: this.sessionInfo?.assetName || '',
            branchId: this.sessionInfo?.branchId || '',
            branchName: this.sessionInfo?.branchName || ''
        };
        
        console.log('Starting chat with prechat data:', JSON.stringify(prechatData));
        
        this.dispatchEvent(new CustomEvent('startconversation', {
            detail: {
                prechatFields: prechatData
            }
        }));
    }
}
