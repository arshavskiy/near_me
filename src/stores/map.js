import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import WikiService from "../services/WikiService";
import MapService from "../services/MapService";

export const useMapStore = defineStore("map", () => {
  // State
  const map = ref(null);
  const geoDataFull = ref([]);
  const mapStyleSelected = ref("Simple");
  const gsradius = ref(1000);
  const toggleMenuOpen = ref(false);
  const currentLocation = ref(null);
  const latitude = ref(0);
  const longitude = ref(0);
  const Tlatitude = ref(0);
  const Tlongitude = ref(0);
  const cardIndex = ref(0);
  const extract = ref([]);
  const language = ref("English");
  const lang = ref("en");
  const local = ref("en_US");
  const localPC = ref("en-US");
  const mapClickedlatlng = ref(null);

  // Language options
  const languageOptions = [
    {
      language: "עברית",
      code: "he",
      local: "he_IL",
      localPC: "he-IL",
    },
    {
      language: "English",
      code: "en",
      local: "en_US",
      localPC: "en-US",
    },
    {
      language: "Русский",
      code: "ru",
      local: "ru_RU",
      localPC: "ru-RU",
    },
  ];

  // Map styles
  const maps = [
    {
      name: "Simple",
      provider: "OpenStreetMap.Mapnik",
    },
    {
      name: "Satellite",
      provider: "Esri.WorldImagery",
    },
    {
      name: "Detailed",
      provider: "OpenStreetMap.France",
    },
  ];

  const mapRadius = [500, 1000, 1500, 2000, 2500, 3000];

  // Actions
  function initMap() {
    if (!map.value) {
      map.value = L.map("mapid").setView([51.505, -0.09], 13);
      // updateMapStyle(mapStyleSelected.value);
      setupMapEvents();
      loadFavorites();
      startLocationTracking();
    }
  }

  function setupMapEvents() {
    MapService.on("click", onMapClick);
    MapService.on("locationfound", onLocationFound);
    MapService.on("locationerror", onLocationError);
  }

  async function onMapClick(e) {
    mapClickedlatlng.value = e.latlng;
    latitude.value = e.latlng.lat;
    longitude.value = e.latlng.lng;

    try {
      const response = await WikiService.getFromWiki(
        e.latlng,
        lang.value,
        gsradius.value
      );
      await processWikiResponse(response);
      drawCircle();
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
    }
  }

  function onLocationFound(e) {
    latitude.value = e.latlng.lat;
    longitude.value = e.latlng.lng;
    currentLocation.value = e.latlng;

    const radius = e.accuracy / 2;
    const locationIcon = L.icon({
      iconUrl: "/assets/location.png",
      iconSize: [40, 40],
      iconAnchor: [25, -20],
    });

    L.marker(e.latlng, { icon: locationIcon })
      .addTo(map.value)
      .bindPopup("You are within " + radius + " meters from this point")
      .openPopup();

    L.circle(e.latlng, radius).addTo(map.value);

    searchNearbyLocations(e.latlng);
  }

  function onLocationError(e) {
    console.error("Error finding location:", e.message);
  }

  function startLocationTracking() {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position) => handlePosition(position),
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );

      // Update position every 5 minutes
      setInterval(
        () => {
          window.navigator.geolocation.getCurrentPosition(
            (position) => handlePosition(position),
            (error) => console.error("Geolocation error:", error),
            { enableHighAccuracy: true }
          );
        },
        5 * 60 * 1000
      );
    }
  }

  function handlePosition(position) {
    const newLat = position.coords.latitude;
    const newLng = position.coords.longitude;

    if (latitude.value !== newLat || longitude.value !== newLng) {
      latitude.value = newLat;
      longitude.value = newLng;
      Tlatitude.value = newLat;
      Tlongitude.value = newLng;

      if (map.value) {
        map.value.setView([newLat, newLng], 16);
        searchNearbyLocations({ lat: newLat, lng: newLng });
      }
    }
  }

  async function searchNearbyLocations(latlng) {
    try {
      const response = await WikiService.getFromWiki(
        latlng,
        lang.value,
        gsradius.value
      );
      await processWikiResponse(response);
      drawCircle();
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
    }
  }

  async function processWikiResponse(response) {
    const locationsData = response.data.query.geosearch;

    for (const location of locationsData) {
      const distance = calculateDistance({
        lat: location.lat,
        lng: location.lon,
      });

      const newLocation = {
        lat: location.lat,
        lon: location.lon,
        lang: lang.value,
        local: local.value,
        title: location.title,
        id: cardIndex.value,
        distance: distance,
        selected: !!localStorage.getItem(location.title),
      };

      geoDataFull.value.push(newLocation);
      cardIndex.value++;

      // Fetch additional data for the location
      await getLocationDetails(location.title);
    }
  }

  async function getLocationDetails(title) {
    try {
      const response = await WikiService.getDataOnLocations(title, lang.value);
      if (response.data.query) {
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const data = pages[pageId];

        const locationIndex = geoDataFull.value.findIndex(
          (item) => item.title === title
        );
        if (locationIndex !== -1) {
          geoDataFull.value[locationIndex].extract = data.extract?.replace(
            /=/g,
            ""
          );

          if (data.thumbnail) {
            geoDataFull.value[locationIndex].img = data.thumbnail.source;
            addMarkerWithImage(geoDataFull.value[locationIndex], data);
          } else {
            addMarker(geoDataFull.value[locationIndex], data);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  }

  function addMarkerWithImage(location, data) {
    const myIcon = L.icon({
      iconUrl: location.img,
      iconSize: [45, 45],
      iconAnchor: [10, 10],
      popupAnchor: [20, -5],
    });

    MapService.addMarker(location.lat, location.lon, {
      icon: myIcon,
    }).bindPopup(`<b>${data.title}</b>`);
  }

  function addMarker(location, data) {
    MapService.addMarker(location.lat, location.lon).bindPopup(
      `<b>${data.title}</b>`
    );
  }

  function updateMapStyle(style) {
    MapService.updateMapStyle(style);
  }

  function locate() {
    MapService.locate();
  }

  function expendMap() {
    document.documentElement.requestFullscreen();
  }

  function toggleMenu() {
    toggleMenuOpen.value = !toggleMenuOpen.value;
  }

  function drawCircle() {
    const center = mapClickedlatlng.value || [latitude.value, longitude.value];
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

  function loadFavorites() {
    try {
      const keys = Object.keys(localStorage);
      const favorites = keys
        .map((key) => {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            return item.title ? { ...item, selected: true } : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (favorites.length > 0) {
        geoDataFull.value.push(...favorites);
        cardIndex.value = Math.max(...favorites.map((f) => f.id)) + 1;

        // Add markers for favorites
        favorites.forEach(async (favorite) => {
          await getLocationDetails(favorite.title);
        });
      } else if (window.defaults) {
        const defaults = window.defaults.map((item, index) => ({
          ...item,
          id: index,
          selected: true,
        }));

        defaults.forEach((item) => {
          if (item.title) {
            localStorage.setItem(item.title, JSON.stringify(item));
          }
        });

        geoDataFull.value.push(...defaults);
        cardIndex.value = defaults.length;

        // Add markers for defaults
        defaults.forEach(async (defaultItem) => {
          await getLocationDetails(defaultItem.title);
        });
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }

  function addToFavorites(place) {
    const index = geoDataFull.value.findIndex((p) => p.id === place.id);
    if (index !== -1) {
      geoDataFull.value[index].selected = true;
      localStorage.setItem(
        place.title,
        JSON.stringify(geoDataFull.value[index])
      );
    }
  }

  function removeFromFavorites(place) {
    const index = geoDataFull.value.findIndex((p) => p.id === place.id);
    if (index !== -1) {
      geoDataFull.value[index].selected = false;
      localStorage.removeItem(place.title);
    }
  }

  function calculateDistance(point) {
    if (map.value && latitude.value && longitude.value) {
      return map.value.distance(
        { lat: latitude.value, lng: longitude.value },
        point
      );
    }
    return 0;
  }

  function updateLanguage(newLang) {
    language.value = newLang.language;
    lang.value = newLang.code;
    local.value = newLang.local;
    localPC.value = newLang.localPC;

    // Refresh locations with new language
    if (mapClickedlatlng.value) {
      searchNearbyLocations(mapClickedlatlng.value);
    } else if (currentLocation.value) {
      searchNearbyLocations(currentLocation.value);
    }
  }

  return {
    // State
    map,
    geoDataFull,
    mapStyleSelected,
    gsradius,
    toggleMenuOpen,
    currentLocation,
    latitude,
    longitude,
    Tlatitude,
    Tlongitude,
    maps,
    mapRadius,
    extract,
    language,
    languageOptions,
    lang,
    local,
    localPC,

    // Actions
    initMap,
    updateMapStyle,
    locate,
    expendMap,
    toggleMenu,
    searchNearbyLocations,
    addToFavorites,
    removeFromFavorites,
    calculateDistance,
    updateLanguage,
  };
});
