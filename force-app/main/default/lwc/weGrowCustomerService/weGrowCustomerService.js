import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowCustomerService extends NavigationMixin(LightningElement) {
    logoUrl = WEGROW_LOGO;

    connectedCallback() {
        console.log('Customer Service page loaded');
    }

    navigateToDashboard() {
        window.location.href = '/members/dashboard';
    }

    navigateToMyOffice() {
        window.location.href = '/members/myoffice';
    }

    navigateToCharge() {
        window.location.href = '/members/charge';
    }

    navigateToService() {
        window.location.href = '/members/service';
    }
}