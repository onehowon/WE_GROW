public without sharing class MessagingSessionHandler {
    
    // LWC에서 호출하는 메서드
    @AuraEnabled
    public static LinkResult getCustomerContextForDisplay() {
        LinkResult result = new LinkResult();
        
        try {
            System.debug('=== getCustomerContextForDisplay 시작 ===');
            
            List<Chat_Context__c> contexts = [
                SELECT Id, Contact__c, Account__c, Asset__c, Branch_Name__c,
                       Contact__r.Name, Contact__r.Email, Contact__r.Phone,
                       Account__r.Name, Asset__r.Name
                FROM Chat_Context__c 
                ORDER BY Created_Timestamp__c DESC 
                LIMIT 1
            ];
            
            if (!contexts.isEmpty()) {
                Chat_Context__c ctx = contexts[0];
                
                result.success = true;
                result.contactId = ctx.Contact__c;
                result.contactName = ctx.Contact__r.Name;
                result.contactEmail = ctx.Contact__r.Email;
                result.contactPhone = ctx.Contact__r.Phone;
                result.accountId = ctx.Account__c;
                result.accountName = ctx.Account__r.Name;
                result.assetName = ctx.Asset__r.Name;
                result.branchName = ctx.Branch_Name__c;
                
                if (ctx.Contact__c != null) {
                    List<Case> recentCases = [
                        SELECT Id, CaseNumber, Subject, Status
                        FROM Case 
                        WHERE ContactId = :ctx.Contact__c 
                        ORDER BY CreatedDate DESC 
                        LIMIT 5
                    ];
                    
                    if (!recentCases.isEmpty()) {
                        Case latestCase = recentCases[0];
                        result.latestCaseId = latestCase.Id;
                        result.latestCaseNumber = latestCase.CaseNumber;
                        result.latestCaseSubject = latestCase.Subject;
                        result.latestCaseStatus = latestCase.Status;
                        result.recentCasesCount = recentCases.size();
                    }
                }
                
                if (ctx.Account__c != null) {
                    List<WorkOrder> recentWorkOrders = [
                        SELECT Id, WorkOrderNumber, Subject, Status
                        FROM WorkOrder 
                        WHERE AccountId = :ctx.Account__c 
                        ORDER BY CreatedDate DESC 
                        LIMIT 5
                    ];
                    
                    if (!recentWorkOrders.isEmpty()) {
                        WorkOrder latestWO = recentWorkOrders[0];
                        result.latestWorkOrderId = latestWO.Id;
                        result.latestWorkOrderNumber = latestWO.WorkOrderNumber;
                        result.latestWorkOrderSubject = latestWO.Subject;
                        result.latestWorkOrderStatus = latestWO.Status;
                        result.recentWorkOrdersCount = recentWorkOrders.size();
                    }
                }
                
                result.message = '고객: ' + ctx.Contact__r.Name;
            } else {
                result.success = false;
                result.message = '컨텍스트 없음';
            }
        } catch (Exception e) {
            result.success = false;
            result.message = e.getMessage();
        }
        
        return result;
    }
    
    @InvocableMethod(label='Get Customer Context for Chat' 
                     description='채팅 컨텍스트에서 연락처, 케이스, 작업주문 정보를 가져옵니다'
                     category='Messaging')
    public static List<LinkResult> getCustomerContext(List<LinkRequest> requests) {
        List<LinkResult> results = new List<LinkResult>();
        
        for (LinkRequest req : requests) {
            LinkResult result = new LinkResult();
            
            try {
                // 가장 최근 Chat_Context__c 조회
                List<Chat_Context__c> contexts = [
                    SELECT Id, Contact__c, Account__c, Asset__c, Branch_Name__c,
                           Contact__r.Name, Contact__r.Email, Contact__r.Phone,
                           Account__r.Name, Asset__r.Name
                    FROM Chat_Context__c 
                    ORDER BY Created_Timestamp__c DESC 
                    LIMIT 1
                ];
                
                if (!contexts.isEmpty()) {
                    Chat_Context__c ctx = contexts[0];
                    
                    result.success = true;
                    result.contactId = ctx.Contact__c;
                    result.contactName = ctx.Contact__r.Name;
                    result.contactEmail = ctx.Contact__r.Email;
                    result.contactPhone = ctx.Contact__r.Phone;
                    result.accountId = ctx.Account__c;
                    result.accountName = ctx.Account__r.Name;
                    result.assetName = ctx.Asset__r.Name;
                    result.branchName = ctx.Branch_Name__c;
                    
                    // 해당 Contact의 최근 Case 조회
                    if (ctx.Contact__c != null) {
                        List<Case> recentCases = [
                            SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate
                            FROM Case 
                            WHERE ContactId = :ctx.Contact__c 
                            ORDER BY CreatedDate DESC 
                            LIMIT 5
                        ];
                        
                        if (!recentCases.isEmpty()) {
                            Case latestCase = recentCases[0];
                            result.latestCaseId = latestCase.Id;
                            result.latestCaseNumber = latestCase.CaseNumber;
                            result.latestCaseSubject = latestCase.Subject;
                            result.latestCaseStatus = latestCase.Status;
                            result.recentCasesCount = recentCases.size();
                        }
                    }
                    
                    // 해당 Account의 최근 WorkOrder 조회
                    if (ctx.Account__c != null) {
                        List<WorkOrder> recentWorkOrders = [
                            SELECT Id, WorkOrderNumber, Subject, Status
                            FROM WorkOrder 
                            WHERE AccountId = :ctx.Account__c 
                            ORDER BY CreatedDate DESC 
                            LIMIT 5
                        ];
                        
                        if (!recentWorkOrders.isEmpty()) {
                            WorkOrder latestWO = recentWorkOrders[0];
                            result.latestWorkOrderId = latestWO.Id;
                            result.latestWorkOrderNumber = latestWO.WorkOrderNumber;
                            result.latestWorkOrderSubject = latestWO.Subject;
                            result.latestWorkOrderStatus = latestWO.Status;
                            result.recentWorkOrdersCount = recentWorkOrders.size();
                        }
                    }
                    
                    result.message = '고객 정보: ' + ctx.Contact__r.Name + ' (' + ctx.Account__r.Name + ')';
                    
                } else {
                    result.success = false;
                    result.message = '채팅 컨텍스트를 찾을 수 없습니다.';
                }
                
            } catch (Exception e) {
                result.success = false;
                result.message = '오류: ' + e.getMessage();
            }
            
            results.add(result);
        }
        
        return results;
    }
    
    public class LinkRequest {
        @InvocableVariable(label='Placeholder' required=false)
        public String placeholder;
    }
    
    public class LinkResult {
        @AuraEnabled @InvocableVariable(label='Success')
        public Boolean success;
        
        @AuraEnabled @InvocableVariable(label='Message')
        public String message;
        
        @AuraEnabled @InvocableVariable(label='Contact ID')
        public String contactId;
        
        @AuraEnabled @InvocableVariable(label='Contact Name')
        public String contactName;
        
        @AuraEnabled @InvocableVariable(label='Contact Email')
        public String contactEmail;
        
        @AuraEnabled @InvocableVariable(label='Contact Phone')
        public String contactPhone;
        
        @AuraEnabled @InvocableVariable(label='Account ID')
        public String accountId;
        
        @AuraEnabled @InvocableVariable(label='Account Name')
        public String accountName;
        
        @AuraEnabled @InvocableVariable(label='Asset Name')
        public String assetName;
        
        @AuraEnabled @InvocableVariable(label='Branch Name')
        public String branchName;
        
        @AuraEnabled @InvocableVariable(label='Latest Case ID')
        public String latestCaseId;
        
        @AuraEnabled @InvocableVariable(label='Latest Case Number')
        public String latestCaseNumber;
        
        @AuraEnabled @InvocableVariable(label='Latest Case Subject')
        public String latestCaseSubject;
        
        @AuraEnabled @InvocableVariable(label='Latest Case Status')
        public String latestCaseStatus;
        
        @AuraEnabled @InvocableVariable(label='Recent Cases Count')
        public Integer recentCasesCount;
        
        @AuraEnabled @InvocableVariable(label='Latest WorkOrder ID')
        public String latestWorkOrderId;
        
        @AuraEnabled @InvocableVariable(label='Latest WorkOrder Number')
        public String latestWorkOrderNumber;
        
        @AuraEnabled @InvocableVariable(label='Latest WorkOrder Subject')
        public String latestWorkOrderSubject;
        
        @AuraEnabled @InvocableVariable(label='Latest WorkOrder Status')
        public String latestWorkOrderStatus;
        
        @AuraEnabled @InvocableVariable(label='Recent WorkOrders Count')
        public Integer recentWorkOrdersCount;
    }
}