import L from "leaflet";

class MapService {
  constructor() {
    this.map = null;
    this.defaultLocation = [51.505, -0.09];
    this.defaultZoom = 13;
  }

  initLeafMap(elementId = "mapid") {
    if (this.map) {
      return this.map;
    }

    // Initialize the map
    this.map = L.map(elementId).setView(this.defaultLocation, this.defaultZoom);

    // Add default tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    return this.map;
  }

  setView(lat, lng, zoom = 16) {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
    }
  }

  addTileLayer(url, options = {}) {
    if (this.map) {
      return L.tileLayer(url, options).addTo(this.map);
    }
  }

  clearLayers() {
    if (this.map) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          this.map.removeLayer(layer);
        }
      });
    }
  }

  updateMapStyle(style) {
    if (!this.map) return;

    this.clearLayers();

    const mapStyles = {
      Simple: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        options: {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        },
      },
      Satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        options: {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        },
      },
      Detailed: {
        url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
        options: {
          maxZoom: 20,
          attribution:
            "© OpenStreetMap France | © OpenStreetMap contributors",
        },
      },
    };

    const selectedStyle = mapStyles[style] || mapStyles["Simple"];
    this.addTileLayer(selectedStyle.url, selectedStyle.options);
  }

  addMarker(lat, lng, options = {}) {
    if (this.map) {
      return L.marker([lat, lng], options).addTo(this.map);
    }
  }

  addCircle(lat, lng, radius, options = {}) {
    if (this.map) {
      return L.circle([lat, lng], radius, options).addTo(this.map);
    }
  }

  removeLayer(layer) {
    if (this.map && layer) {
      this.map.removeLayer(layer);
    }
  }

  on(event, callback) {
    if (this.map) {
      this.map.on(event, callback);
    }
  }

  locate(options = { setView: true, maxZoom: 16 }) {
    if (this.map) {
      this.map.locate(options);
    }
  }

  getMap() {
    return this.map;
  }
}

export default new MapService();
