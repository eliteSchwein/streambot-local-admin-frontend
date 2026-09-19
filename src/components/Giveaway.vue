<script lang="ts">
import {mapState} from "pinia";
import {useAppStore} from "@/stores/app";
import {getWebsocketClient} from "@/plugins/websocketInstance";
import GiveawayCancelConfirmDialog from "@/components/dialogs/GiveawayCancelConfirmDialog.vue";

export default {
  components: {
    GiveawayCancelConfirmDialog,
  },

  data() {
    return {
      giveawayTemplate: {
        giveawayText: '',
        interval: null,
      },
      participantSearch: '',
      cancelDialog: false,
      now: Date.now(),
      clockTimer: null as ReturnType<typeof setInterval> | null,
      times: [
        {
          title: '1 min',
          value: 1,
        },
        {
          title: '5 min',
          value: 5,
        },
        {
          title: '10 min',
          value: 10,
        },
        {
          title: '15 min',
          value: 15,
        },
        {
          title: '30 min',
          value: 30,
        },
        {
          title: '1h',
          value: 60,
        }
      ],
    }
  },
  computed: {
    ...mapState(useAppStore, ['getGiveaway']),

    remainingSeconds(): number {
      if (!this.getGiveaway?.active) return 0

      const endsAt = Number(this.getGiveaway?.endsAt ?? 0)
      if (endsAt > 0) {
        return Math.max(0, Math.ceil((endsAt - this.now) / 1000))
      }

      return Math.max(0, Number(this.getGiveaway?.currentInterval ?? 0))
    },

    remainingTime(): string {
      const seconds = this.remainingSeconds
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      }

      return `${minutes}:${String(secs).padStart(2, '0')}`
    },

    filteredGiveawayUsers(): any[] {
      const users = Array.isArray(this.getGiveaway?.users) ? this.getGiveaway.users : []
      const query = String(this.participantSearch ?? '').trim().toLowerCase()

      if (!query) return users

      return users.filter((user: any) => {
        const values = [
          user?.displayName,
          user?.name,
          user?.id,
        ]

        return values.some(value => String(value ?? '').toLowerCase().includes(query))
      })
    },
  },

  mounted() {
    this.clockTimer = setInterval(() => {
      this.now = Date.now()
    }, 1000)
  },

  beforeUnmount() {
    if (this.clockTimer) clearInterval(this.clockTimer)
  },
  watch: {
    'getGiveaway.active'(active: boolean) {
      if (!active) this.participantSearch = ''
    },
  },

  methods: {
    sendWebsocket(method: string, params: Record<string, any> = {}) {
      getWebsocketClient()?.send(method, params)
    },
    sendGiveaway() {
      const giveawayText = this.giveawayTemplate.giveawayText

      this.sendWebsocket('start_giveaway', {
        giveawayText,
        // Compatibility with backends that still validate the old field name.
        content: giveawayText,
        duration: this.giveawayTemplate.interval,
      })
    },
    requestStopGiveaway() {
      this.cancelDialog = true
    },

    confirmStopGiveaway() {
      this.cancelDialog = false
      this.sendWebsocket('stop_giveaway')
    },

    stopGiveaway() {
      this.sendWebsocket('stop_giveaway')
    },
    deleteUser(userId: string) {
      this.sendWebsocket('remove_giveaway_user', {
        user: userId,
      })
    }
  }
}
</script>

<template>
  <v-card
    color="grey-darken-3"
    rounded="3"
    :subtitle="$t('giveaway.title')"
  >
    <v-card-item v-if="getGiveaway.winner">
      <v-toolbar
        flat
        density="compact"
        rounded
        class="mb-2"
        color="green-darken-2"
      >
        <v-toolbar-title class="d-flex align-center" style="font-size: 1rem">
          {{ $t('giveaway.winner') }}: {{getGiveaway.winner.name}}
        </v-toolbar-title>
        <template v-slot:append>
          <div class="d-flex ga-1">
            <v-btn icon="mdi-broom" @click="stopGiveaway"></v-btn>
          </div>
        </template>
      </v-toolbar>
    </v-card-item>
    <v-card-item v-else-if="getGiveaway.active">
      <v-toolbar
        flat
        density="compact"
        rounded
        class="mb-2"
        color="teal-darken-3"
      >
        <v-toolbar-title class="d-flex align-center" style="font-size: 1rem">
          {{ $t('giveaway.active') }}: {{ getGiveaway.giveawayText ?? getGiveaway.content }}
        </v-toolbar-title>
        <v-progress-linear
          :model-value="100 / getGiveaway.interval * getGiveaway.currentInterval"
          location="bottom"
          absolute
          rounded
          color="teal-lighten-1"
        />
        <template v-slot:append>
          <div class="d-flex align-center ga-2">
            <v-chip
              prepend-icon="mdi-timer-outline"
              size="small"
              variant="tonal"
            >
              {{ $t('giveaway.remaining') }}: {{ remainingTime }}
            </v-chip>
            <v-btn icon="mdi-stop-circle" @click="requestStopGiveaway"></v-btn>
          </div>
        </template>
      </v-toolbar>
      <v-expansion-panels>
        <v-expansion-panel :title="`${getGiveaway.users.length} ${$t('giveaway.participants')}`" color="grey-darken-2">
          <v-expansion-panel-text class="pa-0">
            <div class="pa-3 pb-1">
              <v-text-field
                v-model="participantSearch"
                :label="$t('giveaway.searchParticipant')"
                prepend-inner-icon="mdi-magnify"
                clearable
                density="compact"
                variant="outlined"
                hide-details
              />
            </div>
            <v-table>
              <thead>
              <tr>
                <th class="text-left">
                  {{ $t('giveaway.name') }}
                </th>
                <th class="text-left" style="width: 50px">
                </th>
              </tr>
              </thead>
              <tbody>
              <template v-for="user in filteredGiveawayUsers" :key="user.id">
                <tr>
                  <td>{{user.displayName}}</td>
                  <td>
                    <v-btn icon="mdi-trash-can" color="red" variant="text" density="compact" @click="deleteUser(user.id)"></v-btn>
                  </td>
                </tr>
              </template>
              <tr v-if="filteredGiveawayUsers.length === 0">
                <td colspan="2" class="text-medium-emphasis text-center py-4">
                  {{ $t('giveaway.noParticipantsFound') }}
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-item>
    <v-card-item v-else>
      <v-row>
        <v-col cols="12" md="6" xl="8">
          <v-text-field
            class="mt-1"
            :label="$t('giveaway.contentLabel')"
            variant="outlined"
            v-model="giveawayTemplate.giveawayText"
            density="compact"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="9" md="3" xl="2">
          <v-select
            class="mt-1"
            :label="$t('giveaway.durationLabel')"
            :items="times"
            v-model="giveawayTemplate.interval"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="3" md="3" xl="2">
          <v-btn @click="sendGiveaway" prepend-icon="mdi-send" variant="tonal" class="mt-1" width="100%">{{ $t('giveaway.create') }}</v-btn>
        </v-col>
      </v-row>
    </v-card-item>

    <GiveawayCancelConfirmDialog
      v-model="cancelDialog"
      :giveaway-text="String(getGiveaway?.giveawayText ?? getGiveaway?.content ?? '')"
      :participant-count="Array.isArray(getGiveaway?.users) ? getGiveaway.users.length : 0"
      @confirm="confirmStopGiveaway"
    />
  </v-card>
</template>

<style scoped lang="scss">

</style>
