import { getWebsocketClient } from '@/plugins/websocketInstance'

export type NameExistsResult = {
  exists: boolean
  name: string
  command_name?: string | null
  [key: string]: any
}

export async function checkNameExistsResult(method: string, name: string, timeout = 4_000): Promise<NameExistsResult> {
  const normalizedName = String(name ?? '').trim()
  if (!normalizedName) return false

  const client = getWebsocketClient()
  if (!client) throw new Error('websocket is not connected')

  const response = await client.request(method, { name: normalizedName }, timeout)
  let data: any = response?.params ?? response
  const resultKey = `result_${method}`

  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, resultKey)) {
    data = data[resultKey]
  }
  if (data?.data && typeof data.data === 'object') data = data.data
  if (data?.error) throw new Error(data.error)

  return {
    ...(data && typeof data === 'object' ? data : {}),
    name: String(data?.name ?? normalizedName),
    exists: data?.exists === true,
  }
}

export async function checkNameExists(method: string, name: string, timeout = 4_000): Promise<boolean> {
  return (await checkNameExistsResult(method, name, timeout)).exists
}
