import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (store) {
  const Router = new VueRouter({
    mode: 'history',
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  Router.beforeEach((to, from, next) => {
    // See if any of the matched routes has meta "requiresAuth"
    if (to.matched.some(route => route.meta.requiresAuth)) {
      console.log(store)


      if (localStorage.getItem('tokenAccess')) {
        next();
      } else {
        next("/");
      }
    } else {
      next();
    }
  });
  return Router
}
