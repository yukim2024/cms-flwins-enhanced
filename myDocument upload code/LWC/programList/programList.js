import { LightningElement, api, track } from 'lwc';

import LABEL_SORT_BY from '@salesforce/label/c.servicecatalog_SortBy';
import LABEL_LEARN_MORE from '@salesforce/label/c.servicecatalog_LearnMore';
import LABEL_PREVIOUS from '@salesforce/label/c.servicecatalog_Previous';
import LABEL_NEXT from '@salesforce/label/c.servicecatalog_Next';
import LABEL_PAGE from '@salesforce/label/c.servicecatalog_Page';

export default class ProgramList extends LightningElement {
    @api recordsPerPage;
    @api sortOptions;
    @api sortDirection;

    @track _currentPage = 1;
    @track _totalPages = 0;
    @track _displayRecords = [];
    @track _records = [];

    @api labelSortBy = LABEL_SORT_BY;
    @api labelLearnMore = LABEL_LEARN_MORE;
    @api labelPrevious = LABEL_PREVIOUS;
    @api labelNext = LABEL_NEXT;
    @api labelPage = LABEL_PAGE;

    @api showSortBy;
    @api showPagination;
    @api source;

    connectedCallback() {
        if (this._records.length > 0) {
            this.refreshPagination();
        }
    }

    @api
    set records(value) {
        this._records = value || [];
        this.refreshPagination();
    }
    get records() {
        return this._records;
    }

    @api
    get currentPage() {
        return this._currentPage;
    }

    @api
    get totalPages() {
        return this._totalPages;
    }

    @api
    get displayRecords() {
        return this._displayRecords;
    }

    @api
    get isPrevDisabled() {
        return this._currentPage <= 1;
    }

    @api
    get isNextDisabled() {
        return this._currentPage >= this._totalPages;
    }

    @api
    get paginationText() {
        return `${this.labelPage} ${this._currentPage}/${this._totalPages}`;
    }

    refreshPagination() {
        const totalRecords = this._records.length;
        if (this.showPagination) {
            this._totalPages = Math.ceil(totalRecords / this.recordsPerPage) || 1;
            this._currentPage = 1;
            this.updateDisplayRecords();
        } else {
            this._totalPages = 1;
            this._currentPage = 1;
            this._displayRecords = [...this._records];
        }
    }

    updateDisplayRecords() {
        const startIndex = (this._currentPage - 1) * this.recordsPerPage;
        const endIndex = this._currentPage * this.recordsPerPage;
        this._displayRecords = [...this._records.slice(startIndex, endIndex)];
    }

    handleSortChange(event) {
        const value = event.detail.value;
        this.dispatchEvent(new CustomEvent('sortchange', { detail: { value } }));
    }

    @api
    handlePrevPage() {
        if (this._currentPage > 1) {
            this._currentPage--;
            this.updateDisplayRecords();
            this.scrollToTop();
        }
    }

    @api
    handleNextPage() {
        if (this._currentPage < this._totalPages) {
            this._currentPage++;
            this.updateDisplayRecords();
            this.scrollToTop();
        }
    }

    scrollToTop() {
        if (
            (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1) ||
            ('MozBoxSizing' in document.documentElement.style)
        ) {
            window.scrollTo(0, 0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    @api
    get defaultSortDirection() {
        return this.showSortBy ? this.sortDirection : 'asc';
    }
}