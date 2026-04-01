# DELFI - AI 기반 국어 학습 플랫폼

DELFI는 학생들의 국어 학습을 돕기 위해 설계된 AI 기반 학습 플랫폼입니다. 태블릿 환경(iPad 등)에 최적화된 UI를 제공하며, 학습자, 코치, 관리자 등 역할별로 최적화된 대시보드를 제공합니다.

## 주요 기능

- **학습자 대시보드**: 학습 진행률 시각화, 과제 제출 및 피드백 확인, 복습 노트 관리.
- **코치 대시보드**: 담당 학생 관리, 과제 검토 및 정밀 피드백 작성.
- **관리자 대시보드**: 전체 시스템 현황 모니터링, 사용자 계정 및 권한 관리, 시스템 설정.
- **커뮤니티**: 학생들 간의 질의응답 및 공지사항 확인.

## 기술 스택

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS 4, Lucide Icons
- **Animation**: Motion (Framer Motion)
- **Backend**: Firebase (Auth, Firestore) - 설정 필요

## 프로젝트 구조

```
/src
  /components
    /layout      # Navbar, MobileNav, Footer 등 레이아웃 컴포넌트
    /ui          # Badge, Card, SectionTitle 등 공통 UI 컴포넌트
  /lib           # 유틸리티 함수 (cn 등)
  /pages         # 역할별 페이지 (student, coach, admin)
  /types.ts      # 전역 타입 정의
  /constants.ts  # 목 데이터 및 사이트 설정
  /firebase.ts   # Firebase 초기화 설정
  /App.tsx       # 메인 애플리케이션 엔트리 포인트
```

## 시작하기

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 개발 서버 실행:
   ```bash
   npm run dev
   ```

3. Firebase 설정:
   `src/firebase.ts` 파일에 실제 Firebase 프로젝트 설정을 입력하세요.

## 라이선스

© 2026 DELFI. All rights reserved.
