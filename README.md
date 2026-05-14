# Web IDE - Frontend

협업 가능한 웹 기반 IDE의 프론트엔드 프로젝트입니다.

---

## 📦 기술 스택

| 분류                   | 라이브러리                   |
| ---------------------- | ---------------------------- |
| 프레임워크             | React 19, TypeScript         |
| 빌드 도구              | Vite                         |
| 스타일링               | Tailwind CSS v4              |
| 서버 상태              | TanStack Query (React Query) |
| 소켓 데이터 / UI 상태  | Jotai                        |
| 클라이언트 도메인 상태 | Zustand                      |
| 실시간 통신            | STOMP over WebSocket         |
| 코드 품질              | ESLint v9, Prettier          |

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. VSCode 확장 설치 (권장)

`.vscode/extensions.json`에 추천 확장 목록이 있어 VSCode가 자동으로 안내해줍니다.

- ESLint
- Prettier
- Tailwind CSS IntelliSense

저장 시 자동 포맷팅 / ESLint fix가 활성화되어 있습니다.

---

## 📁 폴더 구조

```
src/
├── app/                          # 앱 진입점, 전역 설정
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers/                # 전역 Provider
│   └── routes/                   # 페이지 단위 컴포넌트
│
├── features/                     # 기능 단위 모듈
│   ├── auth/                     # 로그인, 회원 정보
│   ├── project-list/             # 내 프로젝트 목록
│   ├── workspace/                # 에디터 메인 화면 (에디터/탭/파일트리/레이아웃)
│   ├── chat/                     # 채팅 패널
│   ├── collaboration/            # 실시간 파일 동기화
│   └── members/                  # 팀원/권한 관리
│
├── shared/                       # 여러 feature가 공유하는 코드
│   ├── api/                      # axios 인스턴스, 인터셉터, 에러 처리
│   ├── socket/                   # STOMP client 로직, 공통 타입
│   ├── ui/                       # 공용 컴포넌트 (Button, Modal, Tooltip 등)
│   ├── hooks/                    # 도메인 무관 훅 (useDebounce, useHotkey 등)
│   ├── lib/                      # 순수 유틸 함수 (path, format, cn)
│   ├── types/                    # 전역 타입
│   └── constants/
│
├── assets/                       # 이미지, 폰트, svg
├── styles/                       # index.css, theme.css
├── main.tsx
└── vite-env.d.ts
```

### feature 내부 구조

각 feature 폴더는 다음 구조를 따릅니다.

```
feature-name/
├── api/         # 그 feature의 서버 통신 함수
├── components/  # 그 feature에서만 쓰는 컴포넌트
├── hooks/       # useQuery, useMutation, 도메인 훅
├── stores/      # Jotai atom 또는 Zustand store
├── types.ts
└── index.ts     # 외부에 노출할 것만 export
```

---

## 🔗 의존성 방향

```
app  ──→  features  ──→  shared
```

| 규칙                    | 내용                                        |
| ----------------------- | ------------------------------------------- |
| `shared` → `features`   | ❌ 절대 금지                                |
| `features` → `features` | ❌ 원칙적 금지 (예외: `auth`는 import 허용) |
| `features` → `shared`   | ✅ 자유롭게                                 |
| `app` → 어디든          | ✅ 자유롭게                                 |

> 두 feature가 자꾸 서로 import해야 하면 → 공통 부분을 `shared`로 추출하거나 더 큰 feature로 합치는 걸 검토합니다.

---

## 🗂 상태 관리 전략

| 상태 유형                        | 도구            | 예시                                |
| -------------------------------- | --------------- | ----------------------------------- |
| 서버에서 가져오는 데이터         | **React Query** | 프로젝트 목록, 회원 정보, 멤버 목록 |
| 소켓으로 push되는 raw 데이터     | **Jotai**       | 채팅 메시지, 원격 파일 변경 알림    |
| UI ephemeral 상태                | **Jotai**       | 패널 크기, 모달 열림 여부, 테마     |
| 클라이언트 도메인 + 액션 많은 곳 | **Zustand**     | 탭 관리, 파일 트리 CRUD             |
| WebSocket 연결 인스턴스          | **Context API** | STOMP client                        |

### REST + WebSocket 동기화 패턴

협업 IDE의 핵심 패턴입니다.

1. **REST**로 초기 스냅샷 로드 (예: 프로젝트 멤버 목록)
2. **WebSocket**으로 이후 변경사항 push 받기
3. 소켓 콜백에서 `queryClient.setQueryData`로 캐시 직접 업데이트

```ts
// 예시
queryClient.setQueryData(["project", id, "members"], (old) => {
  return updateMemberInList(old, newMember);
});
```

컴포넌트는 `useQuery(['project', id, 'members'])` 하나만 보면 됩니다.

### Jotai 사용 팁

채팅 메시지 / 원격 파일 변경처럼 **계속 쌓이는 데이터**는 단일 atom에 배열로 두면 한 항목 추가 시 전체 구독자가 리렌더됩니다. 다음 중 하나로 해결하세요.

- `atomFamily(filePath)` 패턴으로 항목별 atom 분리
- 가상 스크롤 + 슬라이스 atom

---

## 🎨 스타일링

### Tailwind CSS v4

v4부터는 **CSS-first 설정**입니다. `tailwind.config.js` 없음.

테마 토큰은 `src/styles/index.css`의 `@theme` 블록에서 정의합니다.

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #1e1e1e;
  --color-bg-secondary: #252526;
  /* ... */
}
```

→ 이렇게 정의하면 `bg-bg-primary` 같은 클래스로 자동 사용 가능.

### className 합성

조건부 className 합성은 `shared/lib/cn.ts`의 `cn()` 유틸을 사용합니다.

```tsx
<div className={cn('base', isActive && 'bg-accent')}>
```

---

## 🛠 코드 컨벤션

### Prettier (`.prettierrc.json`)

| 규칙            | 값                   |
| --------------- | -------------------- |
| `semi`          | `false` (세미콜론 X) |
| `singleQuote`   | `true` (작은따옴표)  |
| `trailingComma` | `all`                |
| `printWidth`    | `100`                |
| `tabWidth`      | `2`                  |
| `arrowParens`   | `always`             |

### Import 순서

`@trivago/prettier-plugin-sort-imports`가 자동 정렬합니다.

```ts
// 1. react
import { useState } from "react";

// 2. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";

// 3. 절대 경로 (@/)
import { Button } from "@/shared/ui/Button";

// 4. 상대 경로
import { useLocalThing } from "./hooks";
```

### TypeScript

- **type-only import** 권장: `import type { User } from '...'`
- 사용하지 않는 변수는 `_` 접두사: `function foo(_unused: string) {}`
- `any` 지양

### 명명 규칙

| 대상              | 규칙           | 예시                        |
| ----------------- | -------------- | --------------------------- |
| 컴포넌트 파일     | PascalCase     | `FileTree.tsx`              |
| 훅 / 유틸 파일    | camelCase      | `useDebounce.ts`, `path.ts` |
| store 파일        | `xxx.store.ts` | `tabs.store.ts`             |
| atom 변수         | `xxxAtom`      | `chatMessagesAtom`          |
| 타입 / 인터페이스 | PascalCase     | `User`, `ProjectMember`     |

### 경로 alias

`@/`는 `src/`를 가리킵니다.

```ts
import { Button } from "@/shared/ui/Button"; // ✅
import { Button } from "../../../shared/ui/Button"; // ❌
```

---

## 📜 NPM 스크립트

| 명령어                 | 설명                           |
| ---------------------- | ------------------------------ |
| `npm run dev`          | 개발 서버 실행                 |
| `npm run build`        | 프로덕션 빌드 (타입 체크 포함) |
| `npm run preview`      | 빌드 결과 미리보기             |
| `npm run lint`         | ESLint 검사                    |
| `npm run lint:fix`     | ESLint 자동 수정               |
| `npm run format`       | Prettier 일괄 적용             |
| `npm run format:check` | Prettier 위반 검사 (CI용)      |
| `npm run typecheck`    | 타입 체크만 실행               |

---

## ⚠️ 작업 시 주의사항

### Provider 순서

`app/providers/index.tsx`에서 Provider 순서는 다음과 같습니다.

```
QueryProvider
  └ SocketProvider
      └ App
```

`SocketProvider`가 React Query 캐시(`queryClient.setQueryData`)를 갱신하므로 **React Query가 바깥**에 있어야 합니다. 순서 유지해 주세요.

### 새 컴포넌트 위치 결정 가이드

```
한 feature에서만 쓴다       → features/<feature>/components/
여러 feature에서 쓴다       → shared/ui/
앱 전체 레이아웃에 관여    → app/
```

**"미리 shared에 두지 말 것"** - 다른 곳에서도 쓰게 되는 시점에 옮기면 됩니다.

### Prettier 세팅 확인

처음 클론 받았을 때 다음을 확인하세요.

1. VSCode 확장 (`esbenp.prettier-vscode`) 설치되어 있는지
2. `.vscode/settings.json`의 `formatOnSave: true` 적용되는지
3. 저장 시 import 정렬 + 포맷팅이 동작하는지

동작 안 하면:

```bash
npm install   # 의존성 누락 확인
npm run format # 수동으로 한 번 돌려보기
```


## 💬 커밋 메시지 규칙

`[Type] 메시지` 형식으로 작성합니다. husky가 커밋 시 형식을 자동 검사하므로 규칙에 맞지 않으면 커밋이 거부됩니다.

### Type 종류

| 타입 | 용도 | 예시 |
|---|---|---|
| `[Feat]` | 새 기능 추가 | `[Feat] 로그인 페이지 구현` |
| `[Fix]` | 버그 수정 | `[Fix] 탭 닫기 시 활성 탭 이동 오류 수정` |
| `[Refactor]` | 기능 변화 없는 코드 개선 | `[Refactor] 파일트리 재귀 로직 분리` |
| `[Style]` | 코드 포맷, 세미콜론 등 (동작 변화 X) | `[Style] Prettier 적용` |
| `[Design]` | UI/CSS 변경 | `[Design] 사이드바 너비 조정` |
| `[Docs]` | 문서 (README 등) | `[Docs] 상태 관리 규칙 추가` |
| `[Chore]` | 빌드, 패키지, 설정 | `[Chore] husky 도입` |
| `[Test]` | 테스트 추가/수정 | `[Test] useDebounce 훅 테스트 추가` |
| `[Rename]` | 파일/폴더명 변경 | `[Rename] Editor → MonacoEditor` |
| `[Remove]` | 파일/코드 삭제 | `[Remove] 사용하지 않는 유틸 제거` |

### 커밋 템플릿 사용 방법

`npm install`을 실행하면 커밋 템플릿(`.gitmessage`)이 자동으로 등록됩니다.
이후 다음 명령어로 커밋하면 에디터에 템플릿이 열립니다.

```bash
git commit
```

> ⚠️ `-m` 옵션을 붙이면 (`git commit -m "..."`) 템플릿이 표시되지 않고 메시지를 직접 입력해야 합니다.

#### 에디터에서 커밋 메시지 작성하기

`git commit`을 실행하면 터미널에 vim(또는 설정된 기본 에디터)이 열리고 다음과 같은 화면이 보입니다.

```
[] 

# ─────────────────────────────────────
# Type:
#   Feat     새 기능
#   Fix      버그 수정
#   ...
# ─────────────────────────────────────
```

1. `i`를 눌러 **입력 모드(INSERT)** 진입
2. `[]` 안에 타입 입력, 뒤에 메시지 작성 → 예: `[Feat] 로그인 페이지 구현`
3. `Esc` 눌러 입력 모드 종료
4. `:wq` 입력하고 Enter → 저장 후 종료 → 커밋 완료

`#`으로 시작하는 줄은 주석이라 커밋 메시지에 포함되지 않으니 그대로 두면 됩니다.

#### 에디터를 VSCode로 바꾸고 싶다면

vim이 익숙하지 않으면 기본 에디터를 VSCode로 변경할 수 있습니다.

```bash
git config --global core.editor "code --wait"
```

이후 `git commit`을 실행하면 VSCode가 열리고, 메시지 작성 후 **탭을 닫으면** 자동으로 커밋됩니다.

### CLI에서 한 줄로 커밋하고 싶다면

간단한 커밋은 `-m` 옵션이 더 빠릅니다. 형식만 맞으면 husky가 통과시켜줍니다.

```bash
git commit -m "[Feat] 로그인 페이지 구현"
```

### 형식 오류 시

규칙에 맞지 않는 메시지로 커밋하면 다음과 같이 거부됩니다.

```
❌ 커밋 메시지 형식이 올바르지 않습니다.

올바른 형식: [Type] 메시지
사용 가능한 타입: Feat, Fix, Refactor, Style, Design, Docs, Chore, Test, Rename, Remove, Init
```

이 경우 메시지를 수정해서 다시 커밋하면 됩니다.

---

## 📚 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Jotai 공식 문서](https://jotai.org)
- [Zustand 공식 문서](https://zustand.docs.pmnd.rs)
- [Tailwind CSS v4 마이그레이션 가이드](https://tailwindcss.com/docs/v4-beta)
