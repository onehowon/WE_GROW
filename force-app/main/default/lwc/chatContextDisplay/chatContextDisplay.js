import { LightningElement, api } from 'lwc';
import getCustomerContextForDisplay from '@salesforce/apex/MessagingSessionHandler.getCustomerContextForDisplay';

export default class ChatContextDisplay extends LightningElement {
    @api recordId;
    
    contactInfo = null;
    caseInfo = null;
    workOrderInfo = null;
    isLoading = true;
    error = null;

    connectedCallback() {
        this.loadContext();
    }

    async loadContext() {
        try {
            this.isLoading = true;
            const result = await getCustomerContextForDisplay();
            
            if (result && result.success) {
                this.contactInfo = {
                    id: result.contactId,
                    name: result.contactName,
                    email: result.contactEmail,
                    phone: result.contactPhone,
                    accountName: result.accountName,
                    assetName: result.assetName
                };
                
                if (result.latestCaseId) {
                    this.caseInfo = {
                        id: result.latestCaseId,
                        number: result.latestCaseNumber,
                        subject: result.latestCaseSubject,
                        status: result.latestCaseStatus,
                        count: result.recentCasesCount
                    };
                }
                
                if (result.latestWorkOrderId) {
                    this.workOrderInfo = {
                        id: result.latestWorkOrderId,
                        number: result.latestWorkOrderNumber,
                        subject: result.latestWorkOrderSubject,
                        status: result.latestWorkOrderStatus,
                        count: result.recentWorkOrdersCount
                    };
                }
            } else {
                this.error = result ? result.message : '데이터를 불러올 수 없습니다.';
            }
        } catch (err) {
            this.error = err.body ? err.body.message : '오류 발생';
        } finally {
            this.isLoading = false;
        }
    }

    get hasContact() {
        return this.contactInfo && this.contactInfo.id;
    }

    get hasCase() {
        return this.caseInfo && this.caseInfo.id;
    }

    get hasWorkOrder() {
        return this.workOrderInfo && this.workOrderInfo.id;
    }

    handleContactClick() {
        if (this.contactInfo && this.contactInfo.id) {
            window.open('/' + this.contactInfo.id, '_blank');
        }
    }

    handleCaseClick() {
        if (this.caseInfo && this.caseInfo.id) {
            window.open('/' + this.caseInfo.id, '_blank');
        }
    }

    handleWorkOrderClick() {
        if (this.workOrderInfo && this.workOrderInfo.id) {
            window.open('/' + this.workOrderInfo.id, '_blank');
        }
    }
}