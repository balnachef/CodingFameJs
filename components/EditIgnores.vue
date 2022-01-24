<template>
  <div>
    <v-btn color="primary" elevation="2" @click.stop="dialog = true">
      Edit ignores
    </v-btn>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title> Edit ignores </v-card-title>
        <v-card-text>
          <v-textarea
            counter
            label="Text"
            :rules="rules"
            :value="files"
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
  },
  methods: {
    saveIgnores: function () {
      const data = {
        repos: this.repos,
        date: this.date,
      };
      var serializedData = JSON.stringify(data);

      const blob = new Blob([serializedData], {
        type: "text/plain;charset=utf-8",
      });
      if (!this.fileName || this.fileName.length === 0) {
        this.fileName = new Date().toISOString().substr(0, 10);
      }
      saveAs(blob, `${this.fileName}.cfj`);
      this.dialog = false;
    },
  },
};
</script>
