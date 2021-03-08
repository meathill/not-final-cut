import {createApp} from 'vue';
import App from './app';
import './style/base.css';
import './style/app.styl';

const index = createApp(App);
index.mount('#app');
