import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Message } from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import 'highlight.js/styles/stackoverflow-light.css'
import 'highlight.js/lib/common';
const app = createApp(App)
Message._context = app._context;
Message.install(app);
app.mount('#app')
