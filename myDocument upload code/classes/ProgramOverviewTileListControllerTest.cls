/**
 * @description: Test class for the ProgramOverviewTileListController class
 * @author: Alex Brodsky
 * @group: IBM
 * @last modified on:   1/15/2025
 * @last modified by:   IBM
 * Ver      Date        Author              Modification
 * 1.0      1/15/2025   Alex Brodsky        Initial Version
 */
@isTest
public with sharing class ProgramOverviewTileListControllerTest {

    public static String UNIQUE_USERNAME = 'admin@testorg.com.897q38urjsadnf';

    @TestSetup
    public static void setupData() {

        User adminUser = TestDataFactory.createAdminUser(false);
        adminUser.UserName = UNIQUE_USERNAME;
        insert adminUser;

    }
   
    @isTest
    public static void getProgramOverviewDataTest() {

       
        User adminUser = [SELECT Id FROM User WHERE UserName = :UNIQUE_USERNAME LIMIT 1];

        String userLastName = 'Test' + System.now();

        System.runAs(adminUser) {
            Id personAccountRecordTypeId =  Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('PersonAccount').getRecordTypeId();
            Account newPersonAccount = new Account();
            newPersonAccount.FirstName = 'Test';
            newPersonAccount.LastName = userLastName;
            newPersonAccount.PersonEmail = 'test@test.com';
            newPersonAccount.RecordTypeId = personAccountRecordTypeId;
            insert newPersonAccount;
    
            newPersonAccount = [SELECT Id,PersonContactId,PersonContact.FirstName,PersonContact.LastName,PersonContact.Email FROM Account WHERE Id = :newPersonAccount.Id];
            TestDataFactory.createPortalUser(newPersonAccount.PersonContact,true);
        }

        User u = [SELECT Id,AccountId FROM User WHERE LastName = :userLastName];
        
        Program p1 = new Program(Name='test1');
        Program p2 = new Program(Name='test2');
        insert new List<Program>{p1, p2};
        ProgramEnrollment pe1 = new ProgramEnrollment(
            ProgramId = p1.Id,
            AccountId = u.AccountId,
            IsActive = true
        );
        ProgramEnrollment pe2 = new ProgramEnrollment(
            ProgramId = p2.Id,
            AccountId = u.AccountId,
            IsActive = true
        );
        
        insert new List<ProgramEnrollment>{pe1,pe2};

        System.runAs(u) {
            String resultJson = ProgramOverviewTileListController.getProgramOverviewData();
            List<ProgramEnrollment> pes = (List<ProgramEnrollment>)JSON.deserialize(resultJson,List<ProgramEnrollment>.class);
            System.assertEquals(2, pes.size());
        }

        
    }
}