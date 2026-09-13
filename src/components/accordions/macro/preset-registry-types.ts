export interface MacroTaskPresetPathEntry {
  titleKey?: string
  title?: string
  icon?: string
}

export interface MacroTaskPresetRegistration extends MacroTaskPresetPathEntry {
  path?: MacroTaskPresetPathEntry[]
  loopOnly?: boolean
  switchOnly?: boolean
  ollamaOnly?: boolean
  order: number
  create: () => any
}

export interface MacroTaskPresetNode extends MacroTaskPresetPathEntry {
  loopOnly?: boolean
  switchOnly?: boolean
  ollamaOnly?: boolean
  order?: number
  create?: () => any
  children?: MacroTaskPresetNode[]
}
