<template>
  <div class="twitch-access-requirements">
    <v-row density="comfortable">
      <v-col cols="12" sm="6">
        <v-switch
          :model-value="bool('require_follower', 'requiresFollower')"
          :label="$t('twitchAccess.requireFollower')"
          color="primary"
          density="comfortable"
          hide-details
          inset
          :disabled="disabled"
          @update:model-value="setField('require_follower', $event === true)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <div class="d-flex ga-2 align-start">
          <v-text-field
            :model-value="followTimeValue"
            :label="$t('twitchAccess.minimumFollowTime')"
            type="number"
            min="0"
            variant="outlined"
            density="comfortable"
            hide-details
            :disabled="disabled || !bool('require_follower', 'requiresFollower')"
            @update:model-value="setFollowTime"
          />
          <v-select
            :model-value="followTimeUnit"
            :items="followUnits"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
            class="unit-select"
            :disabled="disabled || !bool('require_follower', 'requiresFollower')"
            @update:model-value="setFollowUnit"
          />
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-switch
          :model-value="bool('require_subscriber', 'requiresSubscriber')"
          :label="$t('twitchAccess.requireSubscriber')"
          color="primary"
          density="comfortable"
          hide-details
          inset
          :disabled="disabled"
          @update:model-value="setField('require_subscriber', $event === true)"
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          :model-value="numberValue('minimum_sub_tier', 'minimumSubTier')"
          :items="subTierOptions"
          :label="$t('twitchAccess.minimumSubTier')"
          variant="outlined"
          density="comfortable"
          hide-details
          :disabled="disabled || !bool('require_subscriber', 'requiresSubscriber')"
          @update:model-value="setField('minimum_sub_tier', Number($event) || 0)"
        />
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
          :model-value="numberValue('minimum_sub_months', 'minimumSubMonths')"
          :label="$t('twitchAccess.minimumSubMonths')"
          type="number"
          min="0"
          step="1"
          variant="outlined"
          density="comfortable"
          hide-details
          :disabled="disabled || !bool('require_subscriber', 'requiresSubscriber')"
          @update:model-value="setField('minimum_sub_months', Math.max(0, Number($event) || 0))"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-switch
          :model-value="bool('require_vip', 'requiresVip')"
          :label="$t('twitchAccess.requireVip')"
          color="primary"
          density="comfortable"
          hide-details
          inset
          :disabled="disabled"
          @update:model-value="setField('require_vip', $event === true)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-switch
          :model-value="bool('require_moderator', 'requiresModerator')"
          :label="$t('twitchAccess.requireModerator')"
          color="primary"
          density="comfortable"
          hide-details
          inset
          :disabled="disabled"
          @update:model-value="setField('require_moderator', $event === true)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'

export default {
  props: {
    modelValue: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      followTimeUnit: 'days',
      followTimeValue: 0,
      lastEmittedFollowSeconds: null as number | null,
    }
  },

  computed: {
    followUnits(): any[] {
      return [
        { title: this.$t('twitchAccess.units.minutes'), value: 'minutes' },
        { title: this.$t('twitchAccess.units.hours'), value: 'hours' },
        { title: this.$t('twitchAccess.units.days'), value: 'days' },
        { title: this.$t('twitchAccess.units.weeks'), value: 'weeks' },
      ]
    },

    subTierOptions(): any[] {
      return [
        { title: this.$t('twitchAccess.subTierAny'), value: 0 },
        { title: this.$t('twitchAccess.subTier1'), value: 1000 },
        { title: this.$t('twitchAccess.subTier2'), value: 2000 },
        { title: this.$t('twitchAccess.subTier3'), value: 3000 },
      ]
    },
  },

  watch: {
    'modelValue.minimum_follow_seconds': {
      immediate: true,
      handler(value: any) {
        const seconds = Math.max(0, Number(value ?? this.modelValue?.minimumFollowSeconds ?? 0) || 0)
        if (this.lastEmittedFollowSeconds !== null && seconds === this.lastEmittedFollowSeconds) {
          this.lastEmittedFollowSeconds = null
          return
        }
        this.loadFollowTime()
      },
    },
    'modelValue.minimumFollowSeconds': {
      immediate: true,
      handler() {
        if (this.modelValue?.minimum_follow_seconds === undefined) this.loadFollowTime()
      },
    },
  },

  methods: {
    raw(primary: string, alias?: string) {
      const value = this.modelValue?.[primary]
      if (value !== undefined && value !== null) return value
      return alias ? this.modelValue?.[alias] : undefined
    },

    bool(primary: string, alias?: string): boolean {
      return this.raw(primary, alias) === true
    },

    numberValue(primary: string, alias?: string): number {
      return Math.max(0, Number(this.raw(primary, alias) ?? 0) || 0)
    },

    setField(field: string, value: any) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [field]: value,
      })
    },

    unitSeconds(unit: string): number {
      switch (unit) {
        case 'minutes': return 60
        case 'hours': return 3600
        case 'weeks': return 604800
        default: return 86400
      }
    },

    loadFollowTime() {
      const seconds = this.numberValue('minimum_follow_seconds', 'minimumFollowSeconds')
      if (!seconds) {
        this.followTimeValue = 0
        return
      }

      const units = [
        ['weeks', 604800],
        ['days', 86400],
        ['hours', 3600],
        ['minutes', 60],
      ] as const

      const selected = units.find(([, factor]) => seconds >= factor && seconds % factor === 0) ?? ['minutes', 60] as const
      this.followTimeUnit = selected[0]
      this.followTimeValue = seconds / selected[1]
    },

    setFollowTime(value: any) {
      this.followTimeValue = Math.max(0, Number(value) || 0)
      this.syncFollowSeconds()
    },

    setFollowUnit(value: string) {
      this.followTimeUnit = value
      this.syncFollowSeconds()
    },

    syncFollowSeconds() {
      const seconds = Math.round(this.followTimeValue * this.unitSeconds(this.followTimeUnit))
      this.lastEmittedFollowSeconds = seconds
      this.setField('minimum_follow_seconds', seconds)
    },
  },
}
</script>

<style scoped>
.unit-select {
  flex: 0 0 130px;
}
</style>
