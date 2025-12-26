import { LightningElement, api } from 'lwc';

export default class TourInfoCard extends LightningElement {

    // 1. 고객사명
    // Mapping: AccountId (Lookup) -> Account.Name
    @api accountName;

    // 2. 영업 기회명 (건명)
    // Mapping: Name (Standard)
    @api oppName;

    // 3. 예산 (Budget)
    // Mapping: Budget_Max__c (Currency)
    @api budget;

    // 4. 인원 (Headcount)
    // Mapping: Headcount__c (Number)
    @api headcount;

    // 5. 희망 지점명
    // Mapping: Branch_Account__c (Lookup) -> Branch_Account__r.Name
    @api branchName;

    // 6. 희망 호실명
    // Mapping: Asset__c (Lookup) -> Asset__r.Name
    @api assetName;

    // 7. SDR 전달사항 / 인계 노트
    // Mapping: SDR_Handover_Note__c (Long Text Area)
    @api sdrNote;

    // 8. 투어 날짜
    // Mapping: Tour_Date__c (Date)
    @api tourDate;

    // 9. 입주 희망일
    // Mapping: Preferred_MoveIn_Date__c (Date)
    @api moveInDate;

    // 10. 선호사항 (옵션)
    // Mapping: Preferences__c (Text/Picklist)
    @api preferences;

    // 11. 진행 단계 (배지용)
    // Mapping: StageName (Picklist)
    @api stage;

    // 1. 예산 콤마 포맷팅
    get formattedBudget() {
        if (!this.budget) return '-';
        // 숫자 변환 후 로케일 문자열 적용
        return Number(this.budget).toLocaleString('ko-KR');
    }

    // 2. 선호사항 한글 변환 로직 (Key-Value 매핑)
    PREFERENCE_MAP = {
        'Window_Side': '창가',
        'Quiet_Zone': '조용함',
        'Near_Meeting_Room': '회의실근처',
        'Independent_AC': '개별냉방',
        'High_Floor': '고층',
        'Lounge_Access': '라운지',
        'Morning_Sun': '채광좋음'
    };

    get formattedPreferences() {
        // 값이 없으면 '-' 반환
        if (!this.preferences) return '-';
        
        // String()으로 감싸 무조건 문자열로 변환
        // Flow에서 넘어온 값이 순수 문자열이 아닐 경우(Proxy 객체 등) .split()이 없어 에러가 납니다.
        const prefStr = String(this.preferences);
        
        // 세미콜론(;)으로 분리
        const items = prefStr.split(';');
        
        // 매핑 테이블을 통해 변환
        const translated = items.map(item => {
            const key = item.trim();
            // this.PREFERENCE_MAP을 사용하여 매핑, 없으면 원래 값 유지
            return this.PREFERENCE_MAP[key] || key;
        });

        // 쉼표로 연결하여 반환
        return translated.join(', ');
    }
}