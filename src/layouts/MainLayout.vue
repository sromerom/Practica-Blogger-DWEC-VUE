<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
          </q-avatar>sromeromi18n
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/private" label="Inici" />
        <q-route-tab to="/bloggerForm" label="Crea un Post" />
        <q-route-tab to="/calculadora" label="Calculadora Calories" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
          </q-avatar>Samuel Romero Marín &copy;
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
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