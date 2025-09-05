/**
 * Note: This class is Duplicate of FLWINSProfileMenuControllerTest, Need to deprecate it in Future releases as it has no dependencies.
 * 
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@IsTest
public class ProfileMenuControllerTest {
    @IsTest
    static void testGetCurrentUser() {
        User testUser = TestDataFactory.createAdminUser();
        
        System.runAs(testUser) {
            User currentUser = ProfileMenuController.getCurrentUser();
            System.assertEquals(testUser.Id, currentUser.Id, 
                'The current user should be the same as the user returned by the method.');
        }
    }

    @IsTest
    static void testGetAccountIdWithContact() {
        User adminUser = TestDataFactory.createAdminUser();
        
        System.runAs(adminUser) {
            Account testAccount = TestDataFactory.createAccount('Test Account');
            Contact testContact = TestDataFactory.createContact(
                testAccount, 
                'Test', 
                'Contact', 
                'test.contact' + DateTime.now().getTime() + '@test.com'
            );
            
            User portalUser = TestDataFactory.createPortalUser(testContact, false);
            insert portalUser;
            
            System.runAs(portalUser) {
                String accountId = ProfileMenuController.getAccountId();
                System.assertEquals(testAccount.Id, accountId, 
                    'Account ID should match the Contact\'s Account ID');
            }
        }
    }
    
    @IsTest
    static void testGetAccountIdWithoutContact() {
        User testUser = TestDataFactory.createAdminUser();
        
        System.runAs(testUser) {
            String accountId = ProfileMenuController.getAccountId();
            System.assertEquals(null, accountId, 
                'Account ID should be null for users without Contact records');
        }
    }
}