/**
 * WeGrowAgentToolkit - 매물 검색 Agent Action
 * 사용자 쿼리를 기반으로 사용 가능한 오피스 매물을 검색합니다.
 */
public without sharing class WeGrowAgentToolKit {

    // 입력값 구조체: 사용자가 말한 검색어
    public class SearchInput {
        @InvocableVariable(required=true)
        public String userQuery;
    }

    // 출력값 구조체: 에이전트에게 돌려줄 매물 정보
    public class OfficeOutput {
        @InvocableVariable public String assetId;
        @InvocableVariable public String name;
        @InvocableVariable public String location;
        @InvocableVariable public String description;
        @InvocableVariable public Decimal price;
        @InvocableVariable public Integer capacity;
        @InvocableVariable public String imageUrl;
        @InvocableVariable public String tags;
    }

    // 매물 검색 메서드 (Agent Action)
    @InvocableMethod(label='Find Office Assets' description='Search for available office assets (status=Available) based on location and description keywords.')
    public static List<List<OfficeOutput>> findOffices(List<SearchInput> inputs) {
        String query = inputs[0].userQuery;
        String searchKey = '%' + query.replaceAll(' ', '%') + '%';

        // Asset, Account, Product2 조인 검색
        List<Asset> assets = [
            SELECT Id, Name, Capacity__c, Status,
                   Branch_Account__r.Name, 
                   Product2.Name, Product2.Description, Product2.StandardPrice__c, Product2.Family
            FROM Asset
            WHERE Status = 'Available'
            AND (
                Name LIKE :searchKey OR 
                Branch_Account__r.Name LIKE :searchKey OR 
                Product2.Description LIKE :searchKey
            )
            LIMIT 3
        ];

        // 검색 결과 매핑
        List<OfficeOutput> results = new List<OfficeOutput>();
        for(Asset a : assets) {
            OfficeOutput out = new OfficeOutput();
            out.assetId = a.Id;
            out.name = a.Name;
            out.location = a.Branch_Account__r.Name;
            out.description = a.Product2.Description;
            out.price = a.Product2.StandardPrice__c;
            out.capacity = (Integer)a.Capacity__c;
            out.imageUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
            out.tags = a.Product2.Family;
            results.add(out);
        }

        return new List<List<OfficeOutput>>{ results };
    }
}