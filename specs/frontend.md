# 보통예금계좌신규 서비스 프론트엔드

## 1. 개요  
이 문서는 예금 시스템의 프론트엔드 구현 사항을 상세히 설명합니다. React와 Material-UI를 사용하여 구축되었으며, 주요 기능과 컴포넌트 구조를 설명합니다.

## 2. 기술 스택  
- React  
- TypeScript  
- Material-UI  
- Axios (API 통신용)

## 3. 주요 페이지 구성

### 3.1 Dashboard  
- **기능**  
  - 고객 및 계좌 선택  
  - 계좌 상세 정보 표시:  
    - Cash balance  
    - Linked substitute balance  
    - Applied interest rate  
  - 거래 내역 표시:  
    - 시간순 정렬 (오래된 순)  
    - 거래 일시, 거래 유형, 금액, 잔액 표시  
  - 거래 추가 기능:  
    - 거래 유형 선택 (Deposit/Withdrawal)  
    - 거래 금액 입력  
  - 선택된 고객/계좌 정보를 `localStorage`에 저장

### 3.2 Account Management  
- **기능**  
  - 계좌 목록 보기:  
    - Account number, customer name, product name, customer type, tax code  
    - Initial deposit amount, passbook exemption  
    - Base/additional/applied interest rates  
  - 계좌 추가:  
    - 고객 선택  
    - 상품 선택  
    - 실명 확인 번호 입력  
    - 계좌 비밀번호 설정  
    - 현금 예치 금액 입력
