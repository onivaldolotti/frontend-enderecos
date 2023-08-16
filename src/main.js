import App from './App.vue';
import { createApp } from 'vue';
import Vue3Toasity from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

library.add(faSearch)

createApp(App).use(
  Vue3Toasity,
  {
    autoClose: 3000,
  },
)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app');