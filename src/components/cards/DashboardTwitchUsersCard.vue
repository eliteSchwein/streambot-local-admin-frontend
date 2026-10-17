<template>
  <v-card>
    <v-toolbar flat density="compact">
      <v-toolbar-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-account-group-outline" />
        {{ $t('dashboard.twitchUsers.title') }}
      </v-toolbar-title>

    </v-toolbar>

    <v-card-text class="pt-3">
      <v-text-field
        v-model="search"
        :label="$t('dashboard.twitchUsers.search')"
        prepend-inner-icon="mdi-magnify"
        clearable
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3"
        @keydown.enter="lookupSearchUser"
      />

      <template v-if="visibleGroups.length">
        <div class="twitch-user-list">
          <div
            v-for="group in visibleGroups"
            :key="group.role"
            class="twitch-user-group"
          >
            <div class="twitch-user-group__header">
              <span>{{ roleGroupLabel(group.role) }}</span>
            </div>

            <v-list density="compact" bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="user in group.users"
                :key="`${group.role}:${user.id || user.login}`"
                class="twitch-user-row"
                @click="openUser({ role: group.role, user })"
              >
                <template #prepend>
                  <v-icon
                    :icon="roleIcon(group.role)"
                    size="18"
                  />
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ user.display_name || user.login || user.id }}
                </v-list-item-title>

                <v-list-item-subtitle
                  v-if="user.login && normalizeUserName(user.display_name) !== normalizeUserName(user.login)"
                  class="text-caption"
                >
                  @{{ user.login }}
                </v-list-item-subtitle>

                <template #append>
                  <v-icon icon="mdi-chevron-right" size="18" class="text-medium-emphasis" />
                </template>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </template>

      <template v-else-if="searchQuery">
        <v-alert
          type="info"
          color="grey-darken-3"
          density="compact"
          :text="$t('dashboard.twitchUsers.noResults')"
          class="mb-3"
        />

        <v-btn
          block
          color="primary"
          variant="tonal"
          prepend-icon="mdi-account-search-outline"
          :loading="lookupLoading"
          @click="lookupSearchUser"
        >
          {{ $t('dashboard.twitchUsers.lookupUser', { user: searchQuery }) }}
        </v-btn>
      </template>

      <v-alert
        v-else
        type="info"
        color="grey-darken-3"
        density="compact"
        :text="$t('dashboard.twitchUsers.empty')"
      />

      <div v-if="updatedAt" class="text-caption text-medium-emphasis mt-2 text-right">
        {{ $t('dashboard.twitchUsers.updated') }} {{ formatDate(updatedAt) }}
      </div>
    </v-card-text>

    <v-dialog v-model="detailsOpen" max-width="680" scrollable>
      <v-card>
        <v-toolbar flat density="compact">
          <v-toolbar-title class="min-width-0">
            <div class="text-body-1 font-weight-medium text-truncate">
              {{ $t('dashboard.twitchUsers.user') }}
            </div>
          </v-toolbar-title>

          <v-btn icon="mdi-close" variant="text" @click="detailsOpen = false" />
        </v-toolbar>

        <v-divider />

        <v-card-text>
          <v-progress-linear v-if="detailsLoading" indeterminate class="mb-4" />

          <v-alert
            v-if="detailsError"
            type="error"
            color="grey-darken-3"
            density="compact"
            class="mb-4"
            :text="detailsError"
          />

          <template v-if="selectedDetails || selectedUser">
            <div class="twitch-users-card__profile mb-5">
              <v-avatar size="88" class="twitch-users-card__avatar">
                <v-img
                  v-if="selectedDetails?.profile_image_url"
                  :src="selectedDetails.profile_image_url"
                  cover
                />
                <v-icon
                  v-else
                  :icon="roleIcon(selectedRole)"
                  size="38"
                />
              </v-avatar>

              <div class="min-width-0 flex-grow-1">
                <div class="text-h6 font-weight-medium text-truncate">
                  {{ selectedDetails?.display_name || selectedUser?.display_name || selectedDetails?.login || selectedUser?.login || selectedLookup || $t('dashboard.twitchUsers.user') }}
                </div>

                <div class="d-flex align-center ga-2 flex-wrap mt-1">
                  <span
                    v-if="selectedDetails?.login || selectedUser?.login"
                    class="text-body-2 text-medium-emphasis"
                  >
                    @{{ selectedDetails?.login || selectedUser?.login }}
                  </span>

                  <v-chip
                    v-if="selectedRole"
                    size="x-small"
                    variant="tonal"
                    :prepend-icon="roleIcon(selectedRole)"
                  >
                    {{ roleLabel(selectedRole) }}
                  </v-chip>
                </div>

                <div
                  v-if="selectedDetails?.description"
                  class="text-body-2 mt-3 twitch-users-card__description"
                >
                  {{ selectedDetails.description }}
                </div>
              </div>
            </div>

            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="twitch-users-card__detail-label">{{ $t('dashboard.twitchUsers.userId') }}</div>
                <div class="text-body-2 ubuntu-mono">{{ selectedDetails?.id || selectedUser?.id || '—' }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="twitch-users-card__detail-label">{{ $t('dashboard.twitchUsers.broadcasterType') }}</div>
                <div class="text-body-2">{{ broadcasterTypeLabel(selectedDetails?.broadcaster_type) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="twitch-users-card__detail-label">{{ $t('dashboard.twitchUsers.createdAt') }}</div>
                <div class="text-body-2">{{ formatDate(selectedDetails?.created_at) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="twitch-users-card__detail-label">{{ $t('dashboard.twitchUsers.followedAt') }}</div>
                <div class="text-body-2">{{ formatDate(selectedDetails?.follow?.followed_at) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="twitch-users-card__detail-label">{{ $t('dashboard.twitchUsers.subscription') }}</div>
                <div class="d-flex align-center ga-2 flex-wrap">
                  <span class="text-body-2">{{ subscriptionLabel(selectedDetails?.subscription) }}</span>
                  <v-chip
                    v-if="selectedDetails?.subscription?.is_gift"
                    size="x-small"
                    variant="tonal"
                    prepend-icon="mdi-gift-outline"
                  >
                    {{ $t('dashboard.twitchUsers.gifted') }}
                  </v-chip>
                </div>
              </v-col>
              <v-col v-if="subscriptionMonths !== null" cols="12" sm="6">
                <div class="twitch-users-card__detail-label">{{ $t('dashboard.twitchUsers.subscribedFor') }}</div>
                <div class="text-body-2">{{ $t('dashboard.twitchUsers.months', { count: subscriptionMonths }) }}</div>
              </v-col>
            </v-row>

            <v-divider class="my-5" />

            <div class="text-subtitle-2 font-weight-medium mb-3 d-flex align-center ga-2">
              <v-icon icon="mdi-shield-account-outline" size="20" />
              {{ $t('dashboard.twitchUsers.moderation.title') }}
            </div>

            <v-alert
              v-if="selectedRole === 'streamer'"
              type="info"
              color="grey-darken-3"
              density="compact"
              class="mb-4"
              :text="$t('dashboard.twitchUsers.moderation.broadcasterDisabled')"
            />

            <template v-else>
              <v-alert
                v-if="moderationError"
                type="error"
                color="grey-darken-3"
                density="compact"
                class="mb-4"
                :text="moderationError"
              />

              <v-alert
                v-if="moderationSuccess"
                type="success"
                color="grey-darken-3"
                density="compact"
                class="mb-4"
                :text="moderationSuccess"
              />

              <v-text-field
                v-model="moderationReason"
                :label="$t('dashboard.twitchUsers.moderation.reason')"
                prepend-inner-icon="mdi-text-box-outline"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                class="mb-3"
              />

              <div class="text-caption text-medium-emphasis mb-2">
                {{ $t('dashboard.twitchUsers.moderation.timeoutDuration') }}
              </div>

              <v-row dense class="mb-1">
                <v-col cols="7" sm="8">
                  <v-number-input
                    v-model="timeoutValue"
                    :min="1"
                    :step="1"
                    control-variant="stacked"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>

                <v-col cols="5" sm="4">
                  <v-select
                    v-model="timeoutUnit"
                    :items="timeoutUnits"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
              </v-row>

              <div class="text-caption text-medium-emphasis mb-4">
                {{ $t('dashboard.twitchUsers.moderation.timeoutHint') }}
              </div>

              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  color="warning"
                  variant="tonal"
                  prepend-icon="mdi-timer-outline"
                  :loading="moderationAction === 'timeout'"
                  :disabled="moderationBusy || !moderationTarget"
                  @click="runModerationAction('timeout')"
                >
                  {{ $t('dashboard.twitchUsers.moderation.timeout') }}
                </v-btn>

                <v-btn
                  color="error"
                  variant="tonal"
                  prepend-icon="mdi-account-cancel-outline"
                  :loading="moderationAction === 'ban'"
                  :disabled="moderationBusy || !moderationTarget"
                  @click="runModerationAction('ban')"
                >
                  {{ $t('dashboard.twitchUsers.moderation.ban') }}
                </v-btn>

                <v-btn
                  variant="tonal"
                  prepend-icon="mdi-account-check-outline"
                  :loading="moderationAction === 'unban'"
                  :disabled="moderationBusy || !moderationTarget"
                  @click="runModerationAction('unban')"
                >
                  {{ $t('dashboard.twitchUsers.moderation.unban') }}
                </v-btn>
              </div>
            </template>
          </template>
        </v-card-text>

        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailsOpen = false">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { mapState } from 'pinia'
import { useAppStore } from '@/stores/app'
import { getWebsocketClient } from '@/plugins/websocketInstance'

type TwitchUserRole = 'streamer' | 'moderator' | 'vip' | 'normal'

type TwitchUser = {
  id?: string
  login?: string
  display_name?: string
  [key: string]: any
}

type TwitchUserEntry = {
  role: TwitchUserRole
  user: TwitchUser
}

type TwitchUserGroup = {
  role: TwitchUserRole
  users: TwitchUser[]
}

export default {
  name: 'DashboardTwitchUsersCard',

  data() {
    return {
      search: '',
      detailsOpen: false,
      detailsLoading: false,
      detailsError: '',
      lookupLoading: false,
      selectedUser: null as TwitchUser | null,
      selectedRole: null as TwitchUserRole | null,
      selectedDetails: null as any,
      selectedLookup: '',
      moderationReason: '',
      moderationAction: '' as '' | 'timeout' | 'ban' | 'unban',
      moderationError: '',
      moderationSuccess: '',
      timeoutValue: 10,
      timeoutUnit: 'minutes' as 'seconds' | 'minutes' | 'hours' | 'days',
    }
  },

  computed: {
    ...mapState(useAppStore, ['getTwitchUserList']),

    userList(): any {
      return this.getTwitchUserList ?? {}
    },

    groups(): TwitchUserGroup[] {
      return [
        { role: 'streamer', users: this.normalizeUsers(this.userList?.streamer) },
        { role: 'moderator', users: this.normalizeUsers(this.userList?.moderator) },
        { role: 'vip', users: this.normalizeUsers(this.userList?.vips) },
        { role: 'normal', users: this.normalizeUsers(this.userList?.normal) },
      ]
    },

    users(): TwitchUserEntry[] {
      return this.groups.flatMap(group => group.users.map(user => ({ role: group.role, user })))
    },


    updatedAt(): any {
      return this.userList?.updated_at
    },

    searchQuery(): string {
      return String(this.search ?? '').trim()
    },

    moderationTarget(): string {
      return String(
        this.selectedDetails?.login
        ?? this.selectedUser?.login
        ?? this.selectedLookup
        ?? '',
      ).trim().replace(/^@+/, '')
    },

    moderationBusy(): boolean {
      return Boolean(this.moderationAction)
    },

    timeoutUnits(): Array<{ title: string; value: 'seconds' | 'minutes' | 'hours' | 'days' }> {
      return [
        { title: String(this.$t('dashboard.twitchUsers.moderation.units.seconds')), value: 'seconds' },
        { title: String(this.$t('dashboard.twitchUsers.moderation.units.minutes')), value: 'minutes' },
        { title: String(this.$t('dashboard.twitchUsers.moderation.units.hours')), value: 'hours' },
        { title: String(this.$t('dashboard.twitchUsers.moderation.units.days')), value: 'days' },
      ]
    },

    visibleGroups(): TwitchUserGroup[] {
      const query = this.searchQuery.toLowerCase()

      return this.groups
        .map(group => ({
          ...group,
          users: group.users
            .filter(user => {
              if (!query) return true
              return [user?.display_name, user?.login, user?.id]
                .some(value => String(value ?? '').toLowerCase().includes(query))
            })
            .sort((a, b) => {
              const left = String(a.display_name ?? a.login ?? '').toLowerCase()
              const right = String(b.display_name ?? b.login ?? '').toLowerCase()
              return left.localeCompare(right)
            }),
        }))
        .filter(group => group.users.length > 0)
    },

    subscriptionMonths(): number | null {
      const subscription = this.selectedDetails?.subscription
      const raw = subscription?.months
        ?? subscription?.cumulative_months
        ?? subscription?.months_subscribed
        ?? this.selectedDetails?.subscription_months
      const months = Number(raw)
      return Number.isFinite(months) && months >= 0 ? Math.floor(months) : null
    },
  },

  methods: {
    normalizeUsers(value: any): TwitchUser[] {
      if (Array.isArray(value)) return value.filter(user => user && typeof user === 'object')
      if (!value || typeof value !== 'object') return []
      if (value.id || value.login || value.display_name) return [value]
      return Object.values(value).filter((user: any) => user && typeof user === 'object') as TwitchUser[]
    },

    normalizeUserName(value: any) {
      return String(value ?? '').trim().toLowerCase()
    },

    roleIcon(role: TwitchUserRole | null) {
      if (!role) return 'mdi-account-outline'
      return {
        streamer: 'mdi-broadcast',
        moderator: 'mdi-shield-account-outline',
        vip: 'mdi-diamond-stone',
        normal: 'mdi-account-outline',
      }[role] ?? 'mdi-account-outline'
    },

    roleLabel(role: TwitchUserRole) {
      return String(this.$t(`dashboard.twitchUsers.roles.${role}`))
    },

    roleGroupLabel(role: TwitchUserRole) {
      return String(this.$t(`dashboard.twitchUsers.groups.${role}`))
    },

    async openUser(entry: TwitchUserEntry) {
      await this.openUserLookup(entry.user?.id || entry.user?.login || '', entry.user, entry.role)
    },

    async lookupSearchUser() {
      const identifier = this.searchQuery
      if (!identifier || this.lookupLoading) return

      this.lookupLoading = true
      try {
        await this.openUserLookup(identifier, null, null)
      } finally {
        this.lookupLoading = false
      }
    },

    async openUserLookup(identifier: string, user: TwitchUser | null, role: TwitchUserRole | null) {
      const lookup = String(identifier ?? '').trim().replace(/^@+/, '')
      if (!lookup) return

      this.selectedUser = user
      this.selectedRole = role
      this.selectedDetails = null
      this.selectedLookup = lookup
      this.detailsError = ''
      this.moderationReason = ''
      this.moderationAction = ''
      this.moderationError = ''
      this.moderationSuccess = ''
      this.timeoutValue = 10
      this.timeoutUnit = 'minutes'
      this.detailsOpen = true
      this.detailsLoading = true

      try {
        const client: any = getWebsocketClient()
        if (!client?.request) throw new Error(String(this.$t('dashboard.twitchUsers.lookupUnavailable')))

        const response = await client.request('twitch_user_info', { user: lookup }, 15_000)
        const payload = response?.params ?? response?.result ?? response
        if (payload?.error) throw new Error(String(payload?.message ?? payload.error))

        const details = payload?.user ?? payload?.data ?? payload
        if (!details || typeof details !== 'object' || (!details.id && !details.login && !details.display_name)) {
          throw new Error(String(this.$t('dashboard.twitchUsers.userNotFound', { user: lookup })))
        }

        this.selectedDetails = details

        if (!this.selectedRole) {
          this.selectedRole = this.findUserRole(details)
        }
      } catch (error: any) {
        this.detailsError = String(error?.message ?? this.$t('dashboard.twitchUsers.lookupFailed'))
      } finally {
        this.detailsLoading = false
      }
    },

    timeoutDurationSeconds(): number {
      const value = Number(this.timeoutValue)
      if (!Number.isFinite(value) || value <= 0) return 0

      const multipliers: Record<string, number> = {
        seconds: 1,
        minutes: 60,
        hours: 60 * 60,
        days: 24 * 60 * 60,
      }

      return Math.floor(value * (multipliers[this.timeoutUnit] ?? 1))
    },

    async runModerationAction(action: 'timeout' | 'ban' | 'unban') {
      if (this.moderationBusy || !this.moderationTarget || this.selectedRole === 'streamer') return

      this.moderationError = ''
      this.moderationSuccess = ''

      const client: any = getWebsocketClient()
      if (!client?.request) {
        this.moderationError = String(this.$t('dashboard.twitchUsers.moderation.unavailable'))
        return
      }

      const params: Record<string, any> = {
        user: this.moderationTarget,
      }

      let method = ''

      if (action === 'timeout') {
        const duration = this.timeoutDurationSeconds()
        if (duration < 1 || duration > 14 * 24 * 60 * 60) {
          this.moderationError = String(this.$t('dashboard.twitchUsers.moderation.invalidDuration'))
          return
        }

        method = 'twitch_timeout'
        params.duration = duration
        if (this.moderationReason.trim()) params.reason = this.moderationReason.trim()
      } else if (action === 'ban') {
        method = 'twitch_ban'
        if (this.moderationReason.trim()) params.reason = this.moderationReason.trim()
      } else {
        method = 'twitch_unban'
      }

      this.moderationAction = action

      try {
        const response = await client.request(method, params, 15_000)
        const payload = response?.params ?? response?.result ?? response

        if (payload?.error) {
          throw new Error(String(payload?.message ?? payload.error))
        }

        this.moderationSuccess = String(this.$t(`dashboard.twitchUsers.moderation.success.${action}`, {
          user: this.moderationTarget,
        }))
      } catch (error: any) {
        this.moderationError = String(
          error?.message
          ?? this.$t('dashboard.twitchUsers.moderation.failed'),
        )
      } finally {
        this.moderationAction = ''
      }
    },

    findUserRole(user: TwitchUser): TwitchUserRole | null {
      const id = String(user?.id ?? '')
      const login = this.normalizeUserName(user?.login)

      const match = this.users.find(entry => {
        if (id && String(entry.user?.id ?? '') === id) return true
        return Boolean(login && this.normalizeUserName(entry.user?.login) === login)
      })

      return match?.role ?? null
    },

    broadcasterTypeLabel(value: any) {
      const type = String(value ?? '').trim()
      return type || String(this.$t('dashboard.twitchUsers.none'))
    },

    subscriptionLabel(subscription: any) {
      if (!subscription || typeof subscription !== 'object') return String(this.$t('dashboard.twitchUsers.notSubscribed'))
      const tier = String(subscription.tier ?? '').trim()
      if (!tier) return String(this.$t('dashboard.twitchUsers.subscribed'))
      const labels: Record<string, string> = {
        '1000': 'Tier 1',
        '2000': 'Tier 2',
        '3000': 'Tier 3',
      }
      return labels[tier] ?? tier
    },

    formatDate(value: any) {
      if (!value) return '—'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    },
  },
}
</script>

<style scoped>
.twitch-user-list {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
}

.twitch-user-group + .twitch-user-group {
  margin-top: 10px;
}

.twitch-user-group__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  font-size: .72rem;
  font-weight: 700;
  line-height: 1.25rem;
  letter-spacing: .055em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), .62);
}

.twitch-user-row {
  min-height: 44px;
  padding-inline: 8px;
}

.twitch-user-row :deep(.v-list-item__prepend > .v-list-item__spacer) {
  width: 8px;
}

.twitch-user-row:hover {
  background: rgba(var(--v-theme-on-surface), .055);
}

.twitch-users-card__profile {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.twitch-users-card__avatar {
  flex: 0 0 auto;
  background: rgba(var(--v-theme-on-surface), .06);
}

.twitch-users-card__detail-label {
  margin-bottom: 2px;
  font-size: .72rem;
  color: rgba(var(--v-theme-on-surface), .62);
}

.twitch-users-card__description {
  white-space: pre-wrap;
}

.min-width-0 {
  min-width: 0;
}
</style>
