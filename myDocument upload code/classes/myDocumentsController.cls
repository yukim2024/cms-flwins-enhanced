/**
 * @description: Controller class for the myDocuments LWC
 * @author: Alex Brodsky
 * @group: IBM
 * @last modified on:   5/7/2025
 * @last modified by:   IBM
 * Ver      Date            Author                          Modification
 * 1.0      6/16/2025       Alex Brodsky                    Initial Version
 */


public with sharing class myDocumentsController {    

    // Returns all Content Documents owned by the logged-in User (except for QRImage files)
    @AuraEnabled
    public static String getUserDocuments() {

        List<UserDocument> uds = new List<UserDocument>();
        Map<Id,UserDocument> udIdToUd = new Map<Id,UserDocument>();

        String portalUrl = getPortalUrl();

        for(ContentDocument cd : [
            SELECT Id,Title,LastModifiedDate,FileExtension
            FROM ContentDocument
            WHERE OwnerId = :UserInfo.getUserId()
            AND Title != 'QRImage'
            AND (NOT Title LIKE 'Signed By %')
            WITH USER_MODE
            ORDER BY LastModifiedDate DESC
        ]) {
            UserDocument ud = new UserDocument();
            ud.Id = cd.Id;
            ud.Title = cd.Title;
            ud.LastModifiedDate = cd.LastModifiedDate;
            ud.DownloadUrl = portalUrl + '/sfc/servlet.shepherd/document/download/' + cd.Id + '?operationContext=S1'; //#toolbar=0&navpanes=0
            ud.FileType = cd.FileExtension;
            udIdToUd.put(ud.Id, ud);
        }

        for(ContentVersion cv : [SELECT Id,ContentDocumentId,FileExtension, Document_Type__c FROM ContentVersion WHERE ContentDocumentId IN :udIdToUd.keySet()  WITH USER_MODE ORDER BY LastModifiedDate ASC]) {
            String previewUrl = '';
            String docType = '';
           if(cv.FileExtension == 'doc' || cv.FileExtension == 'docx') {
                //previewUrl =  portalUrl + '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId='+cv.Id;
                previewUrl =  portalUrl + '/sfc/servlet.shepherd/version/renditionDownload?rendition=SVGZ&versionId='+cv.Id;
            } else if(cv.FileExtension == 'pdf') {
                previewUrl = portalUrl + '/sfc/servlet.shepherd/version/renditionDownload?rendition=SVGZ&versionId='+cv.Id;
            } else {
                previewUrl = portalUrl + '/sfc/servlet.shepherd/version/renditionDownload?rendition=ORIGINAL_Jpg&versionId='+cv.Id;
            }

            System.debug('docType for ' + cv.Id + ': ' + cv.Document_Type__c);
            System.debug('FileExtension for ' + cv.Id + ': ' + cv.FileExtension);
            udIdToUd.get(cv.ContentDocumentId).PreviewUrl = previewUrl;
            udIdToUd.get(cv.ContentDocumentId).docType = cv.Document_Type__c;
        }

        return JSON.serialize(udIdToUd.values());

    }   

    // Deletes the specified Content Document record
    @AuraEnabled
    public static String deleteUserDocument(String contentDocumentId) {
        String result = 'success';
        try{
            delete [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
        } catch(Exception e) {
            result = 'error';
            //System.debug(e.getMessage());
        }
        return result;
    }

   // Deletes the specified Content Document Type record
    @AuraEnabled
    public static String deleteUserDocumentsByDocumentType(String documentType, Id userId) {
        String result = 'success';
        try {
            // Find latest versions uploaded by the user with the given type
            List<ContentVersion> versions = [
                SELECT ContentDocumentId
                FROM ContentVersion
                WHERE CreatedById = :userId
                AND Document_Type__c = :documentType
                AND IsLatest = true
            ];
            
            Set<Id> docIds = new Set<Id>();
            for (ContentVersion v : versions) {
                docIds.add(v.ContentDocumentId);
            }

            if (!docIds.isEmpty()) {
                List<ContentDocument> docsToDelete = [
                    SELECT Id FROM ContentDocument WHERE Id IN :docIds
                ];
                delete docsToDelete;
            } else {
                result = 'not_found'; // nothing matched
            }
        } catch (Exception e) {
            result = 'error';
            // Optionally log the error
            // System.debug('Delete failed: ' + e.getMessage());
        }
        return result;
    }


    // Returns the base URL of the portal site
    public static String getPortalUrl() {
        Id siteId = [SELECT Id FROM Site WHERE Name = 'FL_WINS' LIMIT 1].Id;
        return [SELECT SecureUrl FROM SiteDetail WHERE DurableId = :siteId].SecureUrl;
    }

    public class UserDocument {
        @AuraEnabled public String Id {get;set;}
        @AuraEnabled public String Title {get;set;}
        @AuraEnabled public String DownloadUrl {get;set;}
        @AuraEnabled public String PreviewUrl {get;set;}
        @AuraEnabled public DateTime LastModifiedDate {get;set;}
        @AuraEnabled public String FileType {get;set;}
        @AuraEnabled public String docType {get;set;} 
    }
}