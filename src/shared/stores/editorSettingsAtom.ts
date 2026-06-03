import { atomWithStorage } from 'jotai/utils'

export interface EditorSettings {
  fontSize: number
  monacoTheme: string
}

export const editorSettingsAtom = atomWithStorage<EditorSettings>('flowdeck-editor-settings', {
  fontSize: 13,
  monacoTheme: 'vs-dark',
})

export const MONACO_THEME_MAP: Record<string, string> = {
  'one-dark': 'vs-dark',
  dracula: 'flowdeck-dracula',
  monokai: 'flowdeck-monokai',
}
