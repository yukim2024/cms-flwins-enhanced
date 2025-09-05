/**
 * Note: Note: This class is Duplicate of FLWINSProfileMenuController, Need to deprecate it in Future releases as it has no dependencies.
 * @description       : 
 * @author            : William.Simmons@commerce.fl.gov
 * @group             : 
 * @last modified on  : 01-20-2025
 * @last modified by  : William.Simmons@commerce.fl.gov
**/
public with sharing class ProfileMenuController {
    @AuraEnabled
    public static User getCurrentUser() {
        return [SELECT Id, FirstName, UserType FROM User WHERE Id = :UserInfo.getUserId()];
    }

    @AuraEnabled
    public static String getAccountId() {
        User u = [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()];
        if (u.ContactId != null) {
            Contact c = [SELECT AccountId FROM Contact WHERE Id = :u.ContactId LIMIT 1];
            return c.AccountId;
        }
        return null;
    }
}