public without sharing class CheckSessionOwner {
    
    public class SessionCheckRequest {
        @InvocableVariable(label='Messaging Session ID' required=true)
        public String sessionId;
    }
    
    public class SessionCheckResult {
        @InvocableVariable(label='Should Route to Agent')
        public Boolean shouldRouteToAgent;
        
        @InvocableVariable(label='Owner Type')
        public String ownerType;
        
        @InvocableVariable(label='Message')
        public String message;
    }
    
    @InvocableMethod(label='Check Session Owner' 
                     description='세션 소유자가 상담사인지 확인하여 에이전트 라우팅 여부를 결정합니다.'
                     category='Messaging')
    public static List<SessionCheckResult> checkOwner(List<SessionCheckRequest> requests) {
        List<SessionCheckResult> results = new List<SessionCheckResult>();
        
        Set<Id> sessionIds = new Set<Id>();
        for (SessionCheckRequest req : requests) {
            if (String.isNotBlank(req.sessionId)) {
                sessionIds.add(req.sessionId);
            }
        }
        
        Map<Id, MessagingSession> sessionMap = new Map<Id, MessagingSession>(
            [SELECT Id, OwnerId, Owner.Type, Owner.Name 
             FROM MessagingSession 
             WHERE Id IN :sessionIds]
        );
        
        for (SessionCheckRequest request : requests) {
            SessionCheckResult result = new SessionCheckResult();
            
            try {
                MessagingSession session = sessionMap.get(request.sessionId);
                
                if (session == null) {
                    result.shouldRouteToAgent = true;
                    result.ownerType = 'Unknown';
                    result.message = '세션을 찾을 수 없습니다. 에이전트로 라우팅합니다.';
                } else {
                    String ownerIdPrefix = String.valueOf(session.OwnerId).substring(0, 3);
                    
                    if (ownerIdPrefix == '005') {
                        result.shouldRouteToAgent = false;
                        result.ownerType = 'User';
                        result.message = '상담사가 이미 세션을 담당하고 있습니다. 에이전트 라우팅을 건너뜁니다.';
                    } else if (ownerIdPrefix == '00G') {
                        result.shouldRouteToAgent = true;
                        result.ownerType = 'Queue';
                        result.message = '큐에 할당된 세션입니다. 에이전트로 라우팅합니다.';
                    } else {
                        result.shouldRouteToAgent = true;
                        result.ownerType = session.Owner.Type;
                        result.message = '에이전트로 라우팅합니다. Owner: ' + session.Owner.Name;
                    }
                }
                
            } catch (Exception e) {
                result.shouldRouteToAgent = true;
                result.ownerType = 'Error';
                result.message = '오류 발생: ' + e.getMessage() + '. 에이전트로 라우팅합니다.';
            }
            
            results.add(result);
        }
        
        return results;
    }
}