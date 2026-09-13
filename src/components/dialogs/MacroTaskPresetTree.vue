<template>
  <div class="macro-task-preset-tree" :class="{ 'macro-task-preset-tree--root': depth === 0 }">
    <div
      v-for="node in nodes"
      :key="node.__key"
      class="macro-task-preset-tree__node"
      :class="{
        'macro-task-preset-tree__node--root': depth === 0,
        'macro-task-preset-tree__node--group': node.children?.length,
      }"
    >
      <v-list-item
        v-if="node.children?.length"
        :prepend-icon="node.icon"
        rounded="lg"
        class="macro-task-preset-tree__row macro-task-preset-tree__group-row"
        :class="{ 'macro-task-preset-tree__row--open': expanded[node.__key] }"
        @click="toggleGroup(node.__key)"
      >
        <v-list-item-title class="font-weight-medium">
          {{ node.title }}
        </v-list-item-title>

        <template #append>
          <v-icon
            :icon="expanded[node.__key] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            size="small"
            class="macro-task-preset-tree__chevron"
          />
        </template>
      </v-list-item>

      <v-list-item
        v-else
        :prepend-icon="node.icon"
        rounded="lg"
        class="macro-task-preset-tree__row macro-task-preset-tree__task-row"
        tabindex="0"
        @click="$emit('select', node.preset)"
        @keydown.enter.prevent="$emit('select', node.preset)"
        @keydown.space.prevent="$emit('select', node.preset)"
      >
        <v-list-item-title>{{ node.title }}</v-list-item-title>

        <template #append>
          <v-icon icon="mdi-plus" size="small" class="macro-task-preset-tree__plus" />
        </template>
      </v-list-item>

      <v-expand-transition v-if="node.children?.length">
        <div
          v-show="expanded[node.__key]"
          class="macro-task-preset-tree__children"
        >
          <MacroTaskPresetTree
            :nodes="node.children"
            :expanded="expanded"
            :depth="depth + 1"
            @select="$emit('select', $event)"
          />
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MacroTaskPresetTree',

  props: {
    nodes: { type: Array, default: () => [] },
    expanded: { type: Object, required: true },
    depth: { type: Number, default: 0 },
  },

  emits: ['select'],

  methods: {
    toggleGroup(key: string) {
      const opening = !this.expanded[key]

      // Keep the root level calm: normal browsing behaves like an accordion.
      // Search expansion is calculated by the parent and is intentionally unaffected.
      if (opening && this.depth === 0) {
        for (const node of this.nodes as any[]) {
          if (node?.children?.length && node.__key !== key) {
            this.expanded[node.__key] = false
          }
        }
      }

      this.expanded[key] = opening
    },
  },
}
</script>

<style scoped>
.macro-task-preset-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.macro-task-preset-tree--root {
  gap: 6px;
}

.macro-task-preset-tree__node {
  min-width: 0;
}

.macro-task-preset-tree__row {
  min-height: 42px;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.macro-task-preset-tree__node--root > .macro-task-preset-tree__row {
  min-height: 46px;
  background: rgba(var(--v-theme-on-surface), 0.055);
}

.macro-task-preset-tree__node--root > .macro-task-preset-tree__row:hover,
.macro-task-preset-tree__node--root > .macro-task-preset-tree__row:focus-visible,
.macro-task-preset-tree__node--root > .macro-task-preset-tree__row--open {
  background: rgba(var(--v-theme-on-surface), 0.105);
}

.macro-task-preset-tree__task-row:hover,
.macro-task-preset-tree__task-row:focus-visible {
  background: rgba(var(--v-theme-primary), 0.10);
}

.macro-task-preset-tree__task-row:focus-visible,
.macro-task-preset-tree__group-row:focus-visible {
  outline: 1px solid rgba(var(--v-theme-primary), 0.6);
  outline-offset: -1px;
}

.macro-task-preset-tree__children {
  position: relative;
  margin: 4px 0 6px 17px;
  padding-left: 14px;
}

.macro-task-preset-tree__children::before {
  content: '';
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 0;
  width: 1px;
  background: rgba(var(--v-theme-on-surface), 0.14);
}

.macro-task-preset-tree__children :deep(.v-list-item__prepend) {
  width: 36px;
}

.macro-task-preset-tree__chevron,
.macro-task-preset-tree__plus {
  opacity: 0.72;
}

.macro-task-preset-tree__task-row:hover .macro-task-preset-tree__plus,
.macro-task-preset-tree__task-row:focus-visible .macro-task-preset-tree__plus {
  opacity: 1;
  color: rgb(var(--v-theme-primary));
}
</style>
