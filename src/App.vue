<template>
  <v-app id="inspire">
    <v-main>
      <v-toolbar id="topNav">
        <v-icon large v-if="showBuilding" @click="showIntroSwitch"> mdi-view-dashboard </v-icon>
        <v-icon large v-if="!showBuilding"> mdi-map </v-icon>
        <v-toolbar-title class="pa-4">AM Sandbox</v-toolbar-title>
      </v-toolbar>
        <div v-if="showIntro" class="ma-4">
          <v-card-text>
            Welcome to Alex McLeans GIS Feature samples. Here, you will find a
            variety of examples in developing Web GIS applications. With a focus
            on utilizing the latest GIS technologies, I have developed various
            web mapping applications that leverage spatial data to provide
            insights into complex spatial problems.
          </v-card-text>
          <v-card-text>
            In this portfolio, you will find examples of applications that I
            have developed using various web GIS technologies such as Mapbox,
            Leaflet, OpenLayers, and Google Maps. Each of these applications
            showcases my expertise in designing and developing interactive maps,
            geospatial visualizations, and analytical tools that are essential
            for understanding complex spatial data.
          </v-card-text>
        
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
                class="parent-card"
              >
                <v-card elevation="9" outlined shaped class="child-card">
                  <v-card-title>Feature No.2</v-card-title>
                  <v-card-text
                    >Description about Feature No.2</v-card-text
                  >
                  <v-btn class="ma-2" elevation="2" tile @click="showBuildingSwitch">View</v-btn>
                </v-card>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                height="200"
                id="buildingTile"
                class="parent-card"
              >
                <v-card elevation="9" outlined shaped class="child-card">
                  <v-card-title>Feature No.3</v-card-title>
                  <v-card-text
                    >Description about Feature No.3</v-card-text
                  >
                  <v-btn class="ma-2" elevation="2" tile @click="showBuildingSwitch">View</v-btn>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </div>
        </div>
        <div v-if="showBuilding">
          <BuildingPolys></BuildingPolys>
        </div>
    </v-main>
  </v-app>
</template>

<script>
import BuildingPolys from "./components/BuildingPolys";

export default {
  name: "App",
  components: {
    BuildingPolys,
  },
  data: () => ({
    showIntro: true,
    showBuilding: false,
  }),
  methods: {
    showBuildingSwitch(){
      this.showIntro = false;
      this.showBuilding = true;
    },
    showIntroSwitch(){
      this.showIntro = true;
      this.showBuilding = false;
    },
  },
};
</script>

<style scoped>
#topNav {
  background-color: #6495ed;
}
#buildingTile {
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
