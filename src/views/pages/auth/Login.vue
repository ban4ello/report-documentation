<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/service/ApiService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter();
const userData = ref({
  username: '',
  email: '',
  password: '',
  role: 'guest'
});
const newUserData = ref({
  username: '',
  email: '',
  password: '',
  сonfirmPassword: '',
  role: 'guest'
});
const checked = ref(false);
const loading = ref(false);
const visible = ref(false);

const login = async ({ email, password }) => {
  try {
    loading.value = true;
    const response = await ApiService.login({ email, password });

    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);

    router.push({ path: '/' });
  } catch (error) {
    console.error('Login error:', error);

    // Обработка разных типов ошибок
    let errorMessage = 'Произошла ошибка при входе';

    if (error.response?.status === 401) {
      errorMessage = error.response.data?.message || 'Неверные учетные данные';
    } else if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 900;
      const minutes = Math.ceil(retryAfter / 60);
      errorMessage = `Слишком много попыток входа. Попробуйте через ${minutes} минут`;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      errorMessage = 'Нет подключения к серверу. Проверьте интернет соединение';
    }

    showNotif({ message: errorMessage, type: 'error' });
  } finally {
    loading.value = false;
  }
};

const signup = async () => {
  try {
    loading.value = true;
    await ApiService.signup(newUserData.value);

    login({ email: newUserData.value.email, password: newUserData.value.password });
  } catch (error) {
    console.error('Signup error:', error);

    // Обработка разных типов ошибок
    let errorMessage = 'Произошла ошибка при регистрации';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      errorMessage = 'Нет подключения к серверу. Проверьте интернет соединение';
    }

    showNotif({ message: errorMessage, type: 'error' });
  } finally {
    loading.value = false;
  }
};

const showNotif = ({ title, message, type = 'success' }) => {
  // 'success'
  // 'warn'
  // 'error'
  toast.add({ severity: type, summary: title, detail: message, life: 5000 });
};
</script>

<template>
  <Toast />

  <div v-if="loading" class="card flex justify-center items-center h-[100vh] fixed top-0 left-0 right-0 z-9999 opacity-60">
    <ProgressSpinner />
  </div>

  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%);
        "
      >
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8 flex justify-center items-center flex-col">
            <div class="w-[80px] mb-4">
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
            </div>

            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
              <div>Добро пожаловать в</div>
              <div>"Калькуляции и Анализ!"</div>
            </div>

            <span class="text-muted-color font-medium">Войдите чтобы продолжить</span>
          </div>

          <div>
            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Почта</label>
            <InputText
              v-model="userData.email"
              required
              id="email1"
              type="text"
              placeholder="example@gmail.com"
              class="w-full md:w-[30rem] mb-8"
            />

            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Пароль</label>
            <Password
              required
              id="password1"
              v-model="userData.password"
              placeholder="Password"
              :toggleMask="true"
              class="mb-4"
              fluid
              :feedback="false"
            ></Password>

            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
              <div class="flex items-center">
                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                <label for="rememberme1">Запомнить меня</label>
              </div>
              <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Забыли пароль?</span>
            </div>

            <div class="flex items-center justify-center mt-2 mb-8 gap-8">
              <div class="layout-topbar-logo" @click="visible = true">
                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Зарегистрироваться</span>
              </div>
            </div>

            <!-- <RecaptchaCheckbox v-model="reCAPTCHA" class="flex justify-center mb-4" /> -->

            <Button label="Войти" class="w-full" @click="login(userData)"></Button>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="visible" pt:root:class=" !bg-transparent" pt:mask:class="backdrop-blur-sm" class="w-[450px]">
      <template #container="{ closeCallback }">
        <div
          class="flex justify-center items-center flex-col px-8 py-8 gap-6 rounded-2xl"
          style="background-image: radial-gradient(circle at left top, var(--p-primary-400), var(--p-primary-700))"
        >
          <div class="w-[80px] mb-4">
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
                    <path fill="#fff" d="M144,144H32v112h112V144z M128,240H48v-80h80V240z" />
                    <path fill="#fff" d="M272,144H160v112h112V144z M256,240h-80v-80h80V240z" />
                    <path fill="#fff" d="M144,272H32v112h112V272z M128,368H48v-80h80V368z" />
                    <path fill="#fff" d="M272,272H160v112h112V272z M256,368h-80v-80h80V368z" />
                    <polygon fill="#fff" points="80,224 96,224 96,208 112,208 112,192 96,192 96,176 80,176 80,192 64,192 64,208 80,208 			" />
                    <rect fill="#fff" x="192" y="192" width="48" height="16" />
                    <polygon
                      fill="#fff"
                      points="69.656,357.656 88,339.312 106.344,357.656 117.656,346.344 99.312,328 117.656,309.656 106.344,298.344 
            88,316.688 69.656,298.344 58.344,309.656 76.688,328 58.344,346.344 			"
                    />
                    <rect fill="#fff" x="192" y="304" width="48" height="16" />
                    <rect fill="#fff" x="192" y="336" width="48" height="16" />
                    <rect fill="#fff" x="256" y="80" width="16" height="16" />
                    <rect fill="#fff" x="32" y="80" width="208" height="16" />
                    <path
                      fill="#fff"
                      d="M464,432H53.784L0.456,464l53.328,32H464c17.648,0,32-14.352,32-32S481.648,432,464,432z M384,480H58.216l-26.672-16
            l26.672-16H384V480z M416,480h-16v-32h16V480z M464,480h-32v-32h32c8.816,0,16,7.176,16,16C480,472.824,472.816,480,464,480z"
                    />
                    <path
                      fill="#fff"
                      d="M304,48V0H0v416h304v-48h192V48H304z M288,400H16V128h272V400z M288,112H16V16h272V112z M480,352H304V64h176V352z"
                    />
                    <path
                      fill="#fff"
                      d="M387.704,334.752l4.296,2.736l4.296-2.736C399.064,332.984,464,290.648,464,208S399.064,83.016,396.296,81.248
            L392,78.512l-4.296,2.736C384.936,83.016,320,125.352,320,208S384.936,332.984,387.704,334.752z M392.016,97.848
            c8.776,6.728,29,24.344,42.584,52.24C422.656,141.28,407.952,136,392,136c-15.912,0-30.584,5.248-42.512,14.016
            C363.08,122.224,383.256,104.592,392.016,97.848z M392,152c30.872,0,56,25.128,56,56s-25.128,56-56,56s-56-25.128-56-56
            S361.128,152,392,152z M392,280c15.912,0,30.576-5.248,42.512-14.016c-13.6,27.792-33.776,45.424-42.528,52.168
            c-8.776-6.728-29-24.344-42.584-52.24C361.344,274.72,376.048,280,392,280z"
                    />
                    <polygon
                      fill="#fff"
                      points="384,248 400,248 400,216 432,216 432,200 400,200 400,168 384,168 384,200 352,200 352,216 384,216 			"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </div>

          <div class="inline-flex flex-col gap-2">
            <label for="username" class="text-primary-50 font-semibold">Ваше имя</label>
            <InputText v-model="newUserData.username" id="username" class="!bg-white/20 !p-4 !text-primary-50 w-80" type="text"></InputText>
          </div>

          <div class="inline-flex flex-col gap-2">
            <label for="email" class="text-primary-50 font-semibold">Почта</label>
            <InputText v-model="newUserData.email" id="email" class="!bg-white/20 !p-4 !text-primary-50 w-80" type="email"></InputText>
            <Message v-if="!newUserData.email" severity="error" size="small" variant="simple">Поле обязательно!</Message>
          </div>

          <div class="inline-flex flex-col gap-2">
            <label for="password" class="text-primary-50 font-semibold">Пароль</label>
            <InputText
              v-model="newUserData.password"
              aria-label="password"
              :invalid="newUserData.password !== newUserData.сonfirmPassword"
              id="password"
              class="!bg-white/20 !p-4 !text-primary-50 w-80"
              type="password"
            ></InputText>
            <Message v-if="newUserData.password !== newUserData.сonfirmPassword" severity="error" size="small" variant="simple"
              >Пароли не соападают</Message
            >
          </div>

          <div class="inline-flex flex-col gap-2">
            <label for="сonfirmPassword" class="text-primary-50 font-semibold">Повторите пароль</label>
            <InputText
              v-model="newUserData.сonfirmPassword"
              :invalid="newUserData.сonfirmPassword !== newUserData.password"
              id="сonfirmPassword"
              class="!bg-white/20 !p-4 !text-primary-50 w-80"
              type="password"
            ></InputText>
            <Message v-if="newUserData.сonfirmPassword !== newUserData.password" severity="error" size="small" variant="simple"
              >Пароли не соападают</Message
            >
          </div>

          <div class="flex items-center justify-between gap-4 w-full">
            <Button
              label="Cancel"
              @click="closeCallback"
              text
              class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"
            ></Button>
            <Button
              type="submit"
              :disabled="
                newUserData.password &&
                newUserData.сonfirmPassword &&
                newUserData.password !== newUserData.сonfirmPassword &&
                newUserData.email
              "
              label="Зарегистрироваться"
              @click="signup"
              text
              class="!p-4 w-full !text-primary-50 !border !border-white/30 hover:!bg-white/10"
            ></Button>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>
