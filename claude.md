# Flowdeck-FE

협업 가능한 웹 기반 IDE의 프론트엔드.
실시간 협업(채팅, 동시 파일 편집)은 STOMP over WebSocket으로 처리.

## 기술 스택

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (CSS-first, `@theme` 블록)
- **서버 상태**: TanStack Query (React Query)
- **소켓 raw 데이터 / UI 상태 / 클라이언트 도메인 상태**: Jotai
- **WebSocket 연결**: STOMP client는 Context API로 제공
- **Router**: react-router-dom

## 폴더 구조

```
src/
├── app/         앱 진입점, router, providers, routes
├── features/    기능별 모듈 (auth, project-list, workspace, chat, collaboration, members)
└── shared/      여러 feature가 공유 (api, socket, ui, hooks, lib, types, constants)
```

각 feature는 내부에 `api/`, `components/`, `hooks/`, `stores/`, `types.ts`로 구성하여 자급자족.
페이지 컴포넌트는 `app/routes/`에 둠.

## 의존성 방향 (필수)

```
app  →  features  →  shared
```

- `shared`는 `features`를 **절대 import 안 함**
- `features`끼리 import 금지 (단, `auth`만 예외 — 거의 모든 곳에서 쓰이므로)

## 상태 관리 규칙

| 상태 유형 | 도구 |
|---|---|
| 서버에서 가져오는 데이터 | React Query |
| 소켓으로 push되는 raw 데이터 | Jotai |
| UI ephemeral (패널 크기, 모달 등) | Jotai |
| 클라이언트 도메인 상태 (탭, 파일트리, 모달 등) | Jotai |
| WebSocket client 인스턴스 | Context API |

**핵심 패턴**: 소켓 콜백에서 React Query 캐시를 직접 업데이트.
`queryClient.setQueryData(['project', id, 'members'], updater)` → REST 스냅샷과 실시간 변경을 하나의 source of truth로 통합.

**Jotai 패턴**:
- 액션 많은 도메인은 write-only atom으로 처리 (`atom(null, (get, set, action) => {...})`)
- 채팅/파일 변경처럼 누적되는 데이터는 `atomFamily(key)`로 항목별 분리

## 커밋 메시지

`[Type] 메시지` 형식. husky `commit-msg` 훅으로 강제됨.
Type: `Feat`, `Fix`, `Refactor`, `Style`, `Design`, `Docs`, `Chore`, `Test`, `Rename`, `Remove`, `Init`

## 브랜치 이름

`type/이슈번호-짧은-설명` (kebab-case, 소문자, 영어)
예: `feat/12-login-page`, `chore/5-claude-code-setup`

장기 브랜치는 `main` (배포), `develop` (개발 통합).

## 명명 규칙

- 컴포넌트 파일: PascalCase (`FileTree.tsx`)
- 훅/유틸 파일: camelCase (`useDebounce.ts`)
- Jotai atom 변수: `xxxAtom`
- 타입/인터페이스: PascalCase

## 새 컴포넌트 위치 결정

- 한 feature에서만 사용 → `features/<feature>/components/`
- 여러 feature에서 사용 → `shared/ui/`
- **미리 `shared`에 두지 말 것.** 실제 재사용이 발생할 때 옮긴다.

## Path Alias

`@/`는 `src/`를 가리킴. 상대경로 `../../../` 사용 금지.

## 코드 스타일

Prettier + ESLint가 자동 강제. 자세한 규칙은 `.prettierrc.json`, `eslint.config.js` 참조.
요약: 세미콜론 없음, 작은따옴표, type-only import는 `import type`.

## Claude Code 개발 플로우

이슈 기반으로 브랜치 단위 작업. 매 작업마다 아래 순서를 따른다.

### 1. 이슈 확인

```bash
gh issue view <번호>
```

이슈 번호, 작업 내용, 완료 조건을 확인한다.  
API 연동 작업이면 명세서를 함께 받아 엔드포인트·요청/응답 타입을 확인한다.

### 2. 브랜치 체크아웃

```bash
git fetch origin
git checkout <브랜치명>
```

브랜치명 규칙: `type/이슈번호-짧은-설명`

### 3. 구현

- 작업 범위는 이슈에 명시된 내용만. 범위 밖 리팩토링·추가 기능 금지.
- API 함수(`api/`) → 훅(`hooks/`) → 컴포넌트(`components/`) 순으로 작업.
- 의존성 방향 준수: `app → features → shared`. `shared`는 `features` import 금지.

### 4. 사용자에게 요약

구현 완료 후 무엇을 만들었는지 간략히 설명한다.  
변경된 파일, 주요 결정 사항, 남은 한계 등을 포함.

### 5. 빌드 확인

```bash
npm run build
```

`tsc -b`(타입 검사) + Vite 번들 빌드를 동시에 수행.  
에러 없이 통과해야 커밋한다.

### 6. 커밋 & 푸시

```bash
git add <변경파일...>
git commit -m "[Type] 메시지"
git push origin <브랜치명>
```

`git add .` 사용 금지. 변경 파일을 명시적으로 지정.

### 7. PR 생성

```bash
gh pr create --title "..." --body "..."
```

PR 본문: Summary(변경 내용) + Test plan(테스트 항목 체크리스트).

---

### 주의 사항

- **명세서 먼저**: API 연동 작업 시 엔드포인트·타입을 사전에 확인. 추정으로 구현 금지.
- **Mock 데이터 필수**: API 연동 작업 시 반드시 `src/mocks/handlers.ts`에 MSW 핸들러도 함께 추가한다. 실제 백엔드 없이도 기능을 테스트할 수 있어야 한다.
- **빌드 통과 필수**: TypeScript 에러나 ESLint 에러가 있으면 커밋하지 않는다.
- **커밋은 명시적 요청 시에만**: 사용자가 "git에 올려줘" 등을 말하기 전까지 커밋하지 않는다.