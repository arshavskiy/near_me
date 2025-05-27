import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vSelect from "vue-select";

// Leaflet imports
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as esri from "esri-leaflet";
import * as ELG from "esri-leaflet-geocoder";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";

// Initialize leaflet providers
import "../assets/leaflet-providers";

// Fix Leaflet's icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
});

const app = createApp(App);

// Register global components
app.component("v-select", vSelect);

// Initialize Pinia store
app.use(createPinia());

// Initialize router
app.use(router);

// Make Leaflet and ELG available globally
window.L = L;
window.ELG = ELG;
window.esri = esri;

app.mount("#app");
