@isTest
public with sharing class myDocumentsControllerTest {
    
    @TestSetup
    static void makeData(){
        User adminUser = TestDataFactory.createAdminUser();
        User portalUser;

        Id networkId = [SELECT Id FROM Network WHERE Name = 'FL WINS' LIMIT 1].Id;

        
        System.runAs(adminUser) {
            Account testAccount = TestDataFactory.createAccount('Test Account');
            Contact testContact = TestDataFactory.createContact(
                testAccount, 
                'Test', 
                'User', 
                'test.contact13241235@example.com'
            );
            portalUser = TestDataFactory.createPortalUser(testContact);
        }

        
        System.runAs(portalUser) {
            // Create a test ContentVersion record
            ContentVersion cv = new ContentVersion();
            cv.Title = 'Test Document';
            cv.PathOnClient = 'TestDocument.pdf';
            cv.VersionData = Blob.valueOf('Test Content with specific size');
            cv.IsMajorVersion = true;
            cv.NetworkId = networkId;

            ContentVersion cv2 = new ContentVersion();
            cv2.Title = 'Test Document2';
            cv2.PathOnClient = 'TestDocument.doc';
            cv2.VersionData = Blob.valueOf('Test Content with specific size');
            cv2.IsMajorVersion = true;
            cv2.NetworkId = networkId;

            ContentVersion cv3 = new ContentVersion();
            cv3.Title = 'Test Document3';
            cv3.PathOnClient = 'TestDocument.png';
            cv3.VersionData = Blob.valueOf('Test Content with specific size');
            cv3.IsMajorVersion = true;
            cv3.NetworkId = networkId;
            insert new List<ContentVersion>{cv, cv2, cv3};
        }
    }

    @isTest 
    public static void getUserDocumentsTest() {
        User portalUser = [SELECT Id FROM User WHERE Email = 'test.contact13241235@example.com'];
        List<myDocumentsController.UserDocument> userDocs;

         Test.startTest();
         System.runAs(portalUser) {
            String documentsJson = myDocumentsController.getUserDocuments();
            userDocs = (List<myDocumentsController.UserDocument>)JSON.deserialize(documentsJson, List<myDocumentsController.UserDocument>.class);
            System.assert(userDocs.size() > 0);
         }
         
         Test.stopTest();

         

    }

    @isTest
    public static void deleteUserDocumentTest() {
        User portalUser = [SELECT Id FROM User WHERE Email = 'test.contact13241235@example.com'];
        Test.startTest();
        System.runAs(portalUser) {
            Id cdId = [SELECT Id FROM ContentDocument WHERE Title = 'Test Document' LIMIT 1].Id;
            String successResult = myDocumentsController.deleteUserDocument(cdId);
            System.assertEquals( 'success', successResult);
        }
         
         Test.stopTest();

         
    }
}