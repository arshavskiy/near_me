function updateGpsData(gpsData) {
  if (app.latitude != gpsData.latitude && app.longitude != gpsData.longitude) {
      app.latitude = gpsData.latitude;
      app.longitude = gpsData.longitude;
  }
}


setMarkersOnMapLoad = ()=>{

  app.geoDataFull.forEach( card =>{

    let calculate  =  app._calculateDistance({
          lat: app.geoDataFull[card.id].lat,
          lon: app.geoDataFull[card.id].lon
      });

//  Vue.set(app.geoDataFull, card.id, calculate)
    app.geoDataFull[card.id].distance = calculate;

    let myIcon = L.icon({
        iconUrl: app.geoDataFull[card.id].img,
        iconSize: [45, 45],
        iconAnchor: [10, 10],
        popupAnchor: [20, -5],
    });

    L.marker([ app.geoDataFull[card.id].lat,  app.geoDataFull[card.id].lon], {
            icon: myIcon
        }).addTo(mymap)
        .bindPopup("<b>" + app.geoDataFull[card.id].title + "</b>").openPopup();
    });

  console.debug('map loaded');
};

let initLeafMap = () => {
  window.navigator.geolocation.getCurrentPosition((handle) => {

    console.debug('gps => call to map from main');

    if (typeof mymap == 'undefined') {
      mymap = L.map('mapid').setView([handle.coords.latitude, handle.coords.longitude], 15);
    }

    updateGpsData(handle.coords);

  // default map Simple 

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

   
    
    L.map.onload = setMarkersOnMapLoad();

    // var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();
    // var searchControl = L.esri.Geocoding.geosearch({
    //   providers: [
    //     arcgisOnline,
    //     L.esri.Geocoding.featureLayerProvider({
    //       url: 'https://services.arcgis.com/uCXeTVveQzP4IIcx/arcgis/rest/services/gisday/FeatureServer/0/',
    //       searchFields: ['Name', 'Organization'],
    //       label: 'GIS Day Events',
    //       bufferRadius: 5000,
    //       formatSuggestion: function(feature){
    //         return feature.properties.Name + ' - ' + feature.properties.Organization;
    //       }
    //     })
    //   ]
    // }).addTo(mymap);

    var searchControl = L.esri.Geocoding.geosearch().addTo(mymap);

    var results = L.layerGroup().addTo(mymap);

    searchControl.on('results', function(data){
      results.clearLayers();
      for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));
      }
    });
  
  
    // var searchControl = new L.esri.Controls.Geosearch().addTo(mymap);

    // var results = new L.LayerGroup().addTo(mymap);
  
    // searchControl.on('results', function(data){
    //   results.clearLayers();
    //   for (var i = data.results.length - 1; i >= 0; i--) {
    //     results.addLayer(L.marker(data.results[i].latlng));
    //   }
    // });

    

     

     mymap.on('click', (e)=>{
      console.debug(e);
      window.resizeClickMap();
    }).on('dragend',(e)=>{
      console.debug(e);
      window.resizeClickMap();
    }).on('zoomend', (e)=>{
      console.debug(e);
      window.resizeClickMap();
    }).on('dblclick ', (e)=>{
      console.debug(e);
      mymap.locate({setView : true})
    });

    window.run();
  });
};

const DOMap = document.getElementById('mapid');
const loader = document.getElementById('loader');

window.resizeClickMap = ()=> {
  DOMap.style.height = '60vh';
  if(mymap) mymap.invalidateSize();

  let DOMcards = document.getElementsByClassName('card');
  for (var i = 0; i < DOMcards.length; i++) {
    DOMcards[i].style.height = '200px';
  }
};

window.resizeClickCard = ()=>{
  if(DOMap){
    DOMap.style.height = '40vh';
    if(mymap) mymap.invalidateSize();
  }

  let DOMcards = document.getElementsByClassName('card');
  for (var i = 0; i < DOMcards.length; i++) {
    DOMcards[i].style.height = '260px';
  }
}


window.onload = initLeafMap;

