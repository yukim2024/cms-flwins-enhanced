import { LightningElement, wire } from 'lwc';
import BROWSE_ALL_PROGRAMS from '@salesforce/label/c.BrowseAllPrograms';
import { CurrentPageReference, NavigationMixin } from "lightning/navigation";
import { extractContentData } from 'c/utils';
import fetchHistoricRecords from '@salesforce/apex/GenerateQrCodeCtrl.fetchHistoricRecords';
import fetchProgramResult from '@salesforce/apex/ServiceMatchController.fetchProgramResult';
import FIRST_NAME_FIELD from '@salesforce/schema/User.FirstName';
import FOR_TEXT from '@salesforce/label/c.ForText';
import getReferralsByExternalId from '@salesforce/apex/ServiceCatalogController.getReferralsByExternalId';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import GO_TO_SERVICE_MATCH from '@salesforce/label/c.GoToServiceMatch';
import Id from '@salesforce/community/Id';
import insertHistoricRecords from '@salesforce/apex/GenerateQrCodeCtrl.insertHistoricRecords';
import LANG from "@salesforce/i18n/lang";
import { listContent } from 'lightning/cmsDeliveryApi';
import NO_SERVICE_MATCH_RESULTS from '@salesforce/label/c.NoServiceMatchResults';
import NOT_FINDING_SERVICE from '@salesforce/label/c.NotFindingService';
import RECOMMENDED_SERVICES from '@salesforce/label/c.RecommendedServices';
import SERVICE_MATCH_RESULTS_DONT_EXIST from '@salesforce/label/c.ServiceMatchResultsDontExist';
import SERVICE_MATCH_RESULTS_TITLE from '@salesforce/label/c.ServiceMatchResultsTitle';
import serviceWizardBasedOnYourNeed from '@salesforce/label/c.servicewizard_basedOnYourNeed';
import updateAssessmentQR from '@salesforce/apex/GenerateQrCodeCtrl.updateAssessment';

/* eslint-disable @lwc/lwc/ssr/no-static-imports-of-user-specific-scoped-modules */
import USER_ID from '@salesforce/user/Id';
import isguest from '@salesforce/user/isGuest';
/* eslint-enable @lwc/lwc/ssr/no-static-imports-of-user-specific-scoped-modules */

const EMPTY_ARRAY_LENGTH = 0, OBJ_APINAME_SERVICE_MATCH_RESULT = 'Service_Match_Result__c', PAGE_NOT_FOUND = 'NotFound__c',  
      SORT_ORDER_NEGATIVE = -1, SORT_ORDER_POSITIVE = 1;

// eslint-disable-next-line new-cap
export default class ServiceMatchResult extends NavigationMixin(LightningElement) {
    cmsContents = [];
    processedSections = [];
    showSpinner = true;
    showSortBy = false;
    showPagination = false;
    inputVar = [];
    resultsLoaded = false;
    source = 'service-match-result';

    label = {
        BROWSE_ALL_PROGRAMS,
        FOR_TEXT,
        GO_TO_SERVICE_MATCH,
        NOT_FINDING_SERVICE,
        NO_SERVICE_MATCH_RESULTS,
        RECOMMENDED_SERVICES,
        SERVICE_MATCH_RESULTS_DONT_EXIST,
        SERVICE_MATCH_RESULTS_TITLE,
        serviceWizardBasedOnYourNeed
    };

    /**
     * Fetch current page reference
     */
    @wire(CurrentPageReference) pageRef;
    /**
     * Get user information
     */
    @wire(getRecord, { fields: [FIRST_NAME_FIELD], recordId: USER_ID })
    userRecord;

    /**
     * Returns the user's first name
     */
    get firstName() {
        if (this.userRecord?.data) {
            return getFieldValue(this.userRecord.data, FIRST_NAME_FIELD);
        } else {
            return '';
        }
    }

    /**
     * Returns whether the user is a guest
     */
    get isGuestUser() {
        return isguest;
    }

    get formattedLanguage() {
        return LANG?.replace('-', '_') || 'en_US';
    }

    /**
     * Returns Boolean on whether service match results exist
     */
    get serviceMatchResultsExist() {
        return this.processedSections.length > EMPTY_ARRAY_LENGTH;
    }

    /**
     * Returns if send results should be visible
     */
    get showSendResultsToEmail() {
        return !this.isHistoricResultsContext && this.serviceMatchResultsExist;
    }

    /**
     * Return program records or service match result based on this.isHistoricResultsContext
     * @param {communityId} communityId 
     */
    @wire(listContent, {
        communityId: Id,
        language: '$formattedLanguage',
        managedContentType: 'Program',
        pageSize: 100
    })
    wiredCmsRecords({ data, error }) {
        if (data) {
            if (this.isHistoricResultsContext) {
                this.getProgramHistoricResult(data.items);
            } else {
                this.getProgramResult(data.items);
            }
        }
        if (error) {
            this.showSpinner = false;
        }
    }

    /**
     * Return the list of programs to display
     * @param {list of programs to display} items 
     */
    getProgramResult(items) {
        if(!import.meta.env.SSR) {
            sessionStorage?.setItem('serviceMatchId', this.pageRef?.state?.recid);
        }
        fetchProgramResult({
            assessmentId : this.pageRef?.state?.recid
        }).then(result => {
            this.inputVar = JSON.parse(result)?.services;
            this.processCmsContent(items);
        }).catch(() => {
            this.showSpinner = false;
        })
    }

    /**
     * Return the list of historic service match result to display
     * @param {list of programs to display} items 
     */
    getProgramHistoricResult(items) {
        const assessId = this.pageRef?.state?.recid;
        if(assessId === null || assessId === '') {
            this.showSpinner = false;
            return;
        }
        fetchHistoricRecords({
            assessId
        }).then(result => {
            this.inputVar = JSON.parse(result);

            if (this.inputVar && this.inputVar.length === EMPTY_ARRAY_LENGTH) {
                this.navigateToNotFound();
            } else {
                this.processCmsContent(items);
            }
        }).catch(() => {
            this.showSpinner = false;
        })
    }

    /**
     * Process CMS Contents
     * @param {list of CMS content records} dataItems 
     */
    processCmsContent(dataItems) {        
        this.cmsContents = dataItems.map(item => extractContentData(item));
        this.fetchReferrals();
    }

    /**
     * Fetch referral records based on programIds
     * @returns void
     */
    fetchReferrals() {
        const programIds = this.cmsContents.map(content => content.ProgramID).filter(Boolean);

        if (isguest || programIds.length === EMPTY_ARRAY_LENGTH) {
            this.processMatchedPrograms();
            return;
        }

        getReferralsByExternalId({ programExternalIds: programIds })
            .then(result => this.handleReferralResult(result))
            .catch(() => this.setDefaultReferralExists())
            .finally(() => this.processMatchedPrograms());
    }

    /**
     * Sanitize referralData input
     * @param {referralData} result 
     */
    handleReferralResult(result) {
        this.cmsContents = this.cmsContents.map(content => {
            const referralData = result[content.ProgramID];
            if (referralData) {
                return this.mapReferralData(content, referralData);
            } 
                return { ...content, referralExists: false };
        });
    }

    /**
     * Map referral item record to add more keys
     * @param {CMS Content item} content 
     * @param {referra record} referralData 
     * @returns new object referralData
     */
    static mapReferralData(content, referralData) {
        return {
            ...content,
            referralDate: referralData.CreatedDate,
            referralExists: true,
            referralStatus: referralData.Status
        };
    }

    /**
     * Add referralExists key to this.cmsContents
     */
    setDefaultReferralExists() {
        this.cmsContents = this.cmsContents.map(content => ({ ...content, referralExists: false }));
    }

    /**
     * Process matched programs to add more keys
     */
    processMatchedPrograms() {
        this.processedSections = this.inputVar.map(section => {
            const matchedPrograms = this.cmsContents
                .filter((content) => {
                    return section.programs.includes(content.ProgramID);
                })
                .sort((programA, programB) => {
                    // First sort by additional match status
                    const aHasAdditionalMatch = section.additionalMatchPrograms?.includes(programA.ProgramID) || false,
                          bHasAdditionalMatch = section.additionalMatchPrograms?.includes(programB.ProgramID) || false;
                    
                    if (aHasAdditionalMatch !== bHasAdditionalMatch) {
                    if (aHasAdditionalMatch) {
                     return SORT_ORDER_NEGATIVE;
                    }
                     return SORT_ORDER_POSITIVE;
                    }
                    
                    // Then sort alphabetically by name
                    return programA.Name.toLowerCase().localeCompare(programB.Name.toLowerCase());
                });
                
            return {
                need: section.need.toLowerCase(),
                programs: matchedPrograms
            };
        });
        this.resultsLoaded = true;
        if (!this.isHistoricResultsContext) {
            this.insertHistoricRecord();
        } else {
            this.showSpinner = false;;
        }
    }

    /**
     * Handle Historic Record Insert
     * @param 
     */
    insertHistoricRecord() {
        insertHistoricRecords({
            assessId: this.pageRef?.state?.recid,
            inputJson: JSON.stringify(this.inputVar)
        }).then(() => {
            this.showSpinner = false;
        }).catch(() => {
            this.showSpinner = false;
        })
    }

    /**
     * Return if page is for Service_Match_Result__c
     */
    get isHistoricResultsContext() {
        return this.pageRef?.attributes?.name !== OBJ_APINAME_SERVICE_MATCH_RESULT;
    }

    /**
     * Navigate user to not found page
     */
    navigateToNotFound() {
        this[NavigationMixin.Navigate]({
            attributes: {
                name: PAGE_NOT_FOUND
            },
            type: 'comm__namedPage'
        });
    }

    handleQrInfo(event) {
        updateAssessmentQR({ assessmentId: 
            this.pageRef?.state?.recid, qrInfo:event.detail.qrDataUrl
        }).then(result => {
            console.log('handleQrInfo result:', result);
        }).catch(error => {
            console.error('Error in handleQrInfo:', error);
        })
    }
}