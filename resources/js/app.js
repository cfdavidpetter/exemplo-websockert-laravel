import 'babel-polyfill'

import Vue from 'vue'
import VueRouter from 'vue-router'
import BootstrapVue from 'bootstrap-vue'
import InfiniteLoading from 'vue-infinite-loading'
import VueSocketIO from 'vue-socket.io'

Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.use(InfiniteLoading)

window.axios = require('axios')
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
window.axios.defaults.headers.common = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
window.axios.interceptors.response.use(function (response) {    
    return response
}, function (error) {
    return Promise.reject(error)
});
let token = document.head.querySelector('meta[name="csrf-token"]')
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token')
}


Vue.use(new VueSocketIO({
    connection: 'ws://192.168.25.71:3000'
}))

import App from './views/App'
import Game from './views/Game'
import Duel from './views/Duel'

const router = new VueRouter({
    routes: [
        {
            path: '/',
            component: Game
        },
        {
            path: '/duel/:play',
            name: 'duel',
            component: Duel
        },
    ],
})

const app = new Vue({
    router,
    render: h => h(App)
}).$mount('#app')