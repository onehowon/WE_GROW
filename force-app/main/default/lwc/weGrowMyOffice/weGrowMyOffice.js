import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import WEGROW_LOGO from '@salesforce/resourceUrl/WeGrowLogo';
import MOCKUP_OFFICE from '@salesforce/resourceUrl/MockUpOffice';

export default class WeGrowMyOffice extends NavigationMixin(LightningElement) {
    logoUrl = WEGROW_LOGO;
    officeBannerUrl = MOCKUP_OFFICE;

    get bannerStyle() {
        return `background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${this.officeBannerUrl}); background-size: cover; background-position: center;`;
    }

    connectedCallback() {
        console.log('My Office page loaded');
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