import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';
import authenticateContact from '@salesforce/apex/ContactAuthController.authenticateContact';

export default class WeGrowCustomerLanding extends NavigationMixin(LightningElement) {
    
    logoUrl = WEGROW_LOGO;
    @track email = '';
    @track password = '';
    @track loginError = '';
    @track isLoading = false;

    handleEmailChange(event) {
        this.email = event.target.value.trim();
        this.loginError = '';
        console.log('[WeGrowCustomer] Email changed:', this.email);
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        this.loginError = '';
        console.log('[WeGrowCustomer] Password changed, length:', this.password.length);
    }

    async handleLogin() {
        console.log('========== [WeGrowCustomer] handleLogin START ==========');
        console.log('[WeGrowCustomer] Input email:', this.email);
        console.log('[WeGrowCustomer] Input password length:', this.password.length);
        
        if (!this.email) {
            console.log('[WeGrowCustomer] ERROR: Email is empty');
            this.loginError = '이메일 주소를 입력해주세요.';
            return;
        }
        
        if (!this.password) {
            console.log('[WeGrowCustomer] ERROR: Password is empty');
            this.loginError = '비밀번호를 입력해주세요.';
            return;
        }

        this.isLoading = true;
        this.loginError = '';
        console.log('[WeGrowCustomer] Calling Apex authenticateContact...');

        try {
            const result = await authenticateContact({
                email: this.email,
                password: this.password
            });

            console.log('[WeGrowCustomer] Apex result received:', JSON.stringify(result));
            console.log('[WeGrowCustomer] result.success:', result.success);
            console.log('[WeGrowCustomer] result.message:', result.message);
            console.log('[WeGrowCustomer] result.contactId:', result.contactId);
            console.log('[WeGrowCustomer] result.contactName:', result.contactName);
            console.log('[WeGrowCustomer] result.accountId:', result.accountId);
            console.log('[WeGrowCustomer] result.accountName:', result.accountName);

            if (result.success) {
                console.log('[WeGrowCustomer] Login SUCCESS - Saving to sessionStorage...');
                
                sessionStorage.setItem('contactId', result.contactId);
                sessionStorage.setItem('contactName', result.contactName);
                sessionStorage.setItem('accountId', result.accountId || '');
                sessionStorage.setItem('accountName', result.accountName || '');
                sessionStorage.setItem('isLoggedIn', 'true');
                
                console.log('[WeGrowCustomer] sessionStorage saved:');
                console.log('  - contactId:', sessionStorage.getItem('contactId'));
                console.log('  - contactName:', sessionStorage.getItem('contactName'));
                console.log('  - accountId:', sessionStorage.getItem('accountId'));
                console.log('  - isLoggedIn:', sessionStorage.getItem('isLoggedIn'));

                const evt = new ShowToastEvent({
                    title: '로그인 성공',
                    message: result.message,
                    variant: 'success',
                });
                this.dispatchEvent(evt);

                console.log('[WeGrowCustomer] Preparing navigation...');
                const baseUrl = window.location.origin;
                const communityPath = '/members';
                const targetUrl = `${baseUrl}${communityPath}/dashboard`;
                console.log('[WeGrowCustomer] Target URL:', targetUrl);
                
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    console.log('[WeGrowCustomer] Navigating now...');
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: targetUrl
                        }
                    });
                }, 500);
            } else {
                console.log('[WeGrowCustomer] Login FAILED:', result.message);
                this.loginError = result.message;
                
                const evt = new ShowToastEvent({
                    title: '로그인 실패',
                    message: result.message,
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            }
        } catch (error) {
            console.error('[WeGrowCustomer] EXCEPTION caught:');
            console.error('[WeGrowCustomer] Error object:', error);
            console.error('[WeGrowCustomer] Error message:', error.message);
            console.error('[WeGrowCustomer] Error body:', error.body);
            if (error.body) {
                console.error('[WeGrowCustomer] Error body message:', error.body.message);
                console.error('[WeGrowCustomer] Error body exceptionType:', error.body.exceptionType);
                console.error('[WeGrowCustomer] Error body stackTrace:', error.body.stackTrace);
            }
            
            this.loginError = '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            
            const evt = new ShowToastEvent({
                title: '오류',
                message: '로그인 처리 중 문제가 발생했습니다.',
                variant: 'error',
            });
            this.dispatchEvent(evt);
        } finally {
            this.isLoading = false;
            console.log('========== [WeGrowCustomer] handleLogin END ==========');
        }
    }
}