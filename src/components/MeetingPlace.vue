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
            <h4>Where Are you?</h4>
            <v-row>
              <v-col cols="6">
                <v-text-field id="lng" v-model="people[0].address" />
              </v-col>
              <v-col cols="3">
                <v-btn @click="locateLocation(0)" width="100%">Set</v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn @click="clearLocation(0)" width="100%">Clear</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <label for="lat">Latitude:</label>
                {{ people[0].lat }}
              </v-col>
              <v-col cols="6">
                <label for="lng">Longitude:</label>
                {{ people[0].lng }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card-actions>
        <v-card-actions>
          <v-card-text>
            <h4>Where Are they?</h4>
            <v-row>
              <v-col cols="6">
                <v-text-field id="lng" v-model="people[1].address" />
              </v-col>
              <v-col cols="3">
                <v-btn @click="locateLocation(1)" width="100%">Set</v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn @click="clearLocation(1)" width="100%">Clear</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <label for="lat">Latitude:</label>
                {{ people[1].lat }}
              </v-col>
              <v-col cols="6">
                <label for="lng">Longitude:</label>
                {{ people[1].lng }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card-actions>
        <v-card-actions>
          <v-btn @click="findMeetingPlaces()" width="100%">Meet!</v-btn>
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
  }),
  mounted() {
  },
  methods: {
    clearLocation(personIndex) {
      this.people[personIndex].address = "";
      this.people[personIndex].lat = 0;
      this.people[personIndex].lng = 0;
      this.people[personIndex].located = false;
    },
    async locateLocation(personIndex) {
      const person = this.people[personIndex];
      //console.log(person);
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

            // add a marker for this person
            this.$refs.mapRef.$mapPromise.then((map) => {
              new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map,
                title: person.name,
              });
            });
          } else {
            console.log("No results found");
          }
        } catch (error) {
          console.error("Error geocoding address:", error);
        }
      }
    },
    findMeetingPlaces() {
      // set the crowsCentre to the middle of the two people
      this.crowsCentre.lat = (this.people[0].lat + this.people[1].lat) / 2;
      this.crowsCentre.lng = (this.people[0].lng + this.people[1].lng) / 2;

      // zoom and centre the map on the 2 people markers
      this.$refs.mapRef.$mapPromise.then((map) => {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: this.people[0].lat, lng: this.people[0].lng });
        bounds.extend({ lat: this.people[1].lat, lng: this.people[1].lng });
        map.fitBounds(bounds);
      });

      // use Google Maps API to find the driving route between them and show that on the map
      const directionsService = new google.maps.DirectionsService();

      const request = {
        origin: { lat: this.people[0].lat, lng: this.people[0].lng },
        destination: { lat: this.people[1].lat, lng: this.people[1].lng },
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          this.$refs.mapRef.$mapPromise.then((map) => {
            const directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(result);

            // Calculate the midpoint based on journey duration
            const route = result.routes[0];
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
            const midpoint = legs[midpointIndex].end_location;

            // Set the midpoint as the crowsCentre
            this.crowsCentre = {
              lat: midpoint.lat(),
              lng: midpoint.lng(),
            };


          });
        }
      });

      // add a marker for the crowsCentre
      this.$refs.mapRef.$mapPromise.then((map) => {
        new google.maps.Marker({
          position: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
          map: map,
          title: "Crows Centre",
        });

        this.showMeetingArea();
      });
    },
    showMeetingArea() {
      // show a circle around the crowsCentre
      this.$refs.mapRef.$mapPromise.then((map) => {
        new google.maps.Circle({
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map,
          center: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
          radius: 10000,
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
            radius: 10000,
            type: ["restaurant"],
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              for (let i = 0; i < results.length; i++) {
                this.createMarker(results[i]);
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