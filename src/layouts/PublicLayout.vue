<template>
  <q-layout view="hHh lpR fFf">
    <div class="flex display-flex">
      <h1>Part publica</h1>
    </div>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script>
export default {
  data() {
    return {
      left: false
    };
  }
};
</script>