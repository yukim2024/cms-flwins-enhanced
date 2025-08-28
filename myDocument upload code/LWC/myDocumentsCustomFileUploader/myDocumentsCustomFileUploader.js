import { LightningElement, track } from 'lwc';
import uploadFileToServer from '@salesforce/apex/MyDocumentsFileUploadController.uploadFileToServer';

export default class MyDocumentsCustomFileUploader extends LightningElement {
 @track files = [];

    handleFilesSelected(event) {
        const input = event.target;
        const selectedFile = event.target.files[0]; // only take first file
        if (selectedFile) {
            this.files = [{
                file: selectedFile,
                name: selectedFile.name,
                progress: 0,
                progressStyle: 'width: 0%',
                iconName: this.getIconName(selectedFile.name)
            }];
             // Dispatch event to notify parent
            this.dispatchEvent(new CustomEvent('fileselected', {
                detail: { hasFiles: true } // or pass this.files if needed
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
                detail: { hasFiles: false }
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

    uploadFiles() {
        this.files.forEach(fileWrapper => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                uploadFileToServer({ fileName: fileWrapper.name, base64Data: base64 })
                    .then(() => {
                        this.incrementProgress(fileWrapper);
                    })
                    .catch(error => {
                        console.error('Upload error', error);
                    });
            };
            reader.readAsDataURL(fileWrapper.file);
        });
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