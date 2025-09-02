/**
 * @description: Test class for MyDocumentsFileUploadController
 * @author: Alex Brodsky
 * @group: IBM
 * @last modified on:   5/7/2025
 * @last modified by:   IBM
 * Ver      Date            Author                          Modification
 * 1.0      5/7/2025       Alex Brodsky                    Initial Version
 */

@isTest
public with sharing class MyDocumentsFileUploadControllerTest {
    
    @isTest
    static void testRecordFileUploadMetrics() {
        // Prepare test data
        String fileName = 'testFile.pdf';
        String contentDocumentId = '069000000000001AAA'; // Mock ID
        Integer fileSizeInBytes = 1024 * 100; // 100 KB
        
        // Start test
        Test.startTest();
        MyDocumentsFileUploadController.insertFileUploadMetric(
            contentDocumentId, fileName, fileSizeInBytes, UserInfo.getUserId(), 5000
        );
        Test.stopTest();
    
    }

    @isTest
    static void uploadFileToServerTest() {
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
            MyDocumentsFileUploadController.uploadFileToServer('testfilename.pdf', 'testData', false);
        }
        
        
        
    }
}