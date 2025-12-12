public with sharing class WeGrowController {
    @AuraEnabled(cacheable=true)
    public static List<Asset> findOffices(String keyword) {
        String searchKey = '%' + keyword + '%';
        
        return [
            SELECT Id, Name, Price, Description, Status,
                   Capacity__c,             
                   Branch_Account__r.Name    
            FROM Asset
            WHERE Status = '공실'            
            AND (
                Name LIKE :searchKey 
                OR Branch_Account__r.Name LIKE :searchKey
                OR Description LIKE :searchKey
            )
            LIMIT 3
        ];
    }
}