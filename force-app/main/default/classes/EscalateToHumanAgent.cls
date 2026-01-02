public without sharing class EscalateToHumanAgent {
    
    public class EscalationRequest {
        @InvocableVariable(label='Messaging Session ID' required=true)
        public String sessionId;
        
        @InvocableVariable(label='Reason for Escalation' required=false)
        public String reason;
    }
    
    public class EscalationResult {
        @InvocableVariable(label='Success')
        public Boolean success;
        
        @InvocableVariable(label='Message')
        public String message;

        @InvocableVariable(label='Is Escalated')
        public Boolean isEscalated;
    }
    
    @InvocableMethod(label='Escalate to Human Agent' 
                     description='상담사에게 연결하고 에이전트의 응답을 중단합니다.'
                     category='Messaging')
    public static List<EscalationResult> escalateToHuman(List<EscalationRequest> requests) {
        List<EscalationResult> results = new List<EscalationResult>();
        
        Id queueId;
        try {
            queueId = [SELECT Id FROM Group WHERE Type = 'Queue' AND DeveloperName = 'Customer_Support_Queue' LIMIT 1].Id;
        } catch (Exception e) {
            EscalationResult errorResult = new EscalationResult();
            errorResult.success = false;
            errorResult.isEscalated = false;
            errorResult.message = '상담사 큐를 찾을 수 없습니다. 관리자에게 문의하세요.';
            results.add(errorResult);
            return results;
        }
        
        for (EscalationRequest request : requests) {
            EscalationResult result = new EscalationResult();
            
            try {
                MessagingSession session = new MessagingSession(Id = request.sessionId);
                session.OwnerId = queueId;
                session.Is_Escalated_c__c = true;
                update session;
                
                result.success = true;
                result.isEscalated = true;
                result.message = '상담사에게 성공적으로 연결되었습니다. 잠시만 기다려주세요.';
                
            } catch (Exception e) {
                result.success = false;
                result.isEscalated = false;
                result.message = '연결 시도 중 오류가 발생했습니다: ' + e.getMessage();
            }
            
            results.add(result);
        }
        
        return results;
    }
}
