public without sharing class CheckEscalationStatus {
    
    public class CheckRequest {
        @InvocableVariable(label='Session ID' required=true)
        public String sessionId;
    }
    
    public class CheckResult {
        @InvocableVariable(label='Is Escalated')
        public Boolean isEscalated;
        
        @InvocableVariable(label='Message')
        public String message;
        
        @InvocableVariable(label='Should Respond')
        public Boolean shouldRespond;
    }
    
    @InvocableMethod(label='Check Escalation Status' 
                     description='현재 세션이 상담사에게 에스컬레이션되었는지 확인합니다. 에스컬레이션된 경우 에이전트는 응답하지 않아야 합니다.'
                     category='Messaging')
    public static List<CheckResult> checkStatus(List<CheckRequest> requests) {
        List<CheckResult> results = new List<CheckResult>();
        
        Set<Id> sessionIds = new Set<Id>();
        for (CheckRequest req : requests) {
            if (String.isNotBlank(req.sessionId)) {
                try {
                    sessionIds.add(Id.valueOf(req.sessionId));
                } catch (Exception e) {
                    // Invalid ID format
                }
            }
        }
        
        Map<Id, MessagingSession> sessionMap = new Map<Id, MessagingSession>();
        if (!sessionIds.isEmpty()) {
            for (MessagingSession sess : [SELECT Id, Is_Escalated_c__c, OwnerId, Owner.Type FROM MessagingSession WHERE Id IN :sessionIds]) {
                sessionMap.put(sess.Id, sess);
            }
        }
        
        for (CheckRequest request : requests) {
            CheckResult result = new CheckResult();
            result.isEscalated = false;
            result.shouldRespond = true;
            result.message = '에이전트가 응답할 수 있습니다.';
            
            if (String.isNotBlank(request.sessionId)) {
                try {
                    Id sessId = Id.valueOf(request.sessionId);
                    MessagingSession sess = sessionMap.get(sessId);
                    
                    if (sess != null) {
                        // Is_Escalated_c__c가 true이거나 Owner가 User인 경우
                        String ownerIdPrefix = String.valueOf(sess.OwnerId).substring(0, 3);
                        
                        if (sess.Is_Escalated_c__c == true || ownerIdPrefix == '005') {
                            result.isEscalated = true;
                            result.shouldRespond = false;
                            result.message = '이 세션은 상담사에게 연결되었습니다. 에이전트는 응답하지 마세요.';
                        }
                    }
                } catch (Exception e) {
                    // Error handling
                }
            }
            
            results.add(result);
        }
        
        return results;
    }
}
