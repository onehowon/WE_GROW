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
                
                List<Contract> contracts = [SELECT Id, Biz_Name__c, Biz_Reg_No__c, Total_Payment_Amount__c, 
                                                   Total_Deposit_Amount__c, Billing_Cycle__c, OpportunityId__c 
                                            FROM Contract WHERE Id = :targetId LIMIT 1];
                
                if (contracts.isEmpty()) {
                    res.Prompt = 'Error: 계약서를 찾을 수 없습니다. 계약서 레코드를 확인해주세요.';
                    responses.add(res);
                    continue;
                }
                Contract con = contracts[0];
                
                if (con.OpportunityId__c == null) {
                    res.Prompt = 'Error: 계약서에 연결된 영업기회가 없습니다. 영업기회를 연결해주세요.';
                    responses.add(res);
                    continue;
                }
                
                List<Quote> quotes = [SELECT GrandTotal, Total_Deposit__c, Main_Billing_Cycle__c, Biz_Name__c, 
                                             Biz_Reg_No__c, Special_Terms__c 
                                      FROM Quote WHERE OpportunityId = :con.OpportunityId__c AND IsSyncing = true LIMIT 1];
                
                if (quotes.isEmpty()) {
                    res.Prompt = 'Error: 동기화된 견적서가 없습니다. 견적서에서 [동기화 시작]을 눌러주세요.';
                    responses.add(res);
                    continue;
                }
                Quote qto = quotes[0];

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