import { LightningElement, track  } from 'lwc';
import labelDocumentUpload from '@salesforce/label/c.My_Document_Upload_Title';



export default class MyDocumentsFileContainer extends LightningElement {
    label = {
        documentUploadtitle : labelDocumentUpload
    };
    selectedDocType;
    showErrorModal = false;
    @track currentStep = 1;
    @track selectedCard = '';
     @track isNextDisabled = false;

    get isStep1() {
        return this.currentStep === 1;
    }
    get isStep2() {
        return this.currentStep === 2;
    }


    handleDocTypeSelected(event) {
        this.selectedDocType = { ...event.detail }; 
    }


    handleStep1Next(event) {
        this.selectedCard = event.detail.selectedCard; // from child event
        this.currentStep = 2;
    }

    handleBack() {
       if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    handleNext() {
        const childCmp = this.template.querySelector('c-my-documents-select-document-type');

        if (!childCmp.isDocumentTypeSelected()) {
            this.showErrorModal = true; // Show error popup
        }else {
            this.navigateToNextScreen();
        }
        /*
        if (this.currentStep < 2) {
            this.currentStep++;
        }*/
    }

    handleFileSelected(event) {
        // Enable Next button if child has files
        this.isNextDisabled = !event.detail.hasFiles;
    }

    handleErrorClose() {
        this.showErrorModal = false; // Close modal
    }

    navigateToNextScreen() {
        // Logic to navigate to next screen
        this.currentStep++;
        console.log('Navigating to next screen...');
    }
    get isBackDisabled() {
        return this.currentStep === 1;
    }

    get isNextDisabled() {
        return this.currentStep === 2;
    }

    get buttonLabel(){
        return this.currentPage === 2? 'Done':'Next';
    }
}