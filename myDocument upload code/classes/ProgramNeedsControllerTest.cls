@isTest
private class ProgramNeedsControllerTest {

    @isTest
    static void testGetNeedsBasedOnProgramCode() {
        // Setup test data
        String programCodeOne = 'TEST_PROGRAM';
        String programCodeTwo = 'TEST_PROGRAM_TWO';

        // Insert sample Goals_and_Needs_Mapping__c records
        List<Goals_and_Needs_Mapping__c> mappings = new List<Goals_and_Needs_Mapping__c>{
            new Goals_and_Needs_Mapping__c(Service__c = programCodeOne, Related_Need__c = 'Career counseling'),
            new Goals_and_Needs_Mapping__c(Service__c = programCodeOne, Related_Need__c = 'Career exploration'),
            new Goals_and_Needs_Mapping__c(Service__c = programCodeTwo, Related_Need__c = 'Job training and placement')
        };
        insert mappings;

        Test.startTest();
            // Call the method
            String[] result = ProgramNeedsController.getNeedsBasedOnProgramCode(programCodeOne, '');
        Test.stopTest();
    }
}