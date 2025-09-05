import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import { OmniscriptActionCommonUtil } from "omnistudio/omniscriptActionUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import labelFirstName from "@salesforce/label/c.intake_FirstName";
import labelFirstName_3rdpt from "@salesforce/label/c.intake_FirstName_OnBeHalf";
import labelLastName from "@salesforce/label/c.intake_LastName";
import labelLastName_3rdpt from "@salesforce/label/c.intake_Last_name_OnBeHalf";
import labelMiddleName from "@salesforce/label/c.intake_MiddleName";
import labelEmail from "@salesforce/label/c.intake_Email";
import labelPhoneNumber from "@salesforce/label/c.intake_Phone_Number";
import labelPreferredCommunication from "@salesforce/label/c.intake_WhatYourPreferredMethodCommnication";
import labelPreferredCommunication_3rdpt from "@salesforce/label/c.intake_Preferred_Method_OnBeHalf";
import labelAddressLine1 from "@salesforce/label/c.intake_HomeAddress_AddressLine1";
import labelAddressLine2 from "@salesforce/label/c.intake_HomeAddress_AddressLine2";
import labelCity from "@salesforce/label/c.intake_HomeAddress_City";
import labelState from "@salesforce/label/c.intake_HomeAddress_State";
import labelZipcode from "@salesforce/label/c.intake_HomeAddress_Zipcode";
import labelDateOfBirth from "@salesforce/label/c.intake_DateOfBirth";
import labelDateOfBirth_3rdpt from "@salesforce/label/c.intake_DOB_OnBeHalf";
import labelSocialSecurityNumber from "@salesforce/label/c.intake_SocialSecurityNumber";
import labelSocialSecurityNumber_3rdpt from "@salesforce/label/c.intake_SSN_OnBeHalf";
import labelDriversLicense from "@salesforce/label/c.intake_Drivers_license";
import labelDriversLicense_3rdpt from "@salesforce/label/c.intake_DriversLicenseNumber_OnBeHalf";
import labelStateID from "@salesforce/label/c.intake_State_ID_number";
import labelEthnicity from "@salesforce/label/c.intake_Ethnicity";
import labelRace from "@salesforce/label/c.intake_Race";
import labelSexGender from "@salesforce/label/c.intake_SexGender";
import labelMaritalStatus from "@salesforce/label/c.intake_MaritalStatus";
import labelCitizenshipStatus from "@salesforce/label/c.intake_CitizenshipStatus";
import labelLanguagePreferred from "@salesforce/label/c.intake_LanguagePreferred";
import labelAdditionalComments from "@salesforce/label/c.intake_AdditionalComment";
import labelMyRegistrationIntakeLabel from "@salesforce/label/c.intake_my_registration_intakes_label";
import labelMyRegistrationIntakeSubmittedLabel from "@salesforce/label/c.intake_registration_intake_submitted_label";
import labelIntakeContactAndIdentityLabel from "@salesforce/label/c.intake_contact_and_identity_label";
import labelHomeAddressLabel from "@salesforce/label/c.intake_home_address_label";
import labelIntakeGeneralInformationLabel from "@salesforce/label/c.intake_general_information_label";
import labelWhatFloridaCountyPrimarilyLocatedIn from "@salesforce/label/c.intake_WhatFloridaCountyPrimarilyLocatedIn";
import labelWhatFloridaCountyPrimarilyLocatedIn_3rdpt from "@salesforce/label/c.intake_Primary_Florida_OnBeHalf";

export default class SectionViewer extends OmniscriptBaseMixin(
	LightningElement
) {
	_actionUtil;
	@api omniProcessName;
	@api assessmentId;
	@api sectionName;
	language;
	@track prefilData = {};
	@track showSpinner = true;
	@track currStepLabel;
	@track allDataList = [];
	@track allDataConvertedList = [];
	@track activeSections = [];
	@track label = {
		labelFirstName,
		labelLastName,
		labelMiddleName,
		labelEmail,
		labelPhoneNumber,
		labelPreferredCommunication,
		labelAddressLine1,
		labelAddressLine2,
		labelCity,
		labelState,
		labelZipcode,
		labelDateOfBirth,
		labelSocialSecurityNumber,
		labelDriversLicense,
		labelStateID,
		labelEthnicity,
		labelRace,
		labelSexGender,
		labelMaritalStatus,
		labelCitizenshipStatus,
		labelLanguagePreferred,
		labelAdditionalComments,
		labelMyRegistrationIntakeLabel,
		labelMyRegistrationIntakeSubmittedLabel,
		labelIntakeContactAndIdentityLabel,
		labelHomeAddressLabel,
		labelIntakeGeneralInformationLabel,
		labelWhatFloridaCountyPrimarilyLocatedIn,
		labelFirstName_3rdpt,
		labelLastName_3rdpt,
		labelPreferredCommunication_3rdpt,
		labelWhatFloridaCountyPrimarilyLocatedIn_3rdpt,
		labelDateOfBirth_3rdpt,
		labelSocialSecurityNumber_3rdpt,
		labelDriversLicense_3rdpt
	};

	connectedCallback() {
		this.language = this.returnUrlParam('language');
		this._actionUtil = new OmniscriptActionCommonUtil();
		this.fetchData();
	}

	fetchData() {
		this.showSpinner = true;
		this.prefilData.assessmentId = this.assessmentId;
		this.prefilData.sectionName = this.sectionName;
		this.prefilData.language = this.language;



		const params = {
			input: JSON.stringify(this.omniJsonData),
			sClassName: "SectionViewerController",
			sMethodName: "fetchReviewData",
			options: this.prefilData,
		};
		this._actionUtil
			.executeAction(params, null, this, null, null)
			.then((output) => {
				var reviewData = JSON.parse(output.result.reviewData);
				reviewData[0].sectionHeder = this.convertFieldLabelToCustomLabel(reviewData[0].sectionHeder);
				reviewData[0].responseList.forEach((element) => {
					element.label = this.convertFieldLabelToCustomLabel(element.label);
					if (element.label == "Date of birth") {
						const dateObject = new Date(element.value);
						// Extract month, day, and year -- BUG8180
						let month = ('0' + (dateObject.getUTCMonth() + 1)).slice(-2); // Ensure 2-digit month
						let day = ('0' + dateObject.getUTCDate()).slice(-2); // Ensure 2-digit day
						let year = dateObject.getUTCFullYear();
						element.value = `${month}/${day}/${year}`;
					} else if (element.label == 'State') {
						if (element.value == 'Canada') {
							element.value = 'California';
						}
					}
				});
				if (output.result.reviewData) {
					this.allDataConvertedList = reviewData;
					this.allDataConvertedList.forEach((element) => {
						this.activeSections.push(element.sectionHeder);
					});
				}

				this.showSpinner = false;
			})
			.catch((error) => {
				this.showSpinner = false;
				this.handleError(error);
			});
	}

	handleError(error) {
		let errorMessage = "Something went wrong!!";
		if (error?.body?.message) {
			errorMessage = error.body.message;
		}
		this.showToast("Error", errorMessage, "error");
	}

	showToast(title, message, variant) {
		if (!import.meta.env.SSR) {
			const evt = new ShowToastEvent({
				title: title,
				message: message,
				variant: variant,
			});
			this.dispatchEvent(evt);
		}
	}

	convertFieldLabelToCustomLabel(staticLabel) {
		switch (staticLabel) {
			case "Address line 1":
				return this.label.labelAddressLine1;
			case "Address line 2":
				return this.label.labelAddressLine2;
			case "City":
				return this.label.labelCity;
			case "State":
				return this.label.labelState;
			case "First name":
				return this.label.labelFirstName;
			case "First name (required)":
				return this.label.labelFirstName_3rdpt;
			case "Last name":
				return this.label.labelLastName;
			case "Last name (required)":
				return this.label.labelLastName_3rdpt;
			case "Middle name":
				return this.label.labelMiddleName;
			case "Phone number":
				return this.label.labelPhoneNumber;
			case "What is your preferred method of communication?":
				return this.label.labelPreferredCommunication;
			case "Preferred method of communication":
				return this.label.labelPreferredCommunication_3rdpt;
			case "Social Security Number":
				return this.label.labelSocialSecurityNumber;
			case "Social security number":
				return this.label.labelSocialSecurityNumber;
			case "Social Security number (required)":
				return this.label.labelSocialSecurityNumber_3rdpt;
			case "State ID number":
				return this.label.labelStateID;
			case "Drivers license number":
				return this.label.labelDriversLicense;
			case "Driver's license number":
				return this.label.labelDriversLicense_3rdpt;
			case "Race":
				return this.label.labelRace;
			case "Sex/gender":
				return this.label.labelSexGender;
			case "Ethnicity":
				return this.label.labelEthnicity;
			case "Marital status":
				return this.label.labelMaritalStatus;
			case "Citizenship status":
				return this.label.labelCitizenshipStatus;
			case "Date of birth":
				return this.label.labelDateOfBirth;
			case "Date of birth (required)":
				return this.label.labelDateOfBirth_3rdpt;
			case "ZIP Code":
				return this.label.labelZipcode;
			case "Email":
				return this.label.labelEmail;
			case "What Florida county are you primarily located in?":
				return this.label.labelWhatFloridaCountyPrimarilyLocatedIn;
			case "Primary Florida county":
				return this.label.labelWhatFloridaCountyPrimarilyLocatedIn_3rdpt;
			case "Language preferred":
				return this.label.labelLanguagePreferred;
			case "Contact & Identity":
				return this.label.labelIntakeContactAndIdentityLabel;
			case "Home Address":
				return this.label.labelHomeAddressLabel;
			case "General Information":
				return this.label.labelIntakeGeneralInformationLabel;
			default:
				return staticLabel;
		}
	}

	/**
	 * 
	 * @param {String} param url param to get value for
	 * @returns value of the provided param
	 */
	returnUrlParam(param) {
		let result;
		let windowLocation;
		if (!import.meta.env.SSR) {
			windowLocation = window.location.href;
		}
		if (windowLocation != null) {
			let url = new URL(windowLocation);
			const searchParams = new URLSearchParams(url.search);
			searchParams.forEach((value, key) => {
				if (key === param) {
					result = value;
				}
			});
		}
		return result;
	}
}