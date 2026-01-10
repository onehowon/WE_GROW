public without sharing class ChatContextManager {
    
    // 채팅 시작 시 컨텍스트 저장
    @AuraEnabled
    public static String saveContext(String contactId, String accountId, String assetId, String branchName) {
        try {
            System.debug('=== ChatContextManager.saveContext ===');
            System.debug('ContactId: ' + contactId);
            System.debug('AccountId: ' + accountId);
            System.debug('AssetId: ' + assetId);
            System.debug('BranchName: ' + branchName);
            
            // 기존 컨텍스트 삭제 (같은 Contact의 이전 레코드)
            List<Chat_Context__c> oldContexts = [
                SELECT Id FROM Chat_Context__c 
                WHERE Contact__c = :contactId
            ];
            if (!oldContexts.isEmpty()) {
                delete oldContexts;
            }
            
            // 새 컨텍스트 생성
            Chat_Context__c ctx = new Chat_Context__c();
            ctx.Contact__c = contactId;
            ctx.Account__c = accountId;
            ctx.Asset__c = assetId;
            ctx.Branch_Name__c = branchName;
            ctx.Created_Timestamp__c = System.now();
            insert ctx;
            
            System.debug('Context saved: ' + ctx.Id);
            return ctx.Id;
            
        } catch (Exception e) {
            System.debug('Error saving context: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // Agentforce Flow에서 호출 - 가장 최근 컨텍스트 조회
    @InvocableMethod(label='Get Chat Context' description='최근 저장된 채팅 컨텍스트를 가져옵니다' category='Agentforce')
    public static List<ContextResult> getRecentContext(List<ContextRequest> requests) {
        List<ContextResult> results = new List<ContextResult>();
        
        for (ContextRequest req : requests) {
            ContextResult result = new ContextResult();
            
            try {
                System.debug('=== ChatContextManager.getRecentContext ===');
                
                // 가장 최근 컨텍스트 조회 (시간 제한 없음)
                List<Chat_Context__c> contexts = [
                    SELECT Id, Contact__c, Contact__r.Name, 
                           Account__c, Account__r.Name,
                           Asset__c, Asset__r.Name, 
                           Branch_Name__c, Created_Timestamp__c
                    FROM Chat_Context__c 
                    ORDER BY Created_Timestamp__c DESC 
                    LIMIT 1
                ];
                
                System.debug('Found ' + contexts.size() + ' recent contexts');
                
                if (!contexts.isEmpty()) {
                    Chat_Context__c ctx = contexts[0];
                    result.contactId = ctx.Contact__c;
                    result.contactName = ctx.Contact__r?.Name;
                    result.accountId = ctx.Account__c;
                    result.accountName = ctx.Account__r?.Name;
                    result.assetId = ctx.Asset__c;
                    result.assetName = ctx.Asset__r?.Name;
                    result.branchName = ctx.Branch_Name__c;
                    result.success = true;
                    
                    System.debug('Context found: Contact=' + result.contactName + ' Branch=' + result.branchName);
                } else {
                    result.success = false;
                    result.errorMessage = 'No recent chat context found';
                }
                
            } catch (Exception e) {
                result.success = false;
                result.errorMessage = e.getMessage();
                System.debug('Error: ' + e.getMessage());
            }
            
            results.add(result);
        }
        
        return results;
    }
    
    public class ContextRequest {
        @InvocableVariable(label='Placeholder')
        public String placeholder;
    }
    
    public class ContextResult {
        @InvocableVariable(label='Success')
        public Boolean success;
        
        @InvocableVariable(label='Error Message')
        public String errorMessage;
        
        @InvocableVariable(label='Contact ID')
        public String contactId;
        
        @InvocableVariable(label='Contact Name')
        public String contactName;
        
        @InvocableVariable(label='Account ID')
        public String accountId;
        
        @InvocableVariable(label='Account Name')
        public String accountName;
        
        @InvocableVariable(label='Asset ID')
        public String assetId;
        
        @InvocableVariable(label='Asset Name')
        public String assetName;
        
        @InvocableVariable(label='Branch Name')
        public String branchName;
    }
}