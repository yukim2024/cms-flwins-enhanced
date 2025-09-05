import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import communityPath from '@salesforce/community/basePath';

import LABEL_IN_REVIEW from '@salesforce/label/c.servicecatalog_InReview';
import LABEL_SUBMITTED from '@salesforce/label/c.servicecatalog_Submitted';
import LABEL_ENROLLED from '@salesforce/label/c.servicecatalog_Enrolled';
import LABEL_NEW from '@salesforce/label/c.servicecatalog_New';

export default class ProgramCard extends NavigationMixin(LightningElement) {
    @api agency;
    @api name;
    @api excerpt;
    @api referralExists;
    @api referralStatus;
    @api referralDate;
    @api labelLearnMore;
    @api contentUrlName;
    @api source;

    navigateToProgramPage(event) {
        let agencyName = event.target.dataset.agencyname;
        if(!import.meta.env.SSR) {
            sessionStorage?.setItem('agencyName', agencyName);
        }
        let finalUrl = `${communityPath}/${this.contentUrlName}`;
        finalUrl += this.source ? `?c__source=${this.source}` : '';

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: finalUrl
            }
        });
    }

    get showReferral() {
        return this.referralExists === true;
    }

    get referralIconName() {
        if (!this.showReferral) {
            return null;
        }

        const statusIconMap = {
            'In Review': 'utility:clock',
            Enrolled: 'utility:check',
            Submitted: 'utility:send',
            New: 'utility:send'
        };

        return statusIconMap[this.referralStatus] || null;
    }

    get referralStatusText() {
        if (!this.showReferral) {
            return '';
        }

        const statusTextMap = {
            'In Review': LABEL_IN_REVIEW,
            Enrolled: LABEL_ENROLLED,
            Submitted: LABEL_SUBMITTED,
            New: LABEL_NEW
        };

        return statusTextMap[this.referralStatus] || '';
    }

    get showReferralDate() {
        // Show the date only for "Submitted" or "New" statuses
        return this.referralStatus === 'Submitted' || this.referralStatus === 'New';
    }

    get formattedReferralDate() {
        if (!this.referralDate) {
            return '';
        }
        const date = new Date(this.referralDate);
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return dateFormatter.format(date);
    }

    get learnMoreAriaLabel() {
        /* START - Commenting return statement against bug - https://dev.azure.com/flwins/FL%20WINS/_workitems/edit/11830 */
        //return this.labelLearnMore + ' ' + this.name;
        /* END - Commenting return statement against bug - https://dev.azure.com/flwins/FL%20WINS/_workitems/edit/11830 */
        
        return this.name + ' ' + this.labelLearnMore;   /* Added against the bug - https://dev.azure.com/flwins/FL%20WINS/_workitems/edit/11830 */
    }
}