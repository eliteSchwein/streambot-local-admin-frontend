// Helpers to connect OBS scene items with the OBS audio input data.
// Scene items carry the input UUID as `sourceUuid`/`uuid`, audio entries use
// `inputUuid`, so both can be matched directly.

export function getAudioDevices(audioData: any): any[] {
  const values = Array.isArray(audioData) ? audioData.flat() : Object.values(audioData ?? {})
  return values.filter((device: any) => device?.inputUuid)
}

export function findAudioDevice(audioData: any, source: any): any | undefined {
  if (!source || source.isGroup) return undefined

  const devices = getAudioDevices(audioData)
  const uuid = String(source.sourceUuid ?? source.inputUuid ?? source.uuid ?? '')

  if (uuid) {
    const byUuid = devices.find((device: any) => String(device.inputUuid) === uuid)
    if (byUuid) return byUuid
  }

  const name = String(source.sourceName ?? source.inputName ?? source.name ?? '')
  return name ? devices.find((device: any) => String(device.inputName) === name) : undefined
}

function collectSceneSourceKeys(scenes: any, uuids: Set<string>, names: Set<string>) {
  const visitItem = (item: any) => {
    if (!item) return
    const uuid = item.sourceUuid ?? item.inputUuid ?? item.uuid
    const name = item.sourceName ?? item.inputName ?? item.name
    if (uuid) uuids.add(String(uuid))
    if (name) names.add(String(name))
    if (Array.isArray(item.children)) item.children.forEach(visitItem)
  }

  const visitScene = (scene: any) => {
    const items = scene?.items ?? scene?.sources ?? scene?.sceneItems
    if (Array.isArray(items)) items.forEach(visitItem)
    // Canvas entries contain their own scene list.
    if (Array.isArray(scene?.scenes)) scene.scenes.forEach(visitScene)
  }

  if (Array.isArray(scenes)) scenes.forEach(visitScene)
}

/**
 * Audio inputs that are not part of any scene, e.g. OBS's global
 * "Desktop Audio" / "Mic/Aux" devices.
 */
export function getGlobalAudioDevices(audioData: any, scenes: any): any[] {
  const uuids = new Set<string>()
  const names = new Set<string>()
  collectSceneSourceKeys(scenes, uuids, names)

  return getAudioDevices(audioData)
    .filter((device: any) => !uuids.has(String(device.inputUuid)) && !names.has(String(device.inputName)))
    .sort((a: any, b: any) => String(a.inputName ?? '').localeCompare(String(b.inputName ?? '')))
}

export function getObsSourceIcon(source: any): string {
  if (source?.isGroup) return 'mdi-folder-outline'

  const kind = String(source?.inputKind ?? source?.sourceType ?? source?.kind ?? '').toLowerCase()

  if (kind.includes('browser')) return 'mdi-web'
  if (kind.includes('image')) return 'mdi-image-outline'
  if (kind.includes('media')) return 'mdi-movie-open-outline'
  if (kind.includes('ffmpeg')) return 'mdi-movie-open-outline'
  if (kind.includes('vlc')) return 'mdi-playlist-play'
  if (kind.includes('text')) return 'mdi-format-text'
  if (kind.includes('audio')) return 'mdi-volume-high'
  if (kind.includes('wasapi')) return 'mdi-volume-high'
  if (kind.includes('pulse')) return 'mdi-volume-high'
  if (kind.includes('alsa')) return 'mdi-volume-high'
  if (kind.includes('capture')) return 'mdi-video-outline'
  if (kind.includes('camera')) return 'mdi-camera-outline'
  if (kind.includes('scene')) return 'mdi-view-dashboard-outline'
  if (kind.includes('color')) return 'mdi-palette-outline'

  return 'mdi-source-branch'
}
