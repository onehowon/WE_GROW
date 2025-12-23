import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';
import getAgentSessionInfo from '@salesforce/apex/CustomerPortalController.getAgentSessionInfo';

export default class WeGrowMessagingPrechat extends LightningElement {
    logoUrl = WEGROW_LOGO;
    
    @track selectedType = '';
    @track isLoading = true;
    @track sessionInfo = null;
    
    // 로그인한 사용자 정보 (Embedded Messaging에서 자동 제공)
    @api prechatFields;
    
    // Contact ID (URL 파라미터 또는 세션에서 가져옴)
    contactId = '';
    
    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef && pageRef.state) {
            // URL에서 contactId 파라미터 확인
            this.contactId = pageRef.state.contactId || '';
        }
    }
    
    connectedCallback() {
        console.log('WeGrowMessagingPrechat connectedCallback');
        this.loadSessionInfo();
    }
    
    async loadSessionInfo() {
        try {
            // sessionStorage에서 contactId 가져오기 (Customer Portal에서 저장됨)
            const storedContactId = sessionStorage.getItem('portal_contactId');
            console.log('Stored contactId:', storedContactId);
            
            if (storedContactId) {
                this.contactId = storedContactId;
                
                // Agent Session 정보 조회
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
    
    // 사용자 정보 표시용 Getters
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
        
        // Messaging API를 통해 채팅 시작
        // prechatFields에 사용자 정보 포함
        const prechatData = {
            type: this.selectedType,
            // 사용자 정보 (자동 인식)
            contactId: this.sessionInfo?.contactId || '',
            contactName: this.sessionInfo?.contactName || '',
            contactEmail: this.sessionInfo?.contactEmail || '',
            contactPhone: this.sessionInfo?.contactPhone || '',
            // 계정 정보
            accountId: this.sessionInfo?.accountId || '',
            accountName: this.sessionInfo?.accountName || '',
            // 자산 정보 (호실)
            assetId: this.sessionInfo?.assetId || '',
            assetName: this.sessionInfo?.assetName || '',
            // 지점 정보
            branchId: this.sessionInfo?.branchId || '',
            branchName: this.sessionInfo?.branchName || ''
        };
        
        console.log('Starting chat with prechat data:', JSON.stringify(prechatData));
        
        // Embedded Messaging의 startConversation 이벤트 발생
        this.dispatchEvent(new CustomEvent('startconversation', {
            detail: {
                prechatFields: prechatData
            }
        }));
    }
}
