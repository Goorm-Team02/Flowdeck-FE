# Flowdeck-FE

협업 가능한 웹 기반 IDE의 프론트엔드.
실시간 협업(채팅, 동시 파일 편집)은 STOMP over WebSocket으로 처리.

## 기술 스택

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (CSS-first, `@theme` 블록)
- **서버 상태**: TanStack Query (React Query)
- **소켓 raw 데이터 / UI 상태**: Jotai
- **클라이언트 도메인 상태 (액션 많은 곳)**: Zustand
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
| 클라이언트 도메인 상태 (탭, 파일트리 등) | Jotai |
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