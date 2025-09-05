/**
 * Component Description:
 * This Lightning Web Component retrieves URL parameters from the browser's address bar, 
 * extracts specific values (such as the instance ID), and updates the OmniScript's data JSON accordingly. 
 * It ensures safe access to browser globals by performing runtime checks.
 * Used in OmniScripts related to OSS processing.
 * 
 * Created by: Pranav B.
 * US: 8047
 * Last modified by: Pranav B.
 * Last updated on: 04/25/2025
 */

import { LightningElement } from "lwc";
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";

export default class RetrieveURLForOSS extends OmniscriptBaseMixin(LightningElement) {
  urlParams = {};
  errorMessage = "";

  extractValue(str) {
    return str.startsWith("c__") ? str.slice(3) : str;
  }

  connectedCallback() {
    try {
      // eslint-disable-next-line @lwc/lwc/no-restricted-browser-globals-during-ssr
      if (typeof window !== "undefined" && window.location && window.location.search) {
        // eslint-disable-next-line @lwc/lwc/no-restricted-browser-globals-during-ssr
        const searchParams = new URLSearchParams(window.location.search);
        this.urlParams = Object.fromEntries(searchParams.entries());
        if (typeof this.urlParams["c__instanceId"] != "undefined") {
          const instanceId = this.extractValue(this.urlParams["c__instanceId"]);
          this.omniUpdateDataJson({
            c__InstanceIDParameter: instanceId,
            c__isPendingRef: "yes",
            c__OSSStatus: "Completed",
          });
        }
      }
    } catch (error) {
      this.errorMessage = error;
    }
  }
}