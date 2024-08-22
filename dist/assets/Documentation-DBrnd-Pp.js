import{_ as e,a,c as t,f as s}from"./index-CZmPgcIN.js";const i={},o={class:"card"},d=s(`<div class="font-semibold text-2xl mb-4" data-v-7b956846>Documentation</div><div class="font-semibold text-xl mb-4" data-v-7b956846>Get Started</div><p class="text-lg mb-4" data-v-7b956846> Sakai is an application template for Vue based on the <a href="https://github.com/vuejs/create-vue" class="font-medium text-primary hover:underline" data-v-7b956846>create-vue</a>, the recommended way to start a <strong data-v-7b956846>Vite-powered</strong> Vue projects. To get started, clone the <a href="https://github.com/primefaces/sakai-vue" class="font-medium text-primary hover:underline" data-v-7b956846>repository</a> from GitHub and install the dependencies with npm or yarn. </p><pre class="app-code" data-v-7b956846><code data-v-7b956846>git clone https://github.com/primefaces/sakai-vue
npm install
npm run dev</code></pre><p class="text-lg mb-4" data-v-7b956846>Navigate to <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-7b956846>http://localhost:5173/</i> to view the application in your local environment.</p><pre class="app-code" data-v-7b956846><code data-v-7b956846>npm run dev</code></pre><div class="font-semibold text-xl mb-4" data-v-7b956846>Structure</div><p class="text-lg mb-4" data-v-7b956846>Templates consists of a couple folders, demos and layout have been separated so that you can easily remove what is not necessary for your application.</p><ul class="leading-normal list-disc pl-8 text-lg mb-4" data-v-7b956846><li data-v-7b956846><span class="text-primary font-medium" data-v-7b956846>src/layout</span>: Main layout files, needs to be present.</li><li data-v-7b956846><span class="text-primary font-medium" data-v-7b956846>src/views</span>: Demo pages like Dashboard.</li><li data-v-7b956846><span class="text-primary font-medium" data-v-7b956846>public/demo</span>: Assets used in demos</li><li data-v-7b956846><span class="text-primary font-medium" data-v-7b956846>src/assets/demo</span>: Styles used in demos</li><li data-v-7b956846><span class="text-primary font-medium" data-v-7b956846>src/assets/layout</span>: SCSS files of the main layout</li></ul><div class="font-semibold text-xl mb-4" data-v-7b956846>Menu</div><p class="text-lg mb-4" data-v-7b956846> Main menu is defined at <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-7b956846>src/layout/AppMenu.vue</span> file. Update the <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-7b956846>model</i> property to define your own menu items. </p><div class="font-semibold text-xl mb-4" data-v-7b956846>Layout Composable</div><p class="text-lg mb-4" data-v-7b956846> The <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-7b956846>src/layout/composables/layout.js</span> is a composable that manages the layout state changes including dark mode, PrimeVue theme, menu modes and states. If you change the initial values like the preset or colors, make sure to apply them at PrimeVue config at main.js as well. </p><div class="font-semibold text-xl mb-4" data-v-7b956846>Tailwind CSS</div><p class="text-lg mb-4" data-v-7b956846>The demo pages are developed with Tailwind CSS however the core application shell mainly uses custom CSS.</p><div class="font-semibold text-xl mb-4" data-v-7b956846>Variables</div><p class="text-lg mb-4" data-v-7b956846> CSS variables used in the template derive their values from the PrimeVue styled mode presets, use the files under <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base" data-v-7b956846>assets/layout/_variables.scss</span> to customize according to your requirements. </p>`,17),l=[d];function n(r,c){return a(),t("div",o,l)}const m=e(i,[["render",n],["__scopeId","data-v-7b956846"]]);export{m as default};