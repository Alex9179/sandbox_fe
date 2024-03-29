import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import * as VueGoogleMaps from 'vue2-google-maps'


Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_API_KEY,
    libraries: 'drawing,places,geometry',
  },
  installComponents: true
})

Vue.config.productionTip = false

new Vue({
  vuetify,
  VueGoogleMaps,
  render: (h) => h(App),
}).$mount("#app");
