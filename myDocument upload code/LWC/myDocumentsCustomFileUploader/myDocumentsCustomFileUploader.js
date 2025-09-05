import { LightningElement, track, api } from 'lwc';
import uploadFileToServer from '@salesforce/apex/MyDocumentsFileUploadController.uploadFileToServer';
import insertUploadMetric from '@salesforce/apex/MyDocumentsFileUploadController.insertFileUploadMetric';
import UPLOAD_FILE_S_LABEL from '@salesforce/label/c.myDocuments_UploadFile';
import CANCEL_LABEL from '@salesforce/label/c.myDocuments_Cancel';	
import OR_DRAG_FILES_LABEL from '@salesforce/label/c.or_drag_files_here';
import YOUR_Attached_FILES_LABEL from '@salesforce/label/c.Your_attached_files';
import YOUR_Attached_FILES_DELETE_LABEL from '@salesforce/label/c.Your_attached_files_Delete';




export default class MyDocumentsCustomFileUploader extends LightningElement {
 @track files = [];
//@api uploadFileLabel = UPLOAD_FILE_S_LABEL;
//@api cancelLabel = CANCEL_LABEL;
@api selecteddocumenttype; // passed from Step2 LWC
@track showWrongFormatError = false;
 @track isUploadFileDisabled = false;

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
        if (selectedFile) {
            this.files = [{
                file: selectedFile,
                name: selectedFile.name,
                size: this.formatFileSize(selectedFile.size), 
                progress: 0,
                progressStyle: 'width: 0%',
                iconName: this.getIconName(selectedFile.name)
            }];
             // Dispatch event to notify parent
            this.dispatchEvent(new CustomEvent('fileselected', {
                detail: { hasFiles: true },
                bubbles: true,      // allow event to bubble up the DOM
                composed: true 
            }));
        }
         input.value = '';
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleDrop(event) {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0]; // only take first file
        if (droppedFile) {
            this.files = [{
                file: droppedFile,
                name: droppedFile.name,
                size: this.formatFileSize(droppedFile.size),
                progress: 0,
                progressStyle: 'width: 0%',
                iconName: this.getIconName(droppedFile.name)
            }];
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

        if (file.size > 5242880) { // 5 MB limit
            console.warn(`File too large: ${file.name}`);
            failedFiles.push(file.name);
            continue;
        }

         filenames.push({ name: file.name, size: file.size });

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            const start = performance.now();
            uploadFileToServer({
                fileName: file.name,
                base64Data: base64,
                createDocumentLink: false,
                documentType:this.selecteddocumenttype
                //,
                //documentType: this.selecteddocumenttype
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
                    //this.closeModal();
                    console.log('insertUploadMetric succeeded for', file.name);
                    this.dispatchEvent(new CustomEvent('mydocfileuploadevent'));

                    // Notify parent/grandparent that upload finished
                    /*
                    console.log('mydocument custom file uploader --> upload finished dispatch event', file.name);
                    this.dispatchEvent(new CustomEvent('mydocuploadfinished', {
                        detail: { files: filenames },
                        bubbles: true,
                        composed: true
                    }));*/

                })
                // eslint-disable-next-line
                .catch(()=> {
                    console.error('insertUploadMetric failed:', err);
                    this.isUploadFileDisabled = false;
                    //console.error('Upload failed:', error);
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