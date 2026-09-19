<template>
  <v-dialog
    :model-value="modelValue"
    max-width="620"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card color="grey-darken-4">
      <v-toolbar color="warning" flat density="comfortable">
        <v-toolbar-title class="d-flex align-center">
          {{ $t('giveaway.cancelDialog.title') }}
        </v-toolbar-title>

        <v-btn
          icon="mdi-close"
          @click="$emit('update:modelValue', false)"
        />
      </v-toolbar>

      <v-card-text>
        <div class="mb-3">
          {{ $t('giveaway.cancelDialog.text') }}
        </div>

        <v-card
          color="grey-darken-3"
          variant="flat"
          class="pa-3"
        >
          <div class="d-flex align-center ga-2 min-width-0">
            <v-icon icon="mdi-gift-outline" />

            <div
              class="text-truncate"
              :title="giveawayText"
            >
              {{ giveawayText || $t('giveaway.title') }}
            </div>
          </div>

          <div class="text-caption text-grey-lighten-1 mt-2">
            {{ participantCount }} {{ $t('giveaway.participants') }}
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          {{ $t('common.cancel') }}
        </v-btn>

        <v-btn
          color="warning"
          variant="flat"
          @click="$emit('confirm')"
        >
          {{ $t('giveaway.cancelDialog.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'GiveawayCancelConfirmDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    giveawayText: {
      type: String,
      default: '',
    },
    participantCount: {
      type: Number,
      default: 0,
    },
  },

  emits: ['update:modelValue', 'confirm'],
}
</script>
