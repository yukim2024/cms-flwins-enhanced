import { LightningElement,api  } from 'lwc';
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


export default class MyDocumentsFileUpload extends LightningElement {
   @api selectedDocument; // receives data from parent
   
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
        return ['.pdf', '.png'];
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        alert('No. of files uploaded : ' + uploadedFiles.length);
    }

}