import { useAtomValue } from 'jotai'

import { roleChangeNotificationAtom } from '@/features/workspace/stores/memberModalAtom'

export function RoleChangeNotification() {
  const notification = useAtomValue(roleChangeNotificationAtom)
  if (!notification) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-bg-secondary border border-border rounded-xl p-6 w-96 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-400"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-text-primary">권한이 변경되었습니다</h3>
        </div>
        <p className="text-[13px] text-text-primary/60 leading-relaxed mb-1">
          회원님의 권한이{' '}
          <span className="font-medium text-text-primary/80">{notification.previousRole}</span>
          {' → '}
          <span className="font-medium text-amber-400">{notification.currentRole}</span>
          으로 변경되었습니다.
        </p>
        <p className="text-[13px] text-text-primary/40 leading-relaxed">
          변경 사항 적용을 위해 잠시 후 로그아웃됩니다.
        </p>
      </div>
    </div>
  )
}
