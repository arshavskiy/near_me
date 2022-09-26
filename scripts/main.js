"use strict";

window.markers = [];


function updateGpsData(gpsData) {
	if (app.latitude != gpsData.latitude && app.longitude != gpsData.longitude) {
		app.latitude = gpsData.latitude || 59.9319;
		app.longitude = gpsData.longitude || 30.3049;
	}
}


function setMarkersOnMapLoad() {
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

	mymap.setView([app.latitude || 59.9319, app.longitude || 30.3049], 15);
};

let initLeafMap = function () {
	console.debug('onloadMap:', performance.now());

	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};

	function error(error) {
		console.debug('gps error', error.message, performance.now());
		window.mymap = L.map('mapid').setView([59.9319, 30.3049], 10);

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

		loader.classList.add("hide");
	}

	function success(handle) {
		console.debug('gps => call to map from main:', performance.now());
		if (app.Tlatitude != handle.coords.latitude && app.Tlongitude != handle.coords.longitude) {
			updateGpsData(handle.coords);
		}

		if (typeof mymap == 'undefined') {

			window.mymap = L.map('mapid').setView([handle.coords.latitude, handle.coords.longitude], 15);

			L.map.onload = setMarkersOnMapLoad();

			// L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			// 	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			// }).addTo(mymap);

			L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
				maxZoom: 20,
				// attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
			mymap.setView([handle.coords.latitude, handle.coords.longitude], 18);
		}



		mymap.on('click', function (e) {
			console.debug(e);
			window.resizeClickMap();
		}).on('dragend', function (e) {
			console.debug(e);
			window.resizeClickMap();
		}).on('zoomend', function (e) {
			console.debug(e);
			window.resizeClickMap();
		}).on('dblclick ', function (e) {
			console.debug(e);
			mymap.locate({
				setView: true
			});
		});


		

		window.run();
	};

	navigator.geolocation.getCurrentPosition(success, error, options);
};

const DOMap = document.getElementById('mapid');
const loader = document.getElementById('loader');

window.resizeClickMap = function () {
	if (DOMap && DOMap.style.height == '50vh') {
		DOMap.style.height = '65vh';
		if (mymap) mymap.invalidateSize();

		let DOMcards = document.getElementsByClassName('card');
		for (var i = 0; i < DOMcards.length; i++) {
			DOMcards[i].style.height = '200px';
		}
	}
};

window.resizeClickCard = function () {
	if (DOMap && DOMap.style.height != '50vh') {
		DOMap.style.height = '50vh';
		if (mymap) mymap.invalidateSize();

		let DOMcards = document.getElementsByClassName('card');
		for (var i = 0; i < DOMcards.length; i++) {
			DOMcards[i].style.height = '260px';
		}
	}
};

console.debug('init:', window.performance.now());

// window.onload = initLeafMap;