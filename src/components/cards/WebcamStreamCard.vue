<template>
  <v-card class="integration-card" color="grey-darken-4" elevation="0">
    <v-card-title class="d-flex align-center justify-space-between ga-2">
      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-webcam" />
        <span>{{ $t('webcam.title') }}</span>
      </div>

      <div class="d-flex align-center ga-1">
        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-plus"
          :disabled="!webcam || busy"
          @click="addCamera"
        >
          {{ $t('webcam.addCamera') }}
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text v-if="!webcam" class="text-medium-emphasis">
      <v-progress-circular indeterminate size="18" class="mr-2" />
      {{ $t('webcam.loading') }}
    </v-card-text>

    <v-card-text v-else>
      <div class="text-body-2 text-medium-emphasis mb-3">
        {{ $t('webcam.description') }}
      </div>

      <div class="d-flex align-center ga-2 flex-wrap mb-3">
        <v-chip size="small" variant="tonal" :color="webcam.cloud_connected ? 'success' : 'warning'">
          {{ webcam.cloud_connected ? $t('webcam.cloudConnected') : $t('webcam.cloudDisconnected') }}
        </v-chip>
        <v-chip size="small" variant="tonal" color="grey">
          {{ $t('webcam.detectedCameras', { count: webcam.devices.length }) }}
        </v-chip>
        <v-chip v-if="corals.length" size="small" variant="tonal" color="info">
          {{ $t('webcam.coralCount', { count: corals.length }) }}
        </v-chip>
        <v-chip v-if="webcam.accelerators?.gpu?.runtime" size="small" variant="tonal" color="info">
          {{ $t('webcam.backends.gpu') }} ({{ gpuRuntimeLabel }})
        </v-chip>
        <v-chip v-if="webcam.accelerators?.rockchip_npu" size="small" variant="tonal" color="info">
          {{ $t('webcam.backends.rknn') }} ({{ webcam.accelerators.rockchip_npu }})
        </v-chip>
      </div>

      <v-alert
        v-if="inaccessibleCorals.length"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <div>{{ $t('webcam.coralNoAccess', { device: inaccessibleCorals.map((coral) => coral.node).join(', ') }) }}</div>
        <v-text-field
          v-if="webcam.coral_udev_command"
          :model-value="webcam.coral_udev_command"
          readonly
          density="compact"
          variant="outlined"
          hide-details
          class="mt-2 webcam-card__command"
          @focus="selectAll"
        >
          <template #append-inner>
            <CopyButton :content="webcam.coral_udev_command" variant="text" />
          </template>
        </v-text-field>
      </v-alert>

      <v-alert
        v-if="requestError"
        type="error"
        variant="tonal"
        density="compact"
        closable
        class="mb-3"
        @click:close="requestError = ''"
      >
        {{ requestError }}
      </v-alert>

      <!-- Privacy blur runtime (shared by all cameras) -->
      <template v-if="anyBlur && !webcam.blur_installed">
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div>{{ $t('webcam.privacy.notInstalled') }}</div>
          <div v-if="webcam.blur_install_error" class="mt-1 text-caption">
            {{ webcam.blur_install_error }}
          </div>
          <div v-if="webcam.blur_install" class="d-flex align-center ga-2 mt-2">
            <v-progress-circular indeterminate size="16" />
            {{ $t('webcam.privacy.installing', { step: webcam.blur_install.stage }) }}
          </div>
          <v-btn
            v-else
            class="mt-2"
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-download"
            :loading="installing"
            @click="installBlur"
          >
            {{ $t('webcam.privacy.install') }}
          </v-btn>
        </v-alert>
      </template>

      <v-alert
        v-if="anyBlur && webcam.blur_installed && webcam.blur_update_available"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <div>{{ $t('webcam.privacy.updateAvailable') }}</div>
        <div v-if="webcam.blur_install" class="d-flex align-center ga-2 mt-2">
          <v-progress-circular indeterminate size="16" />
          {{ $t('webcam.privacy.installing', { step: webcam.blur_install.stage }) }}
        </div>
        <v-btn
          v-else
          class="mt-2"
          color="secondary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-update"
          :loading="installing"
          @click="installBlur"
        >
          {{ $t('webcam.privacy.update') }}
        </v-btn>
      </v-alert>

      <div
        v-if="webcam.blur_installed && !webcam.blur_install"
        class="d-flex align-center justify-space-between ga-2 mb-3 text-body-2 text-medium-emphasis"
      >
        <span>
          {{ $t('webcam.privacy.installed') }}<template v-if="blurSize"> · {{ blurSize }}</template>
        </span>
        <v-btn
          color="error"
          variant="text"
          size="small"
          prepend-icon="mdi-delete"
          :loading="removingBlur"
          :disabled="busy"
          @click="removeBlur"
        >
          {{ $t('webcam.privacy.remove') }}
        </v-btn>
      </div>

      <div v-if="webcam.cameras.length === 0" class="text-medium-emphasis text-body-2 py-4 text-center">
        {{ webcam.devices.length > 0 ? $t('webcam.noCamerasConfigured') : $t('webcam.noDevices') }}
      </div>

      <v-expansion-panels v-else v-model="openPanels" multiple variant="accordion">
        <v-expansion-panel
          v-for="camera in webcam.cameras"
          :key="camera.id"
          :value="camera.id"
          bg-color="grey-darken-3"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center ga-2 flex-wrap webcam-card__panel-title">
              <v-switch
                :model-value="camera.enabled"
                color="primary"
                density="compact"
                hide-details
                inset
                :disabled="busy"
                @click.stop
                @update:model-value="update(camera, { enabled: Boolean($event) })"
              />
              <span class="text-body-1">{{ camera.name }}</span>
              <v-chip size="x-small" variant="tonal" :color="stateColor(camera.state)">
                {{ $t(`webcam.states.${camera.state}`) }}
              </v-chip>
              <v-chip v-if="!camera.device_present" size="x-small" variant="tonal" color="warning">
                {{ $t('webcam.deviceMissing') }}
              </v-chip>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-alert
              v-if="camera.error"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ camera.error }}
            </v-alert>

            <div class="d-flex align-center ga-2 flex-wrap mb-3">
              <v-chip v-if="camera.encoder_in_use" size="small" variant="tonal" color="grey">
                {{ camera.encoder_in_use }}
              </v-chip>
              <v-chip
                v-for="(backend, kind) in camera.worker?.detectors ?? {}"
                :key="kind"
                size="small"
                variant="tonal"
                color="grey"
              >
                {{ $t(`webcam.detectors.${kind}`) }}: {{ $t(`webcam.backends.${backend}`) }}{{ camera.worker?.devices?.[kind] ? ` (${camera.worker.devices[kind]})` : '' }}
              </v-chip>
              <v-chip
                v-for="(fps, kind) in detectionRates(camera)"
                :key="`fps-${kind}`"
                size="small"
                variant="tonal"
                color="grey"
              >
                {{ $t(`webcam.detectors.${kind}`) }}: {{ $t('webcam.detectionFps', { fps }) }}
              </v-chip>
            </div>

            <template v-if="camera.viewer_url">
              <v-text-field
                :model-value="camera.viewer_url"
                :label="$t('webcam.viewerUrl')"
                readonly
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-link-variant"
                class="mb-2"
                hide-details
                @focus="selectAll"
              >
              </v-text-field>
              <v-text-field
                v-if="camera.rtsp_url"
                :model-value="camera.rtsp_url"
                :label="$t('webcam.rtspUrl')"
                readonly
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-video-input-antenna"
                class="mb-4"
                hide-details
                @focus="selectAll"
              >
              </v-text-field>
            </template>

            <v-alert
              v-for="warning in camera.worker?.warnings ?? []"
              :key="warning"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ $t('webcam.acceleratorFallback', { reason: warning }) }}
            </v-alert>

            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="camera.name"
                  :label="$t('webcam.name')"
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @change="update(camera, { name: $event.target.value })"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :model-value="camera.device"
                  :items="deviceItems(camera)"
                  :label="$t('webcam.device')"
                  :hint="deviceHint(camera)"
                  persistent-hint
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="update(camera, { device: $event })"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :model-value="camera.audio_source"
                  :items="audioItems"
                  :label="$t('webcam.microphone')"
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="update(camera, { audio_source: $event })"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :model-value="camera.codec"
                  :items="codecItems"
                  :label="$t('webcam.codec')"
                  :hint="$t(`webcam.codecHints.${camera.codec}`)"
                  persistent-hint
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="setCodec(camera, $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :model-value="camera.encoder"
                  :items="encoderItems(camera)"
                  :label="$t('webcam.encoder')"
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="update(camera, { encoder: $event })"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-select
                  :model-value="`${camera.width}x${camera.height}`"
                  :items="resolutionItems(camera)"
                  :label="$t('webcam.resolution')"
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="setResolution(camera, $event)"
                />
              </v-col>
              <v-col cols="6" sm="4">
                <v-select
                  :model-value="camera.fps"
                  :items="[15, 24, 25, 30, 50, 60]"
                  :label="$t('webcam.fps')"
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="update(camera, { fps: $event })"
                />
              </v-col>
              <v-col cols="6" sm="4">
                <v-select
                  :model-value="camera.bitrate_kbps"
                  :items="bitrateItems"
                  :label="$t('webcam.bitrate')"
                  density="compact"
                  variant="outlined"
                  :disabled="busy"
                  @update:model-value="update(camera, { bitrate_kbps: $event })"
                />
              </v-col>
            </v-row>

            <div class="text-subtitle-2 mt-2 mb-1">
              {{ $t('webcam.privacy.title') }}
            </div>
            <div class="text-caption text-medium-emphasis mb-2">
              {{ $t('webcam.privacy.description') }}
            </div>

            <div class="d-flex flex-wrap ga-4">
              <v-switch
                :model-value="camera.blur_faces"
                :label="$t('webcam.privacy.faces')"
                color="primary"
                density="compact"
                hide-details
                inset
                :disabled="busy"
                @update:model-value="update(camera, { blur_faces: Boolean($event) })"
              />
              <v-switch
                :model-value="camera.blur_plates"
                :label="$t('webcam.privacy.plates')"
                color="primary"
                density="compact"
                hide-details
                inset
                :disabled="busy"
                @update:model-value="update(camera, { blur_plates: Boolean($event) })"
              />
              <v-switch
                :model-value="camera.show_detections"
                :label="$t('webcam.privacy.showDetections')"
                color="primary"
                density="compact"
                hide-details
                inset
                :disabled="busy"
                @update:model-value="update(camera, { show_detections: Boolean($event) })"
              />
            </div>

            <div v-if="camera.show_detections" class="text-caption text-medium-emphasis mt-1 mb-2">
              {{ $t('webcam.privacy.showDetectionsHint') }}
            </div>
            <template v-if="camera.blur_faces || camera.blur_plates || camera.show_detections">
              <v-row dense class="mt-2">
                <v-col v-if="camera.blur_faces || camera.show_detections" cols="12" md="6">
                  <v-select
                    :model-value="camera.face_accelerator"
                    :items="acceleratorItems(camera)"
                    :label="$t('webcam.privacy.faceAccelerator')"
                    :hint="$t('webcam.privacy.faceAcceleratorHint')"
                    persistent-hint
                    density="compact"
                    variant="outlined"
                    :disabled="busy"
                    @update:model-value="update(camera, { face_accelerator: $event })"
                  />
                </v-col>
                <v-col v-if="camera.blur_plates || camera.show_detections" cols="12" md="6">
                  <v-select
                    :model-value="camera.plate_accelerator"
                    :items="plateAcceleratorItems"
                    :label="$t('webcam.privacy.plateAccelerator')"
                    :hint="$t('webcam.privacy.plateAcceleratorHint')"
                    persistent-hint
                    density="compact"
                    variant="outlined"
                    :disabled="busy"
                    @update:model-value="update(camera, { plate_accelerator: $event })"
                  />
                </v-col>
              </v-row>
              <div class="text-caption text-medium-emphasis mt-2">
                {{ $t('webcam.privacy.limits') }}
              </div>
            </template>

            <div class="d-flex justify-end mt-4">
              <v-btn
                color="error"
                variant="tonal"
                size="small"
                prepend-icon="mdi-delete"
                :disabled="busy"
                @click="removeCamera(camera)"
              >
                {{ $t('webcam.removeCamera') }}
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

const RESOLUTION_PRESETS = ['640x360', '854x480', '1280x720', '1920x1080']

const STATE_COLORS: Record<string, string> = {
  streaming: 'success',
  starting: 'info',
  requesting: 'info',
  waiting_for_cloud: 'warning',
  waiting_for_device: 'warning',
  error: 'error',
  disabled: 'grey',
}

export default {
  name: 'WebcamStreamCard',

  data() {
    return {
      store: useAppStore(),
      busy: false,
      installing: false,
      requestError: '',
      removingBlur: false,
      openPanels: [] as string[],
    }
  },

  computed: {
    webcam(): any {
      return this.store.webcam
    },

    corals(): any[] {
      return this.webcam?.accelerators?.corals ?? []
    },

    inaccessibleCorals(): any[] {
      return this.corals.filter((coral: any) => !coral.accessible)
    },

    // Plate detection has no Coral/NPU model: GPU or CPU.
    plateAcceleratorItems(): Array<{ title: string; value: string; props?: any }> {
      const gpu = this.webcam?.accelerators?.gpu ?? {}
      let gpuSuffix = ` (${this.$t('webcam.notDetected')})`
      if (gpu.runtime) gpuSuffix = ` (${this.gpuRuntimeLabel})`
      else if (gpu.vendor) gpuSuffix = ` (${this.$t('webcam.gpuNeedsInstall')})`
      return [
        { title: String(this.$t('webcam.auto')), value: 'auto' },
        { title: `${this.$t('webcam.backends.gpu')}${gpuSuffix}`, value: 'gpu', props: { disabled: !gpu.runtime } },
        { title: String(this.$t('webcam.backends.cpu')), value: 'cpu' },
      ]
    },

    gpuRuntimeLabel(): string {
      const labels: Record<string, string> = { cuda: 'CUDA', openvino: 'OpenVINO', rocm: 'ROCm' }
      const runtime = this.webcam?.accelerators?.gpu?.runtime ?? ''
      return labels[runtime] ?? runtime
    },

    // Size of the blur install from the storage overview (notify_storage_update).
    blurSize(): string {
      const bytes = Number(this.store.storage?.folders?.webcam)
      if (!Number.isFinite(bytes) || bytes <= 0) return ''
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let value = bytes
      let unit = 0
      while (value >= 1024 && unit < units.length - 1) {
        value /= 1024
        unit++
      }
      return `${value.toFixed(unit >= 3 ? 1 : 0)} ${units[unit]}`
    },

    anyBlur(): boolean {
      return (this.webcam?.cameras ?? []).some((camera: any) => camera.blur_faces || camera.blur_plates || camera.show_detections)
    },

    audioItems(): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('webcam.noAudio')), value: '' },
        ...(this.webcam?.audio_sources ?? []).map((source: any) => ({
          title: source.description,
          value: source.name,
        })),
      ]
    },

    bitrateItems(): Array<{ title: string; value: number }> {
      return [800, 1500, 2500, 4000, 6000, 8000].map((value) => ({
        title: `${(value / 1000).toLocaleString()} Mbit/s`,
        value,
      }))
    },

    codecItems(): Array<{ title: string; value: string }> {
      // Only codecs with a working encoder here (AV1 only with hardware).
      const codecs = new Set((this.webcam?.encoders ?? []).map((encoder: any) => encoder.codec))
      return (['h264', 'h265', 'av1'] as const)
        .filter((codec) => codecs.has(codec))
        .map((codec) => ({ title: String(this.$t(`webcam.codecs.${codec}`)), value: codec }))
    },
  },

  mounted() {
    void this.request('webcam_get')
  },

  methods: {
    async request(method: string, params: any = {}) {
      const client = getWebsocketClient()
      if (!client) return null

      try {
        const response = await client.request(method, params, 30_000)
        const result = response?.params
        if (result?.error) {
          this.requestError = String(result.error)
          return null
        }
        this.requestError = ''
        if (Array.isArray(result?.cameras)) this.store.setWebcam(result)
        return result
      } catch (error: any) {
        this.requestError = error?.message ?? String(error)
        return null
      }
    },

    async run(method: string, params: any = {}) {
      this.busy = true
      try {
        return await this.request(method, params)
      } finally {
        this.busy = false
      }
    },

    update(camera: any, patch: Record<string, any>) {
      return this.run('webcam_camera_update', { id: camera.id, ...patch })
    },

    async addCamera() {
      const before = new Set((this.webcam?.cameras ?? []).map((camera: any) => camera.id))
      const result = await this.run('webcam_camera_add')
      const added = (result?.cameras ?? []).find((camera: any) => !before.has(camera.id))
      if (added) this.openPanels = [...this.openPanels, added.id]
    },

    removeCamera(camera: any) {
      if (!window.confirm(String(this.$t('webcam.removeConfirm', { name: camera.name })))) return
      void this.run('webcam_camera_remove', { id: camera.id })
    },

    setResolution(camera: any, value: string) {
      const [width, height] = String(value).split('x').map(Number)
      if (width && height) void this.update(camera, { width, height })
    },

    async removeBlur() {
      if (!window.confirm(String(this.$t('webcam.privacy.removeConfirm')))) return
      this.removingBlur = true
      try {
        await this.request('webcam_remove_blur')
      } finally {
        this.removingBlur = false
      }
    },

    async installBlur() {
      this.installing = true
      try {
        await this.request('webcam_install_blur')
      } finally {
        this.installing = false
      }
    },

    // Read-only URL fields: select everything on focus for easy Ctrl+C.
    selectAll(event: FocusEvent) {
      const input = event.target as HTMLInputElement | null
      input?.select?.()
    },

    // Per detector (face/plate) since each runs in its own thread; older
    // workers reported one number.
    detectionRates(camera: any): Record<string, number> {
      const rates = camera.worker?.detection_fps
      return rates && typeof rates === 'object' ? rates : {}
    },

    stateColor(state: string): string {
      return STATE_COLORS[state] ?? 'grey'
    },

    encoderItems(camera: any): Array<{ title: string; value: string }> {
      return [
        { title: String(this.$t('webcam.auto')), value: 'auto' },
        ...(this.webcam?.encoders ?? [])
          .filter((encoder: any) => encoder.codec === camera.codec)
          .map((encoder: any) => ({ title: encoder.label, value: encoder.kind })),
      ]
    },

    setCodec(camera: any, codec: string) {
      // Keep the chosen encoder family if it can also encode the new codec.
      const keep = (this.webcam?.encoders ?? [])
        .some((encoder: any) => encoder.codec === codec && encoder.kind === camera.encoder)
      void this.update(camera, { codec, encoder: keep ? camera.encoder : 'auto' })
    },

    deviceItems(camera: any): Array<{ title: string; value: string }> {
      const items = (this.webcam?.devices ?? []).map((device: any) => ({
        title: device.name,
        value: device.path,
      }))
      // Keep a configured but unplugged camera selectable.
      if (camera.device && !items.some((item: any) => item.value === camera.device)) {
        items.unshift({
          title: `${String(this.$t('webcam.deviceMissing'))}: ${camera.device.split('/').pop()}`,
          value: camera.device,
        })
      }
      return items
    },

    deviceHint(camera: any): string {
      const device = (this.webcam?.devices ?? []).find((entry: any) => entry.path === camera.device)
      if (!device) return camera.device
      return `${String(this.$t(`webcam.stable.${device.stable}`))} · ${device.node}`
    },

    resolutionItems(camera: any): string[] {
      // Sizes of the selected camera plus common presets (scaled if needed).
      const device = (this.webcam?.devices ?? []).find((entry: any) => entry.path === camera.device)
      const sizes = new Set<string>(RESOLUTION_PRESETS)
      for (const format of device?.formats ?? []) {
        for (const size of Object.keys(format.sizes ?? {})) {
          const [w, h] = size.split('x').map(Number)
          if (w >= 320 && h >= 240) sizes.add(size)
        }
      }
      sizes.add(`${camera.width}x${camera.height}`)
      return [...sizes].sort((a, b) => {
        const [aw, ah] = a.split('x').map(Number)
        const [bw, bh] = b.split('x').map(Number)
        return aw * ah - bw * bh
      })
    },

    // Face detection hardware (Corals, GPU, Rockchip NPU, CPU).
    acceleratorItems(camera: any): Array<{ title: string; value: string; props?: any }> {
      const accelerators = this.webcam?.accelerators ?? {}
      const cameras = this.webcam?.cameras ?? []
      const gpu = accelerators.gpu ?? {}
      const notDetected = ` (${this.$t('webcam.notDetected')})`

      let gpuSuffix = ''
      if (gpu.runtime) gpuSuffix = ` (${this.gpuRuntimeLabel})`
      else if (gpu.vendor) gpuSuffix = ` (${this.$t('webcam.gpuNeedsInstall')})`
      else gpuSuffix = notDetected

      const items: Array<{ title: string; value: string; props?: any }> = [
        { title: String(this.$t('webcam.auto')), value: 'auto' },
        {
          title: `${this.$t('webcam.backends.gpu')}${gpuSuffix}`,
          value: 'gpu',
          props: { disabled: !gpu.runtime },
        },
        {
          title: `${this.$t('webcam.anyCoral')}${this.corals.length ? '' : notDetected}`,
          value: 'coral',
          props: { disabled: !this.corals.length },
        },
      ]

      // Each Edge TPU can only be used by one camera.
      this.corals.forEach((coral: any, index: number) => {
        const value = `coral:${coral.id}`
        const owner = cameras.find((other: any) => other.id !== camera.id && other.face_accelerator === value)
        items.push({
          title: `${this.$t('webcam.coralNumber', { number: index + 1, type: coral.type.toUpperCase() })}`
            + (owner ? ` (${this.$t('webcam.usedBy', { name: owner.name })})` : ''),
          value,
          props: { disabled: Boolean(owner) },
        })
      })
      // Keep a pinned Coral that is currently unplugged selectable.
      if (String(camera.face_accelerator).startsWith('coral:') && !items.some((item) => item.value === camera.face_accelerator)) {
        items.push({ title: `${camera.face_accelerator.slice(6)}${notDetected}`, value: camera.face_accelerator })
      }

      items.push(
        {
          title: `${this.$t('webcam.backends.rknn')}${accelerators.rockchip_npu ? ` (${accelerators.rockchip_npu})` : notDetected}`,
          value: 'rknn',
          props: { disabled: !accelerators.rockchip_npu },
        },
        { title: String(this.$t('webcam.backends.cpu')), value: 'cpu' },
      )
      return items
    },
  },
}
</script>

<style scoped>
.webcam-card__panel-title {
  min-width: 0;
}

.webcam-card__command :deep(input) {
  font-family: monospace;
  font-size: 0.8rem;
}

</style>
