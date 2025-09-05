import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import qrcodeLib from '@salesforce/resourceUrl/flwinsQrCode';

export default class QrCodeGenerator extends LightningElement {
    qrInitialized = false;

    @api hideControls = false;
    @api errorCorrectionLevel = 'H';
    @api text = '';
    @api qrSize = 148;
    _messageFromParent = '';

    @api
    set messageFromParent(value) {
        this._messageFromParent = value;
        if (this.qrInitialized && value) {
            this.generateQRCode();
        }
    }

    get messageFromParent() {
        return this._messageFromParent;
    }

    renderedCallback() {
        if (this.qrInitialized) return;
        this.initializeQRCode();
    }

    initializeQRCode() {
    loadScript(this, qrcodeLib)
        .then(() => {
            this.qrInitialized = true;
            if (this._messageFromParent) {
                this.generateQRCode();
            }
        })
        .catch(error => {
            console.warn('Failed to load QR Code library:', error);
        });
    }

    /* eslint-disable*/
    generateQRCode() {
    try {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const container = this.template.querySelector('.qr-content');
        if (!container) {
            console.warn('QR container not found');
            return;
        }

        // Clear previous content
        container.innerHTML = '';

        // Create QRCode
        new window.QRCode(container, {
            text: this._messageFromParent || '',
            width: this.qrSize,
            height: this.qrSize,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel[this.errorCorrectionLevel || 'H'],
            render: 'canvas' 
        });

        setTimeout(() => {
            const img = container.querySelector('canvas');
            if (img) {
                const qrDataUrl = img.toDataURL('image/png');
                this.dispatchEvent(new CustomEvent('messageevent', {
                    detail: { qrDataUrl },
                    bubbles: true,
                    composed: true
                }));
            } else {
                console.warn('QR canvas not found for data URL generation');
            }
        }, 0);

        } catch (err) {
            console.warn('Error in QR generation:', err);
        }
    }
    /* eslint-enable*/
}