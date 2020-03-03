<template>
  <div class="q-pa-md q-gutter-sm">
    <q-btn id="customBtn" color="primary" label="Google" />
  </div>
</template>

<style lang="stylus" scoped>
.btn-sign-in {
  width: 5.5%;
}
</style>
<script>
export default {
  name: "gsigninbutton",

  data() {
    return {};
  },
  mounted() {
    window.gapi.load("auth2", () => {
      const auth2 = window.gapi.auth2.init({
        client_id:
          "904329681840-9r3m3ldik4sik9poh1j6up3gdkrls4q6.apps.googleusercontent.com",
        cookiepolicy: "single_host_origin"
      });

      auth2.attachClickHandler(
        document.getElementById("customBtn"),
        {},
        googleUser => {
          this.$emit("done", googleUser);
          console.log(googleUser);
          localStorage.setItem("tokenAccess", googleUser.uc.access_token);
          this.$router.push("/post");
        },
        error => console.log(error)
      );
    });
  },
  methods: {}
};
</script>