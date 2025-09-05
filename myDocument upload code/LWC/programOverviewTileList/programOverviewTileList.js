import { LightningElement,track} from 'lwc';
import getProgramData from '@salesforce/apex/ProgramOverviewTileListController.getProgramOverviewData';

export default class ProgramOverviewTileList extends LightningElement {
    programOverviewList = [];
    errorMessage;
    @track isLoading = true;

    connectedCallback() {
        getProgramData({})
            .then(result => {
                if(result) {
                    let res = JSON.parse(result);
                    this.programOverviewList = res;
                }
            })
            .catch(error => {
                this.errorMessage = error;
            })
    }

}