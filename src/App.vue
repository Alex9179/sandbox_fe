<template>
  <v-app id="inspire">
    <v-main>
      <v-toolbar id="topNav">
        <v-icon large v-if="!showIntro" @click="returnToLanding"> mdi-view-dashboard </v-icon>
        <v-icon large v-else> mdi-map </v-icon>
        <v-toolbar-title class="pa-4">AM Sandbox</v-toolbar-title>
      </v-toolbar>
        <div v-if="showIntro" class="ma-4">
          <v-card-title>
              Stuff to build...
          </v-card-title>
       
        <div>
          <v-row>
            <v-col cols="4">
              <v-card
                height="200"
                id="buildingTile"
                :style="{backgroundImage: `url(${require('@/assets/building_example.png')})`,}"           
                class="parent-card"
              >
                <v-card elevation="9" outlined shaped class="child-card">
                  <v-card-title>Choropleth Buildings</v-card-title>
                  <v-card-text
                    >Census Data displayed as building outlines, broken up by
                    statistical boundaries</v-card-text
                  >
                  <v-btn class="ma-2" elevation="2" tile @click="showBuildingSwitch">View</v-btn>
                </v-card>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                height="200"
                id="buildingTile"
                :style="{backgroundImage: `url(${require('@/assets/meeting.png')})`, backgroundSize: 'cover'}"
                class="parent-card"
              >
                <v-card elevation="9" outlined shaped class="child-card">
                  <v-card-title>Meeting Place</v-card-title>
                  <v-card-text
                    >Find out where to meet</v-card-text
                  >
                  <v-btn class="ma-2" elevation="2" tile @click="showMeetinMiddle">View</v-btn>
                </v-card>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                height="200"
                id="buildingTile"
                :style="{backgroundImage: `url(${require('@/assets/robots.png')})`,}"           
                class="parent-card"
              >
                <v-card elevation="9" outlined shaped class="child-card">
                  <v-card-title>AI Tool Sampler</v-card-title>
                  <v-card-text
                    >Let's have a crack at the AI APIs</v-card-text
                  >
                  <v-btn class="ma-2" elevation="2" tile @click="showAISampler">View</v-btn>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </div>
        </div>
        <div v-if="showBuilding">
          <BuildingPolys></BuildingPolys>
        </div>
        <div v-if="meetInMiddle">
          <MeetInMiddle></MeetInMiddle>
        </div>
        <div v-if="AISampler">
          <AISampler></AISampler>
        </div>
    </v-main>
  </v-app>
</template>

<script>
import BuildingPolys from "./components/BuildingPolys";
import MeetInMiddle from "./components/MeetingPlace";
import AISampler from "./components/AISampler";

export default {
  name: "App",
  components: {
    BuildingPolys,
    MeetInMiddle,
    AISampler,
  },
  data: () => ({
    showIntro: true,
    showBuilding: false,
    meetInMiddle: false,
    AISampler: false,
    
  }),
  methods: {
    showBuildingSwitch(){
      this.showIntro = false;
      this.showBuilding = true;
    },
    showMeetinMiddle(){
      this.showIntro = false;
      this.meetInMiddle = true;
    },
    showAISampler(){
      this.showIntro = false;
      this.AISampler = true;
    },
    returnToLanding(){
      this.showIntro = true;
      this.showBuilding = false;
      this.meetInMiddle = false;
      this.AISampler = false;  
    },
  },
};
</script>

<style scoped>
#topNav {
  background-color: #6495ed;
}
.parent-card {
  display: flex;
  justify-content: center;
  align-items: center;
}

.child-card {
  margin: auto;
}
</style>
