<template>
  <div>
    <v-btn color="primary" elevation="2" @click.stop="openDialog">
      <v-icon left>
        mdi-pencil
      </v-icon>
      Edit ignores
    </v-btn>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title> Edit ignores </v-card-title>
        <v-card-text>
          <v-textarea
            counter
            label="Ignored files"
            v-model="files"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" elevation="2" @click="saveIgnores">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  data: () => ({
    dialog: false,
    files: "",
  }),
  props: {
    ignoredFiles: {
      type: Array,
      default: () => [],
    },
    repo: {
      type: String,
      default: () => '',
    },
  },
  methods: {
    saveIgnores: function () {
      this.$emit('ignores', { files: this.files.split("\n"), repo: this.repo });
      this.dialog = false;
    },
    openDialog: function() {
      this.files = this.ignoredFiles.join("\n")
      this.dialog = true;
    }
  },
};
</script>
