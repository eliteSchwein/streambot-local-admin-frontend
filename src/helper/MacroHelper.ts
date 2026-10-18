export const HIDDEN_MACRO_PREFIXES = ['channel_point_', 'event_', 'command_'] as const

export function isHiddenMacroName(name: unknown): boolean {
  const normalized = String(name ?? '').trim().toLowerCase()
  return HIDDEN_MACRO_PREFIXES.some(prefix => normalized.startsWith(prefix))
}

export function filterVisibleMacroNames(names: unknown[]): string[] {
  return Array.from(new Set(
    names
      .map(name => String(name ?? '').trim())
      .filter(name => name && !isHiddenMacroName(name)),
  ))
}
