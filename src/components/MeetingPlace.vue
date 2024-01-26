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
                <v-select v-model="locationType" :items="locationOptions" label="Location Type" outlined dense />
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
              <v-btn color="success" @click="findMeetingPlaces()" block width="100%" :disabled="!start">Go!</v-btn>
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
        address: "33 Chaplin Drive, Headcorn",
        lat: 0,
        lng: 0,
        located: false,
      },
    ],
    radius: 5000,
    travelMethod: "",
    locationOptions: [
      { text: 'Theme Park', value: 'amusement_park' },
      { text: 'Aquarium', value: 'aquarium' },
      { text: 'Art Gallery', value: 'art_gallery' },
      { text: 'Bakery', value: 'bakery' },
      { text: 'Pub/Bar', value: 'bar' },
      { text: 'Salon', value: 'beauty_salon' },
      { text: 'Book Shop', value: 'book_store' },
      { text: 'Bowling Alley', value: 'bowling_alley' },
      { text: 'Cafe', value: 'cafe' },
      { text: 'Camping', value: 'campground' },
      { text: 'Casino', value: 'casino' },
      { text: 'Church', value: 'church' },
      { text: 'Gym', value: 'gym' },
      { text: 'Hairdresser', value: 'hair_care' },
      { text: 'Library', value: 'library' },
      { text: 'Accomodation', value: 'lodging' },
      { text: 'Takeaway', value: 'meal_takeaway' },
      { text: 'Cinema', value: 'movie_theater' },
      { text: 'Museum', value: 'museum' },
      { text: 'Night Club', value: 'night_club' },
      { text: 'Park', value: 'park' },
      { text: 'Parking', value: 'parking' },
      { text: 'Restaurant', value: 'restaurant' },
      { text: 'Shopping Mall', value: 'shopping_mall' },
      { text: 'Spa', value: 'spa' },
      { text: 'Stadium', value: 'stadium' },
      { text: 'Tourism', value: 'tourist_attraction' },
      { text: 'Zoo', value: 'zoo' }
    ],
    directionsRenderer: null,
    resultRoute: null,
    placesPolygon: null,
    placesResults: null,
    placesMarkers: [],
  }),
  mounted() {
  },
  computed: {
    start() {
      if (this.people[0].address && this.people[1].address) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    resetForm() {
      // empty the lot
      this.radius = 1000;
      this.travelMethod = "";
      this.locationType = "";
      this.zoom = 6;
      this.center = { lat: 54.503624731909646, lng: -5.806912193676821 };

      // remove the directions renderer
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
      }

      // remove the places markers
      this.placesMarkers.forEach((marker) => {
        marker.setMap(null);
      });

      this.placesMarkers = [];

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
      return new Promise((resolve) => {
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
      return new Promise((resolve) => {
        this.$refs.mapRef.$mapPromise.then((map) => {
          const route = this.resultRoute.routes[0];
          let totalDuration = 0;
          route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              totalDuration += step.duration.value;
            });
          });
          const halfwayDuration = totalDuration / 2;
          let accumulatedDuration = 0;
          let midpoint;
          for (const leg of route.legs) {
            for (const step of leg.steps) {
              accumulatedDuration += step.duration.value;
              if (accumulatedDuration >= halfwayDuration) {
                const fraction = (halfwayDuration - (accumulatedDuration - step.duration.value)) / step.duration.value;
                const polyline = google.maps.geometry.encoding.decodePath(step.polyline.points);
                const index = Math.floor(fraction * (polyline.length - 1));
                midpoint = polyline[index];
                break;
              }
            }
            if (midpoint) break;
          }
          this.crowsCentre = {
            lat: midpoint.lat(),
            lng: midpoint.lng(),
          };
/*           new google.maps.Marker({
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
              for (let i = 0; i < results.length; i++) {
                this.createMarker(results[i]);
              }
            }
          }
        );
      });
    },
    createMarker(place) {
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

        this.placesMarkers.push(marker);

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