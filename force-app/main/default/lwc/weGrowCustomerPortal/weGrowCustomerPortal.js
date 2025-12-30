import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';
import OFFICE_MOCKUP from '@salesforce/resourceUrl/weGrowOfficeMockup';
import CONTRACT_IMAGE from '@salesforce/resourceUrl/weGrowContract';
import RECEIPT_IMAGE from '@salesforce/resourceUrl/weGrowReciept';
import INVOICE_IMAGE from '@salesforce/resourceUrl/weGrowFirstDocument';
import getPortalData from '@salesforce/apex/CustomerPortalController.getPortalData';
import getInvoices from '@salesforce/apex/CustomerPortalController.getInvoices';
import createCase from '@salesforce/apex/CustomerPortalController.createCase';
import saveChatContext from '@salesforce/apex/ChatContextManager.saveContext';

export default class WeGrowCustomerPortal extends NavigationMixin(LightningElement) {
    logoUrl = WEGROW_LOGO;
    officeMockupUrl = OFFICE_MOCKUP;
    contractImageUrl = CONTRACT_IMAGE;
    receiptImageUrl = RECEIPT_IMAGE;
    invoiceImageUrl = INVOICE_IMAGE;
    
    @track currentTab = 'dashboard';
    @track isLoading = true;
    @track dataLoaded = false;
    
    contactId = '';
    accountId = '';
    
    @track portalData = {};
    @track invoices = [];
    
    @track caseSubject = '';
    @track caseDescription = '';
    @track caseType = '';
    @track casePriority = 'Low';
    @track isUrgent = false;
    @track showDoorLockPw = false;
    @track showCaseModal = false;
    @track selectedCase = null;
    
    get isDashboardTab() { return this.currentTab === 'dashboard'; }
    get isMyOfficeTab() { return this.currentTab === 'myoffice'; }
    get isChargeTab() { return this.currentTab === 'charge'; }
    
    get dashboardNavClass() {
        return `nav-item ${this.currentTab === 'dashboard' ? 'active' : ''}`;
    }
    get myOfficeNavClass() {
        return `nav-item ${this.currentTab === 'myoffice' ? 'active' : ''}`;
    }
    get chargeNavClass() {
        return `nav-item ${this.currentTab === 'charge' ? 'active' : ''}`;
    }

    get bannerStyle() {
        return "background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'); background-size: cover; background-position: center;";
    }
    
    get userName() { return this.portalData.contactName || '사용자'; }
    get companyName() { return this.portalData.accountName || '회사명'; }
    get branchName() { return this.portalData.branchName || '지점명'; }
    get officeName() { return this.portalData.assetName || '호실'; }
    get officeFullName() { return `${this.branchName} - ${this.officeName}`; }
    get capacity() { return this.portalData.capacity || 0; }
    get productName() { return this.portalData.productName || '오피스'; }
    get doorLockPwDisplay() { 
        const pw = this.portalData.doorLockPw || '';
        return this.showDoorLockPw ? pw : '••••••••';
    }
    get doorLockToggleText() { return this.showDoorLockPw ? '숨기기' : '보기'; }
    get wifiSsid() { return this.portalData.wifiSsid || 'WiFi 정보 없음'; }
    get wifiPassword() { return this.portalData.wifiPassword || '******'; }
    
    get contractNumber() { return this.portalData.contractNumber || '-'; }
    get contractStartDate() { return this.formatDate(this.portalData.contractStartDate); }
    get contractEndDate() { return this.formatDate(this.portalData.contractEndDate); }
    get monthlyPayment() { return this.formatCurrency(this.portalData.monthlyPayment); }
    get depositAmount() { return this.formatCurrency(this.portalData.depositAmount); }
    get moveInDate() { return this.formatDate(this.portalData.moveInDate); }
    get billingCycle() { return this.portalData.billingCycle || '월납 (Monthly)'; }
    
    get bizRegistrationNo() { return this.portalData.bizRegistrationNo || '-'; }
    get companyFullName() { return this.portalData.accountName || '-'; }
    
    get daysUntilMoveIn() {
        if (!this.portalData.moveInDate) return 0;
        const moveIn = new Date(this.portalData.moveInDate);
        const today = new Date();
        const diffTime = moveIn - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    get moveInDayDisplay() {
        const days = this.daysUntilMoveIn;
        if (days > 0) {
            return `D-${days}`;
        } else if (days === 0) {
            return 'D-Day';
        } else {
            return `입주 ${Math.abs(days)}일차`;
        }
    }
    
    get daysUntilContractEnd() {
        if (!this.portalData.contractEndDate) return 0;
        const endDate = new Date(this.portalData.contractEndDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    get progressMode() {
        const assetStatus = this.portalData.assetStatus;
        const daysToEnd = this.daysUntilContractEnd;
        
        const isOccupied = assetStatus === 'Occupied' || assetStatus === '입주';
        const isRenewalPending = assetStatus === 'Renewal_Pending_Quote' || assetStatus === '재계약 대상 견적';
        const isRenewalComplete = assetStatus === 'Renewal_Complete' || assetStatus === '재계약 완료';
        
        if (isOccupied && daysToEnd > 90) {
            return 'normal';
        }
        if (isRenewalPending || isRenewalComplete || (isOccupied && daysToEnd <= 90 && daysToEnd > 0)) {
            return 'renewal';
        }
        return 'moveIn';
    }
    
    get isMoveInMode() { return this.progressMode === 'moveIn'; }
    get isNormalMode() { return this.progressMode === 'normal'; }
    get isRenewalMode() { return this.progressMode === 'renewal'; }
    
    get progressSteps() {
        const mode = this.progressMode;
        const assetStatus = this.portalData.assetStatus;
        const contractStatus = this.portalData.contractStatus;
        const daysToMoveIn = this.daysUntilMoveIn;
        const daysToEnd = this.daysUntilContractEnd;
        const hasMoveInWO = this.portalData.hasMoveInWorkOrder;
        const hasRenewalOpp = this.portalData.hasRenewalOpportunity;
        const renewalStage = this.portalData.renewalOpportunityStage;
        
        const isOccupied = assetStatus === 'Occupied' || assetStatus === '입주';
        const isRenewalComplete = assetStatus === 'Renewal_Complete' || assetStatus === '재계약 완료';
        
        if (mode === 'moveIn') {
            const step1 = { label: '계약 체결 완료', status: 'completed' };
            
            let step2Status = 'pending';
            if (contractStatus === 'Activated' || contractStatus === 'Closed' || contractStatus === '서명 완료') {
                step2Status = 'completed';
            } else if (contractStatus === 'In_Approval_Process' || contractStatus === '서명 요청 발송') {
                step2Status = 'active';
            }
            const step2 = { label: '보증금 확인', status: step2Status };
            
            let step3Status = 'pending';
            if (isOccupied) {
                step3Status = 'completed';
            } else if (hasMoveInWO || (daysToMoveIn <= 14 && daysToMoveIn > 3)) {
                step3Status = 'active';
            } else if (step2Status === 'completed') {
                step3Status = 'active';
            }
            const step3 = { label: '입주 세팅 중', status: step3Status };
            
            let step4Status = 'pending';
            if (isOccupied) {
                step4Status = 'completed';
            } else if (daysToMoveIn <= 3 && daysToMoveIn >= 0) {
                step4Status = 'active';
            }
            const step4 = { label: '최종 점검', status: step4Status };
            
            let step5Status = 'pending';
            if (isOccupied || daysToMoveIn < 0) {
                step5Status = 'completed';
            }
            const step5 = { label: '입주 완료', status: step5Status };
            
            return this.formatProgressSteps([step1, step2, step3, step4, step5]);
        }
        
        if (mode === 'renewal') {
            const step1 = { label: '재계약 안내', status: 'completed' };
            
            let step2Status = 'pending';
            if (hasRenewalOpp) {
                if (renewalStage === 'Closed Won') {
                    step2Status = 'completed';
                } else {
                    step2Status = 'active';
                }
            } else if (daysToEnd <= 90) {
                step2Status = 'active';
            }
            const step2 = { label: '재계약 협의', status: step2Status };
            
            let step3Status = 'pending';
            if (isRenewalComplete) {
                step3Status = 'completed';
            } else if (renewalStage === 'Proposal/Price Quote' || renewalStage === 'Negotiation/Review') {
                step3Status = 'active';
            }
            const step3 = { label: '견적 확정', status: step3Status };
            
            let step4Status = 'pending';
            if (isRenewalComplete) {
                step4Status = 'completed';
            }
            const step4 = { label: '재계약 완료', status: step4Status };
            
            return this.formatProgressSteps([step1, step2, step3, step4]);
        }
        
        return [];
    }
    
    formatProgressSteps(steps) {
        return steps.map((step, index) => {
            const stepClass = `progress-step ${step.status}`;
            let connectorClass = 'progress-connector';
            if (index > 0) {
                const prevStatus = steps[index - 1].status;
                if (prevStatus === 'completed' && step.status === 'completed') {
                    connectorClass = 'progress-connector completed';
                } else if (prevStatus === 'completed' && step.status === 'active') {
                    connectorClass = 'progress-connector active';
                }
            }
            return {
                ...step,
                stepClass,
                connectorClass,
                isActive: step.status === 'active',
                isCompleted: step.status === 'completed'
            };
        });
    }
    
    get progressTitle() {
        if (this.progressMode === 'moveIn') return '입주 진행 현황';
        if (this.progressMode === 'renewal') return '재계약 진행 현황';
        return '';
    }
    
    get progressSubtitle() {
        if (this.progressMode === 'moveIn') {
            return `입주일: ${this.moveInDate} (${this.moveInDayDisplay})`;
        }
        if (this.progressMode === 'renewal') {
            return `계약 만료: ${this.contractEndDate} (D-${this.daysUntilContractEnd})`;
        }
        return '';
    }
    
    get recentCases() { 
        const cases = this.portalData.recentCases || [];
        return cases.map(c => {
            const typeIcons = {
                '시설 문의': '🔧',
                '계약 문의': '📄',
                '청구 문의': '💰',
                '일반 문의': '💬',
                'default': '📋'
            };
            const statusClasses = {
                'New': 'case-status new',
                '신규': 'case-status new',
                'Working': 'case-status working',
                '진행중': 'case-status working',
                'Escalated': 'case-status escalated',
                '에스컬레이션': 'case-status escalated',
                'Closed': 'case-status closed',
                '종료': 'case-status closed',
                'default': 'case-status'
            };
            let createdDateFormatted = '-';
            if (c.createdDate) {
                const date = new Date(c.createdDate);
                createdDateFormatted = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
            }
            return {
                ...c,
                icon: typeIcons[c.Type] || typeIcons['default'],
                statusClass: statusClasses[c.Status] || statusClasses['default'],
                CreatedDateFormatted: createdDateFormatted
            };
        });
    }
    get hasCases() { return this.recentCases.length > 0; }
    get caseCountText() { 
        const count = this.recentCases.length;
        return count > 0 ? `${count}건` : ''; 
    }
    get selectedCaseDescription() {
        return this.selectedCase?.description || '상세 내용이 없습니다.';
    }
    
    handleCaseClick(event) {
        const caseId = event.currentTarget.dataset.id;
        const caseItem = this.recentCases.find(c => c.caseId === caseId);
        if (caseItem) {
            this.selectedCase = caseItem;
            this.showCaseModal = true;
        }
    }
    
    closeCaseModal() {
        this.showCaseModal = false;
        this.selectedCase = null;
    }
    
    connectedCallback() {
        console.log('[CustomerPortal] connectedCallback started');
        console.log('[CustomerPortal] Current URL:', window.location.href);
        
        const isOnExperienceCloudSite = window.location.href.includes('/members/') && 
                                         !window.location.href.includes('sitepreview') && 
                                         !window.location.href.includes('livepreview') &&
                                         !window.location.href.includes('live-preview') &&
                                         !window.location.href.includes('salesforce-experience.com') &&
                                         !window.location.href.includes('lwr/');
        console.log('[CustomerPortal] isOnExperienceCloudSite:', isOnExperienceCloudSite);
        
        this.contactId = sessionStorage.getItem('contactId');
        this.accountId = sessionStorage.getItem('accountId');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        
        if (this.contactId) {
            sessionStorage.setItem('portal_contactId', this.contactId);
            sessionStorage.setItem('portal_accountId', this.accountId);
        }
        
        console.log('[CustomerPortal] contactId:', this.contactId);
        window.sessionStorage.setItem('agent_contact_id', this.contactId);
        console.log('[CustomerPortal] accountId:', this.accountId);
        console.log('[CustomerPortal] isLoggedIn:', isLoggedIn);
        
        if (!isLoggedIn || !this.contactId) {
            if (isOnExperienceCloudSite) {
                console.log('[CustomerPortal] Not logged in, redirecting to login...');
                window.location.href = '/members/login';
                return;
            }
            
            console.log('[CustomerPortal] Preview mode detected, using dummy data');
            this.contactId = 'PREVIEW_MODE';
            this.accountId = 'PREVIEW_MODE';
            this.isLoading = false;
            this.dataLoaded = true;
            this.portalData = {
                contactName: '미리보기 사용자',
                accountName: '미리보기 회사',
                branchName: '강남본점',
                assetName: '301호',
                capacity: 10,
                productName: '프리미엄 오피스',
                doorLockPw: '******',
                wifiSsid: 'WE-GROW-WiFi',
                wifiPassword: '******',
                contractNumber: 'PREVIEW-001',
                contractStartDate: '2024-01-01',
                contractEndDate: '2024-12-31',
                monthlyPayment: 5000000,
                depositAmount: 100000000,
                moveInDate: '2024-01-15',
                billingCycle: '월납 (Monthly)',
                bizRegistrationNo: '123-45-67890',
                recentCases: []
            };
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['dashboard', 'myoffice', 'charge', 'service'].includes(tabParam)) {
            this.currentTab = tabParam;
        }
        
        this.loadPortalData();
    }
    
    async loadPortalData() {
        console.log('=== [CustomerPortal] loadPortalData START ===');
        console.log('[CustomerPortal] contactId:', this.contactId);
        console.log('[CustomerPortal] accountId:', this.accountId);
        this.isLoading = true;
        
        try {
            const result = await getPortalData({ contactId: this.contactId });
            console.log('[CustomerPortal] Raw result:', result);
            console.log('[CustomerPortal] result.success:', result.success);
            
            if (result.success) {
                this.portalData = result;
                this.dataLoaded = true;
                
                console.log('[CustomerPortal] === DATA CHECK ===');
                console.log('[CustomerPortal] contactName:', result.contactName || '(null)');
                console.log('[CustomerPortal] accountName:', result.accountName || '(null)');
                console.log('[CustomerPortal] assetId:', result.assetId || '(null)');
                console.log('[CustomerPortal] assetName:', result.assetName || '(null)');
                console.log('[CustomerPortal] branchName:', result.branchName || '(null)');
                console.log('[CustomerPortal] capacity:', result.capacity || '(null)');
                console.log('[CustomerPortal] doorLockPw:', result.doorLockPw ? '(exists)' : '(null)');
                console.log('[CustomerPortal] wifiSsid:', result.wifiSsid || '(null)');
                console.log('[CustomerPortal] contractId:', result.contractId || '(null)');
                console.log('[CustomerPortal] contractNumber:', result.contractNumber || '(null)');
                console.log('[CustomerPortal] monthlyPayment:', result.monthlyPayment || '(null)');
                console.log('[CustomerPortal] recentCases count:', result.recentCases?.length || 0);
                console.log('[CustomerPortal] === END DATA CHECK ===');
                
                console.log('[CustomerPortal] contactId:', this.contactId);
                window.sessionStorage.setItem('agent_contact_id', this.contactId);
                
                window.dispatchEvent(new CustomEvent('WE_GROW_DATA_READY', { 
                    detail: { contactId: this.contactId } 
                }));
                
                // 채팅 컨텍스트 저장 (Agentforce용)
                this.saveChatContextForAgent(result);
                
                if (this.accountId) {
                    this.loadInvoices();
                }
            } else {
                console.error('[CustomerPortal] API returned failure');
                console.error('[CustomerPortal] errorMessage:', result.errorMessage);
                this.showToast('오류', result.errorMessage || '데이터를 불러오는데 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('=== [CustomerPortal] EXCEPTION ===');
            console.error('[CustomerPortal] error:', error);
            console.error('[CustomerPortal] error.message:', error?.message);
            console.error('[CustomerPortal] error.body:', error?.body);
            console.error('[CustomerPortal] error.body?.message:', error?.body?.message);
            this.showToast('오류', '포털 데이터 로드 중 오류가 발생했습니다: ' + (error?.body?.message || error?.message || '알 수 없는 오류'), 'error');
        } finally {
            this.isLoading = false;
            console.log('=== [CustomerPortal] loadPortalData END ===');
        }
    }
    
    async loadInvoices() {
        console.log('[CustomerPortal] Loading invoices for accountId:', this.accountId);
        try {
            this.invoices = await getInvoices({ accountId: this.accountId });
            console.log('[CustomerPortal] Invoices loaded:', this.invoices?.length || 0);
        } catch (error) {
            console.warn('[CustomerPortal] Failed to load invoices (Invoice__c may not exist yet)');
            console.warn('[CustomerPortal] Invoice error:', error?.body?.message || error?.message);
            this.invoices = [];
        }
    }
    
    get formattedInvoices() {
        if (!this.invoices || this.invoices.length === 0) return [];
        
        return this.invoices.map(inv => {
            const today = new Date();
            let billingMonthDisplay = '-';
            if (inv.billingMonth) {
                const bDate = new Date(inv.billingMonth);
                billingMonthDisplay = `${bDate.getFullYear()}년 ${bDate.getMonth() + 1}월분`;
            }
            
            let dueDateDisplay = '-';
            let dDayText = '';
            let isUrgent = false;
            if (inv.dueDate) {
                const dDate = new Date(inv.dueDate);
                dueDateDisplay = `${dDate.getFullYear()}.${String(dDate.getMonth() + 1).padStart(2, '0')}.${String(dDate.getDate()).padStart(2, '0')}`;
                
                const diffTime = dDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (inv.status !== '납부 완료' && inv.status !== 'Paid') {
                    if (diffDays > 0) {
                        dDayText = ` (D-${diffDays})`;
                    } else if (diffDays === 0) {
                        dDayText = ' (오늘)';
                        isUrgent = true;
                    } else {
                        dDayText = ` (${Math.abs(diffDays)}일 경과)`;
                        isUrgent = true;
                    }
                }
            }
            
            const isPaid = inv.status === '납부 완료' || inv.status === 'Paid';
            const statusClass = isPaid ? 'status-tag paid' : 'status-tag unpaid';
            const statusDisplay = isPaid ? '납부 완료' : '미납 (Unpaid)';
            const rowClass = isUrgent ? 'urgent' : '';
            
            return {
                invoiceId: inv.invoiceId,
                billingMonthDisplay,
                amountDisplay: this.formatCurrency(inv.amount),
                dueDateDisplay: dueDateDisplay + dDayText,
                statusClass,
                statusDisplay,
                rowClass
            };
        });
    }
    
    get hasInvoices() {
        return this.formattedInvoices.length > 0;
    }
    
    navigateToDashboard() { this.currentTab = 'dashboard'; }
    navigateToMyOffice() { this.currentTab = 'myoffice'; }
    navigateToCharge() { 
        this.currentTab = 'charge'; 
        if (this.accountId && this.invoices.length === 0) {
            this.loadInvoices();
        }
    }

    toggleDoorLockPw() {
        this.showDoorLockPw = !this.showDoorLockPw;
    }

    openContract() {
        window.open(this.contractImageUrl, '_blank');
    }

    openReceipt() {
        window.open(this.receiptImageUrl, '_blank');
    }

    openInvoice() {
        window.open(this.invoiceImageUrl, '_blank');
    }

    handleCaseTypeChange(event) { this.caseType = event.target.value; }
    handleSubjectChange(event) { this.caseSubject = event.target.value; }
    handleDescriptionChange(event) { this.caseDescription = event.target.value; }
    handleUrgentChange(event) { 
        this.isUrgent = event.target.checked;
        this.casePriority = this.isUrgent ? 'High' : 'Low';
    }
    
    async handleSubmitCase() {
        console.log('[CustomerPortal] Submitting case...');
        
        if (!this.caseSubject || !this.caseDescription || !this.caseType) {
            this.showToast('입력 오류', '제목, 유형, 상세 내용을 모두 입력해주세요.', 'warning');
            return;
        }
        
        this.isLoading = true;
        
        try {
            const result = await createCase({
                accountId: this.accountId,
                assetId: this.portalData.assetId,
                subject: this.caseSubject,
                description: this.caseDescription,
                caseType: this.caseType,
                priority: this.casePriority
            });
            
            console.log('[CustomerPortal] Case created:', result);
            this.showToast('성공', '민원이 성공적으로 접수되었습니다.', 'success');
            
            this.caseSubject = '';
            this.caseDescription = '';
            this.caseType = '';
            this.isUrgent = false;
            this.casePriority = 'Low';
            
            this.loadPortalData();
            
            this.currentTab = 'dashboard';
            
        } catch (error) {
            console.error('[CustomerPortal] Failed to create case:', error);
            this.showToast('오류', '민원 접수 중 오류가 발생했습니다.', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    handleCancelCase() {
        this.caseSubject = '';
        this.caseDescription = '';
        this.caseType = '';
        this.isUrgent = false;
        this.casePriority = 'Low';
        this.currentTab = 'dashboard';
    }
    
    handleLogout() {
        sessionStorage.clear();
        window.location.href = '/members/login';
    }
    
    formatDate(dateValue) {
        if (!dateValue) return '-';
        const date = new Date(dateValue);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
    
    formatCurrency(amount) {
        if (!amount) return '0 원';
        return new Intl.NumberFormat('ko-KR').format(amount) + ' 원';
    }
    
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }
    
    async saveChatContextForAgent(portalData) {
        try {
            console.log('[CustomerPortal] Saving chat context for Agentforce...');
            const contextId = await saveChatContext({
                contactId: this.contactId,
                accountId: this.accountId,
                assetId: portalData.assetId,
                branchName: portalData.branchName
            });
            console.log('[CustomerPortal] Chat context saved:', contextId);
        } catch (error) {
            console.warn('[CustomerPortal] Failed to save chat context:', error?.body?.message || error?.message);
        }
    }
}
