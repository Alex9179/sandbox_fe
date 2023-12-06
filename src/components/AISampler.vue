<template>
  <v-card height="92vh">
    <v-card-title>AI Sampler</v-card-title>
    <v-card-text id="messagePanel" style="height: 72vh;">
      <v-container style="height: 100%;">
        <v-row style="height: 100%;">
          <v-col cols="12">
            <v-list style="height: 100%;">
              <v-list-item v-for="(message, index) in messages" :key="index">
                <v-list-item-content>
                  <v-list-item-title v-text="message.content"
                    :class="message.role === 'bot' ? 'text-right' : 'text-left'"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions id="userInputDiv" height="13vh">
      <v-container class="d-flex align-center">
        <v-text-field v-model="userInput" label="What do you want..." outlined @keyup.enter="sendMessage">
          <template v-slot:append>
            <v-container mb-3>
              <v-btn @click="sendMessage" icon>
                <v-progress-circular indeterminate v-if="fetchInProgress"></v-progress-circular>
                <v-icon v-else>mdi-send</v-icon>
              </v-btn>
            </v-container>
          </template>
        </v-text-field>
      </v-container>
    </v-card-actions>
  </v-card>
</template>

<script>
import OpenAI from "openai";

export default {
  name: "AISampler",
  data: () => ({
    userInput: "",
    messages: [],
    aiInstance: null,
    fetchInProgress: false,
  }),
  methods: {
    startConversation() {
      const userMessage = {
        role: "bot",
        content: "Hi, let's have a chat!",
      };

      this.messages.push(userMessage);
    },
    sendMessage() {
      this.fetchInProgress = true;
      const openai = new OpenAI({ apiKey: process.env.VUE_APP_OPEN_AI_API_KEY, dangerouslyAllowBrowser: true });

      const userMessage = {
        role: "user",
        content: this.userInput,
      };

      this.messages.push(userMessage); // Add the user's message to the messages array

      openai.chat.completions
        .create({
          messages: [userMessage],
          model: "gpt-3.5-turbo",
        })
        .then((response) => {
          this.fetchInProgress = false;
          const reply = response.choices[0].message.content;
          const botMessage = {
            role: "bot",
            content: reply,
          };
          this.messages.push(botMessage); // Add the bot's reply to the messages array
          this.userInput = ""; // Clear the user input field
        })
        .catch((error) => {
          this.fetchInProgress = false;
          console.error(error);
        });
    },
    generateTextResponse() {

    },
  },
  mounted() {
    this.startConversation();
  },
};
</script>

<style scoped>
.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}
</style>
