public class ContractAuditDataProvider {
    
    public class Request {
        @InvocableVariable(label='Contract Record')
        public Contract Contract;
        
        @InvocableVariable(label='Contract Id')
        public Id contractId;
    }
    
    public class Response {
        @InvocableVariable(label='Prompt')
        public String Prompt;
    }
    
    @InvocableMethod(label='Get Comparison Data' category='Prompt Templates')
    public static List<Response> getComparisonData(List<Request> requests) {
        List<Response> responses = new List<Response>();
        
        for (Request req : requests) {
            Response res = new Response();
            try {
                Id targetId = (req.Contract != null && req.Contract.Id != null) ? req.Contract.Id : req.contractId;
                
                if (targetId == null) {
                    res.Prompt = 'Error: No contract provided';
                    responses.add(res);
                    continue;
                }
                
                // 1. 새 필드 Biz_Reg_No__c 포함 쿼리
                Contract con = [SELECT Id, Biz_Name__c, Biz_Reg_No__c, Total_Payment_Amount__c, 
                                       Total_Deposit_Amount__c, Billing_Cycle__c, OpportunityId__c 
                                FROM Contract WHERE Id = :targetId LIMIT 1];
                
                if (con.OpportunityId__c == null) {
                    res.Prompt = 'Error: Contract has no associated Opportunity';
                    responses.add(res);
                    continue;
                }
                
                // 2. 견적서 쿼리
                Quote qto = [SELECT GrandTotal, Total_Deposit__c, Main_Billing_Cycle__c, Biz_Name__c, 
                                    Biz_Reg_No__c, Special_Terms__c 
                             FROM Quote WHERE OpportunityId = :con.OpportunityId__c AND IsSyncing = true LIMIT 1];

                // 3. AI가 읽기 좋게 구조화 (Null 처리 포함)
                res.Prompt = '### [Quote Data] ###\n' +
                             '- Company: ' + (qto.Biz_Name__c == null ? '미입력' : qto.Biz_Name__c) + '\n' +
                             '- Biz No: ' + (qto.Biz_Reg_No__c == null ? '미입력' : qto.Biz_Reg_No__c) + '\n' +
                             '- Amount: ' + qto.GrandTotal + '\n' +
                             '- Cycle: ' + qto.Main_Billing_Cycle__c + '\n\n' +
                             '### [Contract Data] ###\n' +
                             '- Company: ' + (con.Biz_Name__c == null ? '미입력' : con.Biz_Name__c) + '\n' +
                             '- Biz No: ' + (con.Biz_Reg_No__c == null ? '미입력' : con.Biz_Reg_No__c) + '\n' +
                             '- Amount: ' + con.Total_Payment_Amount__c + '\n' +
                             '- Cycle: ' + con.Billing_Cycle__c;
                
            } catch (Exception e) {
                res.Prompt = 'Exception: ' + e.getMessage();
            }
            responses.add(res);
        }
        return responses;
    }
}