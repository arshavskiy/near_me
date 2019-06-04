Vue.component('v-select', VueSelect.VueSelect)

let app = new Vue({
    el: '#app-5',
    data: {
        message: 'Hello Vue.js!',
        Tlatitude: 0,
        Tlongitude: 0,
        latitude: 0,
        longitude: 0,
        geoData: [],
        extract: [],
        geoDataFull: {},
        options:  [
                    {language: 'Hebrew', code: 'he', local:'he-IL'},
                    {language: 'English', code: 'en',  local:'en-GB'},
                    {language: 'Russian', code: 'ru', local:'ru-RU'},
                ],
        lang : 'en',
        local: 'en-US'
    },
    methods: {
        doSomething: function (e){
          console.log(e); 
          app.lang = e.code;
          app.local = e.local; 
        },
        stopText: function () {
            window.speechSynthesis.cancel();
        },

        readText: function (text) {

            let all = document.querySelectorAll('.card_holder__item');
            let array = [];
            let max;

            all.forEach(node => {

                const {top,right,bottom,left,width,height} = node.getBoundingClientRect();
                const intersection = {
                    t: bottom,
                    r: window.innerWidth - left,
                    b: window.innerHeight - top,
                    l: right
                };

                let inview = left >= 0 && right < (window.innerWidth + width / 10);

                if (inview) {

                    if ('speechSynthesis' in window) {
                            // window.speechSynthesis.onvoiceschanged = function() {
                            let sayit = new SpeechSynthesisUtterance(node.innerText);

                            if (window.speechSynthesis.speaking) {
                                window.speechSynthesis.cancel();
                            }
                                
                            sayit.lang = app.local;
                            window.speechSynthesis.speak(sayit);
                            // };
                    }
                }

            });


        },

        run: function () {

            function updateGpsData(gpsData) {
                if (app.latitude != gpsData.coords.latitude && app.longitude != gpsData.coords.longitude) {
                    app.latitude = gpsData.coords.latitude;
                    app.longitude = gpsData.coords.longitude;
                }
                return app.Tlatitude != gpsData.coords.latitude && app.Tlongitude != gpsData.coords.longitude;
            }

            function getFromWiki(mapGeo) {


                axios.get(`https:/${app.lang}.wikipedia.org/w/api.php`, {
                        params: {
                            // headers: {
                            //   'Origin': 'https://5a6b54b1.ngrok.io/',
                            //   'Content-Type':'application/json; charset=UTF-8'
                            //   },
                            action: 'query',
                            list: 'geosearch',
                            gsradius: 1000,
                            gscoord: mapGeo ? mapGeo.lat + '|' + mapGeo.lng : app.latitude + '|' + app.longitude,
                            format: 'json',
                            origin: '*',
                        }
                    })
                    .then(function (response) {
                        console.log('respons: ', response.data.query);
                        registerDataFromWiki(response);
                    })
                    .catch(function (error) {
                        console.error(error);
                    })
                    .then(function () {
                        // always executed
                    });
            }

            function registerDataFromWiki(response) {
                let locationsData = response.data.query.geosearch;

                if (locationsData.length === 1) {
                    app.geoData.push(locationsData[0].title);
                    app.geoDataFull[locationsData[0].title] = {
                        'lat': locationsData[0].lat,
                        'lon': locationsData[0].lon,
                        'lang': app.lang,
                    };

                } else if (locationsData.length > 1) {

                    locationsData.forEach(element => {
                        //if not allready exists 
                        if (!app.geoDataFull[element.title]) {
                            app.geoData.push(element.title);
                            app.geoDataFull[element.title] = {
                                'lat': element.lat,
                                'lon': element.lon,
                                'lang': app.lang,
                            };

                            getDataOnLocations(element.title);
                        }
                    });

                }
                console.log('app.geoData: ', app.geoDataFull);
                // getDataOnLocations();
            }

            function handle(gpsData) {
                let shouldUpdate = updateGpsData(gpsData);

                app.Tlatitude = app.latitude;
                app.Tlongitude = app.longitude;

                if (shouldUpdate) {
                    let mapGeo;
                    getFromWiki();
                    InitMap();
                }

            }

            function InitMap() {

                if (!mymap in window) {
                    mymap = L.map('mapid').setView([app.latitude, app.longitude], 15);
                    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                        maxZoom: 18,
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        id: 'mapbox.streets'
                    }).addTo(mymap);
                }

                L.marker([app.latitude, app.longitude]).addTo(mymap)
                    .bindPopup("<b>Hello world!</b><br />You Are here!").openPopup();

                var popup = L.popup();

                function onMapClick(e) {
                    getFromWiki(e.latlng);
                    popup
                        .setLatLng(e.latlng)
                    // .setContent("You clicked the map at " + e.latlng.toString())
                    // .openOn(mymap);
                }

                mymap.on('click', onMapClick);
            }

            function getDataOnLocations(title) {

                axios.get(`https://${app.lang}.wikipedia.org/w/api.php`, {
                        params: {
                            action: 'query',
                            titles: title,
                            prop: 'extracts|info|images|categories|pageimages',
                            inprop: 'url|talkid',
                            explaintext: 1,
                            pithumbsize: 100,
                            format: 'json',
                            origin: '*',
                        }
                    })
                    .then(function (response) {
                        if (response.data.query) {
                            console.log('respons: ', response.data.query.pages);
                            let page = response.data.query.pages;
                            let pageId = Object.keys(response.data.query.pages)[0];
                            let dataObject = page[pageId];
                            let url = dataObject.fullurl;

                            app.geoDataFull[dataObject.title].extract = dataObject.extract;

                            if (dataObject.thumbnail) {
                                app.geoDataFull[dataObject.title].img = dataObject.thumbnail.source;

                                let myIcon = L.icon({
                                    iconUrl: app.geoDataFull[dataObject.title].img,
                                    iconSize: [50, 50],
                                    iconAnchor: [10, 10],
                                    popupAnchor: [20, -5],
                                });

                                L.marker([app.geoDataFull[dataObject.title].lat, app.geoDataFull[dataObject.title].lon], {
                                        icon: myIcon
                                    }).addTo(mymap)
                                    .bindPopup("<b>" + dataObject.title + "</b>").openPopup();

                            } else {
                                L.marker([app.geoDataFull[dataObject.title].lat, app.geoDataFull[dataObject.title].lon]).addTo(mymap)
                                    .bindPopup("<b>" + dataObject.title + "</b>").openPopup();
                            }



                            app.extract.push(page[pageId].extract);
                        }

                        // axios.get(url,{
                        //   params: {
                        //     'origin': '*',
                        //     'Access-Control-Allow-Origin':'*'
                        //   }
                        // }).then((html)=>{
                        //   console.log('html: ', html);
                        // })

                        // let content = page[pageId].revisions[0].slots.main['*'];

                    })
                    .catch(function (error) {
                        console.error(error);
                    })
                    .then(function () {
                        // always executed
                    });
            }

            if (window.navigator && window.navigator.geolocation) {
                window.navigator.geolocation.getCurrentPosition(handle);


                setInterval(() => {
                    navigator.geolocation.getCurrentPosition(handle);
                }, 30000);
            }
        },





    },


});