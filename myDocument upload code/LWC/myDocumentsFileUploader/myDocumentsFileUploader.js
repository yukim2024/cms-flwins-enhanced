import { LightningElement, api, track } from 'lwc';
import uploadFileToServer from '@salesforce/apex/MyDocumentsFileUploadController.uploadFileToServer';

import insertUploadMetric from '@salesforce/apex/MyDocumentsFileUploadController.insertFileUploadMetric';
// eslint-disable-next-line
import USER_ID from '@salesforce/user/Id';

import UPLOAD_FILE_LABEL from '@salesforce/label/c.myDocuments_UploadFiles';	
import CANCEL_LABEL from '@salesforce/label/c.myDocuments_Cancel';	

import WRONG_FILE_FORMAT_ERROR_LABEL from '@salesforce/label/c.myDocuments_WrongFileFormatError';	

export default class MyDocumentsFileUploader extends LightningElement {
    @api recordId; 
    @track showModal = false;
    @track uploadTime;

    @api uploadFileLabel = UPLOAD_FILE_LABEL;
    @api cancelLabel = CANCEL_LABEL;
    wrongFormatError = WRONG_FILE_FORMAT_ERROR_LABEL;

    @track showWrongFormatError = false;

    get acceptedFormats() {
        return ['.png', '.jpeg', '.jpg', '.pdf', '.heic', '.doc']; 
    }

    acceptedMimeTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'application/pdf',
        'image/heic',
        'image/heif'
    ];

    clickFileInput() {
        this.template.querySelector('.file-upload-input').click();
    }

    openModal() {
        this.showModal = true;
        /* eslint-disable */
        setTimeout(() => {
            const element = this.template.querySelector('.slds-modal__close');
            element.focus();
        }, 10);
        /* eslint-enable */
    }

    closeModal() {
        this.showWrongFormatError = false;
        this.isUploadFileDisabled = false;
        this.showModal = false;
    }

    @track isUploadFileDisabled = false;

    handleFileChange(event) {

        this.isUploadFileDisabled = true;
        this.showWrongFormatError = false;

        const fileInput = event.target;
        const file = event.target.files[0];
        if (!file) {
            this.isUploadFileDisabled = false;
            return;
        }

        if(!this.acceptedMimeTypes.includes(file.type)) {
            this.showWrongFormatError = true;
            this.isUploadFileDisabled = false;
            return;
        }

        if (file.size > 5242880) { //Maximum file size 5 MB allowed
            this.isUploadFileDisabled = false;
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            const start = performance.now();
            
            uploadFileToServer({
                fileName: file.name,
                base64Data: base64,
                createDocumentLink: false
            })
            .then((result) => {

                const end = performance.now();
                this.uploadTime = Math.round(end - start);

            insertUploadMetric({
                documentId : result,
                fileName: file.name,
                userId: USER_ID,
                fileUploadTime: this.uploadTime,
                fileSize: file.size
            })
            // eslint-disable-next-line
            .then(result => {
            })
            this.closeModal();
            this.dispatchEvent(new CustomEvent('fileuploadevent'));
            })
            // eslint-disable-next-line
            .catch(()=> {
                this.isUploadFileDisabled = false;
                //console.error('Upload failed:', error);
            });
        };

        reader.readAsDataURL(file);
    }

}