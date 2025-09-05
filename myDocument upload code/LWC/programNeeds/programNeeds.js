/**
* Component Description:
* This Lightning Web Component dynamically displays a list of workforce development programs
* based on the current page context. The displayed programs address specific employment and 
* training-related needs such as job evaluation, planning, coaching, and vocational rehabilitation.
*
* Pages where this component is used:
*  - businessServices
*  - careerAssistance
*  - cCAEEMOP
*  - dELSchoolReadiness
*  - divisionOfBlindServicesDBS
*  - employFlorida
*  - hopeFlorida
*  - migrantAndSeasonalFarmworkerServices
*  - reemploymentAssistance
*  - rSEA
*  - sNAP
*  - sNAPEmploymentAndTraining
*  - stateRapidResponse
*  - temporaryCashAssistanceTCA
*  - tradeAdjustmentAssistanceTAA
*  - vocationalRehabilitationVR
*  - wagnerPeyser
*  - welfareTransition
*  - wIOAAdultAndDislocatedWorker
*  - wIOATitleIYouth
*  - workforceInnovationOpportunityProgram
*
* Created by: 
* Last modified by: Pranav B.
* Last updated on: 04/25/2025
*/

import { LightningElement, api, wire, track } from 'lwc';
import Id from '@salesforce/community/Id';
import { listContent } from 'lightning/cmsDeliveryApi';
import LANG from "@salesforce/i18n/lang";
import { programCodeToUrlNameMap } from 'c/utils';
import program_Needs_Addressed from '@salesforce/label/c.program_Needs_Addressed';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class ProgramNeeds extends OmniscriptBaseMixin(LightningElement) {
    @track _program;
    @track _error;
    @track _needs = [];
    @api contentUrlName;
    @api language;
    
    program_Needs_Addressed = program_Needs_Addressed;
    
    get formattedLanguage() {
        return LANG?.replace('-', '_') || 'en_US';
    }

    @api
    get program() {
        return this._program;
    }
    set program(value) {
        this._program = value;
    }

    @api
    get error() {
        return this._error;
    }
    set error(value) {
        this._error = value;
    }

    @api
    get needs() {
        return this._needs;
    }
    set needs(value) {
        this._needs = value;
    }
    
    @wire(listContent, {
        communityId: Id,
        managedContentType: 'Program',
        language: '$formattedLanguage',
        pageSize: 100
    })
    wiredContent({ data, error }) {
        if (data) {
            this.handleContentData(data);
        }
        if (error) {
            this.handleError(error);
        }
    }
    
    @api
    handleContentData(data) {
        let programId = '';
        const matchingProgram = data.items.find(item => {
            if (item.type !== 'Program') return false;
            programId = item.contentNodes.programID?.value;
            const mappedUrlName = programCodeToUrlNameMap[programId] || '';
            return mappedUrlName === this.contentUrlName;
        });
        
        if (matchingProgram) {
            this._program = matchingProgram;
            this.extractNeedsDataFromProgram(matchingProgram);
        }
    }
    
    handleError(error) {
        this._error = error;
    }
    
    get screenReaderText() {
        return `${this.program_Needs_Addressed} ${this._needs.join(', ')}`;
    }

    /**
     * @description
     * Extracts the 'needsAddressed' field from the given program data.
     * Parses the HTML content, splits the comma-separated values, trims each entry,
     * and assigns the resulting array to the component's _needs property.
     *
     * @param {Object} programData - The program JSON object containing contentNodes.
     * @return {void}
     */
    extractNeedsDataFromProgram(programData) {
        const needsAddressedRaw = programData.contentNodes.needsAddressed.value;
        const parser = new DOMParser();
        const doc = parser.parseFromString(needsAddressedRaw, 'text/html');
        const needsAddressedText = doc.body.textContent.trim();
        let needsAddressedArr = needsAddressedText.split(',');
        let needsAddressedArrTemp = [];
        needsAddressedArr.forEach(need => {
            needsAddressedArrTemp.push(need.trim());
        });
        this._needs = needsAddressedArr;
    }
}