import { LightningElement, track, wire, api} from 'lwc';
import getDocumentTypes from '@salesforce/apex/MyDocumentsFileUploadController.getDocumentTypeTranslations';
import LANG from "@salesforce/i18n/lang";

export default class MyDocumentsSelectDocumentType extends LightningElement {
    @track selectedDocumentType = '';
    @track documentTypes = []; 
    userLang = LANG;
    selectedDocumentTypeValue;
    @wire(getDocumentTypes, { userLanguage: '$userLang' })
    wiredTranslations({ error, data }) {
        if (data) {
            console.log('Translated Document Types:', data);
             console.log('Current user language is:', LANG);
            this.documentTypes = data;
        } else if (error) {
            console.error('Error retrieving translations:', error);
        }
    }


    handleSelection(event) {
         this.updateSelection(event.target.value);
    }


   handleCardClick(event) {
        const clickedId = event.currentTarget.dataset.id;
        this.updateSelection(clickedId);
    }


   updateSelection(selectedId) {
        this.documentTypes = this.documentTypes.map(documentType => ({
            ...documentType,
            isSelected: documentType.id === selectedId,
            className: documentType.id === selectedId ? 'card-item selected' : 'card-item'
        }));
        const doctypeselected = this.documentTypes.find(d => d.id === selectedId);
       
         if (!doctypeselected) {
            console.warn('No document type found for id:', selectedId);
            return;
        } else {
            console.warn('foundr id:', selectedId);
        }

        this.selectedDocumentType = doctypeselected;
        this.selectedDocumentTypeValue = doctypeselected;
        
        const selectedEvent = new CustomEvent('doctypeselected', {
            detail: this.selectedDocumentTypeValue
        });
        this.dispatchEvent(selectedEvent);

    }

    @api
    isDocumentTypeSelected() {
        return !!this.selectedDocumentTypeValue; // returns true if a program is selected
    }

  
}