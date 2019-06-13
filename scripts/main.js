let initLeafMap = () => {
  window.navigator.geolocation.getCurrentPosition((handle) => {

    console.debug('mapfrommain');

    if (typeof mymap == 'undefined') {
      mymap = L.map('mapid').setView([handle.coords.latitude, handle.coords.longitude], 15);
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        id: 'mapbox.streets'
      }).addTo(mymap);
    }

    mymap.on('click', window.resizeClickMap);
    mymap.on('dragstart', window.resizeClickMap);
    mymap.on('zoom', window.resizeClickMap);

    window.run();
  });
};

const DOMap = document.getElementById('mapid');
const loader = document.getElementById('loader');

window.resizeClickMap = ()=> {
  DOMap.style.height = '60vh';
  mymap.invalidateSize();

  let DOMcards = document.getElementsByClassName('card');
  for (var i = 0; i < DOMcards.length; i++) {
    DOMcards[i].style.height = '200px';
  }
};

window.resizeClickCard = ()=>{
  DOMap.style.height = '40vh';
  mymap.invalidateSize();

  let DOMcards = document.getElementsByClassName('card');
  for (var i = 0; i < DOMcards.length; i++) {
    DOMcards[i].style.height = '300px';
  }
}


window.onload = initLeafMap;

