import { LightningElement, api } from 'lwc';
import labelAdditionalComments from "@salesforce/label/c.intake_AdditionalComment";

export default class ReferralCommentsDisplay extends LightningElement {
    label = {
        labelAdditionalComments
    };
    @api ReferralComments;
    additionalComments = '';

    connectedCallback() {
        if (this.ReferralComments.Comments) {
            this.additionalComments = this.ReferralComments.Comments;
        }
    }
}