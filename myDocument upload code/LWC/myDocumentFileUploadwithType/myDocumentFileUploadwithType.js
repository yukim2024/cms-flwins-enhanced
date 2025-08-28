import { LightningElement, api,  track  } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MY_DOCUMENTS_LABEL from '@salesforce/label/c.myDocuments_MyDocuments';	
import TITLE_LABEL from '@salesforce/label/c.myDocuments_Title';	
import LAST_MODIFIED_LABEL from '@salesforce/label/c.myDocuments_LastModified';	
import FILE_SIZE_LIMIT_LABEL from '@salesforce/label/c.myDocuments_FileSizeLimit';	
import FILE_TYPES_LABEL from '@salesforce/label/c.myDocuments_FileTypes';	
import DOWNLOAD_LABEL from '@salesforce/label/c.myDocuments_Download';	
import DELETE_LABEL from '@salesforce/label/c.myDocuments_Delete';	
import DELETE_TITLE_LABEL from '@salesforce/label/c.myDocuments_DeleteTitle';	
import DELETE_MODAL_CONTENT_LABEL from '@salesforce/label/c.myDocuments_DeleteModalContent';	
import CANCEL_LABEL from '@salesforce/label/c.myDocuments_Cancel';	
import CONFIRM_LABEL from '@salesforce/label/c.myDocuments_Confirm';	


export default class MyDocumentFileUploadwithType extends LightningElement {
    @api selectedDocument; // receives data from parent
    @track files = [];
     @api recordId;
    @track selectedFiles = [];  
       label = {
            MY_DOCUMENTS_LABEL,
            TITLE_LABEL,
            LAST_MODIFIED_LABEL,
            FILE_SIZE_LIMIT_LABEL,
            FILE_TYPES_LABEL,
            DOWNLOAD_LABEL,
            DELETE_LABEL,
            DELETE_TITLE_LABEL,
            DELETE_MODAL_CONTENT_LABEL,
            CANCEL_LABEL,
            CONFIRM_LABEL
        };
    
       
    
        get acceptedFormats() {
            return ['.pdf', '.png','.jpeg','.jpg','.heic','.doc'];
        }
    
        handleUploadFinished(event) {
            const uploadedFiles = event.detail.files;
            console.log('Number of files uploaded: ' + uploadedFiles.length);
            uploadedFiles.forEach(file => {
                console.log('Uploaded File Name: ' + file.name);
            });
        }
    
    
        handleFileSelect(event) {
        // event.detail.files contains the selected file(s)
        this.selectedFiles = event.detail.files;
        console.log('Selected files:', this.selectedFiles);
    }

}