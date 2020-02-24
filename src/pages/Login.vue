<template>
  <q-page>
      <h2>Login</h2>
      <gsigninbutton></gsigninbutton>
  </q-page>
</template>

<script>
import gsigninbutton from 'components/GoogleButton';
export default {
  
  name: "PageLogin",
  components: {
    gsigninbutton,
  },
};
</script>