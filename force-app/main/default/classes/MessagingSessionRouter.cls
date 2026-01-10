public without sharing class MessagingSessionRouter {
    
    public class RouterRequest {
        @InvocableVariable(label='Session ID' required=true)
        public String sessionId;
    }
    
    public class RouterResult {
        @InvocableVariable(label='Route To Agent')
        public Boolean routeToAgent;
    }
    
    @InvocableMethod(label='Check If Should Route To Agent' 
                     description='세션이 에스컬레이션되었는지 확인하고 에이전트 라우팅 여부를 반환합니다.'
                     category='Messaging')
    public static List<RouterResult> shouldRouteToAgent(List<RouterRequest> requests) {
        List<RouterResult> results = new List<RouterResult>();
        
        // 세션 ID와 Name 분리
        Set<Id> sessionIds = new Set<Id>();
        Set<String> sessionNames = new Set<String>();
        
        for (RouterRequest req : requests) {
            // 디버그: 전달받은 sessionId 값 확인
            System.debug('=== MessagingSessionRouter ===');
            System.debug('Received sessionId: ' + req.sessionId);
            System.debug('sessionId length: ' + (req.sessionId != null ? String.valueOf(req.sessionId.length()) : 'null'));
            
            if (String.isNotBlank(req.sessionId)) {
                // Id 형식인지 확인
                if (req.sessionId.length() == 15 || req.sessionId.length() == 18) {
                    try {
                        sessionIds.add(Id.valueOf(req.sessionId));
                        System.debug('Added as ID: ' + req.sessionId);
                    } catch (Exception e) {
                        // Id 형식이 아니면 Name으로 처리
                        sessionNames.add(req.sessionId);
                        System.debug('Added as Name (ID parse failed): ' + req.sessionId);
                    }
                } else {
                    // Name 형식으로 처리
                    sessionNames.add(req.sessionId);
                    System.debug('Added as Name: ' + req.sessionId);
                }
            } else {
                System.debug('sessionId is blank or null');
            }
        }
        
        // 세션 조회 (Id 또는 Name으로)
        Map<String, MessagingSession> sessionMap = new Map<String, MessagingSession>();
        
        if (!sessionIds.isEmpty()) {
            for (MessagingSession sess : [SELECT Id, Name, Is_Escalated_c__c FROM MessagingSession WHERE Id IN :sessionIds]) {
                sessionMap.put(String.valueOf(sess.Id), sess);
                sessionMap.put(sess.Name, sess);
            }
        }
        
        if (!sessionNames.isEmpty()) {
            for (MessagingSession sess : [SELECT Id, Name, Is_Escalated_c__c FROM MessagingSession WHERE Name IN :sessionNames]) {
                sessionMap.put(String.valueOf(sess.Id), sess);
                sessionMap.put(sess.Name, sess);
            }
        }
        
        // 결과 생성
        for (RouterRequest request : requests) {
            RouterResult result = new RouterResult();
            result.routeToAgent = true; // 기본값: 에이전트에게 라우팅
            
            if (String.isNotBlank(request.sessionId)) {
                MessagingSession sess = sessionMap.get(request.sessionId);
                
                // 에스컬레이션된 세션이면 에이전트에게 라우팅하지 않음
                if (sess != null && sess.Is_Escalated_c__c == true) {
                    result.routeToAgent = false;
                }
            }
            
            results.add(result);
        }
        
        return results;
    }
}