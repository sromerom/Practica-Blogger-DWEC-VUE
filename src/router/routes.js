const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Login.vue') }
    ],
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/private',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/BloggerList.vue') },
      { path: '/bloggerForm', component: () => import('pages/BloggerForm.vue') },
      { path: '/calculadora', component: () => import('pages/CalculadoraCalories.vue') }

    ],
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/public',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Public.vue') },
    ],
    meta: {
      requiresAuth: false
    }
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
