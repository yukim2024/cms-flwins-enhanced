import { LightningElement,track } from 'lwc';
import getUserDocuments from '@salesforce/apex/myDocumentsController.getUserDocuments';
import deleteDocument from '@salesforce/apex/myDocumentsController.deleteUserDocument';


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
import NO_RESULTS_LABEL from '@salesforce/label/c.myDocuments_NoResults';	
import NO_PREVIEW_ERROR_LABEL from '@salesforce/label/c.myDocuments_NoPreviewError';	

import DOCUMENT_ACTIONS_LABEL from '@salesforce/label/c.myDocuments_DocumentActions';

import NO_RESULTS_IMAGE from '@salesforce/contentAssetUrl/noresultsfoundportal';

export default class MyDocumentsUpload extends LightningElement {

    @track userDocuments = [];
    @track isLoading = true;
    @track showFilePreviewModal = false;
    @track modalFile = {};

    showNoResults = false;

    showImgErrorMsg = false;

    get noResultsImageUrl() {
        const baseUrl = window.location.origin; // eslint-disable-line
        const fullUrl = `${baseUrl}${NO_RESULTS_IMAGE}`;
        return fullUrl;
    }

    @track showDeleteFileModal = false;

    @track deleteFileId = '';

    @track currentlyDeletingFile = false;  

    imgUrls = [];

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
        CONFIRM_LABEL,
        NO_PREVIEW_ERROR_LABEL,
        NO_RESULTS_LABEL,
        DOCUMENT_ACTIONS_LABEL
    };

    connectedCallback() {
        this.fetchDocuments();
    }

    fetchDocuments() {
        this.isLoading = true;
        getUserDocuments()
            .then(result => {
                if(result) {
                    this.userDocuments = JSON.parse(result);
                    this.showNoResults = this.userDocuments.length == 0;
                }
                this.isLoading = false;
            })
            .catch(() => {
                //console.log(error);
                this.isLoading = false;
            });
    }

    downloadDocument(event) {
        let documentId = event.target.value;
        let downloadUrl = this.getDocumentFromId(documentId).DownloadUrl
        window.open(downloadUrl, "_blank");
    }

    isPdf = false;

    previewFileIfEnter(event) {
        if(event.keyCode == 13) {
            this.previewFile(event);
        }
    }

    previewFile(event) {
        let documentId = event.currentTarget.dataset.id;

        let doc = this.getDocumentFromId(documentId);

        this.modalFile = doc;
        if(doc.FileType == 'pdf' || doc.FileType == 'doc' || doc.FileType == 'docx') {
            this.checkForPdfPages(doc);
        } else {
            this.imgUrls = [];
            this.imgUrls.push({pageNumber: 0, url: doc.PreviewUrl});
        }
        this.loadedImgCount = 0;
        this.imgErrorCount = 0;

        this.openModal('previewFile');
    }

    loadedImgCount = 0;
    imgErrorCount = 0;

    handleImgLoad() {
        this.loadedImgCount += 1;
    }

    get showImgErrorMessage() {
        return this.loadedImgCount < 1 && this.imgErrorCount > 0 && (this.loadedImgCount+this.imgErrorCount==15);
    }

    checkForPdfPages(doc) {
        this.imgUrls = [];
        for(let i = 0; i < 99; i++) {
            this.imgUrls.push({pageNumber: i, url: doc.PreviewUrl + '&page=' + i});
        }
    }

    openModal(modalName) {
        if(modalName == 'deleteFile') {
            this.showDeleteFileModal = true;
        } else if (modalName == 'previewFile') {
            this.showFilePreviewModal = true;
        }
        /* eslint-disable */
        setTimeout(() => {
            const element = this.template.querySelector('.slds-modal__close');
            element.focus();
        }, 10);
        /* eslint-enable */
    }

    closeFilePreviewModal() {
        this.showFilePreviewModal = false;
        this.loadedImgCount = 0;
        this.imgErrorCount = 0;
    }

    openDeleteFileModal(event) {
        let documentId = event.target.value;
        this.deleteFileId = documentId;
        this.openModal('deleteFile');
    }

    closeDeleteFileModal() {
        this.deleteFileId = '';
        this.showDeleteFileModal = false;
    }

    deleteFile() {

        let currentFileId = this.deleteFileId;
        this.currentlyDeletingFile = true;
        deleteDocument({contentDocumentId: currentFileId})
            .then(result => {
                if(result && result == 'success') {
                    this.currentlyDeletingFile = false;
                    this.removeDocumentFromList(currentFileId);
                    this.showNoResults = this.userDocuments.length == 0;
                    this.closeDeleteFileModal();
                }
            })
            .catch(() => {
                this.closeDeleteFileModal();
            })
    }

    handleImageError(event) {
        event.target.style.display = 'none';
        this.imgErrorCount += 1;
    }

    getDocumentFromId(documentId) {
        for(let i = 0; i < this.userDocuments.length; i++) {
            if(this.userDocuments[i].Id == documentId) {
                return this.userDocuments[i];
            }
        }
    }

    removeDocumentFromList(documentId) {
        let ind = -1;
        for(let i = 0; i < this.userDocuments.length; i++) {
            if(this.userDocuments[i].Id == documentId) {
                ind = i;
                break;
            }
        }
        if(ind > -1) {
            this.userDocuments.splice(ind,1);
        }
    }

}