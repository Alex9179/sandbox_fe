<template>
  <div>
    <v-btn elevation="2" @click="buttonClick"> Load</v-btn>
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
    zoom: 13,
    center: { lat: 50.82858299245613, lng: -0.13796688117682637 },
    data_layer: null,
    mapOptions: {
      gestureHandling: "greedy",
    },
    mapStyles: {
      width: "100%",
      height: "93.9vh",
    },
  }),
  mounted() {
    this.mapSetup();
  },
  methods: {
    buttonClick() {
      console.log("Clicked.");
    },
    mapSetup() {
      // set up the layers
      //this.$refs.mapRef.$mapPromise.then((map) => {
        //this.data_layer = new google.maps.Data({ map: map });
      //});
    },
  },
};
</script>

<style scoped></style>
