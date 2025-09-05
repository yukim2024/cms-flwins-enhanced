import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import FORM_ENGLISH from '@salesforce/contentAssetUrl/Form_English';
import FORM_SPANISH from '@salesforce/contentAssetUrl/Form_Spanish';
import FORM_HAITIAN from '@salesforce/contentAssetUrl/Form_Haitian';
import servicepage_NeedToCompleteOffline from '@salesforce/label/c.servicepage_NeedToCompleteOffline';
import servicepage_DownloadPaperVersion from '@salesforce/label/c.servicepage_DownloadPaperVersion';
import languageSelector_English from '@salesforce/label/c.languageSelector_English';
import languageSelector_Spanish from '@salesforce/label/c.languageSelector_Spanish';
import languageSelector_Haitian from '@salesforce/label/c.languageSelector_Haitian';

export default class PaperFormDownload extends NavigationMixin(LightningElement) {
    // import labels/translations
    labels = {
        servicepage_NeedToCompleteOffline,
        servicepage_DownloadPaperVersion,
        languageSelector_English,
        languageSelector_Spanish,
        languageSelector_Haitian
    };

    // import PDF forms
    contentAssetMap = {
        'FORM_ENGLISH': FORM_ENGLISH,
        'FORM_SPANISH': FORM_SPANISH,
        'FORM_HAITIAN': FORM_HAITIAN
    };

    // method to get download URLs of PDF asset files

    getAssetUrl(language) {
        const key = `FORM_${language}`;
        const assetUrl = this.contentAssetMap[key];
        
        return assetUrl || null;
    }

    // Navigate user to asset file download URLs
    /* eslint-disable */
    async downloadDocument(language) {
        const assetUrl = this.getAssetUrl(language);
        
        if (assetUrl) {            
            const baseUrl = window.location.origin;
            const fullUrl = `${baseUrl}${assetUrl}`;
                        
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: fullUrl
                }
            }, true);
        }
    }
    /* eslint-enable */

    // onclick handler for download English PDF
    downloadEN(event) {
        event.preventDefault();
        this.downloadDocument('ENGLISH');
    }

    // onclick handler for download Spanish PDF
    downloadES(event) {
        event.preventDefault();
        this.downloadDocument('SPANISH');
    }

    // onclick handler for download Haitian Creole PDF
    downloadHT(event) {
        event.preventDefault();
        this.downloadDocument('HAITIAN');
    }
}