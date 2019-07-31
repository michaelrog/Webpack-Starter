import Vue from 'vue';
import AudioPlayer from '../components/AudioPlayer.vue';

Vue.component('audio-player', AudioPlayer);

//auto init the Vue components
document.querySelectorAll('audio-player').forEach(el => new Vue({el}));