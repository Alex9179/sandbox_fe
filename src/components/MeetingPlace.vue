<template>
  <div>
    <div class="mapOptions">
      <v-card>
        <v-card-title>Meeting Place</v-card-title>
        <v-card-text>
          Find the perfect place to meet in the Middle
        </v-card-text>
        <v-card-actions>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <h4>Where Are you?</h4>
                <v-text-field id="lng" v-model="people[0].address" outlined />
              </v-col>
              <v-col cols="6">
                <h4>Where Are they?</h4>
                <v-text-field id="lng" v-model="people[1].address" outlined />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field type="number" id="radius" v-model="radius" outlined label="Radius" dense />
              </v-col>
              <v-col cols="4">
                <v-select v-model="travelMethod" :items="['Driving', 'Walking']" label="Travel Method" outlined
                  dense></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field label="Location Type" id="locationType" v-model="locationType" outlined dense />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card-actions>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn color="warning" @click="resetForm()" block width="100%">Reset</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="success" @click="findMeetingPlaces()" block width="100%">Go!</v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </div>
    <GmapMap ref="mapRef" :center="center" :zoom="zoom" :options="mapOptions" :style="mapStyles" />
  </div>
</template>

<script>
/* global google */
import axios from "axios";

export default {
  name: "BuildingPolys",
  data: () => ({
    zoom: 6,
    center: { lat: 54.503624731909646, lng: -5.806912193676821 },
    crowsCentre: { lat: 0, lng: 0 },
    mapOptions: {
      gestureHandling: "greedy",
    },
    mapStyles: {
      width: "100%",
      height: "93.9vh",
    },
    people: [
      {
        name: "You",
        address: "24 Luther Street, Brighton",
        lat: 0,
        lng: 0,
        located: false,
      },
      {
        name: "Them",
        address: "33 Chapling Drive, Headcorn",
        lat: 0,
        lng: 0,
        located: false,
      },
    ],
    radius: 1000,
    travelMethod: "",
    locationType: "",
    directionsRenderer: null,
    resultRoute: null,
    placesPolygon: null,
    placesResults: null,
    placesMarkers: [],
  }),
  mounted() {
  },
  methods: {
    resetForm() {
      // empty the lot
      this.radius = 1000;
      this.travelMethod = "";
      this.locationType = "";
      this.zoom = 6;
      this.center= { lat: 54.503624731909646, lng: -5.806912193676821 };

      // remove the directions renderer
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
      }
      
      // remove the places markers
      this.placesMarkers.forEach((marker) => {
        marker.setMap(null);
      });

      // remove the polygon
      if (this.placesPolygon) {
        this.placesPolygon.setMap(null);
      }
  
      // for each person, reset their details
      this.people.forEach((person) => {
        person.name = "";
        person.address = "";
        person.lat = 0;
        person.lng = 0;
        person.located = false;
      });
    },
    async locateLocation(personIndex) {
      const person = this.people[personIndex];
      if (person) {
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              person.address
            )}&key=${process.env.VUE_APP_GOOGLE_API_KEY}`
          );
          const { results } = response.data;
          if (results.length > 0) {
            const { lat, lng } = results[0].geometry.location;
            person.lat = lat;
            person.lng = lng;
            person.located = true;

          } else {
            console.log("No results found");
          }
        } catch (error) {
          console.error("Error geocoding address:", error);
        }
      }
    },
    async locateAllLocations() {
      for (let i = 0; i < this.people.length; i++) {
        await this.locateLocation(i);
      }
      this.$refs.mapRef.$mapPromise.then((map) => {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: this.people[0].lat, lng: this.people[0].lng });
        bounds.extend({ lat: this.people[1].lat, lng: this.people[1].lng });
        map.fitBounds(bounds);
      });
      console.log('Located all locations');
    },
    async findMeetingPlaces() {
      try {
        await this.locateAllLocations();
        await this.zoomAndCentreMap();
        await this.findRoutes();
        await this.calculateMidpoint();
        this.showMeetingArea();
      } catch (error) {
        console.error("Error finding meeting places:", error);
      }
    },
    async zoomAndCentreMap() {
      return new Promise((resolve, reject) => {
        this.$refs.mapRef.$mapPromise.then((map) => {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: this.people[0].lat, lng: this.people[0].lng });
          bounds.extend({ lat: this.people[1].lat, lng: this.people[1].lng });
          map.fitBounds(bounds);
          resolve();
        });
        console.log('Zoomed and centred map');
      });
    },
    async findRoutes() {
      return new Promise((resolve, reject) => {
        const directionsService = new google.maps.DirectionsService();
        const request = {
          origin: { lat: this.people[0].lat, lng: this.people[0].lng },
          destination: { lat: this.people[1].lat, lng: this.people[1].lng },
          travelMode: google.maps.TravelMode.DRIVING,
        };
        directionsService.route(request, (result, status) => {
          if (status == google.maps.DirectionsStatus.OK) {
            this.resultRoute = result; 
            this.$refs.mapRef.$mapPromise.then((map) => {
              const directionsRenderer = new google.maps.DirectionsRenderer();
              directionsRenderer.setMap(map);
              directionsRenderer.setDirections(result);
              this.directionsRenderer = directionsRenderer; 
              resolve(result);
            });
          } else {
            reject(new Error("Failed to find driving route"));
          }
        });
      });
    },
    async calculateMidpoint() {
      return new Promise((resolve, reject) => {
        this.$refs.mapRef.$mapPromise.then((map) => {
          const route = this.resultRoute.routes[0];
          const legs = route.legs;
          let totalDuration = 0;
          for (let i = 0; i < legs.length; i++) {
            totalDuration += legs[i].duration.value;
          }
          const halfwayDuration = totalDuration / 2;
          let accumulatedDuration = 0;
          let midpointIndex = 0;
          for (let i = 0; i < legs.length; i++) {
            accumulatedDuration += legs[i].duration.value;
            if (accumulatedDuration >= halfwayDuration) {
              midpointIndex = i;
              break;
            }
          }
          const startLocation = legs[midpointIndex].start_location;
          const endLocation = legs[midpointIndex].end_location;
          const fraction = (halfwayDuration - (accumulatedDuration - legs[midpointIndex].duration.value)) / legs[midpointIndex].duration.value;
          const midpoint = {
            lat: startLocation.lat() + (endLocation.lat() - startLocation.lat()) * fraction,
            lng: startLocation.lng() + (endLocation.lng() - startLocation.lng()) * fraction,
          };
          this.crowsCentre = midpoint;

/*           // add a marker for the crows centre
          new google.maps.Marker({
            position: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
            map: map,
            title: "Crows Centre",
          }); */

          resolve();
        });
        console.log('Calculated midpoint');
      });
    },
    showMeetingArea() {
      // show a circle around the crowsCentre
      this.$refs.mapRef.$mapPromise.then((map) => {
        this.placesPolygon = new google.maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map,
          center: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
          radius: this.radius,
        });
        this.showMeetingPlaces();
      });
    },
    showMeetingPlaces() {
      console.log(google.maps.places);
      this.$refs.mapRef.$mapPromise.then((map) => {
        const service = new google.maps.places.PlacesService(map);

        service.nearbySearch(
          {
            location: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
            radius: this.radius,
            type: [this.locationType],
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              this.placesResults = results;
              console.log(this.placesResults); 
              for (let i = 0; i < results.length; i++) {
                const marker = this.createMarker(results[i]);
                this.placesMarkers.push(marker);
              }
            }
          }
        );
      });
    },
    createMarker(place) {
      // Implement your logic to create a marker for the given place
      // Example code:
      this.$refs.mapRef.$mapPromise.then((map) => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
        });

        const infowindow = new google.maps.InfoWindow({
          content: place.name,
        });

        marker.addListener("click", () => {
          infowindow.open(map, marker);
        });
      });
    },
  },
};
</script>

<style scoped>
.mapOptions {
  position: absolute !important;
  top: 200px;
  right: 50px;
  margin-left: 15px;
  background-color: rgba(243, 237, 237, 0);
  z-index: 1;
  max-width: 30%
}
</style>