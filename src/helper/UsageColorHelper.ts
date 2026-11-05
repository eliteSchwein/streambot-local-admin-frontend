export const USAGE_WARNING_PERCENT = 80
export const USAGE_CRITICAL_PERCENT = 90

/**
 * Text color class for a usage percentage: orange from 80 %, red from 90 %.
 */
export function usageColorClass(value: unknown): string {
  const percent = Number(value)

  if (!Number.isFinite(percent)) return ''
  if (percent >= USAGE_CRITICAL_PERCENT) return 'text-error'
  if (percent >= USAGE_WARNING_PERCENT) return 'text-orange'

  return ''
}
