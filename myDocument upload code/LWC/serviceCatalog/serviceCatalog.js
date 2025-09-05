import { LightningElement, api, track, wire } from 'lwc';
import Id from '@salesforce/community/Id';
import LABEL_A_TO_Z from '@salesforce/label/c.servicecatalog_a_z';
import LABEL_CAREERSOURCE from '@salesforce/label/c.servicecatalog_CareerSource';
import LABEL_CHOOSE_PROVIDER from '@salesforce/label/c.servicecatalog_ChooseProvider';
import LABEL_DCF from '@salesforce/label/c.servicecatalog_DCF';
import LABEL_DOE from '@salesforce/label/c.servicecatalog_DOE';
import LABEL_FLORIDACOMMERCE from '@salesforce/label/c.servicecatalog_FloridaCommerce';
import LABEL_SERVICES from '@salesforce/label/c.servicecatalog_Services';
import LABEL_Z_TO_A from '@salesforce/label/c.servicecatalog_z_a';
import LANG from '@salesforce/i18n/lang';
// eslint-disable-next-line
import isguest from '@salesforce/user/isGuest';
import getReferralsByExternalId from '@salesforce/apex/ServiceCatalogController.getReferralsByExternalId';
import { listContent } from 'lightning/cmsDeliveryApi';
import { extractContentData } from 'c/utils';


export default class ServiceCatalog extends LightningElement {
    @api recordsPerPage;
    keyword = '';
    selectedAgency = '';
    sortDirection = 'asc';
    cmsContents = [];
    showSpinner = false;
    showSortBy = true;
    showPagination = true;
    dataLoaded = false;

    @track processedRecords = [];

    sortOptions = [
        { label: LABEL_A_TO_Z, value: 'asc' },
        { label: LABEL_Z_TO_A, value: 'desc' }
    ];

    agencyOptions = [
        { label: LABEL_CHOOSE_PROVIDER, value: '' },
        { label: LABEL_FLORIDACOMMERCE, value: LABEL_FLORIDACOMMERCE },
        { label: LABEL_DOE, value: LABEL_DOE },
        { label: LABEL_DCF, value: LABEL_DCF },
        { label: LABEL_CAREERSOURCE, value: LABEL_CAREERSOURCE }
    ];

    agencyAltNames = {
        [LABEL_FLORIDACOMMERCE]: [LABEL_FLORIDACOMMERCE, 'FloridaCommerce (Depatman Komès Florida)'], 
        [LABEL_DOE]: [LABEL_DOE, 'Depatman Edikasyon Florida'],
        [LABEL_DCF]: [LABEL_DCF, 'Depatman Timoun ak Fanmi Florida'],
        [LABEL_CAREERSOURCE]: [LABEL_CAREERSOURCE, 'CareerSource Florida'] 
    };

    connectedCallback() {
        if (!this.dataLoaded) {
            this.showSpinner = true;
        }
    }

    get formattedLanguage() {
        return LANG?.replace('-', '_') || 'en_US';
    }

    @wire(listContent, {
        communityId: Id,
        managedContentType: 'Program',
        language: '$formattedLanguage',
        pageSize: 100
    })
    wiredCmsRecords({ data, error }) {
        if (data) {
            this.processCmsContent(data.items);
        }
        if (error) {
            this.showSpinner = false;
        }
    }

    get serviceCountText() {
        return `${this.totalRecords} ${LABEL_SERVICES}`;
    }

    get totalRecords() {
        return this.processedRecords.length;
    }

    processCmsContent(dataItems) {
        this.cmsContents = dataItems.map(item => extractContentData(item));
        this.dataLoaded = true;
        this.fetchReferrals();
    }

    fetchReferrals() {
        const programIds = this.cmsContents.map(content => content.ProgramID).filter(Boolean);

        if (isguest || programIds.length === 0) {
            this.applyFiltersAndSorting();
            return;
        }

        getReferralsByExternalId({ programExternalIds: programIds })
            .then(result => this.handleReferralResult(result))
            .catch(() => this.setDefaultReferralExists())
            .finally(() => this.applyFiltersAndSorting());
    }

    handleReferralResult(result) {
        this.cmsContents = this.cmsContents.map(content => {
            const referralData = result[content.ProgramID];
            return referralData ? this.mapReferralData(content, referralData) : { ...content, referralExists: false };
        });
    }

    mapReferralData(content, referralData) {
        return {
            ...content,
            referralExists: true,
            referralStatus: referralData.Status,
            referralDate: referralData.CreatedDate
        };
    }

    setDefaultReferralExists() {
        this.cmsContents = this.cmsContents.map(content => ({ ...content, referralExists: false }));
    }

    applyFiltersAndSorting() {
        let filtered = this.cmsContents.filter(content => {
            const keywordMatch = !this.keyword ||
                content.Name.toLowerCase().includes(this.keyword.toLowerCase()) ||
                content.Excerpt.toLowerCase().includes(this.keyword.toLowerCase());
            const nameArr = this.selectedAgency in this.agencyAltNames ? this.agencyAltNames[this.selectedAgency] : [];
            const agencyMatch = !this.selectedAgency || nameArr.includes(content.Agency);
            return keywordMatch && agencyMatch;
            
        });

        filtered = filtered.sort((a, b) =>
            this.sortDirection === 'asc' ? a.Name.localeCompare(b.Name) : b.Name.localeCompare(a.Name)
        );

        this.processedRecords = [...filtered];
        this.showSpinner = false;
    }

    handleFilterChange(event) {
        const { keyword, agency } = event.detail;
        this.keyword = keyword;
        this.selectedAgency = agency;
        this.applyFiltersAndSorting();
    }

    handleClearFilters() {
        this.keyword = '';
        this.selectedAgency = '';
        this.applyFiltersAndSorting();
    }

    handleSortChange(event) {
        this.sortDirection = event.detail.value;
        this.applyFiltersAndSorting();
    }
}