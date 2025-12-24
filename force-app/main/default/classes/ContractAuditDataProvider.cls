public class ContractAuditDataProvider {
    @InvocableMethod(label='Get Comparison Data' category='Prompt Templates')
    public static List<String> getComparisonData(List<Id> contractIds) {
        if (contractIds == null || contractIds.isEmpty()) {
            return new List<String>{'Error: No contract ID provided'};
        }
        
        List<Contract> contracts = [
            SELECT Id, Biz_Name__c, Biz_Reg_No__c, Total_Payment_Amount__c, 
                   Total_Deposit_Amount__c, Billing_Cycle__c, OpportunityId__c 
            FROM Contract 
            WHERE Id = :contractIds[0] 
            LIMIT 1
        ];
        
        if (contracts.isEmpty()) {
            return new List<String>{'Error: Contract not found'};
        }
        
        Contract con = contracts[0];
        
        if (con.OpportunityId__c == null) {
            return new List<String>{'Error: Contract has no associated Opportunity'};
        }
        
        List<Quote> quotes = [
            SELECT GrandTotal, Total_Deposit__c, Main_Billing_Cycle__c, Biz_Name__c, 
                   Biz_Reg_No__c, Special_Terms__c 
            FROM Quote 
            WHERE OpportunityId = :con.OpportunityId__c AND IsSyncing = true 
            LIMIT 1
        ];
        
        if (quotes.isEmpty()) {
            return new List<String>{'Error: No syncing quote found for the opportunity'};
        }
        
        Quote qto = quotes[0];

        String result = 'Quote: ' + String.valueOf(qto.Biz_Name__c) + 
                        ', Amount: ' + String.valueOf(qto.GrandTotal) + 
                        ', Cycle: ' + String.valueOf(qto.Main_Billing_Cycle__c) + 
                        '\nContract: ' + String.valueOf(con.Biz_Name__c) + 
                        ', Amount: ' + String.valueOf(con.Total_Payment_Amount__c) + 
                        ', Cycle: ' + String.valueOf(con.Billing_Cycle__c);
        
        return new List<String>{result};
    }
}