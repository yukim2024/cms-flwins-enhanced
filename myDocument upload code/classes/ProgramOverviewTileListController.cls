/**
 * @description: Controls the programOverViewTileList LWC. 
 * @author: Alex Brodsky
 * @group: IBM
 * @last modified on:   1/15/2025
 * @last modified by:   IBM
 * Ver      Date        Author              Modification
 * 1.0      1/15/2025   Alex Brodsky        Initial Version
 */
public with sharing class ProgramOverviewTileListController {
    /**
     * @description: Returns a list of Program Enrollment records related to the currently logged-in User
     */
    @AuraEnabled 
    public static string getProgramOverviewData() {

        String accountId = UserController.getAccountId(UserInfo.getUserId());

        List<ProgramEnrollment> pes = [
            SELECT Id,
                    Program.Name,
                    Status,
                    StartDate,
                    EndDate,
                    ApplicationDate,
                    LastModifiedDate
            FROM ProgramEnrollment
            WHERE AccountId = :accountId
            AND IsActive = true
        ];

        return JSON.serialize(pes);
    }
}