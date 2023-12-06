<template>
  <div>
    <div class="mapButtons" >
      <v-card>
        <v-card-title>What Am I Looking At?</v-card-title>
        <v-card-text>
        This is where I'll make the Meet in the Middle feature        </v-card-text>
      </v-card>
    </div>
    <GmapMap
      ref="mapRef"
      :center="center"
      :zoom="zoom"
      :options="mapOptions"
      :style="mapStyles"
    />
  </div>
</template>

<script>
//import axios from "axios";

export default {
  name: "BuildingPolys",
  data: () => ({
    zoom: 16,
    center: { lat: 50.82858299245613, lng: -0.13796688117682637 },
    mapOptions: {
      gestureHandling: "greedy",
    },
    mapStyles: {
      width: "100%",
      height: "93.9vh",
    },
  }),
  mounted() {
  },
  methods: {
    buttonClick() {
      console.log("Clicked.");
    },
  },
};
</script>

<style scoped>
.mapButtons {
  position: absolute !important;
  top: 200px;
  margin-left: 15px;
  background-color: rgba(243, 237, 237, 0);
  z-index: 1;
  max-width: 15%
}
</style>