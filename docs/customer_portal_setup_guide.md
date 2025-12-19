# WE:GROW Customer Portal - Org 사전 설정 가이드

Experience Cloud 기반 Customer Portal을 정상 작동시키기 위한 필수 설정입니다.

---

## 1. Apex 클래스 권한 설정

Experience Cloud 사용자 프로필에 Apex 클래스 접근 권한 부여

### 필수 Apex 클래스

| 클래스명                   | 용도                  |
| -------------------------- | --------------------- |
| `CustomerPortalController` | 포털 메인 데이터 조회 |
| `WeGrowCustomerController` | 로그인/인증 처리      |

### 설정 방법

1. **Setup** → 검색: `Apex Classes`
2. 해당 클래스 클릭 → **Security** 버튼
3. Experience Cloud 프로필 (예: `Customer Community User`) → **Enabled Profiles**로 이동
4. **Save**

---

## 2. 오브젝트 및 필드 권한

Experience Cloud 프로필에서 다음 오브젝트 접근 권한 필요:

| 오브젝트 | 권한        | 필수 필드                                                                                                              |
| -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Contact  | Read        | Name, Email, AccountId                                                                                                 |
| Account  | Read        | Name, Biz_Registration_No\_\_c                                                                                         |
| Asset    | Read        | Name, Status, Capacity**c, Door_Lock_PW**c, WiFi_SSID**c, WiFi_Password**c, Home_Branch**c, ContractId**c, InstallDate |
| Contract | Read        | ContractNumber, StartDate, EndDate, Total_Payment_Amount**c, Total_Deposit_Amount**c, Billing_Cycle\_\_c               |
| Case     | Read/Create | Subject, Description, Status, Type, Priority                                                                           |
| Product2 | Read        | Name                                                                                                                   |

### 설정 방법

1. **Setup** → **Profiles** → Experience Cloud 프로필 선택
2. **Object Settings** → 각 오브젝트 클릭
3. **Read** 권한 및 필수 필드 접근 허용

---

## 3. 데이터 연결 요구사항

포털에 데이터가 표시되려면 다음 관계가 필요합니다:

```
Contact (로그인 사용자)
    └── AccountId → Account (입주사, 예: 블루테크)
                        └── Assets (입주 공간)
                              ├── Status = '입주' (또는 필터 없음)
                              ├── Home_Branch__r → Account (지점, 예: WE-GROW 강남점)
                              └── ContractId__c → Contract (계약서)
```

### 체크리스트

- [ ] Contact가 입주사 Account에 연결됨
- [ ] Asset이 같은 Account에 연결됨
- [ ] Asset에 Contract가 연결됨 (선택, 계약 정보 표시용)
- [ ] Asset에 Home_Branch\_\_c (원 소속 지점) 설정됨

---

## 4. Experience Cloud 사이트 설정

### LWC 컴포넌트 노출

1. **Experience Builder** 열기
2. 페이지에 다음 LWC 추가:
   - `weGrowCustomerPortal` (메인 포털)
   - `weGrowCustomer` (로그인 페이지)

### 사이트 Publish

LWC 변경 후 반드시 **Publish** 버튼 클릭!

---

## 5. Static Resources (Lead Onboarding용)

| 리소스명      | 용도                  |
| ------------- | --------------------- |
| `koreaMap`    | 지점 위치 지도 이미지 |
| `wegrow_logo` | 사이트 로고           |

---

## 6. 문제 해결

### 포털에 데이터가 안 보일 때

1. **브라우저 Console** (F12) 확인 → 에러 메시지 체크
2. "Apex class access" 에러 → Apex 클래스 권한 확인
3. 기본값만 표시됨 → Contact-Account-Asset 연결 확인

### 디버그 로그 확인

Setup → Debug Logs → 포털 사용자 추가 → 로그 확인
