<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/service/ApiService';

const user = JSON.parse(localStorage.getItem('user'));
const router = useRouter();
const { onMenuToggle, toggleDarkMode, isDarkTheme, appConfig } = useLayout();
const logout = async () => {
  try {
    // Вызываем logout на сервере
    await ApiService.logout();
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  } finally {
    // Очищаем локальные данные независимо от результата запроса
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    router.push({ path: '/auth/login' });
  }
};

const menuItems = ref([
  {
    label: user.username,
    icon: 'pi pi-user',
    items: [
      {
        label: 'Настройки',
        icon: 'pi pi-cog'
      },
      {
        label: 'Выход',
        icon: 'pi-sign-out',
        command: () => {
          logout();
        }
      }
    ]
  }
]);
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <svg
          fill="#000000"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 496 496"
          xml:space="preserve"
        >
          <g>
            <g>
              <g>
                <path fill="var(--primary-color)" d="M144,144H32v112h112V144z M128,240H48v-80h80V240z" />
                <path fill="var(--primary-color)" d="M272,144H160v112h112V144z M256,240h-80v-80h80V240z" />
                <path fill="var(--primary-color)" d="M144,272H32v112h112V272z M128,368H48v-80h80V368z" />
                <path fill="var(--primary-color)" d="M272,272H160v112h112V272z M256,368h-80v-80h80V368z" />
                <polygon
                  fill="var(--primary-color)"
                  points="80,224 96,224 96,208 112,208 112,192 96,192 96,176 80,176 80,192 64,192 64,208 80,208 			"
                />
                <rect fill="var(--primary-color)" x="192" y="192" width="48" height="16" />
                <polygon
                  fill="var(--primary-color)"
                  points="69.656,357.656 88,339.312 106.344,357.656 117.656,346.344 99.312,328 117.656,309.656 106.344,298.344 
				88,316.688 69.656,298.344 58.344,309.656 76.688,328 58.344,346.344 			"
                />
                <rect fill="var(--primary-color)" x="192" y="304" width="48" height="16" />
                <rect fill="var(--primary-color)" x="192" y="336" width="48" height="16" />
                <rect fill="var(--primary-color)" x="256" y="80" width="16" height="16" />
                <rect fill="var(--primary-color)" x="32" y="80" width="208" height="16" />
                <path
                  fill="var(--primary-color)"
                  d="M464,432H53.784L0.456,464l53.328,32H464c17.648,0,32-14.352,32-32S481.648,432,464,432z M384,480H58.216l-26.672-16
				l26.672-16H384V480z M416,480h-16v-32h16V480z M464,480h-32v-32h32c8.816,0,16,7.176,16,16C480,472.824,472.816,480,464,480z"
                />
                <path
                  fill="var(--primary-color)"
                  d="M304,48V0H0v416h304v-48h192V48H304z M288,400H16V128h272V400z M288,112H16V16h272V112z M480,352H304V64h176V352z"
                />
                <path
                  fill="var(--primary-color)"
                  d="M387.704,334.752l4.296,2.736l4.296-2.736C399.064,332.984,464,290.648,464,208S399.064,83.016,396.296,81.248
				L392,78.512l-4.296,2.736C384.936,83.016,320,125.352,320,208S384.936,332.984,387.704,334.752z M392.016,97.848
				c8.776,6.728,29,24.344,42.584,52.24C422.656,141.28,407.952,136,392,136c-15.912,0-30.584,5.248-42.512,14.016
				C363.08,122.224,383.256,104.592,392.016,97.848z M392,152c30.872,0,56,25.128,56,56s-25.128,56-56,56s-56-25.128-56-56
				S361.128,152,392,152z M392,280c15.912,0,30.576-5.248,42.512-14.016c-13.6,27.792-33.776,45.424-42.528,52.168
				c-8.776-6.728-29-24.344-42.584-52.24C361.344,274.72,376.048,280,392,280z"
                />
                <polygon
                  fill="var(--primary-color)"
                  points="384,248 400,248 400,216 432,216 432,200 400,200 400,168 384,168 384,200 352,200 352,216 384,216 			"
                />
              </g>
            </g>
          </g>
        </svg>

        <span>{{ appConfig.companyName }}</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>

        <div class="relative">
          <button
            v-styleclass="{
              selector: '@next',
              enterFromClass: 'hidden',
              enterActiveClass: 'animate-scalein',
              leaveToClass: 'hidden',
              leaveActiveClass: 'animate-fadeout',
              hideOnOutsideClick: true
            }"
            type="button"
            class="layout-topbar-action layout-topbar-action-highlight"
          >
            <i class="pi pi-palette"></i>
          </button>
          <AppConfigurator />
        </div>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true
        }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <!-- <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-user"></i>
            <span>Profile</span>
          </button>
        </div> -->

        <Menubar :model="menuItems" />
      </div>
    </div>
  </div>
</template>
