<template>
  <q-page class="flex flex-center">
      <h1>Prova</h1>
    <div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
  </q-page>
</template>
 <script src="https://apis.google.com/js/platform.js" async defer></script>
<script>
export default {
  name: "PageLogin",
};
</script>