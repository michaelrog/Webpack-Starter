// import Vue from 'vue';
// import TextBawx from "../vue/TextBawx.vue";
//
// const yar = [].concat([]);
//
// console.log("Howdy!");
//
// window.App = new Vue(
//     {
//         components: {
//             TextBawx
//         }
//     }
// );
// ;

// Import our CSS
// import styles from '../css/app.pcss';

window.numbers = [1,2,3].map((n) => n * 2);

// App main
const main = async () => {
    // Async load the vue module
    const { default: Vue } = await import(/* webpackChunkName: "vue" */ 'vue');
    // Create our vue instance
    const vm = new Vue({
        el: "#app",
        components: {
            // 'confetti': () => import(/* webpackChunkName: "confetti" */ '../vue/Confetti.vue'),
        },
        data: {
        },
        methods: {
        },
        mounted() {
        },
    });

    return vm;
};

// Execute async function
main().then( (vm) => {
});

// Accept HMR as per: https://webpack.js.org/api/hot-module-replacement#accept
if (module.hot) {
    module.hot.accept();
}
