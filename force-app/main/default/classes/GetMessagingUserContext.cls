public without sharing class GetMessagingUserContext {
    
    @InvocableMethod(label='Get Messaging User Context' description='현재 메시징 세션의 사용자 정보를 가져옵니다' category='Agentforce')
    public static List<UserContextResult> getUserContext(List<UserContextRequest> requests) {
        List<UserContextResult> results = new List<UserContextResult>();
        
        for (UserContextRequest req : requests) {
            UserContextResult result = new UserContextResult();
            
            try {
                System.debug('=== GetMessagingUserContext START ===');
                Contact foundContact = null;
                
                // 방법 1: MessagingEndUser를 통해 Contact 찾기
                System.debug('Trying Method 1: MessagingEndUser');
                List<MessagingEndUser> endUsers = [
                    SELECT Id, ContactId, Contact.Name, Contact.AccountId, 
                           Contact.Account.Name, MessagingPlatformKey
                    FROM MessagingEndUser 
                    WHERE ContactId != null
                    ORDER BY CreatedDate DESC 
                    LIMIT 5
                ];
                
                System.debug('Found ' + endUsers.size() + ' MessagingEndUsers with Contact');
                
                if (!endUsers.isEmpty()) {
                    foundContact = endUsers[0].Contact;
                    System.debug('Method 1 Success: Found Contact via MessagingEndUser: ' + foundContact.Name);
                }
                
                // 방법 2: MessagingSession의 EndUserContactId 확인
                if (foundContact == null) {
                    System.debug('Trying Method 2: MessagingSession.EndUserContactId');
                    List<MessagingSession> sessions = [
                        SELECT Id, EndUserContactId, Status, CreatedDate
                        FROM MessagingSession 
                        WHERE EndUserContactId != null
                        ORDER BY CreatedDate DESC 
                        LIMIT 1
                    ];
                    
                    if (!sessions.isEmpty()) {
                        foundContact = [SELECT Id, Name, AccountId, Account.Name 
                                       FROM Contact WHERE Id = :sessions[0].EndUserContactId LIMIT 1];
                        System.debug('Method 2 Success: Found Contact via MessagingSession');
                    }
                }
                
                // 방법 3: 가장 최근 활성 Experience Cloud 사용자의 Contact 찾기
                if (foundContact == null) {
                    System.debug('Trying Method 3: Recent Community User');
                    List<User> communityUsers = [
                        SELECT Id, ContactId, Contact.Name, Contact.AccountId, Contact.Account.Name
                        FROM User 
                        WHERE ContactId != null 
                        AND IsActive = true
                        AND Profile.Name LIKE '%Customer%'
                        ORDER BY LastLoginDate DESC
                        LIMIT 5
                    ];
                    
                    System.debug('Found ' + communityUsers.size() + ' Community Users');
                    
                    if (!communityUsers.isEmpty()) {
                        foundContact = communityUsers[0].Contact;
                        System.debug('Method 3 Success: Found Contact via Community User: ' + foundContact.Name);
                    }
                }
                
                // Contact를 찾았으면 나머지 정보 조회
                if (foundContact != null) {
                    result.contactId = foundContact.Id;
                    result.contactName = foundContact.Name;
                    result.accountId = foundContact.AccountId;
                    result.accountName = foundContact.Account?.Name;
                    
                    System.debug('Contact: ' + foundContact.Name + ' AccountId: ' + foundContact.AccountId);
                    
                    // Asset 조회
                    List<Asset> assets = [
                        SELECT Id, Name, Home_Branch__c, Home_Branch__r.Name
                        FROM Asset 
                        WHERE AccountId = :foundContact.AccountId 
                        LIMIT 1
                    ];
                    
                    System.debug('Assets found: ' + assets.size());
                    
                    if (!assets.isEmpty()) {
                        result.assetId = assets[0].Id;
                        result.assetName = assets[0].Name;
                        result.branchId = assets[0].Home_Branch__c;
                        result.branchName = assets[0].Home_Branch__r?.Name;
                        System.debug('Asset: ' + assets[0].Name + ' Branch: ' + assets[0].Home_Branch__r?.Name);
                    }
                    
                    result.success = true;
                } else {
                    System.debug('All methods failed - No Contact found');
                    result.success = false;
                    result.errorMessage = 'Unable to identify user context through any method';
                }
                
            } catch (Exception e) {
                result.success = false;
                result.errorMessage = e.getMessage();
                System.debug('GetMessagingUserContext EXCEPTION: ' + e.getMessage());
                System.debug('Stack: ' + e.getStackTraceString());
            }
            
            System.debug('=== GetMessagingUserContext END ===');
            results.add(result);
        }
        
        return results;
    }
    
    public class UserContextRequest {
        @InvocableVariable(label='Placeholder' description='입력값 (사용하지 않음)')
        public String placeholder;
    }
    
    public class UserContextResult {
        @InvocableVariable(label='Success' description='조회 성공 여부')
        public Boolean success;
        
        @InvocableVariable(label='Error Message' description='오류 메시지')
        public String errorMessage;
        
        @InvocableVariable(label='Contact ID' description='연락처 ID')
        public String contactId;
        
        @InvocableVariable(label='Contact Name' description='연락처 이름')
        public String contactName;
        
        @InvocableVariable(label='Account ID' description='계정 ID')
        public String accountId;
        
        @InvocableVariable(label='Account Name' description='계정 이름')
        public String accountName;
        
        @InvocableVariable(label='Asset ID' description='자산(호실) ID')
        public String assetId;
        
        @InvocableVariable(label='Asset Name' description='자산(호실) 이름')
        public String assetName;
        
        @InvocableVariable(label='Branch ID' description='지점 ID')
        public String branchId;
        
        @InvocableVariable(label='Branch Name' description='지점 이름')
        public String branchName;
    }
}

