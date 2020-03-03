<template>
  <!-- <div ref="signinBtn" class="btn-sign-in">Sign In</div> -->
  <div class="q-pa-md q-gutter-sm">
    <div ref="signinBtn" class="btn-sign-in">
      <q-btn color="primary" label="Google" />
    </div>
  </div>
</template>

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
        this.$refs.signinBtn,
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

    function onSignIn(googleUser) {
      var user = googleUser.getAuthResponse();
      localStorage.setItem("tokenAccess", user.access_token);
      window.location.replace("BLOGGERLIST.html");
    }
  },
  methods: {}
};
</script>