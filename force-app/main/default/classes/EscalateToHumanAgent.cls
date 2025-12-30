public with sharing class EscalateToHumanAgent {
    
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
    }
    
    @InvocableMethod(label='Escalate to Human Agent' 
                     description='상담사에게 대화를 전달합니다'
                     category='Messaging')
    public static List<EscalationResult> escalateToHuman(List<EscalationRequest> requests) {
        List<EscalationResult> results = new List<EscalationResult>();
        
        for (EscalationRequest request : requests) {
            EscalationResult result = new EscalationResult();
            
            try {
                // Get the queue ID for Customer_Support_Queue
                Id queueId = [SELECT Id FROM Group WHERE Type = 'Queue' AND DeveloperName = 'Customer_Support_Queue' LIMIT 1].Id;
                
                // Update the MessagingSession owner to the queue
                MessagingSession session = new MessagingSession(Id = request.sessionId);
                session.OwnerId = queueId;
                update session;
                
                result.success = true;
                result.message = '상담사에게 연결되었습니다. 잠시만 기다려주세요.';
                
            } catch (Exception e) {
                result.success = false;
                result.message = '연결 중 오류가 발생했습니다: ' + e.getMessage();
            }
            
            results.add(result);
        }
        
        return results;
    }
}
