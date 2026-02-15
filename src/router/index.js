import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '/',
          name: 'analysis',
          component: () => import('@/views/pages/analysis/index.vue')
        },
        {
          path: '/calculations',
          name: 'calculations',
          component: () => import('@/views/pages/calculations/index.vue')
        },
        {
          path: '/workers',
          name: 'workers',
          component: () => import('@/views/pages/workers/index.vue')
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/views/pages/settings/index.vue')
        },
        {
          path: '/calculations/create',
          name: 'calculation-create',
          component: () => import('@/views/pages/calculations/_id.vue')
        },
        {
          path: '/calculations/:id',
          name: 'calculation-item',
          component: () => import('@/views/pages/calculations/_id.vue')
        }
      ]
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/pages/auth/Login.vue')
    },
    {
      path: '/auth/access',
      name: 'accessDenied',
      component: () => import('@/views/pages/auth/Access.vue')
    },
    {
      path: '/auth/error',
      name: 'error',
      component: () => import('@/views/pages/auth/Error.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  if (to.name !== 'login' && (!isAuthenticated || isAuthenticated === 'false')) next({ path: '/login' });
  else next();
});

export default router;
