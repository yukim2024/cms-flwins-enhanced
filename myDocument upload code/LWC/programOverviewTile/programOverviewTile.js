import { LightningElement, api } from 'lwc';

import LABEL_ENROLLED from '@salesforce/label/c.homePage_Enrolled';
import LABEL_REG_INTAKE_SUBMITTED from '@salesforce/label/c.homePage_RegIntakeSubmitted';
import LABEL_UPDATED from '@salesforce/label/c.homePage_Updated';

export default class ProgramOverviewTile extends LightningElement {

    labels = {
        enrolled: LABEL_ENROLLED,
        regIntakeSubmitted: LABEL_REG_INTAKE_SUBMITTED,
        updated: LABEL_UPDATED
    };

    @api programEnrollment = {};

    statusMapping = {
        'Applied': 'Not started',
        'In Progress': 'Active',
        'Completed': 'Completed',
        'Enrolled': 'Completed'
    }

    get parsedAppDate() {
        if(this.programEnrollment.ApplicationDate != null) {
            console.log('this.programEnrollment.ApplicationDate: ' + this.programEnrollment.ApplicationDate + 'T00:00-0800');
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            let newDate = Date.parse(this.programEnrollment.ApplicationDate + 'T00:00-0800');
            return new Date(newDate).toLocaleDateString("en-US",options);
        } else {
            return '';
        }
    }

    get statusIsApplied() {
        return this.programEnrollment.Status == 'Applied'
    }

    get statusIsInProgress() {
        return this.programEnrollment.Status == 'In Progress'
    }

    get statusIsInProgessOrCompleted() {
        return this.statusIsCompleted || this.statusIsInProgress;
    }

    get statusIsCompleted() {
        return this.statusText == 'Completed'
    }

    get statusText() {
        return this.statusMapping[this.programEnrollment.Status];
    }
}