public class InvokeTransferFlow {
    public class TransferResult {
        @InvocableVariable(label='Success')
        public Boolean isSuccess;
        
        @InvocableVariable(label='Message')
        public String message;
    }

    @InvocableMethod(label='Transfer to Human Agent' description='Outbound Omni-Channel Flow를 실행하여 상담사에게 라우팅합니다.')
    public static List<TransferResult> transferSession(List<String> sessionIds) {
        List<TransferResult> results = new List<TransferResult>();
        List<MessagingSession> sessionsToUpdate = new List<MessagingSession>();
        
        // 1. 에스컬레이션 플래그 강제 업데이트 (봇 응답 차단용)
        for (String sessionId : sessionIds) {
            MessagingSession session = new MessagingSession(
                Id = sessionId,
                Is_Escalated_c__c = true
            );
            sessionsToUpdate.add(session);
        }
        
        String updateError = '';
        if (!sessionsToUpdate.isEmpty()) {
            try {
                update sessionsToUpdate;
                System.debug('Successfully updated Is_Escalated_c__c to true for sessions: ' + sessionIds);
            } catch (Exception e) {
                updateError = 'Session Update Failed: ' + e.getMessage();
                System.debug(updateError);
            }
        }
        
        // 2. Flow 실행
        for (String sessionId : sessionIds) {
            TransferResult res = new TransferResult();
            try {
                Map<String, Object> params = new Map<String, Object>();
                params.put('recordId', sessionId); 
                
                Flow.Interview.Transfer_To_Agent_Queue transferFlow = 
                    new Flow.Interview.Transfer_To_Agent_Queue(params);
                transferFlow.start();
                
                res.isSuccess = true;
                if (String.isNotBlank(updateError)) {
                     res.message = 'Flow Started but ' + updateError;
                } else {
                     res.message = '상담사 연결 및 에스컬레이션 상태 업데이트 완료.';
                }
            } catch (Exception e) {
                res.isSuccess = false;
                res.message = 'Flow Failed: ' + e.getMessage() + ' | ' + updateError;
            }
            results.add(res);
        }
        return results;
    }
}
