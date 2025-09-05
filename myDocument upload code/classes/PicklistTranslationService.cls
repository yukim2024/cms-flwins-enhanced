/**
 * @description: Contains code for translation for Picklist Values for data
 * @author: Mohit Arora
 * @group: IBM
 * @last modified on:   13/03/2025
 * @last modified by:   IBM
 * Ver      Date            Author              Modification
 * 1.0      13/03/2025      Mohit Arora         Initial Version
 */
public without sharing class PicklistTranslationService {
    public String encodedEntries {get; set;}

    /**
     * @description: Translate all picklist values of the object provided for a language
     */
    public PicklistTranslationService() {
        String sObjectName = ApexPages.currentPage().getParameters().get('sObjectName');
        Map<String, String> entries = getPicklistValues(sObjectName);
        this.encodedEntries = JSON.serializePretty(entries);
    }

    /**
     * @description: Translate all picklist values of the object provided for a language
     * @return: Map<String, String> contains original value in Eng to translated language
     * @param: sObjectName - sobject API Name to fetch picklists for
     */
    public static Map<String,String> getPicklistValues(String sObjectName) {
        Map<String, String> retval = new Map<String, String>();
        String[] types = new String[]{sObjectName};
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);
        for (Schema.DescribeSobjectResult res : results) {
            Map<String, Schema.SObjectField> fieldDescribeMap = res.fields.getMap();
            for(String fieldApiName : fieldDescribeMap.keySet()) {
                Schema.DescribeFieldResult fieldDescribe = fieldDescribeMap.get(fieldApiName).getDescribe();
                if(fieldDescribe.getType() == Schema.DisplayType.MULTIPICKLIST || fieldDescribe.getType() == Schema.DisplayType.PICKLIST) {
                    for (Schema.PicklistEntry entry : fieldDescribe.getPicklistValues()) {
                        retval.put(entry.getValue(), entry.getLabel());
                    }
                }
            }
            
        }
        return retval;
    }

    /**
     * @description: Translate all picklist values of the object provided for a language
     * @return: Map<String, String> contains original value in Eng to translated language
     * @param: sObjectName - sobject API Name to fetch picklists for
     * @param: language - language to translate to
     */
    public static Map<String, String> getTranslatedPicklistValue(String sObjectName, String language) {
        PageReference translationPage = Page.PicklistTranslationService;
        translationPage.getParameters().put('lang', language);
        translationPage.getParameters().put('sObjectName', sObjectName);
        String vfContent = !Test.isRunningTest() ? translationPage.getContent().toString() : '{ "White" : "Blanco", "Asian" : "Asiático" }';
        return (Map<String, String>) JSON.deserializeStrict(vfContent, Map<String, String>.class);
    }
}