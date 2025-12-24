public with sharing class WeGrowController {

    @AuraEnabled(cacheable=true)
    public static List<Asset> findOffices(String keyword) {
        if (String.isBlank(keyword)) {
            return new List<Asset>();
        }

        String searchTerm = keyword.trim();
        
        if (searchTerm.contains(' ')) {
            searchTerm = searchTerm.split(' ')[0];
        }
        
        if (searchTerm.length() > 1) {
             searchTerm = searchTerm.removeEnd('역')
                                    .removeEnd('점')
                                    .removeEnd('시')
                                    .removeEnd('구');
        }

        System.debug('최종 검색어: ' + searchTerm);

        String searchKey = '%' + searchTerm + '%';
        List<String> validStatuses = new List<String>{'Available', 'Pre_Available', 'Maintenance'};
        
        return [
            SELECT Id, Name, Price, Description, Status,
                   Capacity__c, Branch_Account__r.Id, Branch_Account__r.Name   
            FROM Asset
            WHERE (
                Name LIKE :searchKey 
                OR Branch_Account__r.Name LIKE :searchKey
            )
            AND Status IN :validStatuses
            LIMIT 3
        ];
    }

    public class AgentInput {
        @InvocableVariable(label='검색 키워드' description='사용자가 말한 지역명이나 지점명 그대로' required=true)
        public String keyword;
    }

    public class AgentOutput {
        @InvocableVariable(label='검색된 오피스 목록' description='오피스 리스트')
        public List<Asset> assets;
    }

    @InvocableMethod(label='오피스 검색' description='오피스를 검색합니다.')
    public static List<AgentOutput> findOfficesForAgent(List<AgentInput> inputs) {
        
        List<AgentOutput> results = new List<AgentOutput>();

        for (AgentInput input : inputs) {
            List<Asset> foundAssets = findOffices(input.keyword);
            
            AgentOutput output = new AgentOutput();
            output.assets = foundAssets;
            results.add(output);
        }

        return results;
    }
}