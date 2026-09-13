import { alertsMacroTaskPresets } from './alerts'
import { animationMacroTaskPresets } from './animation'
import { apiMacroTaskPresets } from './api'
import { audioMacroTaskPresets } from './audio'
import { autoMacroMacroTaskPresets } from './auto-macro'
import { channelPointMacroTaskPresets } from './channel-point'
import { commandMacroTaskPresets } from './command'
import { fileMacroTaskPresets } from './file'
import { flowMacroTaskPresets } from './flow'
import { functionsMacroTaskPresets } from './functions'
import { keyboardMacroTaskPresets } from './keyboard'
import { macroMacroTaskPresets } from './macro'
import { mediaMacroTaskPresets } from './media'
import { miscMacroTaskPresets } from './misc'
import { musicMacroTaskPresets } from './music'
import { obsMacroTaskPresets } from './obs'
import { ollamaMacroTaskPresets } from './ollama'
import { rotateSceneMacroTaskPresets } from './rotate-scene'
import { systemMacroTaskPresets } from './system'
import { themeMacroTaskPresets } from './theme'
import { timerMacroTaskPresets } from './timer'
import { twitchMacroTaskPresets } from './twitch'
import { variablesMacroTaskPresets } from './variables'
import { webMacroTaskPresets } from './web'
import { wledMacroTaskPresets } from './wled'
import { yoloboxMacroTaskPresets } from './yolobox'
import type { MacroTaskPresetNode, MacroTaskPresetPathEntry, MacroTaskPresetRegistration } from './preset-registry-types'

const registrations: MacroTaskPresetRegistration[] = [
  ...alertsMacroTaskPresets,
  ...animationMacroTaskPresets,
  ...apiMacroTaskPresets,
  ...audioMacroTaskPresets,
  ...autoMacroMacroTaskPresets,
  ...channelPointMacroTaskPresets,
  ...commandMacroTaskPresets,
  ...fileMacroTaskPresets,
  ...flowMacroTaskPresets,
  ...functionsMacroTaskPresets,
  ...keyboardMacroTaskPresets,
  ...macroMacroTaskPresets,
  ...mediaMacroTaskPresets,
  ...miscMacroTaskPresets,
  ...musicMacroTaskPresets,
  ...obsMacroTaskPresets,
  ...ollamaMacroTaskPresets,
  ...rotateSceneMacroTaskPresets,
  ...systemMacroTaskPresets,
  ...themeMacroTaskPresets,
  ...timerMacroTaskPresets,
  ...twitchMacroTaskPresets,
  ...variablesMacroTaskPresets,
  ...webMacroTaskPresets,
  ...wledMacroTaskPresets,
  ...yoloboxMacroTaskPresets,
].sort((a, b) => a.order - b.order)

const nodeKey = (node: MacroTaskPresetPathEntry) => node.titleKey ?? `title:${node.title ?? ''}`

export function buildMacroTaskPresets(): MacroTaskPresetNode[] {
  const roots: MacroTaskPresetNode[] = []

  for (const registration of registrations) {
    let children = roots

    for (const pathEntry of registration.path ?? []) {
      const key = nodeKey(pathEntry)
      let group = children.find((item) => nodeKey(item) === key)

      if (!group) {
        group = { ...pathEntry, children: [] }
        children.push(group)
      }

      group.children ??= []
      children = group.children
    }

    const { path: _path, ...leaf } = registration
    children.push(leaf)
  }

  return roots
}


const stableDataKeys = new Set([
  'action',
  'isSelected',
  'AFV',
  'status',
  'sceneItemEnabled',
  'sceneItemLocked',
  'inputMuted',
  'filterEnabled',
])

function taskFromPreset(registration: MacroTaskPresetRegistration): any {
  try {
    return registration.create?.()
  } catch {
    return null
  }
}

function presetMatchScore(registration: MacroTaskPresetRegistration, item: any): number {
  const created = taskFromPreset(registration)
  if (!created || !item) return -1

  if (created.type && item.type && created.type !== item.type) return -1

  const expectedTask = created.task ?? {}
  const actualTask = item.task ?? {}

  if (String(expectedTask.channel ?? '') !== String(actualTask.channel ?? '')) return -1
  if (String(expectedTask.method ?? '') !== String(actualTask.method ?? '')) return -1

  let score = 10
  const expectedData = expectedTask.data && typeof expectedTask.data === 'object' ? expectedTask.data : {}
  const actualData = actualTask.data && typeof actualTask.data === 'object' ? actualTask.data : {}

  for (const [key, expected] of Object.entries(expectedData)) {
    const isStable = stableDataKeys.has(key) || (key === 'id' && expected === 'all')
    if (!isStable) continue

    if (actualData[key] === expected) score += 5
    else score -= 5
  }

  return score
}

export function findMacroTaskPreset(item: any): MacroTaskPresetRegistration | null {
  // The sleep shortcuts are intentionally examples in the picker. Once created,
  // the editor uses the generic Sleep title plus its actual duration.
  if (item?.task?.channel === 'function' && item?.task?.method === 'sleep') return null

  let best: MacroTaskPresetRegistration | null = null
  let bestScore = -1

  for (const registration of registrations) {
    const score = presetMatchScore(registration, item)
    if (score > bestScore) {
      best = registration
      bestScore = score
    }
  }

  return bestScore >= 10 ? best : null
}
