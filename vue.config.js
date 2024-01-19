const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    client: {
      webSocketURL: 'ws://sandbox:8080'
    },
    allowedHosts: [
      'sandbox'
    ]
  },
})