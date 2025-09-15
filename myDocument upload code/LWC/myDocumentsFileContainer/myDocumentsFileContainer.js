import { LightningElement, track  } from 'lwc';
import labelDocumentUpload from '@salesforce/label/c.My_Document_Upload_Title';
import { NavigationMixin } from 'lightning/navigation';
import checkIfDocTypeExists from '@salesforce/apex/MyDocumentsFileUploadController.checkIfDocTypeExists';
import USER_ID from '@salesforce/user/Id';

export default class MyDocumentsFileContainer extends NavigationMixin(LightningElement) {
    label = {
        documentUploadtitle : labelDocumentUpload
    };
    selectedDocType;
    showErrorModal = false;
    userId = USER_ID;
    @track currentStep = 1;
    @track selectedCard = '';
    @track hasFiles = false; // track if files are selected
    showErrorModal = false;
    @track isLoading = false; 
    @track showReplaceModal = false;
    key = 0;

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

     // ---- Upload Events ----
    handleUploadFinished(event) {
        this.isLoading = false;
        console.log('Upload finished:');
        this.key += 1;
        
        this.navigateToListPage();
       
    }


    navigateToListPage() {
        // Optionally navigate to a "done" step
         this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/my-documents?c__refresh=true'   // API name of the Experience Builder page
            }
        });
    }

    
    handleUploadError(event) {
        this.isLoading = false;
        console.error('Upload error:', event.detail.error);
    }


    handleBack() {
       if (this.currentStep > 1  && !this.isLoading) {
            this.currentStep--;
        }
    }

    handleNext() {
       if (this.currentStep === 1) {
            console.log('childCmp' + childCmp);
            const childCmp = this.template.querySelector('c-my-documents-select-document-type');
            if (!childCmp.isDocumentTypeSelected()) {
                this.showErrorModal = true; // Show error popup
            }else {
                checkIfDocTypeExists({ 
                documentType: childCmp, 
                linkedEntityId: this.userId  
            })
            .then(result => {
                console.log('Document exists:', result);
                if(result) {
                   
                    this.showReplaceModal = true; //show Modal
                } else {
                    this.navigateToNextScreen();
                }
            })
            .catch(error => {
                console.error('Error checking document:', error);
            });
               
            }
            //this.handleStep1Next({ detail: { selectedCard: this.selectedCard }});
        } else if (this.currentStep === 2) {
            this.isLoading = true;  
            if (!this.hasFiles) {
                //this.showErrorModal = true;
                return;
            }
            console.log('Step 2 button was clicked');
            const parent = this.template.querySelector('c-my-document-file-uploadwith-type');
            if (parent) {
                console.log('calling uploadwith type lwc was called');
                parent.triggerUpload();
            
            } else {
                alert('no parent');
            }
        }
    }

    handleFileSelected(event) {
        this.hasFiles = event.detail.hasFiles;
    }

    handleErrorClose() {
        this.showErrorModal = false; // Close modal
    }

    navigateToNextScreen() {
        // Logic to navigate to next screen
        this.currentStep++;
        console.log('Navigating to next screen...');
    }

    get isBackDisabled() { return this.currentStep === 1 || this.isLoading; }

    get isNextDisabled() {
        if (this.isLoading) return true; 
        if (this.currentStep === 1) {
            return false; // allow click
        }
       else if (this.currentStep === 2) {
            return !this.hasFiles;
        }
        return true;
    }

    get buttonLabel(){
        return this.currentStep === 2? 'Done':'Next';
    }
   
     handleMyDocUploadFinished(event){
        console.log('Upload finished for: ', event.detail.fileName);
        const uploadedFiles = event.detail.files;
        this.isLoading = false; // ✅ stop spinner
        alert('No. of files uploaded : ' + uploadedFiles.length);
        this.navigateToListPage();
       /*
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                name: '/s/my-documents?c__refresh=true'   // API name of the Experience Builder page
            }
        });
      */
     
    }

    navigateToListPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/my-documents'
            }
        });
    }

    handleMyDocUploadError(event) {
        console.log('Upload error: ', event.detail.error);
        this.isLoading = false;
        this.showErrorModal = true;
    }



    myDocHandleUploading() {
        console.log('my documents file container uploading message received');
        this.isLoading = true;  // show spinner
    }

    handleReplaceConfirm() {
        if (this.pendingFile) {
            this.handleDeleteDocs();
           // this.addFileToList(this.pendingFile);
           // this.pendingFile = null;
           // this.myDocUploadFiles();
        }
        this.showReplaceModal = false;
    }

     handleDeleteDocs() {
        deleteDocumentByDocType({ userId: this.userId, documentType: this.selecteddocumenttype })
            .then((result) => {
                if (result === 'success') {
                    console.log('Documents deleted successfully.');
                } else if (result === 'not_found') {
                    console.log('No matching documents found.');
                } else {
                    console.error('Error deleting documents.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }


}