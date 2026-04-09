# **📘 Join! - MVP 종합 기획서**

---

## **📑 목차**
1. [제품 개요](#1-제품-개요)
2. [타겟 및 시나리오](#2-타겟-및-시나리오)
3. [게임 규칙](#3-게임-규칙)
4. [성공 지표](#4-성공-지표)
5. [속성 설정](#5-속성-설정)
6. [기능 명세서](#6-기능-명세서)
7. [화면 구조 (Wireframe)](#7-화면-구조-wireframe)
8. [유저 플로우](#8-유저-플로우)
9. [비기능 요구사항](#9-비기능-요구사항)
10. [정책 및 제약사항](#10-정책-및-제약사항)
11. [리스크 및 대응](#11-리스크-및-대응)
12. [출시 판단 기준](#12-출시-판단-기준)
13. [부록](#13-부록)

---

# **1. 제품 개요**

## **1.1 제품명**
**Join!**

## **1.2 한 줄 정의**
앱 설치나 회원가입 없이 링크 공유만으로 친구들과 즉시 즐길 수 있는 실시간 멀티플레이 퍼즐 웹 게임.

## **1.3 제품 설명**
- Wordle / 숫자야구 기반 웹 게임
- SOLO / MULTI 플레이 지원
- 방 생성 및 참여 기반 멀티플레이 구조
- 게스트 ID 기반 즉시 참여 시스템

## **1.4 제품 목표**
사용자들이 앱 설치나 복잡한 회원가입 없이 링크 공유만으로 친구들과 쉽고 빠르게 실시간 멀티플레이 퍼즐 게임을 즐길 수 있는 환경을 제공합니다. 디스코드 액티비티와 유사하게 가볍고 즐거운 소셜 인터랙션을 통해 친구들과 함께하는 즐거움을 극대화하는 것이 목표입니다.

## **1.5 배경**
최근 모바일 환경에서 친구들과 가볍게 즐길 수 있는 실시간 멀티플레이 게임에 대한 수요가 증가하고 있으나, 대부분의 게임은 앱 설치나 회원가입 등 참여를 위한 번거로운 절차를 요구합니다. 이로 인해 즉흥적인 게임 플레이에 진입 장벽이 존재합니다.

## **1.6 MVP 목표**
- ✅ 유저가 **2번 클릭 이내 게임 시작**
- ✅ 멀티 플레이에서 **동일 결과 보장** (동기화)
- ✅ 기본 게임 루프 완성
- ✅ 링크 공유만으로 즉시 참여 가능

## **1.7 핵심 가치**

### **사용자 문제**
사용자들은 친구들과 실시간으로 함께 즐길 수 있는 게임을 원하지만, 앱 설치, 회원가입, 복잡한 초대 과정 때문에 즉흥적이고 간편한 게임 플레이에 어려움을 겪고 있습니다.

### **해결 방식**
링크 공유만으로 즉시 참여 가능한 멀티플레이 웹 게임 플랫폼을 제공합니다. 별도의 앱 설치나 회원가입 없이 게스트 ID를 통해 누구나 손쉽게 방에 입장하여 Word 또는 Number 게임을 실시간으로 즐길 수 있도록 합니다.

### **차별점**
- 설치 없이 즉시 플레이 가능한 웹 기반 서비스로 접근 장벽이 낮습니다.
- 카카오톡 등 메신저 링크 공유 중심으로 친구 초대 흐름이 자연스럽습니다.
- 디스코드 액티비티와 유사한 가벼운 멀티플레이 경험을 제공합니다.
- SOLO 모드로 혼자서도 즐길 수 있습니다.
- 소규모 친구 그룹 중심의 캐주얼한 게임 환경에 최적화되어 있습니다.

## **1.8 MVP 범위**

### **✅ 포함**
- SOLO 플레이
- MULTI (방 생성 / 입장 / 동기화)
- 단어/숫자 판정 로직
- UI 키패드
- 상태 표시 (WAITING / PLAYING / ENDED)
- 방 목록 조회 (최대 50개)
- 링크/코드 기반 공유
- Profile (Stats)
- 게스트 ID 기반 세션

### **❌ 제외**
- 회원가입 및 소셜 로그인
- 친구 목록, 팔로우, 채팅 기능
- 랭킹, 시즌제, 업적 시스템
- 결제, 광고, 아이템 판매
- Wordle 자동완성 추천 고도화
- 게임 결과 시각 효과 애니메이션 강화

---

# **2. 타겟 및 시나리오**

## **2.1 타겟 사용자**
별도의 앱 설치나 복잡한 절차 없이 친구들과 즉석에서 가벼운 게임을 즐기고자 하는 소규모 친구 그룹 사용자.

### **세부 타겟**
- **연령대**: 10대 후반 ~ 30대 초반
- **환경**: 모바일 메신저 중심 (카카오톡, 라인 등)
- **성향**: 캐주얼 게임 선호, Wordle/숫자야구 경험자

## **2.2 대표 사용 시나리오**

### **시나리오 1: 멀티플레이 방 생성 및 초대**
```
1. 사용자 A가 게임 웹사이트에 접속해 중앙 JOIN 버튼을 클릭
2. 우측 슬라이드 메뉴에서 CREATE ROOM 선택
3. 게임 종류(Word/Number), 공개 여부(Public/Private), 
   글자 수/자릿수, 제한 시간을 선택해 방 생성
4. 시스템은 고유한 roomId와 6자리 code가 포함된 링크 생성
5. 사용자 A는 링크를 카카오톡 채팅방에 공유
6. 사용자 B와 C는 링크 클릭만으로 로그인 없이 게스트로 즉시 입장
7. 세 명의 사용자는 동일한 게임 화면에서 각자 추측을 입력하고 제출
8. 각 참여자는 서로의 실제 입력값이 아닌 진행 상태만 실시간으로 확인
9. 게임 종료 후 결과를 확인하고 다시 하거나 결과를 공유
```

### **시나리오 2: SOLO 플레이**
```
1. 사용자가 Lobby에서 JOIN 버튼 클릭
2. 좌측 슬라이드 메뉴에서 SOLO 선택
3. 게임 설정 팝업에서 모드, 길이, 제한 시간, 시도 횟수 선택
4. START GAME 클릭
5. 게임 화면에서 혼자 플레이
6. 정답 맞추거나 시도 소진 시 결과 화면
7. PLAY AGAIN 또는 LOBBY 복귀
```

### **시나리오 3: 방 탐색 후 입장**
```
1. 사용자가 JOIN 버튼 클릭 후 FIND ROOM 선택
2. 공개 방 목록 조회 (최대 50개, WAITING 우선 정렬)
3. 방 제목으로 검색 (선택)
4. 원하는 방 카드 클릭
5. 비밀번호 입력 (Private 방인 경우)
6. 즉시 게임 참여
```

## **2.3 유저 플로우 요약**
- **홈/진입**: 메인 홈, SOLO/CREATE/FIND 선택, 방 코드 입력
- **방 생성**: 게임 종류 선택, 공개 여부 설정, 옵션 설정, 방 생성 완료
- **대기실/공유**: 참여자 목록 확인, 링크 복사, 카카오톡 공유, 기타 메신저 공유, 게임 시작
- **게임 플레이**: Word 또는 Number 진행, 실시간 진행 현황 확인, 추측 제출
- **게임 결과**: 승리/패배 확인, 다시 하기, 결과 공유, 홈 복귀

---

# **3. 게임 규칙**

## **3.1 게임 모드**

### **🟢 Word 모드 (Wordle)**

#### **규칙**
- 영단어를 추측하는 게임
- 각 글자별로 피드백 제공
- 위치 기반 힌트 제공

#### **피드백**
```
⬜ gray   → 해당 글자 없음
🟡 yellow → 글자는 맞지만 위치 틀림
🟢 green  → 글자 + 위치 모두 맞음
```

#### **예시**
```
정답: GREEN
입력: GREAT

결과:
G → 🟢 (위치 + 글자 맞음)
R → 🟢 (위치 + 글자 맞음)
E → 🟡 (글자는 맞지만 위치 틀림)
A → ⬜ (없는 글자)
T → ⬜ (없는 글자)
```

#### **입력 검증**
```typescript
// 유효한 영단어 체크
if (!isValidWord(input)) {
  return "존재하지 않는 단어입니다"
}

// 길이 체크
if (input.length !== settings.length) {
  return "길이가 맞지 않습니다"
}
```

---

### **🟡 Number 모드 (숫자야구)**

#### **규칙**
- 숫자를 추측하는 게임
- **셀 단위 피드백 없음**
- 집계 결과만 제공
- **중복 숫자 불가** (예: 1123 ❌)

#### **피드백**
```
🟢 strike → 숫자 + 위치 모두 맞음
🟡 ball   → 숫자는 맞지만 위치 틀림
```

#### **예시**
```
정답: 1325
입력: 1234

결과: 🟢1 🟡2
(= 1 strike, 2 ball)

👉 어느 위치가 맞는지는 절대 알려주지 않음
```

#### **승리 조건**
```
입력: 1325
결과: 🟢4 🟡0
→ 정답!
```

#### **입력 검증**
```typescript
// 중복 숫자 체크
if (hasDuplicate(input)) {
  return "중복된 숫자는 사용할 수 없습니다"
}

// 길이 체크
if (input.length !== settings.length) {
  return "길이가 맞지 않습니다"
}
```

---

## **3.2 게임 설정 항목**

### **공통 설정**
| 항목 | 설명 | 옵션 |
|------|------|------|
| `mode` | 게임 모드 | `Word` / `Number` |
| `length` | 글자/숫자 길이 | `4` / `5` / `6` (가변) |
| `runtime` | 제한 시간 (초) | `60` ~ `300` / `Unlimited` |
| `attempts` | 시도 횟수 | `6` / `8` / `Unlimited` |

### **멀티 플레이 추가 설정**
| 항목 | 설명 | 옵션 |
|------|------|------|
| `maxPlayers` | 최대 인원 | `2` ~ `10` |
| `visibility` | 공개 여부 | `Public` / `Private` |
| `password` | 비밀번호 (선택) | 4 ~ 20자 |

### **기본값**
```typescript
// SOLO 기본값
{
  mode: "word",
  length: 5,
  runtime: 180,
  attempts: 6
}

// MULTI 기본값 (SOLO + 추가)
{
  maxPlayers: 4,
  visibility: "public",
  password: null
}
```

---

## **3.3 종료 조건**

### **승리**
- Word: 정답 단어 맞춤
- Number: Strike 개수 = length

### **패배**
- attempts 소진
- runtime 초과 (설정된 경우)

---

# **4. 성공 지표**

## **4.1 핵심 지표**

| 지표 | 목표 | 정의 | 측정 방식 |
|------|------|------|----------|
| **주간 활성 사용자(WAU)** | MVP 2주 내 20명 | 7일 동안 1회 이상 방 생성, 방 입장, 추측 제출을 수행한 유니크 게스트 ID 수 | `guest_id` 기준 유니크 사용자 집계 |
| **게임 완료율** | MVP 2주 내 60% | 방 입장 또는 게임 시작 대비 실제 게임 종료 비율 | `game_complete ÷ room_join` 또는 `game_complete ÷ game_start` |
| **초대 성공률** | MVP 2주 내 50% | 공유된 링크가 실제 입장으로 이어진 비율 | `room_join_from_link ÷ share_click` |
| **7일 재방문율** | MVP 2주 내 30% | 첫 방문 이후 7일 내 재활동한 사용자 비율 | 첫 `guest_id` 생성 코호트 기준 재방문 집계 |

---

## **4.2 측정 이벤트 정의**

### **사용자 생성**
```typescript
event: "guest_id_created"
properties: {
  guest_id: string
  created_at: timestamp
  device_type: "mobile" | "desktop"
}
```

### **방 생성**
```typescript
event: "room_create"
properties: {
  guest_id: string
  room_id: string
  mode: "word" | "number"
  visibility: "public" | "private"
  length: number
  runtime: number
  attempts: number
}
```

### **방 입장**
```typescript
event: "room_join"
properties: {
  guest_id: string
  room_id: string
  join_method: "link" | "code" | "find_room"
}
```

### **링크 방 입장**
```typescript
event: "room_join_from_link"
properties: {
  guest_id: string
  room_id: string
  referrer: string
}
```

### **게임 시작**
```typescript
event: "game_start"
properties: {
  guest_id: string
  room_id: string
  game_id: string
  mode: "word" | "number"
  is_solo: boolean
}
```

### **추측 제출**
```typescript
event: "guess_submit"
properties: {
  guest_id: string
  game_id: string
  attempt_number: number
  is_correct: boolean
}
```

### **게임 완료**
```typescript
event: "game_complete"
properties: {
  guest_id: string
  game_id: string
  result: "win" | "lose"
  attempts_used: number
  time_taken: number
}
```

### **공유 클릭**
```typescript
event: "share_click"
properties: {
  guest_id: string
  room_id: string
  share_method: "copy" | "kakao" | "web_share"
}
```

### **공유 성공**
```typescript
event: "share_success"
properties: {
  guest_id: string
  room_id: string
  share_method: "copy" | "kakao" | "web_share"
}
```

---

## **4.3 대시보드 구성**

### **일일 모니터링**
- DAU (Daily Active Users)
- 신규 게스트 ID 생성 수
- 방 생성 수
- 게임 완료 수

### **주간 모니터링**
- WAU
- 게임 완료율
- 초대 성공률
- 재방문율

### **퍼널 분석**
```
방문
 ↓ (전환율)
게스트 ID 생성
 ↓ (전환율)
방 생성/입장
 ↓ (전환율)
게임 시작
 ↓ (전환율)
게임 완료
```

---

# **5. 속성 설정**

## **5.1 제품 속성**

| 항목 | 설정값 |
|------|--------|
| **카테고리** | 엔터테인먼트 / 미디어 |
| **사용자 역할** | 일반 사용자 (게스트) |
| **지원 디바이스** | 모바일 웹 우선, 데스크톱 웹 지원 |
| **참여 방식** | 공유 링크 입장, 룸 ID 직접 입력, 방 탐색 |
| **인증 방식** | 비회원 게스트 ID 기반 세션 참여 |
| **핵심 게임 모드** | Word, Number |
| **방 공개 범위** | `Public`, `Private` (Invite Only) |
| **방 식별 방식** | 고유 roomId + 6자리 code 자동 생성 |
| **공유 채널** | 링크 복사, 카카오톡 공유, Web Share 기반 기타 메신저 |
| **실시간 통신** | WebSocket 기반 양방향 동기화 |
| **상태 저장** | 서버 DB 저장 + 세션 복구 |

---

## **5.2 게스트 ID 정책**

### **생성 방식**
```typescript
// UUID v4 기반
guest_id = uuidv4() // 예: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### **저장 위치**
```typescript
// 브라우저 localStorage
localStorage.setItem('guest_id', guest_id)

// 서버 세션
session.guest_id = guest_id
```

### **유효 기간**
- localStorage: 영구 (브라우저 데이터 삭제 전까지)
- 서버 세션: 30일 (마지막 활동 기준)

### **보안**
- UUID 기반으로 예측 불가
- 세션 탈취 방지를 위한 추가 검증 (IP, User-Agent)

---

## **5.3 방 코드 정책**

### **생성 방식**
```typescript
// 6자리 영숫자 (대문자)
code = generateCode() // 예: "ABC123"
```

### **충돌 방지**
```typescript
// 중복 체크 후 재생성
while (await isCodeExists(code)) {
  code = generateCode()
}
```

### **유효 기간**
- 방 생성 후 24시간
- 게임 종료 후 1시간

---

## **5.4 상태 관리 원칙**

### **서버 우선 (Single Source of Truth)**
- 모든 게임 상태는 서버에서 관리
- 클라이언트는 서버 응답을 기준으로 UI 업데이트

### **실시간 동기화**
- WebSocket을 통한 양방향 통신
- 상태 변경 시 모든 참여자에게 즉시 전파

### **정보 보호**
- 정답은 서버에서만 관리
- 다른 플레이어의 실제 입력값은 노출하지 않음
- 진행도(시도 횟수, 완료 여부)만 공유

### **세션 복구**
- 페이지 새로고침 시 기존 상태 복원
- 재접속 시 게임 진행 상태 유지
- guest_id + room_id 기준으로 복구

---

# **6. 기능 명세서**

## **6.1 Lobby (홈)**

### **기능**
- 중앙 `JOIN!` 버튼 클릭 → 좌우 메뉴 확장
- SOLO / CREATE ROOM / FIND ROOM 선택
- 코드 입력 → 즉시 방 입장
- Profile / Help / Settings 접근

### **컴포넌트**
```
JoinButton         (중앙 원형 버튼)
SlideMenu          (좌우 펼침 메뉴)
  ├─ Left: SOLO
  └─ Right: CREATE ROOM / FIND ROOM
CodeInput          (좌측 하단 고정)
TopBar
 ├─ ProfileIcon    (좌측 상단)
 ├─ HelpButton     (우측 상단)
 └─ SettingsButton (우측 상단)
```

### **상호작용**
```typescript
// JOIN 버튼 클릭
onClick(JoinButton) → {
  expandSlideMenu()
  showOptions(['SOLO', 'CREATE', 'FIND'])
}

// 코드 입력
onSubmit(CodeInput) → {
  validateCode(code)
  if (valid) joinRoom(code)
  else showError("유효하지 않은 코드입니다")
}
```

---

## **6.2 SOLO Play**

### **입력값**
```typescript
{
  mode: "word" | "number"
  length: number          // 4 ~ 6
  runtime: number         // 60 ~ 300 or "unlimited"
  attempts: number | "unlimited"
}
```

### **플로우**
```
1. SOLO 버튼 클릭
2. 설정 팝업 표시
3. 설정 선택
4. "START GAME" 클릭
5. POST /games/solo → gameId 생성
6. Game 화면 이동
```

### **최초 1회 설정 저장**
```typescript
// 설정 완료 후 (localStorage에 'default_settings' 없는 경우)
if (!localStorage.getItem('default_settings')) {
  showPrompt({
    title: "이 설정을 기본으로 사용하시겠습니까?",
    message: "추후 설정에서 변경 가능합니다.",
    buttons: [
      {
        label: "YES",
        onClick: () => {
          localStorage.setItem('default_settings', JSON.stringify(settings))
        }
      },
      { label: "NO" }
    ]
  })
}
```

### **API**
```http
POST /games/solo

Request:
{
  guest_id: string
  mode: "word" | "number"
  length: number
  runtime: number
  attempts: number | "unlimited"
}

Response:
{
  game_id: string
  answer_hash: string  // 서버에서만 정답 보유
  settings: GameSettings
}
```

---

## **6.3 CREATE ROOM**

### **입력값**
```typescript
{
  mode: "word" | "number"
  length: number
  runtime: number
  attempts: number | "unlimited"
  maxPlayers: number      // 2 ~ 10
  visibility: "public" | "private"
  password?: string       // 4 ~ 20자 (선택)
}
```

### **플로우**
```
1. CREATE ROOM 버튼 클릭
2. 설정 팝업 표시
3. 설정 입력
4. "CREATE" 클릭
5. POST /rooms → roomId, code, inviteLink 생성
6. Game 화면 이동 (WAITING 상태)
7. Invite Code / Link 표시
```

### **API**
```http
POST /rooms

Request:
{
  guest_id: string
  mode: "word" | "number"
  length: number
  runtime: number
  attempts: number | "unlimited"
  maxPlayers: number
  visibility: "public" | "private"
  password?: string
}

Response:
{
  room_id: string
  code: string              // 6자리
  invite_link: string       // https://join.game/r/{code}
  status: "WAITING"
  host_id: string
  created_at: timestamp
}
```

### **공유 기능**

#### **1. 링크 복사**
```typescript
async function copyLink() {
  try {
    await navigator.clipboard.writeText(inviteLink)
    showToast("링크가 복사되었습니다")
    trackEvent("share_click", { share_method: "copy" })
    trackEvent("share_success", { share_method: "copy" })
  } catch (error) {
    showToast("복사에 실패했습니다")
  }
}
```

#### **2. 카카오톡 공유**
```typescript
function shareKakao() {
  if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_API_KEY)
  }
  
  Kakao.Link.sendDefault({
    objectType: 'feed',
    content: {
      title: 'Join! 게임 초대',
      description: `${mode === 'word' ? 'Word' : 'Number'} 게임에 참여하세요!`,
      imageUrl: 'https://join.game/og-image.png',
      link: {
        mobileWebUrl: inviteLink,
        webUrl: inviteLink
      }
    },
    buttons: [
      {
        title: '게임 참여',
        link: {
          mobileWebUrl: inviteLink,
          webUrl: inviteLink
        }
      }
    ]
  })
  
  trackEvent("share_click", { share_method: "kakao" })
  // 실제 전송은 사용자 액션이므로 share_success는 추적 어려움
}
```

#### **3. Web Share (기타 메신저)**
```typescript
async function shareOther() {
  // Web Share API 지원 체크
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join! 게임 초대',
        text: `${mode === 'word' ? 'Word' : 'Number'} 게임에 참여하세요!`,
        url: inviteLink
      })
      trackEvent("share_click", { share_method: "web_share" })
      trackEvent("share_success", { share_method: "web_share" })
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    }
  } else {
    // Fallback: 링크 복사
    await copyLink()
  }
}
```

---

## **6.4 FIND ROOM**

### **API**
```http
GET /rooms?limit=50&search={query}

Response:
{
  rooms: [
    {
      room_id: string
      title: string
      players: number
      maxPlayers: number
      mode: "word" | "number"
      status: "WAITING" | "PLAYING"
      visibility: "public"
      has_password: boolean
      created_at: timestamp
    }
  ],
  total: number
}
```

### **정렬 기준**
```sql
ORDER BY
  status = 'WAITING' DESC,  -- 1순위: 대기중
  players DESC,             -- 2순위: 인원 많은 순
  created_at DESC           -- 3순위: 최신순
```

### **검색**
```typescript
// 방 제목 기준 필터링
function searchRooms(query: string) {
  return rooms.filter(room => 
    room.title.toLowerCase().includes(query.toLowerCase())
  )
}
```

### **방 카드**
```typescript
<RoomCard>
  <Title>{room.title}</Title>
  <Meta>
    Players: {room.players}/{room.maxPlayers}
    Mode: {room.mode === 'word' ? 'Word' : 'Number'}
    Status: {
      room.status === 'WAITING' ? '🟡 대기중' : '🟢 진행중'
    }
    {room.has_password && '🔒'}
  </Meta>
</RoomCard>
```

### **입장**
```typescript
async function joinRoom(room_id: string, password?: string) {
  try {
    const response = await POST('/rooms/:room_id/join', {
      guest_id,
      password
    })
    
    if (response.success) {
      trackEvent("room_join", { 
        room_id, 
        join_method: "find_room" 
      })
      navigateTo(`/game/${room_id}`)
    }
  } catch (error) {
    if (error.code === 'WRONG_PASSWORD') {
      showError("비밀번호가 틀렸습니다")
    } else if (error.code === 'ROOM_FULL') {
      showError("방이 가득 찼습니다")
    }
  }
}
```

---

## **6.5 GAME (플레이 화면)**

### **6.5.1 게임 상태**
```typescript
type GameStatus = "WAITING" | "PLAYING" | "ENDED"
```

| 상태 | 설명 | 표시 |
|------|------|------|
| `WAITING` | 플레이어 대기 중 (멀티만) | 🟡 |
| `PLAYING` | 게임 진행 중 | 🟢 |
| `ENDED` | 게임 종료 | 🔴 |

---

### **6.5.2 입력 처리**

#### **키보드 UI**
```typescript
// Word 모드
const WORD_KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
]

// Number 모드
const NUMBER_KEYS = [
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '0'],
  ['ENTER', 'DELETE']
]
```

#### **입력 검증**
```typescript
// Word 모드
async function validateWordInput(input: string) {
  if (input.length !== settings.length) {
    return { valid: false, error: "길이가 맞지 않습니다" }
  }
  
  const isValid = await checkWordExists(input)
  if (!isValid) {
    return { valid: false, error: "존재하지 않는 단어입니다" }
  }
  
  return { valid: true }
}

// Number 모드
function validateNumberInput(input: string) {
  if (input.length !== settings.length) {
    return { valid: false, error: "길이가 맞지 않습니다" }
  }
  
  if (hasDuplicate(input)) {
    return { valid: false, error: "중복된 숫자는 사용할 수 없습니다" }
  }
  
  return { valid: true }
}
```

---

### **6.5.3 판정 로직**

#### **Word 모드 API**
```http
POST /games/:game_id/submit

Request:
{
  guest_id: string
  attempt: string
}

Response:
{
  result: ("gray" | "yellow" | "green")[]
  is_correct: boolean
  attempts_left: number
  game_status: "PLAYING" | "ENDED"
}
```

#### **Number 모드 API**
```http
POST /games/:game_id/submit

Request:
{
  guest_id: string
  attempt: string
}

Response:
{
  result: {
    strike: number
    ball: number
  }
  is_correct: boolean
  attempts_left: number
  game_status: "PLAYING" | "ENDED"
}
```

---

### **6.5.4 UI 분기**

#### **Word 모드 UI**
```typescript
<Grid>
  {attempts.map(attempt => (
    <Row>
      {attempt.input.split('').map((char, i) => (
        <Cell color={attempt.result[i]}>
          {char}
        </Cell>
      ))}
    </Row>
  ))}
</Grid>
```

#### **Number 모드 UI**
```typescript
<AttemptsList>
  {attempts.map(attempt => (
    <AttemptRow>
      <Input>{attempt.input}</Input>
      <Result>
        🟢 {attempt.result.strike} strike
        🟡 {attempt.result.ball} ball
      </Result>
    </AttemptRow>
  ))}
</AttemptsList>
```

---

### **6.5.5 멀티플레이 동기화**

#### **WebSocket 이벤트**
```typescript
// 플레이어 입장
socket.on('player_joined', (data) => {
  updatePlayersList(data.players)
  showNotification(`${data.player_name}님이 입장했습니다`)
})

// 플레이어 퇴장
socket.on('player_left', (data) => {
  updatePlayersList(data.players)
  showNotification(`${data.player_name}님이 퇴장했습니다`)
})

// 게임 시작
socket.on('game_started', (data) => {
  setGameStatus('PLAYING')
  startTimer()
})

// 다른 플레이어 시도
socket.on('player_attempt', (data) => {
  updatePlayerProgress(data.guest_id, {
    attempts_used: data.attempts_used,
    is_complete: data.is_complete
  })
})

// 게임 종료
socket.on('game_ended', (data) => {
  setGameStatus('ENDED')
  showResults(data.results)
})
```

#### **UI 구성 (멀티)**
```typescript
<GameLayout>
  <PlayersList> {/* 좌측 */}
    {players.map(player => (
      <PlayerCard>
        <Name>{player.name}</Name>
        <Progress>
          시도: {player.attempts_used}/{settings.attempts}
          {player.is_complete && '✓ 완료'}
        </Progress>
      </PlayerCard>
    ))}
  </PlayersList>
  
  <MainGame> {/* 중앙 */}
    <Grid />
    <Keyboard />
  </MainGame>
</GameLayout>
```

---

### **6.5.6 종료 처리**

#### **종료 조건**
```typescript
function checkGameEnd(state: GameState) {
  // 정답 맞춤
  if (state.is_correct) {
    return { ended: true, result: 'win' }
  }
  
  // attempts 소진
  if (state.attempts_left === 0) {
    return { ended: true, result: 'lose' }
  }
  
  // runtime 초과
  if (state.runtime && state.time_elapsed >= state.runtime) {
    return { ended: true, result: 'lose' }
  }
  
  return { ended: false }
}
```

#### **결과 화면**
```typescript
<ResultScreen>
  <Status>
    {result === 'win' ? '🎉 승리!' : '😢 패배'}
  </Status>
  
  <Stats>
    <Stat>
      <Label>시도 횟수</Label>
      <Value>{attempts_used}/{settings.attempts}</Value>
    </Stat>
    <Stat>
      <Label>소요 시간</Label>
      <Value>{formatTime(time_elapsed)}</Value>
    </Stat>
    <Stat>
      <Label>정답</Label>
      <Value>{answer}</Value>
    </Stat>
  </Stats>
  
  <Actions>
    <Button onClick={playAgain}>PLAY AGAIN</Button>
    <Button onClick={shareResult}>SHARE</Button>
    <Button onClick={goToLobby}>LOBBY</Button>
  </Actions>
</ResultScreen>
```

---

## **6.6 Settings (설정 팝업)**

### **탭 구조**
```typescript
<SettingsModal>
  <Tabs>
    <Tab active>ROOM SETTINGS</Tab>
    <Tab>USER SETTINGS</Tab>
  </Tabs>
  
  <Content />
</SettingsModal>
```

### **ROOM SETTINGS** (게임 진행 중)
```typescript
<RoomSettings>
  <Setting>
    <Label>Runtime</Label>
    <Counter
      value={runtime}
      min={60}
      max={300}
      step={30}
      onChange={setRuntime}
    />
  </Setting>
  
  <Setting>
    <Label>Attempts</Label>
    <Options>
      <Option value={6}>6</Option>
      <Option value={8}>8</Option>
      <Option value="unlimited">Unlimited</Option>
    </Options>
  </Setting>
  
  <Setting>
    <Label>Visibility</Label>
    <Toggle
      options={['Public', 'Private']}
      value={visibility}
      onChange={setVisibility}
    />
  </Setting>
  
  <Button onClick={saveRoomSettings}>SAVE</Button>
</RoomSettings>
```

### **USER SETTINGS**
```typescript
<UserSettings>
  <Setting>
    <Label>🔊 Sound</Label>
    <Toggle
      value={soundEnabled}
      onChange={setSoundEnabled}
    />
  </Setting>
  
  <Setting>
    <Label>🎨 Theme</Label>
    <Options>
      <Option value="light">Light</Option>
      <Option value="dark">Dark</Option>
    </Options>
  </Setting>
  
  <Setting>
    <Label>👤 Nickname</Label>
    <Input
      value={nickname}
      maxLength={20}
      onChange={setNickname}
    />
  </Setting>
  
  <Button onClick={saveUserSettings}>SAVE</Button>
</UserSettings>
```

---

## **6.7 Profile (프로필 화면)**

### **표시 정보**
```typescript
<ProfileScreen>
  <Header>
    <Avatar src={avatar_url} />
    <Nickname>{nickname}</Nickname>
  </Header>
  
  <Stats>
    <StatCard>
      <Icon>🏆</Icon>
      <Label>Wins</Label>
      <Value>{stats.wins}</Value>
    </StatCard>
    
    <StatCard>
      <Icon>📈</Icon>
      <Label>Avg Attempts</Label>
      <Value>{stats.avg_attempts.toFixed(1)}</Value>
    </StatCard>
    
    <StatCard>
      <Icon>🎮</Icon>
      <Label>Play Count</Label>
      <Value>{stats.play_count}</Value>
    </StatCard>
  </Stats>
  
  <Actions>
    <Button onClick={editProfile}>EDIT PROFILE</Button>
  </Actions>
</ProfileScreen>
```

### **Stats API**
```http
GET /users/:guest_id/stats

Response:
{
  guest_id: string
  nickname: string
  avatar_url: string
  stats: {
    wins: number
    losses: number
    play_count: number
    avg_attempts: number
    avg_time: number
    best_time: number
  },
  created_at: timestamp
  last_active: timestamp
}
```

---

# **7. 화면 구조 (Wireframe)**

## **7.1 Lobby (홈)**

```
┌─────────────────────────────────────┐
│ 👤                      ❓ ⚙️        │ ← TopBar
│                                     │
│                                     │
│          ┌──────────┐               │
│  [SOLO]  │  JOIN!   │ [CREATE]     │ ← 중앙 버튼 + 슬라이드
│          └──────────┘  [FIND]       │
│                                     │
│                                     │
│ [   ENTER CODE / LINK   ] 🔍       │ ← 코드 입력 (좌측 하단 고정)
└─────────────────────────────────────┘
```

---

## **7.2 SOLO 설정 팝업**

```
┌────────────────────────┐
│   🎮 SOLO PLAY         │
├────────────────────────┤
│ MODE                   │
│  ( Word ) ( Number )   │
│                        │
│ LENGTH                 │
│  [ 4 ][ 5 ][ 6 ]       │
│                        │
│ RUNTIME                │
│  (-) 180s (+)          │
│                        │
│ ATTEMPTS               │
│  [ 6 ][ 8 ][Unlimited] │
│                        │
│    [ START GAME ]      │
└────────────────────────┘
```

---

## **7.3 CREATE ROOM 팝업**

```
┌────────────────────────┐
│   🏠 CREATE ROOM       │
├────────────────────────┤
│ MODE                   │
│  ( Word ) ( Number )   │
│                        │
│ LENGTH                 │
│  [ 4 ][ 5 ][ 6 ]       │
│                        │
│ RUNTIME                │
│  (-) 180s (+)          │
│                        │
│ ATTEMPTS               │
│  [ 6 ][ 8 ][Unlimited] │
│                        │
│ MAX PLAYERS            │
│  (-) 4 (+)             │
│                        │
│ VISIBILITY             │
│  ( Public ) ( Private )│
│                        │
│ PASSWORD (optional)    │
│  [__________]          │
│                        │
│ ┌────────────────────┐ │
│ │ INVITE CODE:       │ │
│ │ ABC123       [📋] │ │
│ │                    │ │
│ │ [📱 카카오톡 공유] │ │
│ │ [🔗 기타 메신저]   │ │
│ └────────────────────┘ │
│                        │
│     [ CREATE ]         │
└────────────────────────┘
```

---

## **7.4 FIND ROOM 화면**

```
┌─────────────────────────────────────┐
│ [🔍 Search by room name...        ] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Room A                     🟡  │ │
│ │ Players: 2/4 | Word            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Room B                     🟢  │ │
│ │ Players: 3/6 | Number          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Room C               🔒    🟡  │ │
│ │ Players: 1/4 | Word            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ... (최대 50개)                     │
│                                     │
│ [   ENTER CODE / LINK   ] 🔍       │
└─────────────────────────────────────┘
```

---

## **7.5 Game 화면 (SOLO - Word)**

```
┌─────────────────────────────────────┐
│                            ❓ ⚙️     │
│                                     │
│         [ WORD GRID ]               │
│         🟢🟢🟡⬜⬜                  │
│         ⬜⬜⬜⬜⬜                  │
│         ⬜⬜⬜⬜⬜                  │
│         ⬜⬜⬜⬜⬜                  │
│         ⬜⬜⬜⬜⬜                  │
│         ⬜⬜⬜⬜⬜                  │
│                                     │
│       [●●●○○○] ← Attempts          │
│       ⏱️ 2:34 / 3:00                │
│                                     │
│    [ Q W E R T Y U I O P ]         │
│     [ A S D F G H J K L ]          │
│      [ Z X C V B N M ]             │
│       [  ← ENTER  ]                │
└─────────────────────────────────────┘
```

---

## **7.6 Game 화면 (SOLO - Number)**

```
┌─────────────────────────────────────┐
│                            ❓ ⚙️     │
│                                     │
│    [ ATTEMPT HISTORY ]              │
│                                     │
│    입력: 1234                        │
│    결과: 🟢 1  🟡 2                 │
│                                     │
│    입력: 5678                        │
│    결과: OUT‼️                       │
│                                     │
│    입력: 1325                        │
│    결과: 🟢 2  🟡 1                 │
│                                     │
│       [●●●○○○] ← Attempts          │
│       ⏱️ 1:45 / 3:00                │
│                                     │
│    [ 1  2  3  4  5 ]               │
│    [ 6  7  8  9  0 ]               │
│       [  ← ENTER  ]                │
└─────────────────────────────────────┘
```

---

## **7.7 Game 화면 (MULTI)**

```
┌────────────┬────────────────────────┐
│ User1: 3/6 │                   ❓ ⚙️ │
│ 🟢🟡⬜    │                        │
│ ✓ 완료     │   [ WORD GRID ]        │
│            │   🟢🟢🟡⬜⬜         │
│ User2: 2/6 │   ⬜⬜⬜⬜⬜         │
│ 🟢⬜⬜    │   ⬜⬜⬜⬜⬜         │
│            │                        │
│ User3: 4/6 │   [●●●●○○]            │
│ 🟢🟢🟡    │   ⏱️ 2:15 / 3:00       │
│            │                        │
│ User4: 1/6 │   [ KEYBOARD ]         │
│ ⬜⬜⬜    │                        │
└────────────┴────────────────────────┘
```

---

## **7.8 WAITING (대기실)**

```
┌─────────────────────────────────────┐
│            🟡 WAITING               │
├─────────────────────────────────────┤
│                                     │
│   [ Word Game - 5글자 ]            │
│                                     │
│   플레이어 (2/4)                    │
│   ┌───────────────────────────┐   │
│   │ 👤 User1 (Host)     🟢   │   │
│   │ 👤 User2            🟢   │   │
│   └───────────────────────────┘   │
│                                     │
│   ┌────────────────────────────┐  │
│   │ INVITE CODE: ABC123  [📋] │  │
│   │                            │  │
│   │ [📱 카카오톡 공유]        │  │
│   │ [🔗 기타 메신저]          │  │
│   └────────────────────────────┘  │
│                                     │
│   [ START GAME ] (Host only)       │
│                                     │
└─────────────────────────────────────┘
```

---

## **7.9 결과 화면**

```
┌─────────────────────────────────────┐
│          🎉 승리!                   │
├─────────────────────────────────────┤
│                                     │
│   정답: GREEN                       │
│                                     │
│   📊 통계                           │
│   ┌─────────────────────────────┐ │
│   │ 시도 횟수:  5 / 6           │ │
│   │ 소요 시간:  2:34            │ │
│   │ 평균 시도:  4.2             │ │
│   └─────────────────────────────┘ │
│                                     │
│   🏆 순위 (멀티플레이)              │
│   ┌─────────────────────────────┐ │
│   │ 1. User3  (3회, 1:45)  🥇  │ │
│   │ 2. User1  (5회, 2:34)  🥈  │ │
│   │ 3. User2  (실패)            │ │
│   └─────────────────────────────┘ │
│                                     │
│   [ PLAY AGAIN ]                   │
│   [ SHARE RESULT ]                 │
│   [ LOBBY ]                        │
│                                     │
└─────────────────────────────────────┘
```

---

## **7.10 Settings 팝업**

```
┌────────────────────────┐
│ [ ROOM ]  [ USER ]     │
├────────────────────────┤
│ ROOM SETTINGS          │
│                        │
│ Runtime                │
│  (-) 180s (+)          │
│                        │
│ Attempts               │
│  [ 6 ] [ 8 ] [Unlimit] │
│                        │
│ Visibility             │
│  ( Public ) ( Private )│
│                        │
│     [ SAVE ]           │
└────────────────────────┘

┌────────────────────────┐
│ [ ROOM ]  [ USER ]     │
├────────────────────────┤
│ USER SETTINGS          │
│                        │
│ 🔊 Sound:    [ ON ]    │
│                        │
│ 🎨 Theme:    [ Dark ]  │
│                        │
│ 👤 Nickname:           │
│    [____________]      │
│                        │
│     [ SAVE ]           │
└────────────────────────┘
```

---

## **7.11 Profile 화면**

```
┌─────────────────────────────────────┐
│          [ Avatar ]                 │
│          Username123                │
├─────────────────────────────────────┤
│ 📊 Stats                            │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 🏆 Wins                      │  │
│  │    23                        │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 📈 Avg Attempts              │  │
│  │    4.2                       │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 🎮 Play Count                │  │
│  │    47                        │  │
│  └─────────────────────────────┘  │
│                                     │
│     [ EDIT PROFILE ]                │
│                                     │
└─────────────────────────────────────┘
```

---

# **8. 유저 플로우**

## **8.1 SOLO 플레이**

```
Lobby
 ↓
[JOIN 버튼 클릭]
 ↓
좌측 메뉴 확장 → [SOLO 선택]
 ↓
설정 팝업 표시
 ├─ Mode: Word / Number
 ├─ Length: 4 / 5 / 6
 ├─ Runtime: 60~300s / Unlimited
 └─ Attempts: 6 / 8 / Unlimited
 ↓
[최초 1회] "이 설정을 기본으로 사용하시겠습니까?"
 ├─ YES → localStorage 저장
 └─ NO → 저장 안 함
 ↓
[START GAME 클릭]
 ↓
Game 화면 이동 (PLAYING)
 ↓
게임 진행
 ├─ 입력 → 판정 → 피드백
 ├─ attempts 차감
 ├─ runtime 체크
 └─ 종료 조건 체크
 ↓
결과 화면
 ├─ 승리/패배 표시
 ├─ 통계 표시
 └─ 액션 선택
     ├─ [PLAY AGAIN] → 동일 설정으로 재시작
     ├─ [SHARE RESULT] → 결과 공유
     └─ [LOBBY] → 홈 복귀
```

---

## **8.2 CREATE ROOM 플로우**

```
Lobby
 ↓
[JOIN 버튼 클릭]
 ↓
우측 메뉴 확장 → [CREATE ROOM 선택]
 ↓
설정 팝업 표시
 ├─ Mode / Length / Runtime / Attempts
 ├─ Max Players: 2~10
 ├─ Visibility: Public / Private
 └─ Password: (optional)
 ↓
[CREATE 클릭]
 ↓
서버: 방 생성
 ├─ roomId 생성
 ├─ code 생성 (6자리)
 └─ inviteLink 생성
 ↓
Game 화면 이동 (WAITING 상태)
 ├─ Invite Code 표시: ABC123 [📋]
 ├─ 공유 버튼 표시
 │   ├─ [📋 링크 복사]
 │   ├─ [📱 카카오톡 공유]
 │   └─ [🔗 기타 메신저]
 └─ 다른 플레이어 입장 대기
 ↓
[링크 공유]
 ├─ 링크 복사 → 클립보드 복사 → "링크가 복사되었습니다" 토스트
 ├─ 카카오톡 공유 → Kakao SDK → 카카오톡 앱/웹 열림
 └─ 기타 메신저 → Web Share API → 시스템 공유 시트
 ↓
[다른 플레이어 입장]
 ├─ 실시간으로 참여자 목록 업데이트
 └─ "User2님이 입장했습니다" 알림
 ↓
[인원 충족 또는 방장이 START 클릭]
 ↓
게임 시작 (PLAYING)
 ├─ 모든 참여자에게 동시 시작 신호
 └─ 타이머 시작
 ↓
게임 진행 (멀티플레이)
 ├─ 좌측: 다른 유저 진행도
 │   ├─ User1: 3/6, 🟢🟡⬜
 │   └─ User2: 2/6, 🟢⬜⬜
 ├─ 중앙: 내 게임 화면
 └─ 실시간 동기화
     ├─ WebSocket 이벤트
     └─ 다른 유저 시도 시 즉시 반영
 ↓
결과 화면
 ├─ 개인 결과 + 순위
 ├─ 통계 표시
 └─ 액션 선택
```

---

## **8.3 FIND ROOM 플로우**

```
Lobby
 ↓
[JOIN 버튼 클릭]
 ↓
우측 메뉴 확장 → [FIND ROOM 선택]
 ↓
방 목록 조회
 ├─ GET /rooms?limit=50
 ├─ 정렬: WAITING → 인원 많은 순 → 최신순
 └─ 최대 50개 표시
 ↓
[검색 (선택)]
 ├─ 방 제목 입력
 └─ 실시간 필터링
 ↓
방 카드 표시
 ├─ Room Title
 ├─ Players (2/4)
 ├─ Mode (Word / Number)
 ├─ Status (🟡 WAITING / 🟢 PLAYING)
 └─ 🔒 (Private + Password)
 ↓
[방 선택 → 카드 클릭]
 ↓
비밀번호 입력 (Private 방인 경우)
 ├─ 비밀번호 팝업
 └─ 확인 클릭
 ↓
서버 검증
 ├─ 유효한 코드/비밀번호 → 입장 성공
 └─ 에러 처리
     ├─ 잘못된 비밀번호 → "비밀번호가 틀렸습니다"
     ├─ 방이 가득 참 → "방이 가득 찼습니다"
     └─ 만료된 방 → "유효하지 않은 방입니다"
 ↓
입장 성공
 ↓
Game 화면 이동
 ├─ 상태: WAITING → 대기실
 └─ 상태: PLAYING → 진행 중 게임 참여
```

---

## **8.4 CODE ENTRY 플로우**

```
Lobby (모든 화면)
 ↓
좌측 하단 코드 입력란
 ↓
코드 입력: ABC123
 ↓
[ENTER 클릭 또는 키보드 Enter]
 ↓
서버 검증
 ├─ POST /rooms/join-by-code
 └─ code 유효성 검증
 ↓
[검증 결과]
 ├─ 성공 → 방 입장
 └─ 실패 → 에러 메시지
     ├─ "유효하지 않은 코드입니다"
     ├─ "만료된 방입니다"
     └─ "방이 가득 찼습니다"
 ↓
[비밀번호 필요 시]
 ├─ 비밀번호 팝업
 └─ 확인 후 입장
 ↓
Game 화면 이동
```

---

## **8.5 링크 공유 후 입장 플로우**

```
[사용자 B - 링크 수신자]
 ↓
카카오톡 메시지에서 링크 클릭
 ↓
브라우저에서 웹사이트 열림
 ├─ URL: https://join.game/r/ABC123
 └─ roomId 또는 code 추출
 ↓
[게스트 ID 체크]
 ├─ localStorage에 guest_id 있음 → 재사용
 └─ localStorage에 guest_id 없음 → 신규 생성
 ↓
서버 요청: POST /rooms/:room_id/join
 ├─ guest_id
 ├─ room_id (또는 code)
 └─ referrer: "link"
 ↓
[검증]
 ├─ 방 존재 확인
 ├─ 인원 확인 (정원 체크)
 ├─ 비밀번호 확인 (Private 방)
 └─ 상태 확인 (WAITING / PLAYING)
 ↓
[입장 성공]
 ├─ 이벤트 트래킹: room_join_from_link
 └─ Game 화면 이동
     ├─ WAITING → 대기실
     └─ PLAYING → 진행 중 참여 (관전 모드)
 ↓
[WebSocket 연결]
 ├─ socket.emit('join_room', { guest_id, room_id })
 └─ 실시간 동기화 시작
 ↓
다른 참여자에게 알림
 ├─ "User2님이 입장했습니다"
 └─ 참여자 목록 업데이트
```

---

## **8.6 재접속 플로우 (세션 복구)**

```
[사용자 - 페이지 새로고침 또는 재접속]
 ↓
localStorage에서 guest_id 로드
 ↓
[현재 URL 체크]
 ├─ /game/:room_id → 게임 진행 중
 └─ / → Lobby
 ↓
[게임 진행 중인 경우]
 ↓
서버 요청: GET /games/:room_id/state
 ├─ guest_id
 └─ room_id
 ↓
[서버 응답]
 ├─ 게임 상태 (WAITING / PLAYING / ENDED)
 ├─ 참여자 목록
 ├─ 내 진행 상태
 │   ├─ attempts (시도 기록)
 │   ├─ attempts_left
 │   └─ is_complete
 ├─ 설정 정보
 └─ 타이머 정보
 ↓
[UI 복원]
 ├─ 게임 화면 렌더링
 ├─ 시도 기록 표시
 ├─ 참여자 목록 표시
 └─ 타이머 재개 (남은 시간 기준)
 ↓
[WebSocket 재연결]
 ├─ socket.connect()
 ├─ socket.emit('rejoin_room', { guest_id, room_id })
 └─ 실시간 동기화 재개
```

---

# **9. 비기능 요구사항**

## **9.1 성능**

### **응답 시간**
| 작업 | 목표 시간 |
|------|----------|
| 방 생성 | < 1초 |
| 방 입장 | < 1초 |
| 게임 재진입 (세션 복구) | < 2초 |
| 추측 제출 → 결과 반환 | < 500ms |
| 실시간 상태 변경 전파 | < 300ms |

### **동시 접속**
- 목표: 100명 동시 접속 지원 (MVP)
- 확장: 1,000명까지 확장 가능한 구조

### **로딩 최적화**
- 초기 번들 크기 < 200KB (gzip)
- 이미지 lazy loading
- 코드 스플리팅 (route 기준)

---

## **9.2 신뢰성**

### **WebSocket 재연결**
```typescript
// 자동 재연결 로직
socket.on('disconnect', () => {
  console.log('WebSocket disconnected')
  attemptReconnect()
})

function attemptReconnect() {
  const maxRetries = 5
  let retryCount = 0
  
  const reconnect = setInterval(() => {
    if (socket.connected) {
      clearInterval(reconnect)
      console.log('WebSocket reconnected')
      rejoinRoom()
    } else if (retryCount >= maxRetries) {
      clearInterval(reconnect)
      showError('연결에 실패했습니다. 페이지를 새로고침해주세요.')
    } else {
      retryCount++
      socket.connect()
    }
  }, 2000)
}
```

### **상태 저장 재시도**
```typescript
async function saveGameState(state: GameState) {
  const maxRetries = 3
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      await POST('/games/:game_id/state', state)
      return
    } catch (error) {
      retryCount++
      if (retryCount >= maxRetries) {
        // 로컬에 임시 저장
        localStorage.setItem('pending_state', JSON.stringify(state))
        showWarning('상태 저장에 실패했습니다. 재시도 중...')
      }
      await sleep(1000 * retryCount) // exponential backoff
    }
  }
}
```

### **동시 입력 충돌 해결**
```typescript
// 서버에서 타임스탬프 기준 처리
function handleSubmit(attempt: Attempt) {
  // 낙관적 업데이트
  addAttemptToUI(attempt)
  
  // 서버 요청
  POST('/games/:game_id/submit', {
    ...attempt,
    timestamp: Date.now()
  })
  .then(response => {
    // 서버 응답 기준으로 UI 업데이트
    updateUIFromServer(response)
  })
  .catch(error => {
    // 롤백
    removeAttemptFromUI(attempt)
    showError('제출에 실패했습니다')
  })
}
```

---

## **9.3 접근성**

### **키보드 탐색**
```html
<!-- 모든 인터랙티브 요소에 tabindex 설정 -->
<button tabindex="0">JOIN</button>
<input tabindex="1" placeholder="Enter code" />
<button tabindex="2">ENTER</button>

<!-- 키보드 이벤트 핸들링 -->
<script>
document.addEventListener('keydown', (e) => {
  // Enter: 제출
  if (e.key === 'Enter') {
    handleSubmit()
  }
  
  // Escape: 닫기
  if (e.key === 'Escape') {
    closeModal()
  }
  
  // Arrow keys: 네비게이션
  if (e.key === 'ArrowDown') {
    focusNextElement()
  }
})
</script>
```

### **스크린 리더 지원**
```html
<!-- ARIA 레이블 -->
<button aria-label="게임 시작">START</button>
<input aria-label="방 코드 입력" />

<!-- 상태 안내 -->
<div role="status" aria-live="polite">
  {status === 'WAITING' ? '게임 대기 중' : '게임 진행 중'}
</div>

<!-- 에러 메시지 -->
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### **모바일 터치**
```css
/* 터치 영역 확보 */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* 터치 피드백 */
.button:active {
  transform: scale(0.95);
  opacity: 0.8;
}
```

---

## **9.4 보안 및 개인정보**

### **게스트 ID 생성**
```typescript
import { v4 as uuidv4 } from 'uuid'

function createGuestId() {
  return uuidv4() // 예측 불가능한 UUID
}

// Bad (예측 가능)
❌ const guestId = `guest_${Date.now()}`

// Good (예측 불가능)
✅ const guestId = uuidv4()
```

### **세션 관리**
```typescript
// 서버 세션 검증
app.use((req, res, next) => {
  const guestId = req.headers['x-guest-id']
  
  // 세션 존재 확인
  if (!guestId || !isValidSession(guestId)) {
    return res.status(401).json({ error: 'Invalid session' })
  }
  
  // 세션 탈취 방지 (IP, User-Agent 검증)
  if (!verifySession(guestId, req.ip, req.headers['user-agent'])) {
    return res.status(403).json({ error: 'Session verification failed' })
  }
  
  next()
})
```

### **방 접근 제어**
```typescript
// Public 방
if (room.visibility === 'public') {
  // 인원 체크만
  if (room.players.length >= room.maxPlayers) {
    throw new Error('ROOM_FULL')
  }
}

// Private 방
if (room.visibility === 'private') {
  // 코드 + 비밀번호 검증
  if (password !== room.password) {
    throw new Error('WRONG_PASSWORD')
  }
}
```

### **정답 보호**
```typescript
// ❌ Bad: 클라이언트에 정답 노출
const gameState = {
  answer: "GREEN",
  attempts: []
}

// ✅ Good: 서버에서만 정답 관리
// 클라이언트
const gameState = {
  answer_hash: "a1b2c3...",  // 해시만 전송
  attempts: []
}

// 서버
function checkAnswer(attempt: string, answer: string) {
  // 서버에서만 비교
  return attempt === answer
}
```

### **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit'

// 추측 제출 제한
const submitLimiter = rateLimit({
  windowMs: 1000, // 1초
  max: 5,         // 최대 5회
  message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
})

app.post('/games/:game_id/submit', submitLimiter, handleSubmit)

// 방 생성 제한
const createRoomLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10,             // 최대 10개
  message: '방 생성 한도를 초과했습니다.'
})

app.post('/rooms', createRoomLimiter, createRoom)
```

---

## **9.5 브라우저 호환성**

### **지원 브라우저**
| 브라우저 | 버전 |
|---------|------|
| Chrome | 최신 2개 버전 |
| Safari (iOS) | 최신 2개 버전 |
| Samsung Internet | 최신 버전 |
| Firefox | 최신 2개 버전 |

### **Web Share API 분기**
```typescript
async function share() {
  // Web Share API 지원 체크
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join! 게임 초대',
        text: `${mode === 'word' ? 'Word' : 'Number'} 게임에 참여하세요!`,
        url: inviteLink
      })
      trackEvent("share_success", { share_method: "web_share" })
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback
        await copyToClipboard(inviteLink)
      }
    }
  } else {
    // Fallback: 링크 복사
    await copyToClipboard(inviteLink)
  }
}
```

### **Clipboard API Fallback**
```typescript
async function copyToClipboard(text: string) {
  // 최신 API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      // Fallback으로 진행
    }
  }
  
  // Fallback: document.execCommand (구형 브라우저)
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  
  try {
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch (error) {
    document.body.removeChild(textarea)
    return false
  }
}
```

---

# **10. 정책 및 제약사항**

## **10.1 게임 설정 제약**

### **공통 설정**
| 항목 | 최소값 | 최대값 | 기본값 |
|------|--------|--------|--------|
| `length` | 4 | 6 | 5 |
| `runtime` | 60초 | 300초 | 180초 |
| `attempts` | 1 | 20 | 6 |

### **멀티 플레이 설정**
| 항목 | 최소값 | 최대값 | 기본값 |
|------|--------|--------|--------|
| `maxPlayers` | 2 | 10 | 4 |
| `password` 길이 | 4자 | 20자 | - |

---

## **10.2 방 목록 정책**

### **최대 노출 개수**
```
limit = 50
```

### **정렬 기준**
```sql
SELECT * FROM rooms
WHERE visibility = 'public'
  AND status IN ('WAITING', 'PLAYING')
  AND expires_at > NOW()
ORDER BY
  status = 'WAITING' DESC,  -- 1순위: 대기중
  players DESC,             -- 2순위: 인원 많은 순
  created_at DESC           -- 3순위: 최신순
LIMIT 50
```

### **방 상태**
| 상태 | 설명 | 목록 노출 | 입장 가능 |
|------|------|----------|----------|
| `WAITING` | 대기중 | ✅ | ✅ |
| `PLAYING` | 진행중 | ✅ | ⚠️ (관전 모드) |
| `ENDED` | 종료됨 | ❌ | ❌ |

---

## **10.3 방 타입**

### **Public**
- 방 목록에 노출 ✅
- 누구나 입장 가능
- 코드/링크로도 입장 가능
- 비밀번호 설정 불가

### **Private (Invite Only)**
- 방 목록에 노출 ❌
- 코드 또는 링크로만 입장
- 비밀번호 설정 가능 (선택)
- 초대받은 사람만 참여

---

## **10.4 방 유효 기간**

### **생성 후**
```
expires_at = created_at + 24시간
```

### **게임 시작 후**
```
expires_at = started_at + (runtime + 1시간)
```

### **게임 종료 후**
```
expires_at = ended_at + 1시간
```

### **자동 삭제**
```
// Cron job
0 * * * * // 매 시간 실행

DELETE FROM rooms
WHERE expires_at < NOW()
  OR (status = 'ENDED' AND ended_at < NOW() - INTERVAL 1 HOUR)
```

---

## **10.5 입력 검증 정책**

### **Word 모드**
```typescript
async function validateWord(input: string, length: number) {
  // 1. 길이 체크
  if (input.length !== length) {
    return {
      valid: false,
      error: `${length}글자를 입력해주세요`
    }
  }
  
  // 2. 알파벳만 허용
  if (!/^[A-Za-z]+$/.test(input)) {
    return {
      valid: false,
      error: '영문자만 입력 가능합니다'
    }
  }
  
  // 3. 유효한 단어 확인
  const exists = await checkWordExists(input.toUpperCase())
  if (!exists) {
    return {
      valid: false,
      error: '존재하지 않는 단어입니다'
    }
  }
  
  return { valid: true }
}
```

### **Number 모드**
```typescript
function validateNumber(input: string, length: number) {
  // 1. 길이 체크
  if (input.length !== length) {
    return {
      valid: false,
      error: `${length}자리 숫자를 입력해주세요`
    }
  }
  
  // 2. 숫자만 허용
  if (!/^\d+$/.test(input)) {
    return {
      valid: false,
      error: '숫자만 입력 가능합니다'
    }
  }
  
  // 3. 중복 숫자 체크
  const digits = input.split('')
  const unique = new Set(digits)
  if (digits.length !== unique.size) {
    return {
      valid: false,
      error: '중복된 숫자는 사용할 수 없습니다'
    }
  }
  
  return { valid: true }
}
```

---

## **10.6 예외 처리 정책**

### **방 입장 실패**
| 에러 코드 | 메시지 | 대응 |
|----------|--------|------|
| `ROOM_NOT_FOUND` | 존재하지 않는 방입니다 | Lobby 복귀 유도 |
| `ROOM_EXPIRED` | 만료된 방입니다 | Lobby 복귀 유도 |
| `ROOM_FULL` | 방이 가득 찼습니다 | 다른 방 찾기 유도 |
| `WRONG_PASSWORD` | 비밀번호가 틀렸습니다 | 재입력 요청 |
| `ALREADY_STARTED` | 이미 시작된 게임입니다 | 관전 모드 제안 |

### **게임 플레이 실패**
| 에러 코드 | 메시지 | 대응 |
|----------|--------|------|
| `INVALID_INPUT` | 잘못된 입력입니다 | 입력 초기화 |
| `WORD_NOT_EXISTS` | 존재하지 않는 단어입니다 | 재입력 요청 |
| `DUPLICATE_NUMBER` | 중복된 숫자입니다 | 재입력 요청 |
| `ATTEMPT_EXCEEDED` | 시도 횟수를 초과했습니다 | 게임 종료 |
| `TIME_EXCEEDED` | 제한 시간을 초과했습니다 | 게임 종료 |

---

## **10.7 게스트 ID 정책**

### **생성 시점**
- 첫 방문 시 자동 생성
- localStorage 저장
- 서버 세션 생성

### **유효 기간**
- localStorage: 영구 (브라우저 데이터 삭제 전까지)
- 서버 세션: 30일 (마지막 활동 기준)

### **갱신 조건**
```typescript
// 매 활동마다 세션 갱신
app.use((req, res, next) => {
  const guestId = req.headers['x-guest-id']
  
  if (guestId) {
    // 세션 갱신
    updateSessionExpiry(guestId, 30 * 24 * 60 * 60) // 30일
  }
  
  next()
})
```

---

# **11. 리스크 및 대응**

## **11.1 기술 리스크**

### **🔴 실시간 동기화 지연**

#### **리스크**
- 네트워크 환경에 따라 상태 반영이 늦어질 수 있음
- 동시 입력 시 상태 충돌 가능성
- WebSocket 연결 불안정

#### **대응**
```typescript
// 1. 서버를 단일 진실 소스로 설정
// 클라이언트는 서버 응답 기준으로 UI 업데이트
function handleServerUpdate(data) {
  // 낙관적 업데이트 롤백
  if (pendingUpdate && pendingUpdate.id !== data.id) {
    rollbackOptimisticUpdate(pendingUpdate)
  }
  
  // 서버 데이터로 UI 업데이트
  updateUI(data)
}

// 2. 재연결 처리
socket.on('disconnect', () => {
  showReconnectingIndicator()
  attemptReconnect()
})

// 3. 타임스탬프 기반 충돌 해결
function resolveConflict(localData, serverData) {
  // 서버 타임스탬프 우선
  return serverData.timestamp > localData.timestamp
    ? serverData
    : localData
}

// 4. 이벤트 최소 전송 (디바운싱)
const debouncedSync = debounce((data) => {
  socket.emit('sync', data)
}, 300)
```

---

### **🔴 사용자 참여도 부족**

#### **리스크**
- 친구 기반 서비스 특성상 초기 네트워크 효과가 약할 수 있음
- 혼자서는 재미가 떨어질 수 있음
- 공유 후 실제 입장 전환율이 낮을 수 있음

#### **대응**
```typescript
// 1. 링크 공유 UX 최적화
// - 원클릭 복사
// - 카카오톡 바로 공유
// - 공유 성공 피드백

// 2. SOLO 모드 강화
// - 혼자서도 즐길 수 있는 경험 제공
// - 개인 통계 (Profile)
// - PLAY AGAIN 유도

// 3. 재플레이 유도
// - 결과 화면에서 바로 재시작
// - 같은 설정으로 빠른 재플레이
// - 친구 초대 CTA

// 4. 소규모 테스트 운영
// - 클로즈 베타 (친구/지인)
// - 피드백 수집 및 개선
// - 입소문 마케팅

// 5. 공유 인센티브
// - "친구와 함께 플레이하면 더 재미있어요!" 메시지
// - 멀티 플레이 결과 공유 유도
```

---

### **🟡 차별성 약화**

#### **리스크**
- 단순 퍼즐 게임으로 인식될 가능성
- 기존 Wordle/숫자야구와 차이 부족
- 경쟁 서비스 대비 우위 불명확

#### **대응**
```typescript
// 1. 소셜 플레이 감각 강화
// - 실시간 진행도 노출
// - 순위 경쟁 요소
// - 친구와 함께하는 즐거움 강조

// 2. 빠른 진입 UX
// - 2번 클릭 이내 게임 시작
// - 링크 공유만으로 즉시 참여
// - 앱 설치/회원가입 없음

// 3. 멀티플레이 차별화
// - 디스코드 액티비티 유사 경험
// - 소규모 친구 그룹 최적화
// - 카카오톡 중심 공유

// 4. 마케팅 메시지
"친구들과 함께 즐기는 실시간 퍼즐 게임"
"링크 하나로 즉시 시작"
"앱 설치 필요 없음"
```

---

### **🟡 개인정보 및 보안**

#### **리스크**
- 게스트 ID 악용 가능성
- 세션 탈취 위협
- 링크 무단 공유
- 정답 유출

#### **대응**
```typescript
// 1. UUID 기반 게스트 ID
const guestId = uuidv4() // 예측 불가능

// 2. 세션 검증
function verifySession(guestId, ip, userAgent) {
  const session = getSession(guestId)
  
  // IP 변경 체크 (지역 단위)
  if (getRegion(ip) !== getRegion(session.ip)) {
    return false
  }
  
  // User-Agent 체크
  if (userAgent !== session.userAgent) {
    return false
  }
  
  return true
}

// 3. 공개/초대 정책 분리
if (room.visibility === 'private') {
  // 코드 + 비밀번호 검증
  if (password !== room.password) {
    throw new Error('WRONG_PASSWORD')
  }
}

// 4. 정답 서버 보호
// 클라이언트에는 정답 전송 절대 금지
// 서버에서만 비교 후 결과만 전송

// 5. Rate Limiting
// 추측 제출: 1초당 최대 5회
// 방 생성: 1분당 최대 10개
```

---

### **🟡 브라우저 호환성**

#### **리스크**
- 모바일 브라우저별 공유 API 동작 차이
- iOS Safari 제약사항 (WebSocket, localStorage)
- 구형 브라우저 지원

#### **대응**
```typescript
// 1. Web Share 분기 처리
if (navigator.share) {
  await navigator.share({ ... })
} else {
  await copyToClipboard(inviteLink)
}

// 2. Clipboard API Fallback
if (navigator.clipboard) {
  await navigator.clipboard.writeText(text)
} else {
  // document.execCommand('copy') 사용
}

// 3. WebSocket Fallback
if (!WebSocket) {
  // Long Polling 사용
  startPolling()
}

// 4. localStorage 검증
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
} catch (error) {
  // sessionStorage 또는 메모리 저장소 사용
}

// 5. Polyfill 사용
import 'core-js/stable'
import 'regenerator-runtime/runtime'
```

---

## **11.2 비즈니스 리스크**

### **🟡 초기 사용자 확보**

#### **리스크**
- 친구 기반 서비스 특성상 초기 확산 어려움
- 혼자 플레이 시 재미 부족

#### **대응**
- SOLO 모드로 혼자서도 즐길 수 있도록
- 클로즈 베타로 소규모 시작
- 입소문 마케팅 (지인 초대)
- 카카오톡 오픈 채팅방 활용

---

### **🟢 서버 비용**

#### **리스크**
- 실시간 통신으로 서버 비용 증가
- 초기 수익 모델 없음

#### **대응**
- MVP는 소규모 트래픽 (100명)
- Serverless/managed 서비스 활용
- 캐싱으로 DB 부하 감소
- 방 자동 삭제로 저장소 관리

---

# **12. 출시 판단 기준**

## **12.1 기능 완성도**

### **✅ 필수 기능 체크리스트**
- [ ] 사용자가 1분 이내에 방 생성부터 공유까지 완료할 수 있다
- [ ] 초대받은 사용자가 로그인 없이 10초 내 대기실에 진입할 수 있다
- [ ] SOLO 모드에서 게임이 정상 작동한다
- [ ] 멀티 플레이 (2~4인)에서 게임 상태 동기화가 안정적으로 유지된다
- [ ] 새로고침 또는 재입장 시 진행 중 게임을 복구할 수 있다
- [ ] Word 모드 판정이 정확하다 (gray/yellow/green)
- [ ] Number 모드 판정이 정확하다 (strike/ball)
- [ ] 링크 복사가 정상 작동한다
- [ ] 카카오톡 공유가 정상 작동한다 (모바일/데스크톱)
- [ ] 방 목록 조회 및 정렬이 정상 작동한다
- [ ] 코드 입력으로 방 입장이 가능하다
- [ ] Profile 통계가 정상 표시된다
- [ ] Settings에서 설정 변경이 가능하다

---

## **12.2 성능 기준**

### **✅ 응답 시간**
- [ ] 방 생성 < 1초
- [ ] 방 입장 < 1초
- [ ] 게임 재진입 < 2초
- [ ] 추측 제출 → 결과 반환 < 500ms
- [ ] 실시간 상태 변경 전파 < 300ms

### **✅ 동시 접속**
- [ ] 100명 동시 접속 시 안정적 작동
- [ ] 3인 멀티 플레이에서 동기화 지연 < 300ms

---

## **12.3 안정성 기준**

### **✅ 오류 처리**
- [ ] WebSocket 재연결이 자동으로 작동한다
- [ ] 상태 저장 실패 시 재시도한다
- [ ] 유효하지 않은 코드 입력 시 명확한 에러 메시지를 표시한다
- [ ] 방이 가득 찬 경우 명확한 안내를 제공한다
- [ ] 만료된 방 접근 시 적절히 처리한다

### **✅ 예외 상황**
- [ ] 네트워크 끊김 → 재연결 시도
- [ ] 서버 에러 → 사용자 친화적 메시지
- [ ] 동시 입력 충돌 → 서버 기준 해결

---

## **12.4 UX 기준**

### **✅ 사용성**
- [ ] 2번 클릭 이내 게임 시작 가능
- [ ] 링크 공유 UX가 직관적이다
- [ ] 코드 입력이 쉽다 (좌측 하단 고정)
- [ ] 게임 규칙이 명확하다 (Help)
- [ ] 에러 메시지가 이해하기 쉽다

### **✅ 모바일 최적화**
- [ ] 모바일 화면에 적합한 레이아웃
- [ ] 터치 조작이 자연스럽다
- [ ] 가상 키보드가 정상 작동한다
- [ ] 화면 회전 시 레이아웃 유지

---

## **12.5 측정 가능 지표**

### **✅ 초기 2주 목표**
- [ ] WAU 20명 달성
- [ ] 게임 완료율 60% 달성
- [ ] 초대 성공률 50% 달성
- [ ] 7일 재방문율 30% 달성

### **✅ 이벤트 트래킹**
- [ ] 모든 주요 이벤트가 트래킹된다
  - guest_id_created
  - room_create
  - room_join
  - room_join_from_link
  - game_start
  - guess_submit
  - game_complete
  - share_click
  - share_success

---

## **12.6 브라우저 호환성**

### **✅ 지원 브라우저**
- [ ] Chrome (최신 2개 버전) 정상 작동
- [ ] Safari iOS (최신 2개 버전) 정상 작동
- [ ] Samsung Internet 정상 작동
- [ ] Firefox (최신 2개 버전) 정상 작동

### **✅ 핵심 API**
- [ ] WebSocket 작동 (또는 Fallback)
- [ ] localStorage 작동 (또는 Fallback)
- [ ] Clipboard API 작동 (또는 Fallback)
- [ ] Web Share 분기 처리

---

## **12.7 보안 체크**

### **✅ 필수 사항**
- [ ] 게스트 ID가 UUID 기반으로 생성된다
- [ ] 세션 검증이 작동한다
- [ ] 정답이 클라이언트에 노출되지 않는다
- [ ] Rate Limiting이 적용된다
- [ ] HTTPS로 배포된다

---

## **12.8 최종 출시 판단**

### **🔴 필수 (모두 충족 시 출시)**
- ✅ 기능 완성도 100% (모든 체크리스트)
- ✅ 성능 기준 충족
- ✅ 안정성 기준 충족
- ✅ 보안 체크 통과

### **🟡 권장 (출시 후 개선 가능)**
- ⚠️ UX 기준 일부 미충족
- ⚠️ 브라우저 호환성 일부 제한
- ⚠️ 초기 2주 목표 미달

### **🟢 선택 (우선순위 낮음)**
- 📊 이벤트 트래킹 일부 누락
- 🎨 UI 디자인 개선
- 📱 추가 플랫폼 지원

---

# **13. 부록**

## **13.1 용어 정의**

| 용어 | 설명 |
|------|------|
| `guest_id` | 게스트 사용자 고유 식별자 (UUID) |
| `room_id` | 방 고유 식별자 |
| `code` | 6자리 방 코드 (예: ABC123) |
| `invite_link` | 방 초대 링크 (예: https://join.game/r/ABC123) |
| `attempt` | 시도 (추측) |
| `strike` | 숫자 + 위치 모두 맞음 (Number 모드) |
| `ball` | 숫자만 맞음 (Number 모드) |
| `runtime` | 제한 시간 (초) |
| `visibility` | 방 공개 여부 (public / private) |

---

## **13.2 API 엔드포인트 목록**

### **게스트**
```
POST   /guests              게스트 ID 생성
GET    /guests/:guest_id    게스트 정보 조회
```

### **방**
```
POST   /rooms               방 생성
GET    /rooms               방 목록 조회
GET    /rooms/:room_id      방 상세 조회
POST   /rooms/:room_id/join 방 입장
POST   /rooms/join-by-code  코드로 방 입장
DELETE /rooms/:room_id      방 삭제
```

### **게임**
```
POST   /games/solo                 SOLO 게임 생성
GET    /games/:game_id             게임 상태 조회
POST   /games/:game_id/submit      추측 제출
GET    /games/:game_id/state       게임 상태 복구
POST   /games/:game_id/complete    게임 종료
```

### **통계**
```
GET    /users/:guest_id/stats      사용자 통계 조회
```

---

## **13.3 WebSocket 이벤트 목록**

### **클라이언트 → 서버**
```typescript
socket.emit('join_room', { guest_id, room_id })
socket.emit('leave_room', { guest_id, room_id })
socket.emit('start_game', { room_id })
socket.emit('submit_attempt', { game_id, attempt })
```

### **서버 → 클라이언트**
```typescript
socket.on('player_joined', (data) => { ... })
socket.on('player_left', (data) => { ... })
socket.on('game_started', (data) => { ... })
socket.on('player_attempt', (data) => { ... })
socket.on('game_ended', (data) => { ... })
socket.on('sync_state', (data) => { ... })
```

---

## **13.4 localStorage 키 목록**

```typescript
'guest_id'           // 게스트 ID
'default_settings'   // 기본 설정 (SOLO)
'user_settings'      // 사용자 설정 (sound, theme, nickname)
'pending_state'      // 저장 실패 시 임시 상태
```

---

## **13.5 에러 코드 목록**

| 코드 | 메시지 | HTTP 상태 |
|------|--------|-----------|
| `ROOM_NOT_FOUND` | 존재하지 않는 방입니다 | 404 |
| `ROOM_EXPIRED` | 만료된 방입니다 | 410 |
| `ROOM_FULL` | 방이 가득 찼습니다 | 403 |
| `WRONG_PASSWORD` | 비밀번호가 틀렸습니다 | 401 |
| `ALREADY_STARTED` | 이미 시작된 게임입니다 | 409 |
| `INVALID_INPUT` | 잘못된 입력입니다 | 400 |
| `WORD_NOT_EXISTS` | 존재하지 않는 단어입니다 | 400 |
| `DUPLICATE_NUMBER` | 중복된 숫자입니다 | 400 |
| `ATTEMPT_EXCEEDED` | 시도 횟수를 초과했습니다 | 403 |
| `TIME_EXCEEDED` | 제한 시간을 초과했습니다 | 403 |
| `INVALID_SESSION` | 유효하지 않은 세션입니다 | 401 |
| `RATE_LIMIT` | 너무 많은 요청입니다 | 429 |

---

## **13.6 환경 변수**

```bash
# 서버
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# 게임 설정
MAX_ROOMS=1000
ROOM_EXPIRY_HOURS=24
SESSION_EXPIRY_DAYS=30

# 외부 서비스
KAKAO_API_KEY=your_kakao_api_key
DICTIONARY_API_URL=https://...

# 보안
JWT_SECRET=your_jwt_secret
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## **13.7 데이터베이스 스키마 (간략)**

### **guests**
```sql
CREATE TABLE guests (
  guest_id UUID PRIMARY KEY,
  nickname VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

### **rooms**
```sql
CREATE TABLE rooms (
  room_id UUID PRIMARY KEY,
  code VARCHAR(6) UNIQUE,
  host_id UUID REFERENCES guests(guest_id),
  mode VARCHAR(10),
  length INTEGER,
  runtime INTEGER,
  attempts INTEGER,
  max_players INTEGER,
  visibility VARCHAR(10),
  password VARCHAR(255),
  status VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

### **games**
```sql
CREATE TABLE games (
  game_id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(room_id),
  guest_id UUID REFERENCES guests(guest_id),
  answer VARCHAR(10),
  attempts JSONB,
  attempts_used INTEGER,
  is_complete BOOLEAN,
  result VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## **13.8 MVP 체크리스트 (최종)**

### **✅ 기능**
- [ ] Lobby 화면
- [ ] SOLO 플레이
- [ ] CREATE ROOM
- [ ] FIND ROOM
- [ ] CODE ENTRY
- [ ] Word 모드 판정
- [ ] Number 모드 판정
- [ ] 멀티플레이 동기화
- [ ] 방 목록 정렬
- [ ] 링크 복사
- [ ] 카카오톡 공유
- [ ] Web Share
- [ ] 설정 저장
- [ ] Profile 통계
- [ ] 세션 복구

### **✅ 비기능**
- [ ] 성능 기준 충족
- [ ] 안정성 기준 충족
- [ ] 보안 체크 통과
- [ ] 브라우저 호환성 확인

### **✅ 측정**
- [ ] 이벤트 트래킹 설정
- [ ] 대시보드 구축
- [ ] 성공 지표 모니터링

---

**END OF DOCUMENT**

**문서 버전: v2.0**  
**작성일: 2026-04-02**  
**최종 수정일: 2026-04-02**