<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme, totalPrice } = useLayout();
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" viewBox="0 0 502 502" xml:space="preserve" width="512" height="512">
          <g>
            <g>
              <rect x="115.576" y="111.15" style="fill: #4d93e8" width="30.727" height="159.201" />
              <rect x="115.576" y="305.533" style="fill: #4d93e8" width="30.727" height="85.318" />
              <rect x="355.697" y="305.533" style="fill: #4d93e8" width="30.727" height="85.318" />
              <rect x="355.697" y="111.15" style="fill: #4d93e8" width="30.727" height="159.201" />
              <polygon style="fill: #ccd7eb" points="386.424,270.35 355.697,270.35 146.304,270.35 115.576,270.35 10,270.35 10,305.533     115.576,305.533 146.304,305.533 355.697,305.533 386.424,305.533 492,305.533 492,270.35   " />
            </g>
            <g>
              <path d="M477.156,248.256c4.633,0.869,9.332,1.31,13.964,1.31c5.523,0,10-4.477,10-10s-4.477-10-10-10    c-3.398,0-6.856-0.325-10.276-0.967c-5.428-1.018-10.654,2.556-11.673,7.984S471.728,247.237,477.156,248.256z" />
              <path
                d="M492,260.351h-52.449v-29.086c1.995,1.456,4.018,2.866,6.091,4.183c1.663,1.056,3.518,1.56,5.352,1.56    c3.308,0,6.546-1.641,8.451-4.641c2.961-4.662,1.582-10.842-3.081-13.802c-35.837-22.759-59.911-73.46-59.911-106.535    c0-0.193-0.018-0.381-0.029-0.57v-0.309c0-5.523-4.477-10-10-10h-30.728c-5.523,0-10,4.477-10,10v0.319    c-0.01,0.187-0.028,0.371-0.028,0.561c0,43.955-42.468,79.715-94.668,79.715s-94.668-35.76-94.668-79.715    c0-0.189-0.018-0.374-0.028-0.561v-0.319c0-5.523-4.477-10-10-10h-30.728c-5.523,0-10,4.477-10,10v0.309    c-0.011,0.19-0.029,0.378-0.029,0.57c0,22.769-11.268,52.763-28.706,76.415c-11.323,15.358-34.949,41.122-65.962,41.122    c-5.523,0-10,4.477-10,10s4.477,10,10,10c18.026,0,35.915-6.542,52.449-18.868v29.653H10c-5.523,0-10,4.477-10,10v35.182    c0,5.523,4.477,10,10,10h95.576v75.318c0,5.523,4.477,10,10,10h30.728c5.523,0,10-4.477,10-10v-75.318h189.393v75.318    c0,5.523,4.477,10,10,10h30.728c5.523,0,10-4.477,10-10v-75.318H492c5.523,0,10-4.477,10-10v-35.182    C502,264.828,497.523,260.351,492,260.351z M419.551,213.179v47.171h-23.127v-79.878    C402.789,192.096,410.551,203.285,419.551,213.179z M376.424,121.149v139.201h-10.728V121.149H376.424z M345.696,168.196v92.155    h-23.567v-70.166C331.195,183.933,339.15,176.516,345.696,168.196z M260.75,211.38v29.97c0,5.523,4.477,10,10,10s10-4.477,10-10    v-33.016c7.452-1.742,14.606-4.122,21.38-7.07v59.086H240.31v-49.043c3.521,0.284,7.085,0.437,10.69,0.437    C254.284,211.745,257.534,211.617,260.75,211.38z M220.31,208.113v52.238h-20.439V222c0-5.523-4.477-10-10-10s-10,4.477-10,10    v38.351h-23.567v-92.155C171.385,187.363,193.95,201.738,220.31,208.113z M136.304,121.149v139.201h-10.728V121.149H136.304z     M83.323,212.189c3.297-3.705,6.509-7.661,9.617-11.877c4.639-6.293,8.867-12.936,12.636-19.764v79.802H83.329v-48.051    C83.329,212.262,83.323,212.226,83.323,212.189z M136.304,380.851h-10.728v-65.318h10.728V380.851z M376.424,380.851h-10.728    v-65.318h10.728V380.851z M482,295.533H20v-15.182h462V295.533z"
              />
            </g>
          </g>
        </svg>

        <span>ЕВРОМОСТ-НАН-ЭТАЛОН-СТРОЙ</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <div class="font-bold text-[--primary-color]">Итоговая сумма калькуляции: {{ totalPrice }}</div>

        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>

        <div class="relative">
          <button
            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
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
        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
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
        </div>
      </div>
    </div>
  </div>
</template>
