/**
 * Contact 기반 고객 인증 컨트롤러
 * Experience Cloud 고객 포털 로그인 처리
 */
public without sharing class ContactAuthController {
    
    /**
     * 이메일과 비밀번호로 Contact 인증
     * @param email 사용자 이메일
     * @param password 사용자 비밀번호
     * @return AuthResult 인증 결과 (성공 시 Contact 정보 포함)
     */
    @AuraEnabled
    public static AuthResult authenticateContact(String email, String password) {
        System.debug('========== ContactAuthController.authenticateContact START ==========');
        System.debug('Input email: ' + email);
        System.debug('Input password length: ' + (password != null ? password.length() : 0));
        
        AuthResult result = new AuthResult();
        
        try {
            // 입력값 검증
            if (String.isBlank(email) || String.isBlank(password)) {
                System.debug('ERROR: Empty email or password');
                result.success = false;
                result.message = '이메일과 비밀번호를 모두 입력해주세요.';
                return result;
            }
            
            String trimmedEmail = email.trim();
            System.debug('Trimmed email: ' + trimmedEmail);
            
            // 이메일로 Contact 조회 (Password__c는 WHERE에서 필터링 불가 - 암호화 필드)
            System.debug('Querying Contact with email: ' + trimmedEmail);
            List<Contact> contacts = [
                SELECT Id, Name, FirstName, LastName, Email, Password__c, AccountId, Account.Name
                FROM Contact 
                WHERE Email = :trimmedEmail 
                LIMIT 1
            ];
            
            System.debug('Query result count: ' + contacts.size());
            
            if (contacts.isEmpty()) {
                System.debug('ERROR: No Contact found with email: ' + trimmedEmail);
                result.success = false;
                result.message = '등록되지 않은 이메일입니다.';
                return result;
            }
            
            Contact contact = contacts[0];
            
            // Password__c가 null인지 확인
            if (String.isBlank(contact.Password__c)) {
                System.debug('ERROR: Contact exists but Password__c is null or empty');
                result.success = false;
                result.message = '비밀번호가 설정되지 않은 계정입니다. 관리자에게 문의하세요.';
                return result;
            }
            System.debug('Contact found - Id: ' + contact.Id + ', Name: ' + contact.Name);
            System.debug('Contact Email: ' + contact.Email);
            System.debug('Contact Password__c length: ' + (contact.Password__c != null ? contact.Password__c.length() : 0));
            System.debug('Contact AccountId: ' + contact.AccountId);
            System.debug('Contact Account.Name: ' + contact.Account?.Name);
            
            // 비밀번호 확인
            System.debug('Comparing passwords...');
            System.debug('Input password: [' + password + ']');
            System.debug('Stored password: [' + contact.Password__c + ']');
            System.debug('Passwords match: ' + (contact.Password__c == password));
            
            if (contact.Password__c != password) {
                System.debug('ERROR: Password mismatch');
                result.success = false;
                result.message = '비밀번호가 올바르지 않습니다.';
                return result;
            }
            
            // 인증 성공
            System.debug('SUCCESS: Authentication passed');
            result.success = true;
            result.message = contact.Name + '님, 환영합니다!';
            result.contactId = contact.Id;
            result.contactName = contact.Name;
            result.accountId = contact.AccountId;
            result.accountName = contact.Account?.Name;
            
            System.debug('Result - success: ' + result.success);
            System.debug('Result - message: ' + result.message);
            System.debug('Result - contactId: ' + result.contactId);
            System.debug('Result - accountId: ' + result.accountId);
            
        } catch (Exception e) {
            System.debug('EXCEPTION: ' + e.getTypeName() + ' - ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            result.success = false;
            result.message = '로그인 중 오류가 발생했습니다: ' + e.getMessage();
        }
        
        System.debug('========== ContactAuthController.authenticateContact END ==========');
        return result;
    }
    
    /**
     * 인증 결과를 담는 래퍼 클래스
     */
    public class AuthResult {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Id contactId;
        @AuraEnabled public String contactName;
        @AuraEnabled public Id accountId;
        @AuraEnabled public String accountName;
    }
}
