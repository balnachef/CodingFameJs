<template>
  <div id="wrapper">
    <div class="input_row">
      <input
        v-model="shell_command"
        type="text"
        class="input_text"
      >
      <label class="label_" for="shell">Type Shell Command</label>
    </div>
    <button type="button" class="button" @click="shellExec">
      Submit !
    </button>
  </div>
</template>
<script>

export default {
  name: 'ShellExec',
  components: {},
  data () {
    return {
      shell_command: ''
    }
  },
  methods: {
    shellExec () {

    }
  }
}
</script>
<style scoped>
input[type="text"] {
  color: white;
}
</style>
