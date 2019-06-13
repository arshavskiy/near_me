Vue.component('v-select', VueSelect.VueSelect);

let app = new Vue({
    el: '#app-5',
    data() {
        return {
            message: 'Hello Vue.js!',
            Tlatitude: 0,
            Tlongitude: 0,
            latitude: 0,
            longitude: 0,
            geoData: [],
            extract: [],
            geoDataFull: {},
            voices: [],
            options: [{
                    language: 'עברית',
                    code: 'he',
                    local: 'he_IL',
                    localPC: 'he-IL'
                },
                {
                    language: 'English',
                    code: 'en',
                    local: 'en_US',
                    localPC: 'en-US'
                },
                {
                    language: 'Русский',
                    code: 'ru',
                    local: 'ru_RU',
                    localPC: 'ru-RU'
                },
            ],
            lang: 'en',
            local: 'en_US',
            localPC: 'en-US',
            reading: false
        }

    },

    created() {
        console.log('created called.');
        initLeafMap();
       
    },

    filters: {
        reverse: function (value) {
            return value.reverse();
        }
    },

    methods: {
        onLanguageUpdate: function (e) {
            console.table(e);
            app.lang = e.code;
            app.local = e.local;
            app.localPC = e.localPC;
            //   app.geoData = [], app.geoDataFull = {};
            run();
        },

        stopText: function () {
            window.speechSynthesis.cancel();
            app.reading = false;
        },

        readText: function (textNode) {

            window.speechSynthesis.cancel();

            let array = [];
            let max;

            let text = textNode.extract;
            let local = textNode.local;;

            if ('speechSynthesis' in window) {
                const voiceIndex = 0;

                const speak = async (text) => {
                    if (!speechSynthesis) {
                        return
                    }
                    let message = new SpeechSynthesisUtterance(text);
                    message.voice = await chooseVoice();
                    message.lang = message.voice.lang;
                    speechSynthesis.speak(message);
                    console.table(message);
                }

                let voices = app.voices;

                let getVoices = () => {
                    return new Promise((resolve) => {
                        voices = app.voices = speechSynthesis.getVoices()
                        if (voices.length) {
                            resolve(voices);
                            
                            return 
                        }
                        if (speechSynthesis.onvoiceschanged !== undefined) {
                            // Chrome gets the voices asynchronously so this is needed
                            speechSynthesis.onvoiceschanged = () => {
                                voices = app.voices = speechSynthesis.getVoices();
                                resolve(voices);
                            }
                        } else {
                            speechSynthesis.onvoiceschanged = () => {
                                voices = app.voices = speechSynthesis.getVoices();
                                resolve(voices);
                            }
                        }
                    })
                }

                let chooseVoice = async () => {
                    // let voices = (await getVoices()).filter((voice) => { 
                    //     voice.lang == app.local || voice.lang == app.localPC; 
                    // });
                    if (voices.length === 0) {
                        voices = await getVoices();
                    } else {
                        voices = app.voices;
                    }

                    let filterdVoice = [];

                    voices.forEach(voice => {
                        if (voice.lang == app.localPC || voice.lang == local) {
                            filterdVoice.push(voice);
                        }
                    })

                    return new Promise((resolve) => {
                        resolve(filterdVoice[voiceIndex]);
                    })
                }

                speak(text);
                app.reading = true;
                return;

            }

        },

        resize: window.resizeClickCard,

        showOnMap: (e, cardName)=>{
            console.debug(e, cardName);
            e.stopPropagation();
            // if ( e.target.className.includes('fa-map-marked-alt') ) {
                mymap.setView([app.geoDataFull[cardName].lat , app.geoDataFull[cardName].lon], 16, {
                    "animate": true,
                   });
            // }
           
        },

        run: window.run = function () {

            if (typeof mymap == 'undefined' || typeof mymap == 'null') initLeafMap();

            function updateGpsData(gpsData) {
                if (app.latitude != gpsData.coords.latitude && app.longitude != gpsData.coords.longitude) {
                    app.latitude = gpsData.coords.latitude;
                    app.longitude = gpsData.coords.longitude;
                }
                return app.Tlatitude != gpsData.coords.latitude && app.Tlongitude != gpsData.coords.longitude;
            }

            function getFromWiki(mapGeo) {

                const LANGUAGE_LINK = app.lang;

                axios.get('https://' + LANGUAGE_LINK + '.wikipedia.org/w/api.php', {
                        params: {
                            // headers: {
                            //   'Origin': 'https://5a6b54b1.ngrok.io/',
                            //   'Content-Type':'application/json; charset=UTF-8'
                            //   },
                            action: 'query',
                            list: 'geosearch',
                            gsradius: 2000,
                            gscoord: mapGeo ? mapGeo.lat + '|' + mapGeo.lng : app.latitude + '|' + app.longitude,
                            format: 'json',
                            origin: '*',
                        }
                    })
                    .then(function (response) {
                        console.debug(response.data.query);
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
                    app.geoData.unshift(locationsData[0].title);
                    app.geoDataFull[locationsData[0].title] = {
                        'lat': locationsData[0].lat,
                        'lon': locationsData[0].lon,
                        'lang': app.lang,
                        'local': app.local,
                        'title': locationsData[0].title
                    };

                    getDataOnLocations(locationsData[0].title);

                } else if (locationsData.length > 1) {

                    locationsData.forEach(element => {
                        //if not allready exists
                        if (!app.geoDataFull[element.title] && element.title) {
                            app.geoData.unshift(element.title);
                            app.geoDataFull[element.title] = {
                                'lat': element.lat,
                                'lon': element.lon,
                                'lang': app.lang,
                                'local': app.local,
                                'title': element.title
                            };

                            getDataOnLocations(element.title);
                        }
                    });

                    loader.classList.add("hide");

                } else {

                }
                console.table('app.geoData: ', app.geoDataFull);
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
                if (typeof mymap == 'undefined') {

                    console.debug('mapfromapp');
                    
                    mymap = L.map('mapid').setView([app.latitude, app.longitude], 15);
                    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                        maxZoom: 18,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        id: 'mapbox.streets'
                    }).addTo(mymap);
                }

                const locationIcon = L.icon({
                    iconUrl: './assets/location.png',
                    iconSize: [60, 60],
                    iconAnchor: [25, -20],
                });

                L.marker([app.latitude, app.longitude],{icon:locationIcon}).addTo(mymap)
                    .bindPopup("You Are here!").openPopup();

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

                const LANGUAGE_LINK = app.lang;

                axios.get('https://' + LANGUAGE_LINK + '.wikipedia.org/w/api.php', {
                        params: {
                            action: 'query',
                            titles: title,
                            prop: 'extracts|info|images|categories|pageimages',
                            inprop: 'url|talkid',
                            explaintext: 1,
                            pithumbsize: 300,
                            format: 'json',
                            origin: '*',
                        }
                    })
                    .then(function (response) {
                        if (response.data.query) {
                            console.table('respons: ', response.data.query.pages);
                            let page = response.data.query.pages;
                            let pageId = Object.keys(response.data.query.pages)[0];
                            let dataObject = page[pageId];
                            let url = dataObject.fullurl;

                            app.geoDataFull[dataObject.title].extract = dataObject.extract;

                            if (dataObject.thumbnail) {
                                app.geoDataFull[dataObject.title].img = dataObject.thumbnail.source;

                                let myIcon = L.icon({
                                    iconUrl: app.geoDataFull[dataObject.title].img,
                                    iconSize: [40, 40],
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

                            app.extract.unshift(page[pageId].extract);
                            // app.extract = app.extract.reverse();
                        }

                        // axios.get(url,{
                        //   params: {
                        //     'origin': '*',
                        //     'Access-Control-Allow-Origin':'*'
                        //   }
                        // }).then((html)=>{
                        //   console.table('html: ', html);
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


                // setInterval(() => {
                //     navigator.geolocation.getCurrentPosition(handle);
                // }, 30000);
            }
        },





    },


});