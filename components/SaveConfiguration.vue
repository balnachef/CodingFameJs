<template>
  <div>
    <v-btn color="primary" elevation="2" @click.stop="dialog = true">
      Save configuration
    </v-btn>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title> Save Configuration </v-card-title>
        <v-card-text>
          <v-text-field v-model="fileName" label="File name" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" elevation="2" @click="saveConfiguration">
            Save localy
          </v-btn>
          <v-btn
            color="primary"
            elevation="2"
            @click="saveConfigurationToLocalStorage"
          >
            Save to storage
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
    fileName: "",
  }),
  props: {
    date: {
      type: Array,
      default: () => [],
    },
    repos: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    saveConfiguration: function () {
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

    saveConfigurationToLocalStorage: function () {
      const data = {
        repos: this.repos,
        date: this.date,
      };
      if (!this.fileName || this.fileName.length === 0) {
        this.fileName = new Date().toISOString().substr(0, 10);
      }
      var mySettings = localStorage.getItem("settings");
      if (mySettings === null) {
        var newSettings = {};
        newSettings[this.fileName] = data;
        localStorage.setItem("settings", JSON.stringify(newSettings));
      } else {
        var setting = JSON.parse(localStorage.getItem("settings"));
        setting[this.fileName] = data;
        localStorage.setItem("settings", JSON.stringify(setting));
      }
      this.dialog = false;
    },
  },
};
</script>
