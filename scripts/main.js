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

    var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

   
    
    L.map.onload = setMarkersOnMapLoad();

    let searchControl = new L.esri.Controls.Geosearch().addTo(map);
    let results = new L.LayerGroup().addTo(map);
  
    searchControl.on('results', function(data){
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));
      }
    });

    

     

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

