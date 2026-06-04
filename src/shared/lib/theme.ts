export const THEMES = {
  'one-dark': {
    label: 'One Dark',
    desc: 'VS Code 기본 다크 테마',
    preview: { bg: '#1e1e1e', panel: '#252526', accent: '#007acc' },
  },
  dracula: {
    label: 'Dracula',
    desc: '보라색 강조의 다크 테마',
    preview: { bg: '#282a36', panel: '#21222c', accent: '#bd93f9' },
  },
  monokai: {
    label: 'Monokai',
    desc: '분홍 강조의 클래식 테마',
    preview: { bg: '#272822', panel: '#1e1f1c', accent: '#f92672' },
  },
} as const

export type ThemeName = keyof typeof THEMES

const STORAGE_KEY = 'flowdeck-theme'

export function getStoredTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && stored in THEMES) return stored as ThemeName
  return 'one-dark'
}

export function applyTheme(theme: ThemeName) {
  if (theme === 'one-dark') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = theme
  }
  localStorage.setItem(STORAGE_KEY, theme)
}
