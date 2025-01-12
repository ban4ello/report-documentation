import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createHead } from '@unhead/vue'
import { VueRecaptchaPlugin } from 'vue-recaptcha'

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);

const head = createHead();
app.use(head);
app.use(VueRecaptchaPlugin, {
  v2SiteKey: '6LeUF7UqAAAAAChYDk5sWq8sajQRofFXJLMlGG9H',
  // v2SiteKey: '6LeUF7UqAAAAAKLKb3Rir7bKOdfESnsFOkrmI2rm',
  // v2SiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
});
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark'
    }
  }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
