import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';

export default class WeGrowCustomerDashboard extends NavigationMixin(LightningElement) {
    logoUrl = WEGROW_LOGO;

    connectedCallback() {
        console.log('Dashboard loaded');
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