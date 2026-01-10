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
        
        if (!sessionsToUpdate.isEmpty()) {
            try {
                update sessionsToUpdate;
            } catch (Exception e) {
                System.debug('Error updating MessagingSession: ' + e.getMessage());
                // 업데이트 실패하더라도 Flow 시도는 계속 진행
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
                res.message = '상담사 연결 요청이 완료되었습니다.';
            } catch (Exception e) {
                res.isSuccess = false;
                res.message = '오류 발생: ' + e.getMessage();
            }
            results.add(res);
        }
        return results;
    }
}