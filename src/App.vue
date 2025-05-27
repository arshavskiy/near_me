<template>
  <main>
    <div id="loader"></div>
    <div id="mapid"></div>
    <i class="far fa-compass locationBtn" @click="locate"></i>
    <i class="fas fa-expand expendBtn" @click="expendMap"></i>

    <app-menu />
    <section class="card_holder__container">
      <div v-for="card in reversedGeoData" :key="card.id" class="card_holder">
        <card-component :card="card" />
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMapStore } from "./stores/map";
import AppMenu from "./components/AppMenu.vue";
import CardComponent from "./components/CardComponent.vue";
import MapService from "./services/MapService";
import WikiService from "./services/WikiService";

// Global filters (now as global methods since Vue 3 removed filters)
const filters = {
  reverse: (array) => array.slice().reverse(),
  capitalize: (value) => {
    if (!value) return "";
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
};

const mapStore = useMapStore();
const {
  geoDataFull,
  mapStyleSelected,
  gsradius,
  latitude,
  longitude,
  Tlatitude,
  Tlongitude,
  cardIndex,
  extract,
  language,
  lang,
  local,
  localPC,
  mapRadius,
  maps,
  toggleMenuOpen,
  geoData,
} = storeToRefs(mapStore);

const {
  locate,
  expendMap,
  toggleMenu,
  updateMapStyle,
  searchNearbyLocations,
  calculateDistance,
  updateLanguage,
  addToFavorites,
  removeFromFavorites,
} = mapStore;

const reversedGeoData = computed(() => [...geoDataFull.value].reverse());

// Watch for map style changes
watch(mapStyleSelected, (newStyle) => {
  updateMapStyle(newStyle);
});

onBeforeMount(() => {
  // Show app after Vue is initialized
  document.getElementById("app").style.display = "initial";
});

onMounted(() => {
  debugger;
  const map = MapService.initLeafMap();
  mapStore.$patch({ map });

  // Load favorites
  addFavoriteCardToMap();

  // Start location tracking
  if (window.navigator && window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(handlePosition);

    // Update position every 5 minutes
    setInterval(
      () => {
        window.navigator.geolocation.getCurrentPosition(handlePosition);
      },
      5 * 60 * 1000
    );
  }
});

// Location handling
function handlePosition(position) {
  const newLat = position.coords.latitude;
  const newLng = position.coords.longitude;

  if (latitude.value !== newLat || longitude.value !== newLng) {
    latitude.value = newLat;
    longitude.value = newLng;
    Tlatitude.value = newLat;
    Tlongitude.value = newLng;

    if (MapService.getMap()) {
      MapService.setView(newLat, newLng, 16);
      searchNearbyLocations({ lat: newLat, lng: newLng });
    }
  }
}

// Methods from app.js
const showOnMap = (e, cardName) => {
  e.stopPropagation();
  MapService.setView(cardName.lat, cardName.lon, 16);
};

const runMap = (map) => {
  const selectedMap = maps.value.find((m) => m.name === map);
  if (selectedMap) {
    updateMapStyle(selectedMap.name);
  }
};

function addFavoriteCardToMap() {
  let values = [];
  let keys = Object.keys(localStorage);
  let i = keys.length;
  let tempIndex = 0;

  while (i--) {
    let favCard = JSON.parse(localStorage.getItem(keys[i]));

    if (favCard?.title) {
      favCard.id = tempIndex++;
      localStorage.setItem(favCard.title, JSON.stringify(favCard));
      favCard.selected = true;

      values.push(favCard);
      geoDataFull.value.push(favCard);
    } else {
      if (typeof window.valuesT === "undefined" && window.defaults) {
        let defaults = window.defaults;
        let j = defaults.length;
        let tempIndext = 0;

        while (j--) {
          let defCard = defaults[j];
          defCard.id = tempIndext++;

          if (defCard.title) {
            localStorage.setItem(defCard.title, JSON.stringify(defCard));
            geoDataFull.value.push(defCard);
          }
        }
      }
    }
  }

  if (geoDataFull.value.length > 0) {
    cardIndex.value = geoDataFull.value.length;
  }
}

async function registerDataFromWiki(response) {
  const locationsData = response.data.query.geosearch;
  const geoDataMaped = geoData.value.join();

  if (locationsData.length === 1) {
    geoData.value.push(locationsData[0].title);
    const calculate = calculateDistance({
      lat: locationsData[0].lat,
      lon: locationsData[0].lon,
    });

    const newCard = {
      lat: locationsData[0].lat,
      lon: locationsData[0].lon,
      lang: lang.value,
      local: local.value,
      title: locationsData[0].title,
      id: cardIndex.value,
      distance: calculate,
    };

    geoDataFull.value[cardIndex.value] = newCard;

    const favorite = localStorage.getItem(locationsData[0].title);
    geoDataFull.value[cardIndex.value].selected = !!favorite;

    cardIndex.value++;
    await getDataOnLocations(locationsData[0].title);
  } else if (locationsData.length > 1) {
    for (const element of locationsData) {
      geoData.value.push(element.title);

      const calculate = calculateDistance({
        lat: element.lat,
        lon: element.lon,
      });

      const newCard = {
        lat: element.lat,
        lon: element.lon,
        lang: lang.value,
        local: local.value,
        title: element.title,
        id: cardIndex.value,
        distance: calculate,
      };

      geoDataFull.value[cardIndex.value] = newCard;

      const favorite = localStorage.getItem(element.title);
      geoDataFull.value[cardIndex.value].selected = !!favorite;

      cardIndex.value++;
      await getDataOnLocations(element.title);
    }
  }

  drawCircle();
  document.getElementById("loader").classList.add("hide");
}

async function getDataOnLocations(title) {
  try {
    const response = await WikiService.getDataOnLocations(title, lang.value);
    if (response.data.query) {
      const page = response.data.query.pages;
      const pageId = Object.keys(response.data.query.pages)[0];
      const dataObject = page[pageId];

      const cardIndex = geoDataFull.value.findIndex(
        (card) => card.title === title
      );
      if (cardIndex !== -1) {
        geoDataFull.value[cardIndex].extract = dataObject.extract?.replace(
          /=/g,
          ""
        );

        if (dataObject.thumbnail) {
          preloadImages(dataObject.thumbnail.source, true);
          geoDataFull.value[cardIndex].img = dataObject.thumbnail.source;

          const myIcon = L.icon({
            iconUrl: geoDataFull.value[cardIndex].img,
            iconSize: [45, 45],
            iconAnchor: [10, 10],
            popupAnchor: [20, -5],
          });

          MapService.addMarker(
            geoDataFull.value[cardIndex].lat,
            geoDataFull.value[cardIndex].lon,
            { icon: myIcon }
          )
            .bindPopup(`<b>${dataObject.title}</b>`)
            .openPopup();
        } else {
          MapService.addMarker(
            geoDataFull.value[cardIndex].lat,
            geoDataFull.value[cardIndex].lon
          )
            .bindPopup(`<b>${dataObject.title}</b>`)
            .openPopup();
        }
      }
    }
  } catch (error) {
    console.error("Error fetching location details:", error);
  }
}

function preloadImages(url, addToMap = false) {
  const img = new Image();
  img.src = url;
  if (addToMap) {
    img.onload = () => {
      // Image is loaded and can be used
    };
  }
}

function drawCircle() {
  const center = mapStore.mapClickedlatlng || [latitude.value, longitude.value];
  const circleOptions = {
    color: "#111",
    weight: 2,
    radius: gsradius.value,
    fillOpacity: 0.05,
    dashArray: "1 4 8",
  };

  MapService.clearLayers();
  MapService.addCircle(center[0], center[1], gsradius.value, circleOptions);
}
</script>

<style>
@import "vue-select/dist/vue-select.css";
@import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400,700&display=swap");
@import url("https://use.fontawesome.com/releases/v5.3.1/css/all.css");
@import "../styles/card.css";
@import "../styles/loader.css";
@import "../styles/main.css";

#app {
  display: none; /* Initially hidden, shown after Vue is initialized */
}

/* Ensure the map container takes full height */
#mapid {
  height: 100vh;
  width: 100%;
  z-index: 1;
}

/* Control positioning */
.locationBtn,
.expendBtn {
  position: fixed;
  right: 10px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.locationBtn {
  top: 10px;
}

.expendBtn {
  top: 60px;
}

/* Card container positioning */
.card_holder__container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 40vh;
  overflow-y: auto;
  z-index: 1000;
  padding: 10px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
}

.card_holder {
  flex: 0 0 auto;
  width: 300px;
}
</style>
