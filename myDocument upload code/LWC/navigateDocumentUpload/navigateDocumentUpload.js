import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import labelDocumentUpload from '@salesforce/label/c.Upload_Docuement_txt';

export default class NavigateDocumentUpload extends NavigationMixin(LightningElement) {
    label = {
        uploadDocumentTxt: labelDocumentUpload
    }
    navigateToDocumentUploadPage() {
         this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/mydocumentupload' 
            }
        });
    }
}