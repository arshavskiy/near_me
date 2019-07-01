"use strict";

function updateGpsData(gpsData) {
	store.commit('latitudeUpdate', gpsData.latitude);
	store.commit('longitudeUpdate',gpsData.longitude);
}

window.resizeClickMap = function () {
	if (DOMap && DOMap.style.height == '50vh') {
		DOMap.style.height = '65vh';
		if (mymap) mymap.invalidateSize();

		let DOMcards = document.getElementsByClassName('card');
		for (var i = 0; i < DOMcards.length; i++) {
			DOMcards[i].style.height = '160px';
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

function setMarkersOnMapLoad() {

	console.debug('map loaded', performance.now());

	store.getters.cardsData.forEach(card => {

		let calculate = app._calculateDistance({
			lat: store.getters.cardsData[card.id].lat,
			lon: store.getters.cardsData[card.id].lon
		});

		//  Vue.set(store.getters.cardsData, card.id, calculate)
		// store.getters.cardsData[card.id].distance = calculate; fix

		if (store.getters.cardsData[card.id].img) {
			let myIcon = L.icon({
				iconUrl: store.getters.cardsData[card.id].img,
				iconSize: [45, 45],
				iconAnchor: [10, 10],
				popupAnchor: [20, -5],
			});
			L.marker([store.getters.cardsData[card.id].lat, store.getters.cardsData[card.id].lon], {
				icon: myIcon
			}).addTo(mymap).bindPopup("<b>" + store.getters.cardsData[card.id].title + "</b>").openPopup();
		} else {
			L.marker([store.getters.cardsData[card.id].lat, store.getters.cardsData[card.id].lon]).addTo(mymap).bindPopup("<b>" + store.getters.cardsData[card.id].title + "</b>").openPopup();
		}

	});

	console.debug('markers loaded', performance.now());

};

let initLeafMap = function () {

	console.debug('onloadMap:', performance.now());

	window.navigator.geolocation.getCurrentPosition((handle) => {

		console.debug('gps => call to map from main:', performance.now());

		if (store.getters.Tlatitude != handle.coords.latitude && store.getters.Tlongitude != handle.coords.longitude) {
			updateGpsData(handle.coords);
		}

		if (typeof mymap == 'undefined') {

			window.mymap = L.map('mapid').setView([handle.coords.latitude, handle.coords.longitude], 15);
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
	});
};

const DOMap = document.getElementById('mapid');
const loader = document.getElementById('loader');



console.debug('init:', performance.now());

// window.onload = initLeafMap;
