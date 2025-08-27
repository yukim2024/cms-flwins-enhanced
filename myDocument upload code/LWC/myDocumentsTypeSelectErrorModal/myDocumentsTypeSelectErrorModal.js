import { LightningElement, api} from 'lwc';

export default class MyDocumentsTypeSelectErrorModal extends LightningElement {
    @api message = 'An error occurred';

    handleOk() {
        this.dispatchEvent(new CustomEvent('close'));
    }

}