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

    mymap.on('click', function (e) {

      DOMap.style.height = '60vh';
      mymap.invalidateSize();

      let DOMcards = document.getElementsByClassName('card');
      for (var i = 0; i < DOMcards.length; i++) {
        DOMcards[i].style.height = '200px';
      }

      console.debug(e);
    });

    mymap.on('dragstart',function (e) {

      DOMap.style.height = '60vh';
      mymap.invalidateSize();

      let DOMcards = document.getElementsByClassName('card');
      for (var i = 0; i < DOMcards.length; i++) {
        DOMcards[i].style.height = '200px';
      }

      console.debug(e);
    });



    window.run();
  });
};

const DOMap = document.getElementById('mapid');

window.onload = initLeafMap;

window.mobilecheck = () => {
  if (navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  } else {
    return false;
  }
}

window.inview = () => {
  let all = document.querySelectorAll('.class');
  let array = [];
  let max;

  all.forEach(node => {

    const {
      top,
      right,
      bottom,
      left,
      width
    } = node.getBoundingClientRect();
    const intersection = {
      t: bottom,
      r: window.innerWidth - left,
      b: window.innerHeight - top,
      l: right
    };

    let inview = left >= (0 - width / 10) && right < (window.innerWidth + width / 10);
  });
}