/**
 * WeGrowLeadAction - 리드 생성 및 후속 처리 Agent Action
 * 리드를 생성하고 이메일 발송 또는 미팅 일정을 등록합니다.
 */
public without sharing class WeGrowLeadAction {

    // 입력값 구조체: 리드 생성 정보
    public class LeadInput {
        @InvocableVariable(required=true)
        public String name;
        
        @InvocableVariable(required=true)
        public String company;
        
        @InvocableVariable(required=true)
        public String phone;
        
        @InvocableVariable(required=true)
        public String email;
        
        @InvocableVariable(required=true)
        public String selectedSpaceName;
        
        @InvocableVariable
        public String selectedAssetId;
        
        @InvocableVariable
        public Decimal price;
        
        @InvocableVariable
        public Integer capacity;
        
        @InvocableVariable
        public String actionType;
    }

    // 리드 생성 및 후속 처리 메서드 (Agent Action)
    @InvocableMethod(label='Create Lead and Schedule' description='Creates a Web Lead and triggers email or meeting schedule.')
    public static List<String> createLeadAndAction(List<LeadInput> inputs) {
        LeadInput input = inputs[0];
        
        // 1. Lead 생성
        Lead newLead = new Lead();
        newLead.LastName = input.name;
        newLead.Company = input.company;
        newLead.MobilePhone = input.phone;
        newLead.Email = input.email;
        newLead.LeadSource = 'Web';
        newLead.Status = 'New';
        newLead.SDR_Handover_Note__c = 'Agent 추천 매물: ' + input.selectedSpaceName;
        newLead.Budget_Max__c = input.price;
        newLead.Headcount__c = input.capacity;

        if (input.actionType == 'meeting') {
            newLead.Consult_Note__c = 'Zoom 미팅 요청';
        } else {
            newLead.Consult_Note__c = '제안서 메일 요청';
        }

        insert newLead;

        // 2. 이메일 또는 미팅 처리
        if (input.actionType == 'email') {
            sendEmail(newLead.Email, newLead.LastName, input.selectedSpaceName);
        } else if (input.actionType == 'meeting') {
            createEvent(newLead.Id, newLead.LastName, input.selectedSpaceName);
        }

        return new List<String>{ newLead.Id };
    }

    // 이메일 발송 헬퍼 메서드
    private static void sendEmail(String toAddress, String name, String space) {
        if (String.isEmpty(toAddress)) return;
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new String[] { toAddress });
        mail.setSubject('[WE-GROW] ' + name + '님, 제안서 송부');
        mail.setHtmlBody('<h1>제안서</h1><p>' + space + ' 관련 제안서입니다.</p>');
        
        try {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        } catch (Exception e) {
            System.debug('Email send failed: ' + e.getMessage());
        }
    }

    // 이벤트/미팅 생성 헬퍼 메서드
    private static void createEvent(Id leadId, String name, String space) {
        Event evt = new Event(
            Subject = '[상담] ' + name + ' - ' + space,
            WhoId = leadId,
            StartDateTime = System.now().addDays(1).addHours(10),
            DurationInMinutes = 60
        );
        insert evt;
    }
}