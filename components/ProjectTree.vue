<template>
  <v-treeview
    :items="items"
    activatable
    item-key="path"
    open-on-click
    transition
    :active.sync="activeFile"
    :open.sync="openFile"
    v-if="items.length > 0"
  >
    <template #prepend="{ item, open }">
      <v-icon v-if="item.children && item.children.length > 0">
        {{ open ? "mdi-folder-open" : "mdi-folder" }}
      </v-icon>
      <v-icon v-else> mdi-file-document </v-icon>
    </template>

    <template #append="{ item }">
      <v-btn
        v-if="isIgnoredCallback(item.path, item.repo)"
        icon
        @click="stopIgnoreFileCallback(item.path, item.repo)"
      >
        <v-icon>mdi-minus-circle-off</v-icon>
      </v-btn>
      <v-btn v-else icon @click="ignoreFileCallback(item.path, item.repo)">
        <v-icon>mdi-minus-circle</v-icon>
      </v-btn>
    </template>
  </v-treeview>
</template>
<script>
import { Repository } from '~/models/repository'

/* eslint-disable */
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    activeFile: {
      type: Array,
      default: () => [],
    },
    openFile: {
      type: Array,
      default: () => [],
    },
    repo: {
        type: Repository
    },
    isIgnoredCallback: {
        type: Function
    },
    stopIgnoreFileCallback: {
        type: Function
    },
    ignoreFileCallback: {
        type: Function
    },
  },
};
</script>
