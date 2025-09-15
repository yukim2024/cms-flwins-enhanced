import { LightningElement, track, api } from 'lwc';
import uploadFileToServer from '@salesforce/apex/MyDocumentsFileUploadController.uploadFileToServer';
import insertUploadMetric from '@salesforce/apex/MyDocumentsFileUploadController.insertFileUploadMetric';
import checkIfDocTypeExists from '@salesforce/apex/MyDocumentsFileUploadController.checkIfDocTypeExists';
import deleteDocumentByDocType from '@salesforce/apex/myDocumentsController.deleteUserDocumentsByDocumentType';
import UPLOAD_FILE_S_LABEL from '@salesforce/label/c.myDocuments_UploadFile';
import CANCEL_LABEL from '@salesforce/label/c.myDocuments_Cancel';	
import OR_DRAG_FILES_LABEL from '@salesforce/label/c.or_drag_files_here';
import YOUR_Attached_FILES_LABEL from '@salesforce/label/c.Your_attached_files';
import YOUR_Attached_FILES_DELETE_LABEL from '@salesforce/label/c.Your_attached_files_Delete';
import USER_ID from '@salesforce/user/Id';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class MyDocumentsCustomFileUploader extends LightningElement {
userId = USER_ID;
 @track files = [];
//@api uploadFileLabel = UPLOAD_FILE_S_LABEL;
//@api cancelLabel = CANCEL_LABEL;
@api selecteddocumenttype; // passed from Step2 LWC -- Document Type
@track showWrongFormatError = false;
@track isUploadFileDisabled = false;
@track errorMessage1 = '';

@track showReplaceModal = false;
@track pendingFile = null; // hold file until user decides
@track existingDocs = new Set(); // store uploaded doc types

//MAX_FILE_SIZE = 150 * 1024 * 1024; // 150 MB - need replace to this later
MAX_FILE_SIZE =3 * 1024 * 1024 // 3MB

label = {
        uploadFileLabel: UPLOAD_FILE_S_LABEL,
        cancelLabel: CANCEL_LABEL,
        orDragFilesLabel:OR_DRAG_FILES_LABEL,
        attachedFileLabel:YOUR_Attached_FILES_LABEL,
        attachedFileDeleteLabel:YOUR_Attached_FILES_DELETE_LABEL

};

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


    handleFilesSelected(event) {
        const input = event.target;
        const selectedFile = event.target.files[0]; // only take first file
        this.errorMessage1 = null;
        if (!selectedFile) return;

        if (selectedFile) {
             if (selectedFile.size > this.MAX_FILE_SIZE) {
                console.log('selected file is too big');
                this.selectedFile = null;
                this.files = [];
                this.errorMessage1 = `File "${selectedFile.name}" -  This file size exceeds the limit of ${this.formatFileSize(this.MAX_FILE_SIZE)}.`;
                 console.error(this.errorMessage1);

                 // 🔥 Show popup error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'File Upload Error',
                        message: this.errorMessage1,
                        variant: 'error',
                        mode: 'dismissable' // stays until user closes
                    })
                );
                input.value = ''; 
                // Notify parent that no files are selected
                this.dispatchEvent(new CustomEvent('fileselected', {
                    detail: { hasFiles: false },
                    bubbles: true,
                    composed: true
                }));
                return;
            }
            console.log('selected file is NOT big' + selectedFile.name );
            console.log('this.selecteddocumenttype' + this.selecteddocumenttype);
            console.log('this.userId' + this.userId);
            // 🚨 Check if restricted doc type already exists
            checkIfDocTypeExists({ 
                documentType: this.selecteddocumenttype, 
                linkedEntityId: this.userId  
            })
            .then(result => {
                console.log('Document exists:', result);
                if(result) {
                    //Document exists--
                    this.pendingFile = selectedFile;
                    this.showReplaceModal = true; //show Modal
                } else {
                    //safe to upload
                    /*
                     this.files = [{
                        file: selectedFile,
                        name: selectedFile.name,
                        size: this.formatFileSize(selectedFile.size), 
                        progress: 0,
                        progressStyle: 'width: 0%',
                        iconName: this.getIconName(selectedFile.name)
                    }];
                    this.dispatchEvent(new CustomEvent('fileselected', {
                        detail: { hasFiles: true },
                        bubbles: true,      // allow event to bubble up the DOM
                        composed: true 
                    }));
                    */
                   this.addFileToList(selectedFile);
                }
            })
            .catch(error => {
                console.error('Error checking document:', error);
            });

           

            
        }
         input.value = '';
    }

 
    addFileToList(file) {
        this.files = [{
            file: file,
            name: file.name,
            size: this.formatFileSize(file.size),
            progress: 0,
            progressStyle: 'width: 0%',
            iconName: this.getIconName(file.name)
        }];

        // Notify parent that a file is selected
        this.dispatchEvent(new CustomEvent('fileselected', {
            detail: { hasFiles: true },
            bubbles: true,
            composed: true
        }));
    }

    handleReplaceConfirm() {
        if (this.pendingFile) {
            this.handleDeleteDocs();
            this.addFileToList(this.pendingFile);
            this.pendingFile = null;
           // this.myDocUploadFiles();
        }
        this.showReplaceModal = false;
    }

    handleReplaceCancel() {
        this.pendingFile = null;
        this.showReplaceModal = false;
    }

    handleDragOver(event) {
        event.preventDefault();
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

    handleDrop(event) {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0]; // only take first file
        console.log("droppedFile is " + droppedFile);
        this.errorMessage1 = null;

        if (droppedFile) {
            if (droppedFile.size > this.MAX_FILE_SIZE) {
                // if file size is bigger than max file size, Clear files array
                this.files = [];

                this.errorMessage1 = `File "${droppedFile.name}" - This file size exceeds the limit of ${this.formatFileSize(this.MAX_FILE_SIZE)}.`;
                console.error(this.errorMessage1);

                // Show popup error
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'File Upload Error',
                        message: this.errorMessage1,
                        variant: 'error',
                        mode: 'dismissable'
                    })
                );

                // Notify parent that no files are selected
                this.dispatchEvent(new CustomEvent('fileselected', {
                    detail: { hasFiles: false },
                    bubbles: true,
                    composed: true
                }));

                return;
            }


            this.files = [{
                file: droppedFile,
                name: droppedFile.name,
                size: this.formatFileSize(droppedFile.size),
                progress: 0,
                progressStyle: 'width: 0%',
                iconName: this.getIconName(droppedFile.name)
            }];

            // Notify parent that file is selected
            this.dispatchEvent(new CustomEvent('fileselected', {
                detail: { hasFiles: true },
                bubbles: true,
                composed: true
            }));
        }
    }

    removeFile(event) {
        const fileName = event.currentTarget.dataset.name;
        this.files = this.files.filter(file => file.name !== fileName);

        // Notify parent if no files left
        if (this.files.length === 0) {
            this.dispatchEvent(new CustomEvent('fileselected', {
                detail: { hasFiles: false },
                bubbles: true,
                composed: true
            }));
        }
    }

    getIconName(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        switch(ext) {
            case 'pdf': return 'doctype:pdf';
            case 'doc':
            case 'docx': return 'doctype:word';
            case 'xls':
            case 'xlsx': return 'doctype:excel';
            case 'ppt':
            case 'pptx': return 'doctype:ppt';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'doctype:image';
            case 'txt': return 'doctype:text';
            default: return 'doctype:attachment';
        }
    }

    @api
    async myDocUploadFiles() {
        console.log('customfile upload was called with myDocUploadFiles');
        console.log('selecteddocumenttype:', this.selecteddocumenttype);
        this.isUploadFileDisabled = true;

        if (!this.files || this.files.length === 0) {
            console.warn('No files to upload');
            this.isUploadFileDisabled = false;
            return;
        }
        console.log(' myDocUploadFiles -- dispatch uploading')
        this.dispatchEvent(new CustomEvent('myDocUploading', {
            bubbles: true,
            composed: true
        }));

        const filenames = [];
        const failedFiles = [];

    for (const fileWrapper of this.files) {
        const file = fileWrapper.file;

        // Validate file type and size
        if (!this.acceptedMimeTypes.includes(file.type)) {
            console.warn(`Invalid file type: ${file.name}`);
            failedFiles.push(file.name);
            continue;
        }

        if (file.size >  this.MAX_FILE_SIZE) { // 5 MB limit
            console.warn(`File too large: ${file.name}`);
            failedFiles.push(file.name);
            continue;
        }

        filenames.push({ name: file.name, size: file.size });

        console.warn('FileReader');
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            const start = performance.now();
            uploadFileToServer({
                fileName: file.name,
                base64Data: base64,
                createDocumentLink: false,
                documentType:this.selecteddocumenttype
            })
            .then((result) => {
                const end = performance.now();
                this.uploadTime = Math.round(end - start);
                console.log('uploadTime', this.uploadTime); 

                insertUploadMetric({
                    documentId : result,
                    fileName: file.name,
                    userId: USER_ID,
                    fileUploadTime: this.uploadTime,
                    fileSize: file.size
                })
              
                .then(result => {
                })
                    //this.closeModal();
                    console.log('Upload + metric complete for', file.name);
                    //this.dispatchEvent(new CustomEvent('mydocfileuploadevent'));

                    // Notify parent/grandparent that upload finished
                    
                    console.log('mydocument custom file uploader --> upload finished dispatch event', file.name);
                    this.dispatchEvent(new CustomEvent('mydocuploadfinished', {
                        detail: { files: filenames, failedFiles},
                        bubbles: true,
                        composed: true
                    }));
                    this.isUploadFileDisabled = false;

                })
                // eslint-disable-next-line
                .catch(()=> {
                    console.error('insertUploadMetric failed:', err);
                   // this.isUploadFileDisabled = false;
                    //console.error('Upload failed:', error);
                    this.dispatchEvent(new CustomEvent('mydocuploaderror', {
                        detail: { error: error.body?.message || 'Upload failed' },
                        bubbles: true,
                        composed: true
                    }));
                    this.isUploadFileDisabled = false;
                });
         };

        reader.readAsDataURL(file);
    }

    console.log('isUploadFileDisabled = false', this.selecteddocumenttype);
    this.isUploadFileDisabled = false;

    console.log('sending dispatch with mydocuploadfinished ');
    this.dispatchEvent(new CustomEvent('mydocuploadfinished', {
        detail: { files: filenames, failedFiles },
        bubbles: true,
        composed: true
    }));

    if (failedFiles.length > 0) {
        this.dispatchEvent(new CustomEvent('mydocuploaderror', {
            detail: { error: `Failed to upload: ${failedFiles.join(', ')}` },
            bubbles: true,
            composed: true
        }));
    }
}





  formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
    incrementProgress(fileWrapper) {
        let progress = 0;
        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
            } else {
                progress += 10;
                fileWrapper.progress = progress;
                fileWrapper.progressStyle = `width: ${progress}%`;
                this.files = [...this.files]; // trigger re-render
            }
        }, 100);
    }
}