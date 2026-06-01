// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App'
import { AppProviders } from '@/app/providers'
import '@/styles/index.css'

// [수정] 실제 백엔드 연동을 위해 MSW 가동 차단 (주석 처리)
async function prepare() {
  /*
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
  */
}

// prepare().then() 구조를 일반 렌더링 구조로 변경하여 백엔드 직행하도록 수립
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)