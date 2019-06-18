let initLeafMap = () => {
  window.navigator.geolocation.getCurrentPosition((handle) => {

    console.debug('mapfrommain');

    if (typeof mymap == 'undefined') {
      mymap = L.map('mapid').setView([handle.coords.latitude, handle.coords.longitude], 15);
      // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      //   maxZoom: 18,
      //   id: 'mapbox.streets'
      // }).addTo(mymap);
    }

    var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    mymap.on('click', (e)=>{
      console.debug(e);
      window.resizeClickMap();
    });
    mymap.on('dragend',(e)=>{
      console.debug(e);
      window.resizeClickMap();
    });
    mymap.on('zoomend', (e)=>{
      console.debug(e);
      window.resizeClickMap();
    });
    mymap.on('dblclick ', (e)=>{
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
    DOMcards[i].style.height = '300px';
  }
}


window.onload = initLeafMap;

