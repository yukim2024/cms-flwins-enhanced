@isTest
private class PicklistTranslationServiceTest {
    @isTest
    static void testGetPicklistValues() {
        // Create a test object with a picklist field
        Test.startTest();
            Map<String, String> result = PicklistTranslationService.getTranslatedPicklistValue('Account', 'es');
        Test.stopTest();
        // Validate that result is not null
        System.assertNotEquals(null, result, 'Result should not be null');
    }
    
    @isTest
    static void testConstructor() {
        Test.startTest();
            PageReference pageRef = Page.PicklistTranslationService;
            pageRef.getParameters().put('sObjectName', 'Account');
            Test.setCurrentPage(pageRef);
            PicklistTranslationService service = new PicklistTranslationService();
        Test.stopTest();
        System.assertNotEquals(null, service.encodedEntries, 'Encoded entries should not be null');
    }
}