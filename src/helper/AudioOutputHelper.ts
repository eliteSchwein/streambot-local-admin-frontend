// Readable name for an ALSA sink of a device that is not connected (e.g.
// "alsa_output.usb-MOTU_M2_M2MA094DXA-00.HiFi__Line__sink" -> "MOTU M2 · Line").
export function prettySinkName(name: string): string {
  const raw = String(name ?? '')
  // Bluetooth: "bluez_output.AA_BB_CC_DD_EE_FF.1" -> "Bluetooth AA:BB:CC:DD:EE:FF"
  const bluetooth = raw.match(/^bluez_output\.([0-9a-f]{2}(?:_[0-9a-f]{2}){5})/i)
  if (bluetooth) return `Bluetooth ${bluetooth[1].replace(/_/g, ':')}`
  const match = raw.match(/^alsa_output\.(?:usb|pci|platform|bluez)[-_](.+)\.([^.]+)$/)
  if (!match) return raw
  const parts = match[1].split('_').filter(Boolean)
  // Drop a trailing serial/interface token like "M2MA094DXA-00".
  if (parts.length > 1 && /\d.*-\d+$/.test(parts[parts.length - 1])) parts.pop()
  // PCI bus addresses ("0000_00_1f.3") are not a useful name.
  const device = /^[0-9a-f]{4}$/i.test(parts[0] ?? '') ? '' : parts.join(' ')
  const profile = match[2]
    .replace(/^HiFi__/i, '').replace(/__(sink|source)$/i, '')
    .replace(/^analog-stereo$/i, '').replace(/[_-]+/g, ' ').trim()
  return [device, profile].filter(Boolean).join(' · ') || raw
}
