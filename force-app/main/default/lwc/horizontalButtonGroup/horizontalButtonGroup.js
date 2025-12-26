import { LightningElement, api, track } from 'lwc';

export default class HorizontalButtonGroup extends LightningElement {
    @api label = '투어 결과 (선택)';
    
    // Flow와 주고받을 값 (단일 선택 결과값)
    @api value; 
    
    // 화면에 보여줄 옵션 목록 (필요에 따라 라벨 수정)
    @track options = [
        { label: '긍정적', value: 'Good', className: '' },
        { label: '부정적', value: 'Bad', className: '' },
        { label: '보류', value: 'Nothing', className: '' },
    ];

    // 초기화 시 현재 값에 따라 선택 상태 반영
    connectedCallback() {
        this.updateClasses();
    }

    handleClick(event) {
        const val = event.target.dataset.value;
        
        // 이미 선택된 것을 다시 누르면 변경
        this.value = val; 
        this.updateClasses();
        
        // Flow에게 "값이 변경되었음"을 알림
        const attributeChangeEvent = new CustomEvent('valuechange', {
            detail: { value: this.value }
        });
        this.dispatchEvent(attributeChangeEvent);
    }

    // 선택된 버튼에만 'selected' 클래스 부여
    updateClasses() {
        this.options = this.options.map(opt => ({
            ...opt,
            className: opt.value === this.value ? 'selected' : ''
        }));
    }
}