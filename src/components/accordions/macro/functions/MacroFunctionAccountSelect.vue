<template>
  <v-select
    v-model="account"
    :items="accountOptions"
    item-title="title"
    item-value="value"
    :label="$t('macro.function.fields.account')"
    density="compact"
    variant="outlined"
    hide-details
  />
</template>

<script lang="ts">
export default {
  name: 'MacroFunctionAccountSelect',

  props: {
    modelValue: {
      type: String,
      default: 'message',
    },
  },

  emits: ['update:modelValue'],

  computed: {
    account: {
      get(): string {
        const value = String(this.modelValue ?? '').trim().toLowerCase()
        return value === 'streamer' || value === 'control' ? 'streamer' : 'message'
      },
      set(value: string) {
        this.$emit('update:modelValue', value === 'streamer' ? 'streamer' : 'message')
      },
    },

    accountOptions(): Array<{ title: string, value: string }> {
      return [
        {
          title: String(this.$t('macro.function.accounts.message')),
          value: 'message',
        },
        {
          title: String(this.$t('macro.function.accounts.streamer')),
          value: 'streamer',
        },
      ]
    },
  },
}
</script>
