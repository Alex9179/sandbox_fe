<template>
  <div>
    <v-dialog v-model="dialogVisible" max-width="60%" persistent>
      <v-card class="mapSettings">
        <v-card-title>Meeting Place</v-card-title>
        <v-card-actions>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-text-field label="Where Are you?" v-model="people[0].address" outlined
                  @change="debouncePersonLocator(0)" @keyup.enter="locateLocation(0)">
                  <template v-slot:append>
                    <v-icon :color="getLocatorIconColor(0)">
                      {{ getLocatorIcon(0) }}
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field label="Where Are you?" v-model="people[1].address" outlined
                  @change="debouncePersonLocator(1)" @keyup.enter="locateLocation(1)">
                  <template v-slot:append>
                    <v-icon :color="getLocatorIconColor(1)">
                      {{ getLocatorIcon(1) }}
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-expand-transition>
              <v-row v-if="bothLocated">
                <v-col cols="4">
                  <v-text-field type="number" id="radius" v-model="radius" outlined label="Radius" dense />
                </v-col>
                <v-col cols="4">
                  <v-select v-model="travelMethod" :items="travelOptions" label="Travel Method" outlined dense></v-select>
                </v-col>
                <v-col cols="4">
                  <v-select v-model="locationType" :items="locationOptions" label="Location Type" outlined dense />
                </v-col>
              </v-row>
            </v-expand-transition>
          </v-card-text>
        </v-card-actions>
        <v-card-actions style="display: flex; justify-content: center;">
          <v-expand-transition>
            <div v-if="start">
              <v-btn color="success" @click="findMeetingPlaces()" :disabled="!start">
                <v-icon left>mdi-arrow-right</v-icon>
                Go!
              </v-btn>
            </div>
          </v-expand-transition>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    dialogVisible: true,
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
        address: "",
        lat: 0,
        lng: 0,
        located: 'not-located'
      },
      {
        name: "Them",
        address: "",
        lat: 0,
        lng: 0,
        located: 'not-located',
      },
    ],
    radius: 5000,
    travelMethod: "DRIVING",
    travelOptions: [
      { text: 'Driving', value: 'DRIVING' },
      { text: 'Walking', value: 'WALKING' },
      { text: 'Bicycling', value: 'BICYCLING' },
      { text: 'Public Transport', value: 'TRANSIT' },
    ],
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
    locationType: "",
    directionsRenderer: null,
    resultRoute: null,
    placesPolygon: null,
    placesResults: null,
    placesMarkers: [],
    personMarkerSVG: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="25px" width="25px"><title>map-marker-check</title><path d="M12,2C15.86,2 19,5.14 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9C5,5.14 8.14,2 12,2M10.47,14L17,7.41L15.6,6L10.47,11.18L8.4,9.09L7,10.5L10.47,14Z" fill="green" /></svg>'),
  }),
  mounted() {
  },
  computed: {
    bothLocated() {
      if (this.people.every(person => person.located === 'found')) {
        return true;
      } else {
        return false;
      }
    },
    start() {
      if (this.bothLocated && this.travelMethod && this.locationType && this.radius) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    getLocatorIconColor(personIndex) {
      if (this.people[personIndex].located === 'not-located') {
        return 'grey';
      } else if (this.people[personIndex].located === 'locating') {
        return 'orange';
      } else if (this.people[personIndex].located === 'found') {
        return 'green';
      } else if (this.people[personIndex].located === 'not-found') {
        return 'red';
      }
    },
    getLocatorIcon(personIndex) {
      if (this.people[personIndex].located === 'not-located') {
        return 'mdi-map-marker-question';
      } else if (this.people[personIndex].located === 'locating') {
        return 'mdi-map-marker-question';
      } else if (this.people[personIndex].located === 'found') {
        return 'mdi-map-marker-check';
      } else if (this.people[personIndex].located === 'not-found') {
        return 'mdi-map-marker-remove';
      }
    },
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
        person.located = 'not-located';
      });
    },
    debouncePersonLocator: function (personIndex) {
      setTimeout(() => {
        this.locateLocation(personIndex);
      }, 1000);
    },
    async locateLocation(personIndex) {
      const person = this.people[personIndex];
      if (person) {
        person.located = 'locating';
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
            person.located = 'found';

            // add them to the map
            this.$refs.mapRef.$mapPromise.then((map) => {
              new google.maps.Marker({
                position: { lat: person.lat, lng: person.lng },
                map: map,
                title: person.name,
                icon: this.personMarkerSVG,
              });
            });


          } else {
            person.located = 'not-found';
            console.log("No results found");
          }
        } catch (error) {
          console.error("Error geocoding address:", error);
        }
      }
    },
    async locateAllLocations() {
      // run through the people and locate them if they're not already
      for (let i = 0; i < this.people.length; i++) {
        if (this.people[i].located === 'not-located') {
          await this.locateLocation(i);
        }
      }

      // zoom the map to them
      this.$refs.mapRef.$mapPromise.then((map) => {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: this.people[0].lat, lng: this.people[0].lng });
        bounds.extend({ lat: this.people[1].lat, lng: this.people[1].lng });
        map.fitBounds(bounds);
      });

    },
    async findMeetingPlaces() {
      try {
        // locate the people if they're not already
        await this.locateAllLocations();
        // find the routes - just take the first one for now
        await this.findRoutes();
        // calculate the midpoint of the route
        await this.calculateMidpoint();
        // show the meeting area and the locations we've found for it
        this.showMeetingArea();
        this.dialogVisible = false;
      } catch (error) {
        console.error("Error finding meeting places:", error);
      }
    },
    async findRoutes() {
      // do this in a promise, we can't find the middle until we have the route
      return new Promise((resolve, reject) => {
        // make a nw directions service
        const directionsService = new google.maps.DirectionsService();
        // make a request with the people and the travel method
        const request = {
          origin: { lat: this.people[0].lat, lng: this.people[0].lng },
          destination: { lat: this.people[1].lat, lng: this.people[1].lng },
          travelMode: this.travelMethod,
        };
        // get the route
        directionsService.route(request, (result, status) => {
          if (status == google.maps.DirectionsStatus.OK) {
            this.resultRoute = result;
            this.$refs.mapRef.$mapPromise.then((map) => {
              // get a renderer and show the route
              const directionsRenderer = new google.maps.DirectionsRenderer();
              directionsRenderer.setMap(map);
              directionsRenderer.setDirections(result);
              this.directionsRenderer = directionsRenderer;
              // tell it we're done here
              resolve(result);
            });
          } else {
            reject(new Error("Failed to find driving route"));
          }
        });
      });
    },
    async calculateMidpoint() {
      // do it in a promise as we can't find the locations without the mid point
      return new Promise((resolve) => {
        this.$refs.mapRef.$mapPromise.then((map) => {
          // get the route we're using
          const route = this.resultRoute.routes[0];
          // calculate the total duration of the route, add up each leg and step
          let totalDuration = 0;
          route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              totalDuration += step.duration.value;
            });
          });

          // find the halfway point
          const halfwayDuration = totalDuration / 2;
          let accumulatedDuration = 0;
          let midpoint;
          // run through the route again, adding up the duration until we reach the halfway point
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
            // if we're there, break
            if (midpoint) break;
          }
          // note the point
          this.crowsCentre = {
            lat: midpoint.lat(),
            lng: midpoint.lng(),
          };
          /*           new google.maps.Marker({
                      position: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
                      map: map,
                      title: "Crows Centre",
                    }); */
          // we're done, crack on
          resolve();
        });
        console.log('Calculated midpoint');
      });
    },
    showMeetingArea() {
      // show a circle around the crowsCentre using the input radius
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
        // fire up a new places service
        const service = new google.maps.places.PlacesService(map);

        // do a search using our midpoint and radius
        service.nearbySearch(
          {
            location: { lat: this.crowsCentre.lat, lng: this.crowsCentre.lng },
            radius: this.radius,
            type: [this.locationType],
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              this.placesResults = results;
              // create a marker with each of them
              for (let i = 0; i < results.length; i++) {
                this.createMarker(results[i]);
              }
            }
          }
        );
      });
    },
    createMarker(place) {
      // create a marker for the place with it's name
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
.mapSettings {
  overflow-y: hidden !important;
}
</style>