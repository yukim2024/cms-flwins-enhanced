public with sharing class ProgramNeedsController {

    private static String GOALS_AND_NEEDS_MAPPING_OBJECT_API_NAME = 'Goals_and_Needs_Mapping__c';
    
    @AuraEnabled
    public static String[] getNeedsBasedOnProgramCode(String programCode, String languageCode) {
        Goals_and_Needs_Mapping__c[] goalsAndNeedsMappings = [SELECT Id, Related_Need__c FROM Goals_and_Needs_Mapping__c WHERE Service__c = :programCode];
        String[] returnedNeedsSet = new String[]{};
        for (Goals_and_Needs_Mapping__c goalsAndNeedsMapping : goalsAndNeedsMappings) {
            returnedNeedsSet.add(goalsAndNeedsMapping.Related_Need__c);
        }
        languageCode = String.isEmpty(languageCode) ? 'en-US' : languageCode;
        Map<String, String> translatedPicklistValuesMap = PicklistTranslationService.getTranslatedPicklistValue(GOALS_AND_NEEDS_MAPPING_OBJECT_API_NAME, languageCode);
        String[] fitleredValuesToReturn = new String[]{};
        for (String engPicklistValue : translatedPicklistValuesMap.keySet()) {
            if (returnedNeedsSet.contains(engPicklistValue)) {
                fitleredValuesToReturn.add(translatedPicklistValuesMap.get(engPicklistValue));
            }
        }
        fitleredValuesToReturn.sort();
        return fitleredValuesToReturn;
    }
}