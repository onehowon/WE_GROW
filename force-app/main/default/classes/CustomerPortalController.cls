public without sharing class CustomerPortalController {
    
    @AuraEnabled(cacheable=true)
    public static PortalData getPortalData(String contactId) {
        System.debug('=== CustomerPortalController.getPortalData START ===');
        System.debug('Input contactId: ' + contactId);
        
        PortalData result = new PortalData();
        
        try {
            Contact contact = [
                SELECT Id, Name, FirstName, LastName, Email, AccountId, 
                       Account.Name, Account.Biz_Reg_No__c
                FROM Contact 
                WHERE Id = :contactId 
                LIMIT 1
            ];
            System.debug('Contact found: ' + contact.Name);
            
            result.contactName = contact.Name;
            result.accountId = contact.AccountId;
            result.accountName = contact.Account?.Name;
            result.bizRegistrationNo = contact.Account?.Biz_Reg_No__c;
            
            System.debug('Searching Assets for AccountId: ' + contact.AccountId);
            
            List<Asset> assets = [
                SELECT Id, Name, Status, Capacity__c, Door_Lock_PW__c,
                       InstallDate, UsageEndDate,
                       WiFi_SSID__c, WiFi_Password__c,
                       Home_Branch__c, Home_Branch__r.Name,
                       ContractId__c, Product2Id, Product2.Name
                FROM Asset 
                WHERE AccountId = :contact.AccountId
                LIMIT 1
            ];
            
            System.debug('Assets found: ' + assets.size());
            if (!assets.isEmpty()) {
                System.debug('Asset found: ' + assets[0].Name + ' Status: ' + assets[0].Status);
            }
            
            if (!assets.isEmpty()) {
                Asset asset = assets[0];
                result.assetId = asset.Id;
                result.assetName = asset.Name;
                result.branchName = asset.Home_Branch__r?.Name;
                result.capacity = asset.Capacity__c != null ? Integer.valueOf(asset.Capacity__c) : 0;
                result.doorLockPw = asset.Door_Lock_PW__c;
                result.wifiSsid = asset.WiFi_SSID__c;
                result.wifiPassword = asset.WiFi_Password__c;
                result.moveInDate = asset.InstallDate;
                result.moveOutDate = asset.UsageEndDate;
                result.productName = asset.Product2?.Name;
                
                if (asset.ContractId__c != null) {
                    Contract contract = [
                        SELECT Id, ContractNumber, Status, StartDate, EndDate,
                               Total_Payment_Amount__c, Total_Deposit_Amount__c, Billing_Cycle__c
                        FROM Contract 
                        WHERE Id = :asset.ContractId__c
                        LIMIT 1
                    ];
                    System.debug('Contract found: ' + contract.ContractNumber);
                    
                    result.contractId = contract.Id;
                    result.contractNumber = contract.ContractNumber;
                    result.contractStatus = contract.Status;
                    result.contractStartDate = contract.StartDate;
                    result.contractEndDate = contract.EndDate;
                    result.monthlyPayment = contract.Total_Payment_Amount__c;
                    result.depositAmount = contract.Total_Deposit_Amount__c;
                    result.billingCycle = contract.Billing_Cycle__c;
                }
            }
            
            List<Case> cases = [
                SELECT Id, CaseNumber, Subject, Description, Status, Priority, Type, CreatedDate
                FROM Case 
                WHERE AccountId = :contact.AccountId
                ORDER BY CreatedDate DESC
                LIMIT 5
            ];
            System.debug('Cases found: ' + cases.size());
            
            result.recentCases = new List<CaseInfo>();
            for (Case c : cases) {
                CaseInfo ci = new CaseInfo();
                ci.caseId = c.Id;
                ci.caseNumber = c.CaseNumber;
                ci.subject = c.Subject;
                ci.description = c.Description;
                ci.status = c.Status;
                ci.priority = c.Priority;
                ci.caseType = c.Type;
                ci.createdDate = c.CreatedDate;
                result.recentCases.add(ci);
            }
            
            result.success = true;
            
        } catch (Exception e) {
            System.debug('EXCEPTION: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            result.success = false;
            result.errorMessage = e.getMessage();
        }
        
        System.debug('=== CustomerPortalController.getPortalData END ===');
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<InvoiceInfo> getInvoices(String accountId) {
        System.debug('=== getInvoices for Account: ' + accountId);
        
        List<InvoiceInfo> result = new List<InvoiceInfo>();
        
        List<Invoice__c> invoices = [
            SELECT Id, Name, Billing_Month__c, Amount__c, Due_Date__c, 
                   Status__c, Paid_Date__c, Contract__c
            FROM Invoice__c 
            WHERE Account__c = :accountId
            ORDER BY Billing_Month__c DESC
            LIMIT 12
        ];
        
        for (Invoice__c inv : invoices) {
            InvoiceInfo ii = new InvoiceInfo();
            ii.invoiceId = inv.Id;
            ii.invoiceName = inv.Name;
            ii.billingMonth = inv.Billing_Month__c;
            ii.amount = inv.Amount__c;
            ii.dueDate = inv.Due_Date__c;
            ii.status = inv.Status__c;
            ii.paidDate = inv.Paid_Date__c;
            result.add(ii);
        }
        
        return result;
    }
    
    @AuraEnabled
    public static String createCase(String accountId, String assetId, 
                                     String subject, String description, 
                                     String caseType, String priority) {
        System.debug('=== createCase START ===');
        System.debug('AccountId: ' + accountId);
        System.debug('AssetId: ' + assetId);
        System.debug('Subject: ' + subject);
        
        Case newCase = new Case();
        newCase.AccountId = accountId;
        newCase.AssetId = assetId;
        newCase.Subject = subject;
        newCase.Description = description;
        newCase.Type = caseType;
        newCase.Priority = priority;
        newCase.Status = 'New';
        newCase.Origin = 'Web';
        
        insert newCase;
        
        System.debug('Case created: ' + newCase.Id);
        return newCase.Id;
    }
    
    public class PortalData {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String errorMessage;
        
        @AuraEnabled public String contactName;
        @AuraEnabled public Id accountId;
        @AuraEnabled public String accountName;
        @AuraEnabled public String bizRegistrationNo;
        
        @AuraEnabled public Id assetId;
        @AuraEnabled public String assetName;
        @AuraEnabled public String branchName;
        @AuraEnabled public Integer capacity;
        @AuraEnabled public String doorLockPw;
        @AuraEnabled public String wifiSsid;
        @AuraEnabled public String wifiPassword;
        @AuraEnabled public Date moveInDate;
        @AuraEnabled public Date moveOutDate;
        @AuraEnabled public String productName;
        
        @AuraEnabled public Id contractId;
        @AuraEnabled public String contractNumber;
        @AuraEnabled public String contractStatus;
        @AuraEnabled public Date contractStartDate;
        @AuraEnabled public Date contractEndDate;
        @AuraEnabled public Decimal monthlyPayment;
        @AuraEnabled public Decimal depositAmount;
        @AuraEnabled public String billingCycle;
        
        @AuraEnabled public List<CaseInfo> recentCases;
    }
    
    public class CaseInfo {
        @AuraEnabled public Id caseId;
        @AuraEnabled public String caseNumber;
        @AuraEnabled public String subject;
        @AuraEnabled public String description;
        @AuraEnabled public String status;
        @AuraEnabled public String priority;
        @AuraEnabled public String caseType;
        @AuraEnabled public DateTime createdDate;
    }
    
    public class InvoiceInfo {
        @AuraEnabled public Id invoiceId;
        @AuraEnabled public String invoiceName;
        @AuraEnabled public Date billingMonth;
        @AuraEnabled public Decimal amount;
        @AuraEnabled public Date dueDate;
        @AuraEnabled public String status;
        @AuraEnabled public Date paidDate;
    }
    
    @AuraEnabled
    public static AgentSessionInfo getAgentSessionInfo(String contactId) {
        System.debug('=== getAgentSessionInfo START ===');
        System.debug('Input contactId: ' + contactId);
        
        AgentSessionInfo result = new AgentSessionInfo();
        
        try {
            Contact contact = [
                SELECT Id, Name, Email, Phone, AccountId, 
                       Account.Name, Account.Id
                FROM Contact 
                WHERE Id = :contactId 
                LIMIT 1
            ];
            
            result.contactId = contact.Id;
            result.contactName = contact.Name;
            result.contactEmail = contact.Email;
            result.contactPhone = contact.Phone;
            result.accountId = contact.AccountId;
            result.accountName = contact.Account?.Name;
            
            System.debug('Contact found: ' + contact.Name);
            
            List<Asset> assets = [
                SELECT Id, Name, Home_Branch__c, Home_Branch__r.Name
                FROM Asset 
                WHERE AccountId = :contact.AccountId 
                LIMIT 1
            ];
            
            if (!assets.isEmpty()) {
                Asset asset = assets[0];
                result.assetId = asset.Id;
                result.assetName = asset.Name;
                result.branchId = asset.Home_Branch__c;
                result.branchName = asset.Home_Branch__r?.Name;
                
                System.debug('Asset found: ' + asset.Name);
                System.debug('Branch found: ' + asset.Home_Branch__r?.Name);
            }
            
            result.success = true;
            
        } catch (Exception e) {
            System.debug('EXCEPTION: ' + e.getMessage());
            result.success = false;
            result.errorMessage = e.getMessage();
        }
        
        System.debug('=== getAgentSessionInfo END ===');
        return result;
    }
    
    public class AgentSessionInfo {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String errorMessage;
        
        @AuraEnabled public Id contactId;
        @AuraEnabled public String contactName;
        @AuraEnabled public String contactEmail;
        @AuraEnabled public String contactPhone;
        
        @AuraEnabled public Id accountId;
        @AuraEnabled public String accountName;
        
        @AuraEnabled public Id assetId;
        @AuraEnabled public String assetName;
        
        @AuraEnabled public Id branchId;
        @AuraEnabled public String branchName;
    }
}
