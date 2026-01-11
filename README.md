<img width="1893" height="937" alt="image" src="https://github.com/user-attachments/assets/0b6ae7b0-0406-4eda-a97d-2590b5afd7ef" /><p align="middle" >
  <img width="960" height="672" alt="Salesforce com_logo svg (1)" src="https://github.com/user-attachments/assets/cab61035-cc1f-4fd2-b824-3bee2ae31111" />
</p>
<h1 align="middle">WE:GROW - Agentforce & Omni-Channel Service Hub</h1>
<h3 align="middle">Salesforce Agentforce와 Omni-Channel을 결합하여 구축한 지능형 유지보수 및 리드 관리 시스템</h3>

<br/>

## 📝 작품소개

WE:GROW는 가상 공유 오피스 서비스로, 입주사의 편의를 극대화하기 위해 AI와 상담사가 유기적으로 협업하는 CRM 환경을 구축했습니다. 
단순히 묻고 답하는 챗봇을 넘어, 비즈니스 로직(Flow/Apex)을 직접 실행하고 실시간으로 상담사에게 세션을 이양하는 Actionable AI 구현에 초점을 맞췄습니다.

<br/>

## 🌁 프로젝트 배경
비즈니스 배경: 공유 오피스 시장의 서비스 가속화
최근 공유 오피스 산업은 단순한 공간 대여를 넘어, 입주사의 업무 몰입을 돕는 '스마트 워크 플레이스'로 진화하고 있습니다. **WE:GROW**는 이러한 흐름에 발맞춰 전 세계 지점을 운영하는 글로벌 공유 오피스 브랜드로서, 입주사의 사소한 불편함부터 복잡한 기술 문의까지 실시간으로 대응해야 하는 과제에 직면했습니다.

### ⚠️ 기존 서비스의 문제점 (Pain Points)
1. **유지보수 접수의 파편화:** 입주사가 시설 문제를 접수할 때 채널이 일원화되지 않아 데이터 누락이 발생하고, 상담사가 이를 수동으로 Case화하는 데 과도한 리소스가 소모되었습니다.
2. **단순 챗봇의 한계:** 기존의 시나리오 기반 챗봇은 단순한 FAQ 응대에 그칠 뿐, 실제 CRM 데이터(Case)를 생성하거나 지점 정보를 정확히 매핑하는 '액션' 수행 능력이 부족했습니다.
3. **상담사 연결의 병목 현상:** 상담사가 부재중이거나 업무가 몰리는 시간대에 적절한 에스컬레이션(Escalation) 로직이 부재하여 고객 이탈 및 만족도 저하가 발생했습니다.

### 🎯 프로젝트 목표 (Objectives)
본 프로젝트는 세일즈포스의 최신 AI 기술인 **Agentforce**를 도입하여 다음과 같은 디지털 전환을 목표로 합니다.
* **Actionable AI 구현:** 대화 내용을 스스로 분석하여 Case를 자동 생성하고 지점 정보를 정확히 매핑하는 지능형 에이전트 구축.
* **Hybrid Handover 프로세스:** AI가 1차적으로 대응하되, 복잡한 문제는 **Omni-Channel**을 통해 실시간으로 전문 상담사에게 연결되는 심리스(Seamless)한 고객 여정 설계.
* **UX 최적화:** 비즈니스 목적에 따라 마케팅 리드 수집(커스텀 Apex/UI)과 고객 서비스(표준 AI 위젯)를 전략적으로 분리 배치하여 최적의 인터페이스 제공.

|서비스명|플랫폼 유형|특징|단점|
|---|---|---|---|
|위워크(WeWork)|글로벌 프리미엄|전 세계 지점 네트워크 활용 가능|지점별 유지보수 대응 속도의 편차 존재|
|패스트파이브(FastFive)|국내 시장 점유율 1위|국내 최다 지점 및 접근성|고도화된 IT 자동화 리소스 부족|
|스파크플러스(SparkPlus)|실무 집중형|워크모드 중심의 실무 특화 공간|입주사 문의 처리가 주로 상담사 수동 대응|
|WE:GROW|AI-Native 공유 오피스|AI가 관리하는 세일즈/자동 유지 보수 시스템|초기 AI 학습 및 시나리오 고도화 필요|

WE:GROW는 기존 공유오피스 시장의 물리적 공간 임대 서비스를 넘어, **'기술이 관리하는 오피스'**라는 새로운 패러다임을 제안합니다.

<br/>

## 🎞 Demo
[Sales 시연영상보기](https://github.com/user-attachments/assets/1d4487bd-bc4f-489e-a926-230f1e5acc1f)
<br/>
[Service 시연영상보기](https://github.com/user-attachments/assets/9015b1af-e041-4fea-a6e7-7b38bffa4b6a)
<br/>

## ⭐ 주요 기능
- **Agentforce 기반 지능형 유지보수 접수** : 사용자가 별도의 양식을 작성할 필요 없이, 대화만으로 복잡한 서비스 요청을 처리합니다.
- **의도 파악 및 데이터 추출** : 에이전트가 대화 맥락에서 고장 부위, 지점 정보(branchId, branchName) 등을 스스로 파악합니다.
- **자동 레코드 생성**: 수집된 정보를 바탕으로 Salesforce 내에 Case 레코드를 즉시 생성하고 적절한 카테고리를 할당합니다.
- **비즈니스 가치**: 수동 데이터 입력 시간을 단축하고, 지점별 민원 통계를 자동화하여 운영 효율성을 높입니다.

![Agentforce 기반 지능형 유지보수 접수](<img width="1893" height="937" alt="스크린샷 2026-01-11 104931" src="https://github.com/user-attachments/assets/0ae640fa-6bc1-4de2-9b5a-1a1df764edd0" />)
![Service Cloud 대시보드](<img width="1917" height="848" alt="스크린샷 2026-01-11 105148" src="https://github.com/user-attachments/assets/19a2b06e-3657-4b77-aaae-b7ce4e4d2274" />)


- **하이브리드 리드(Lead) 수집 시스템** : 마케팅 효과를 극대화하기 위해 표준 UI의 제약을 극복한 맞춤형 UI를 제공합니다.
- **중앙 집중형 커스텀 UI**: 페이지 우측 하단의 표준 위젯 대신, 랜딩 페이지 중앙에 위치한 Apex/LWC 기반 채팅창을 통해 시선을 집중시킵니다.
- **실시간 데이터 검증**: 연락처 형식이나 중복 여부를 Apex 로직을 통해 실시간으로 검증하여 고품질의 리드 데이터만 CRM에 적재합니다.
- **비즈니스 가치**: 첫 방문자의 전환율(Conversion Rate)을 높이고 마케팅 데이터의 신뢰성을 확보합니다.

![리드 유입 페이지](<img width="1896" height="939" alt="스크린샷 2026-01-11 105302" src="https://github.com/user-attachments/assets/5b8c3c47-91bc-4e63-8291-608c65ecbb09" />)
![리드 유입 페이지](<img width="1895" height="932" alt="스크린샷 2026-01-11 105328" src="https://github.com/user-attachments/assets/86a93fba-be10-4a55-8321-81e036b49c17" />)

- **심리스(Seamless) 상담사 에스컬레이션** : AI가 해결하기 어려운 문제는 옴니채널을 통해 실시간으로 전문 상담사에게 인계합니다.
- **지능형 라우팅**: Autolaunched Flow와 Route Work 액션을 연동하여 대기열(Queue)에 있는 상담사에게 알림을 보냅니다.
- **응답 제어(Turn Management)**: 상담사 연결 즉시 에이전트의 권한을 중단시키는 System Escalation 설정을 통해 대화 간섭을 방지합니다.
- **비즈니스 가치**: 24/7 대응 체계를 구축함과 동시에, 고난도 문의에 대한 고객 만족도를 유지합니다.

![상담사 에스컬레이션](<img width="1901" height="779" alt="스크린샷 2026-01-11 105512" src="https://github.com/user-attachments/assets/27d3884b-1bff-44e4-937d-97a89bf21f1f" />)

- **AI 기반 계약 확인 및 오딧(Audit) 자동화** : 계약 과정에서의 오류를 방지하기 위해 AI가 문서를 검토하고 알림을 발송합니다

![AI 기반 계약 검수](<img width="1911" height="934" alt="스크린샷 2026-01-11 105652" src="https://github.com/user-attachments/assets/7a9bb728-d082-4726-b6c3-7cfe5d9e6db6" />)

<br/>

## 🔨 프로젝트 구조
- 세일즈포스 DX(SFDX) 표준 구조를 따르며, 핵심 로직은 다음과 같이 분류되어 있습니다.
![아키텍처](<img width="2816" height="1536" alt="Gemini_Generated_Image_8lgxm8lgxm8lgxm8" src="https://github.com/user-attachments/assets/3b719f7a-19b2-4957-9971-0395b2eb8e62" />)

<br/>

## 🔧 Stack

**Frontend(Web)**
- **Language** : JavaScript (ES6+), HTML, CSS
- **Library & Framework** : Lightning Web Components (LWC), SLDS (Salesforce Lightning Design System)
- **Component** : Custom Central Lead Chat UI, Messaging for In-App and Web (MIAW)
- **Tools** : Salesforce Lightning Experience, VS Code (SFDX)
<br />

**Backend**
- **Language** : Apex 
- **AI Engine** : Agentforce (Agent Builder, Prompt Builder - AI_real)
- **Automation** : Flow Builder (Autolaunched Flow, Omni-Channel Flow, Email Flow)
- **Database** : Salesforce Objects (Case, Lead, Account, MessagingSession, etc.)
- **Routing** : Omni-Channel (Skills-based/Queue-based Routing)
- **Security** : Permission Sets, Field-Level Security (FLS), System Escalation

<br/>

## 💡 기대효과

**운영 효율성 극대화**: AI 에이전트의 24/7 민원 대응으로 MTTR(평균 처리 시간)을 50% 이상 단축하고 인적 리소스를 고난도 케어에 집중시킵니다.

**고객 경험 완성도 향상**: 심리스한 상담사 핸드오버와 실시간 피드백 시스템을 통해 고객 만족도(CSAT)를 높이고 이탈률을 효과적으로 방지합니다.

**마케팅 성과 및 데이터 무결성**: 전략적 커스텀 UI로 리드 전환율을 높이며, Apex 실시간 검증을 통해 CRM 데이터의 신뢰성을 확보합니다.

**지속 가능한 비즈니스 확장성**: 중앙 집중형 AI 아키텍처를 활용하여 추가 인력 충원 없이도 신규 지점으로 서비스를 빠르게 확장할 수 있습니다.

<br/>

## 👍 활용분야

**스마트 공간 및 시설 관리: 공유 오피스, 호텔, 리조트 등 다수 지점의 유지보수 접수와 시설 관리 프로세스를 자동화하여 운영 효율을 높입니다.**

**24/7 하이브리드 고객 지원: 전문 상담사 연결(Handoff) 기능과 AI 상담을 결합하여, 업종에 관계없이 중단 없는 고도화된 고객 응대 환경을 구축합니다.**

**고효율 마케팅 및 리드 관리: 정확한 데이터 수집과 커스텀 UI가 필요한 랜딩 페이지에 적용하여 잠재 고객 확보 및 CRM 데이터 적재를 최적화합니다.**

**엔터프라이즈 백오피스 자동화: 계약서 검토, 견적서 오딧(Audit), 내부 결제 승인 등 정확도와 속도가 동시에 요구되는 복잡한 행정 업무를 자동화합니다.**

<br/>

## 🙋‍♂️ Developer

|                                          Backend                                           |                                         Frontend                                          |                                         Frontend                                          |                                         Frontend                                         |             
| :----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------: | 
|  |  |  |  | 
|                            [성원호](https://github.com/onehowon)                            |                           [김민석](https://github.com/yjh-1008)                           |                                                  
