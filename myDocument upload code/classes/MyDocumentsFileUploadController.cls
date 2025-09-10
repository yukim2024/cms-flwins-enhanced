/**
 * @description: Controller class for the myDocumentsFileUploader LWC
 * @author: Alex Brodsky
 * @group: IBM
 * @last modified on:   5/7/2025
 * @last modified by:   IBM
 * Ver      Date            Author                          Modification
 * 1.0      5/7/2025       Alex Brodsky                    Initial Version
 */

public with sharing class MyDocumentsFileUploadController {

     // Method for uploading files to Salesforce
     @AuraEnabled
     public static Id uploadFileToServer(String fileName, String base64Data, Boolean createDocumentLink, String documentType) {
         Blob fileBody = EncodingUtil.base64Decode(base64Data);
 
         ContentVersion cv = new ContentVersion();
         cv.Title = fileName;
         cv.PathOnClient = '/' + fileName;
         cv.VersionData = fileBody;
         cv.IsMajorVersion = true;
         cv.Document_Type__c =  documentType;
         String contentDocumentId = '';
         
         if(!Test.isRunningTest()) { 
             insert cv; 
             cv = [SELECT Id, Title, Document_Type__c FROM ContentVersion WHERE Id = :cv.Id];
             System.debug('Document_Type__c value: ' + cv.Document_Type__c);
             contentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId;
         }
 
         Id accountId = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()].AccountId;
         
         // If the user does not have an associated account, CDL can not be created
         if(accountId == null){ return cv.Id; }
 
         ContentDocumentLink cdl = new ContentDocumentLink();
         cdl.ContentDocumentId = contentDocumentId != '' ? contentDocumentId : null;
         cdl.LinkedEntityId = accountId;
         cdl.ShareType='V';
         cdl.Visibility = 'AllUsers'; 
 
         if(!Test.isRunningTest() && createDocumentLink) { insert cdl; }
         
         return cv.Id;
     }


    // Inserts a "File Upload Metrics" record with the provided parameters
    @AuraEnabled
    public static void insertFileUploadMetric(String documentId, String fileName, Integer fileSize, String userId, Integer fileUploadTime) {
        System.debug('uploadStartTime: ' + documentId);
        
        try {
            insert new File_Upload_Metrics__c(
                File_Name__c = fileName,
                File_Size_KB__c = fileSize / 1024.0,
                ContentDocument_Id__c = documentId,
                Upload_Duration_Exact__c = fileUploadTime,
                User__c = userId
            );
        } catch (Exception e) {
            System.debug('insertFileUploadMetric failed: ' + e.getMessage());
            throw new AuraHandledException('Failed to insert File Upload Metric: ' + e.getMessage());
        }
    }


    // Retrieves document type names and translated descriptions
   @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getDocumentTypeTranslations(String userLanguage) {
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        List<DocumentType> docTypes = [SELECT Id,DeveloperName, MasterLabel, CreatedDate, Description FROM DocumentType WITH USER_MODE];

        for (DocumentType doc : docTypes) {
            Map<String, Object> entry = new Map<String, Object>();
            entry.put('id', doc.Id); // Pass Id to LW
            entry.put('className','card-item');
            entry.put('isSelected',false);
            entry.put('MasterLabel',doc.MasterLabel);
            entry.put('DeveloperName',doc.DeveloperName);
          

            String labelName = doc.DeveloperName;
            String labelDescription = doc.Description;
            String translatedName = '';
            String translatedDescription = '';
            try {
                translatedName = System.Label.get(null, labelName, userLanguage);
                translatedDescription = System.Label.get(null, labelDescription, userLanguage);
            } catch (Exception e) {
                translatedDescription = labelDescription; // fallback to label name if translation fails
                translatedName = labelName;
            }
            entry.put('name', translatedName);
            entry.put('description', translatedDescription);
            result.add(entry);
        }
        System.debug('result: ' + result);
        
        return result;
    }

    
    // check if this document type is already uploaded
    /*
    @AuraEnabled(cacheable=true)
    public static Boolean checkIfDocTypeExists(String documentType, Id linkedEntityId) {
          // Get max upload count
        DocumentType docType = [
            SELECT Id, DeveloperName, Language, MasterLabel, Description, IsActive, FormType, MaximumFileUploadCount 
            FROM DocumentType
            WHERE IsActive = true
            and DeveloperName =:documentType
            WITH USER_MODE
        ];
       

        String q = 'SELECT Id, DeveloperName, MaximumFileUploadCount ' +
                   'FROM DocumentType WHERE DeveloperName = :documentType';
        String url = '/services/data/v61.0/tooling/query/?q=' + EncodingUtil.urlEncode(q, 'UTF-8');

        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint('callout:Callout_Self' + url); 
        Http h = new Http();
        HttpResponse res = h.send(req);

        // If max upload = 1, check if file exists
        if (docType.MaximumFileUploadCount == 1) {
                List<ContentVersion> existingFiles = [
                SELECT Id
                FROM ContentVersion
                WHERE ContentDocumentId IN (
                    SELECT ContentDocumentId
                    FROM ContentDocumentLink
                    WHERE LinkedEntityId = :linkedEntityId
                )
                AND Document_Type__c = :documentType
                WITH USER_MODE
            ];
            return !existingFiles.isEmpty(); // true = show replace modal
        }
        
        
        return false; // no modal needed for multiple uploads
    }
*/
    @AuraEnabled(cacheable=true)
    public static Boolean checkIfDocTypeExists(String documentType, Id linkedEntityId) {
        DocumentType[] docTypes = [
            SELECT Id, DeveloperName, Language, MasterLabel, Description, IsActive, FormType, MaximumFileUploadCount
            FROM DocumentType
            WHERE IsActive = true
            and DeveloperName =:documentType
            WITH USER_MODE
        ];
        if (docTypes.isEmpty()) {
            return false;
        }
        DocumentType docType = docTypes[0];
        if (docType.MaximumFileUploadCount == 1) {
            List<ContentDocumentLink> cdlList = [
                SELECT ContentDocumentId
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :linkedEntityId
                WITH USER_MODE
            ];
             if (cdlList.isEmpty()) {
                return false;
            }
            Set<Id> contentDocIds = new Set<Id>();
            for (ContentDocumentLink cdl : cdlList) {
                contentDocIds.add(cdl.ContentDocumentId);
            }
            List<ContentVersion> existingFiles = [
                SELECT Id
                FROM ContentVersion
                WHERE ContentDocumentId IN :contentDocIds
                AND Document_Type__c = :documentType
                WITH USER_MODE
            ];

            return !existingFiles.isEmpty();
        }
        return false;
    }
}