<div align="center">

# 🌍 DayGo

### 여행의 모든 순간을 완벽하게 정리하는 스마트 플래너

[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br>

**여행 중 흩어진 티켓, 바우처, 예약서를 찾느라 고생하셨나요?**  
**DayGo**가 일차별로 깔끔하게 정리해드립니다! 📱✨

<br>

[기능 소개](#-주요-기능) • [설치 방법](#-설치-및-실행) • [기술 스택](#-기술-스택) • [기여하기](#-기여하기)

</div>

<br>

---

<br>

## 📖 프로젝트 소개

**DayGo**는 여행자를 위한 **일차별 여행 플래너 앱**입니다.

해외여행 중 박물관 입장권, 기차 예약서, 호텔 바우처 등 중요한 서류들을 찾느라 스크린샷을 뒤적이는 불편함을 해결합니다.

<br>

### 🎯 해결하는 문제

- ❌ 갤러리에 흩어진 티켓 스크린샷 찾기 어려움
- ❌ 어떤 날 어떤 예약이 있는지 헷갈림
- ❌ 오프라인 환경에서 서류 접근 불가
- ❌ 여행 동행자와 정보 공유 불편

<br>

### ✅ DayGo의 솔루션

- ✨ **일차별 정리**: 1일차, 2일차... 날짜별로 자동 분류
- 📸 **사진/파일 저장**: 티켓, 바우처, 지도 등 모든 자료 보관
- 🔒 **오프라인 지원**: 인터넷 없이도 모든 자료 접근 가능
- ☁️ **클라우드 백업**: Supabase 기반 안전한 데이터 보관

<br>

---

<br>

## ✨ 주요 기능

### 📅 일차별 여행 관리
여행을 생성하고 날짜별로 일정을 구성하세요.

```
🗓️ 파리 여행 (2024.03.15 ~ 03.20)
  ├─ 1일차: 루브르 박물관
  ├─ 2일차: 에펠탑 & 센 강 유람선
  ├─ 3일차: 베르사유 궁전
  └─ ...
```

<br>

### 🎫 티켓 & 바우처 저장
각 날짜에 필요한 모든 자료를 제목과 함께 저장하세요.

- 박물관 입장권
- 기차/버스 예약서
- 호텔 바우처
- 레스토랑 예약 확인서
- 관광지 지도

<br>

### 🔍 빠른 검색 & 접근
필요한 순간, 해당 날짜 탭만 열면 모든 자료가 한눈에!

<br>

### 📱 크로스 플랫폼
iOS, Android, 그리고 **Web**까지 완벽하게 지원합니다.
(웹 환경에서는 브라우저의 파일 시스템을 활용합니다)

<br>

---

<br>

## 🚀 설치 및 실행

### 📋 사전 요구사항

- **Node.js** 18.0 이상
- **npm** 또는 **yarn**
- **Expo Go** 앱 (모바일 테스트용)

<br>

### 1️⃣ 저장소 클론

```bash
git clone https://github.com/ImYourNote/travel.git
cd travel
```

<br>

### 2️⃣ 의존성 설치

```bash
npm install
npx expo install
```

<br>

### 3️⃣ 개발 서버 실행

```bash
npx expo start
```

<br>

### 4️⃣ 앱 실행

- **iOS 시뮬레이터**: `i` 키 입력
- **Android 에뮬레이터**: `a` 키 입력
- **실제 기기**: Expo Go 앱으로 QR 코드 스캔

<br>

---

<br>

## 🛠️ 기술 스택

### Frontend

| 기술 | 설명 |
|------|------|
| **React Native** | 크로스 플랫폼 모바일 앱 프레임워크 |
| **Expo** | 빠른 개발 및 배포를 위한 도구 |
| **Expo Router** | 파일 기반 네비게이션 |
| **TypeScript** | 타입 안정성 보장 |
| **Zustand** | 경량 상태 관리 라이브러리 |

<br>

### Backend & Storage

| 기술 | 설명 |
|------|------|
| **Supabase** | PostgreSQL 기반 백엔드 서비스 |
| **Supabase Storage** | 사진/파일 클라우드 저장소 |
| **AsyncStorage** | 오프라인 로컬 저장소 |

<br>

### 주요 라이브러리

- `expo-image-picker` - 사진 선택
- `expo-document-picker` - 파일 선택
- `@react-native-async-storage/async-storage` - 로컬 데이터 저장

<br>

---

<br>

## 📂 프로젝트 구조

```
travel/
├── app/                      # Expo Router 화면
│   ├── (tabs)/              # 탭 네비게이션
│   │   ├── index.tsx        # 여행 목록 화면
│   │   └── settings.tsx     # 설정 화면
│   ├── trip/
│   │   └── [id].tsx         # 여행 상세 화면
│   └── _layout.tsx          # 루트 레이아웃
├── components/              # 재사용 컴포넌트
│   ├── TripCard.tsx        # 여행 카드
│   ├── DayTab.tsx          # 일차 탭
│   ├── ContentItem.tsx     # 콘텐츠 아이템
│   └── ImageViewer.tsx     # 이미지 뷰어
├── lib/                     # 유틸리티 & 설정
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── storage.ts          # 로컬 저장소
│   └── database.ts         # DB 작업
├── store/                   # 상태 관리
│   └── tripStore.ts        # 여행 스토어
├── types/                   # TypeScript 타입
│   └── index.ts
└── package.json
```

<br>

---

<br>

## 🎨 화면 구성

### 1. 여행 목록 화면
모든 여행을 한눈에 확인하고 새 여행을 생성합니다.

### 2. 여행 상세 화면
일차별 탭으로 구성되어 각 날짜의 자료를 관리합니다.

### 3. 콘텐츠 추가
사진 또는 파일을 선택하고 제목을 입력하여 저장합니다.

### 4. 전체 화면 뷰어
저장된 티켓/바우처를 크게 확대하여 확인합니다.

<br>

---

<br>

## 🗺️ 로드맵

### ✅ Phase 1: MVP (완료)
- [x] 프로젝트 초기화
- [x] README 작성
- [x] 여행 생성/목록 기능
- [x] 일차별 콘텐츠 관리
- [x] 사진/파일 업로드
- [x] 오프라인 저장 (AsyncStorage + FileSystem)

<br>

### 🔜 Phase 2: 고급 기능
- [ ] 파티원 위치 공유
- [ ] 그룹 채팅
- [x] 준비물 체크리스트
- [ ] 여행 일정 공유

<br>

### 🚀 Phase 3: 배포
- [ ] App Store 출시
- [ ] Google Play Store 출시

<br>

---

<br>

## 🤝 기여하기

DayGo는 오픈소스 프로젝트입니다! 기여를 환영합니다. 🎉

### 기여 방법

1. 이 저장소를 Fork 합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m '멋진 기능 추가'`)
4. 브랜치에 Push 합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

<br>

### 개발 가이드라인

- 모든 코드는 **한국어 주석** 작성
- TypeScript 타입 정의 필수
- 컴포넌트는 재사용 가능하게 설계
- 커밋 메시지는 명확하게 작성

<br>

---

<br>

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다.  
자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

<br>

---

<br>

## 💬 문의 및 지원

- **이슈 등록**: [GitHub Issues](https://github.com/ImYourNote/travel/issues)
- **이메일**: ktnote5716@gmail.com

<br>

---

<br>

<div align="center">

**DayGo와 함께 완벽한 여행을 준비하세요! ✈️**

Made with ❤️ by ImYourNote

<br>

⭐ 이 프로젝트가 마음에 드셨다면 Star를 눌러주세요!

</div>
