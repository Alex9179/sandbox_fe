<template>
  <div>
    <div class="mapButtons" >
      <v-card>
        <v-card-text>
        This dataset shows Census 2021 Population Data displayed via building polygons, broken up and styled via their MSOA (Middle Layer Super Output Area)
        </v-card-text>
        <v-card-title>How was it made?</v-card-title>
        <v-card-text>
        This layer was created by combining 3 different open data sources. ONS MSOA Boundaries (BGC), Ordnance Survery OS OpenMap - Local Building Polygons, and Census 2021 Population Data. The Buildings layer was broken up using an intersection with the MSOA layer, with the MSOA code and name applied. I could then apply the population data by joining via the MSOA code, break the values down into quintiles and apply styling accordingly.
        </v-card-text>
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
      this.$refs.mapRef.$mapPromise.then((map) => {
        // load the polys straight from the API
        map.data.loadGeoJson("http://localhost:8081/api/test-polygons");

        map.data.setStyle(function (feature) {
          var value = feature.getProperty("value");
          var color;
          switch (value) {
            case 1:
              color = "rgb(147, 196, 125)";
              break;
            case 2:
              color = "rgb(255, 217, 102)";
              break;
            case 3:
              color = "rgb(230, 145, 56)";
              break;
            case 4:
              color = "rgb(204, 0, 0)";
              break;
            case 5:
              color = "rgb(102, 0, 0)";
              break;
            default:
              color = "rgb(102, 0, 0)";
          }
          return {
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 1,
          };
        });
      });
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