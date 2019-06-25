function updateGpsData(gpsData) {
	if (app.latitude != gpsData.latitude && app.longitude != gpsData.longitude) {
		app.latitude = gpsData.latitude;
		app.longitude = gpsData.longitude;
	}
}


setMarkersOnMapLoad = () => {

	console.debug('map loaded', performance.now());

	app.geoDataFull.forEach(card => {

		let calculate = app._calculateDistance({
			lat: app.geoDataFull[card.id].lat,
			lon: app.geoDataFull[card.id].lon
		});

		//  Vue.set(app.geoDataFull, card.id, calculate)
		app.geoDataFull[card.id].distance = calculate;

		if (app.geoDataFull[card.id].img) {
			let myIcon = L.icon({
				iconUrl: app.geoDataFull[card.id].img,
				iconSize: [45, 45],
				iconAnchor: [10, 10],
				popupAnchor: [20, -5],
			});
			L.marker([app.geoDataFull[card.id].lat, app.geoDataFull[card.id].lon], {
				icon: myIcon
			}).addTo(mymap).bindPopup("<b>" + app.geoDataFull[card.id].title + "</b>").openPopup();
		} else {
			L.marker([app.geoDataFull[card.id].lat, app.geoDataFull[card.id].lon]).addTo(mymap).bindPopup("<b>" + app.geoDataFull[card.id].title + "</b>").openPopup();
		}

	});

};

let initLeafMap = () => {

	console.debug('onloadMap:', performance.now());

	window.navigator.geolocation.getCurrentPosition((handle) => {

		console.debug('gps => call to map from main:', performance.now());

		if (typeof mymap == 'undefined') {

			mymap = L.map('mapid').setView([handle.coords.latitude, handle.coords.longitude], 15);
			L.map.onload = setMarkersOnMapLoad();

			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(mymap);

			let searchControl = L.esri.Geocoding.geosearch().addTo(mymap);
			let results = L.layerGroup().addTo(mymap);

			searchControl.on('results', function (data) {
				results.clearLayers();
				for (var i = data.results.length - 1; i >= 0; i--) {
					results.addLayer(L.marker(data.results[i].latlng));
				}
			});

		} else {
			mymap.setView([handle.coords.latitude, handle.coords.longitude], 15);
		}

		if (app.Tlatitude != handle.coords.latitude && app.Tlongitude != handle.coords.longitude) {
			updateGpsData(handle.coords);
		}

		mymap.on('click', (e) => {
			console.debug(e);
			window.resizeClickMap();
		}).on('dragend', (e) => {
			console.debug(e);
			window.resizeClickMap();
		}).on('zoomend', (e) => {
			console.debug(e);
			window.resizeClickMap();
		}).on('dblclick ', (e) => {
			console.debug(e);
			mymap.locate({
				setView: true
			})
		});

		window.run();
	});
};

const DOMap = document.getElementById('mapid');
const loader = document.getElementById('loader');

window.resizeClickMap = () => {
	DOMap.style.height = '65vh';
	if (mymap) mymap.invalidateSize();

	let DOMcards = document.getElementsByClassName('card');
	for (var i = 0; i < DOMcards.length; i++) {
		DOMcards[i].style.height = '200px';
	}
};

window.resizeClickCard = () => {
	if (DOMap) {
		DOMap.style.height = '50vh';
		if (mymap) mymap.invalidateSize();
	}

	let DOMcards = document.getElementsByClassName('card');
	for (var i = 0; i < DOMcards.length; i++) {
		DOMcards[i].style.height = '260px';
	}
}

console.debug('init:', performance.now());

window.onload = initLeafMap;