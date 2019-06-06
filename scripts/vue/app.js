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
                    {language: 'Hebrew', code: 'he', local:'he_IL', localPC:'he-IL'},
                    {language: 'English', code: 'en',  local:'en_US', localPC:'en-US'},
                    {language: 'Russian', code: 'ru', local:'ru_RU', localPC:'ru-RU'},
                ],
        lang : 'en',
        local: 'en_US',
        localPC: 'en-US',

    },
    methods: {
        doSomething: function (e){
          console.table(e);
          app.lang = e.code;
          app.local = e.local;
          app.localPC = e.localPC;
        },

        stopText: function () {
            window.speechSynthesis.cancel();
        },

        readText: function (text) {

            window.speechSynthesis.cancel();

            let all = document.querySelectorAll('.card_holder__item');
            let array = [];
            let max;

            all.forEach(node => {

                const {top,right,bottom,left,width} = node.getBoundingClientRect();
                const intersection = {
                    t: bottom,
                    r: window.innerWidth - left,
                    b: window.innerHeight - top,
                    l: right
                };

                let inview = left >= (0 - width/10) && right < (window.innerWidth + width / 10);

                if (inview) {

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

                        let getVoices = () => {
                            return new Promise((resolve) => {
                                let voices = speechSynthesis.getVoices()
                                if (voices.length) {
                                    resolve(voices)
                                    return
                                }
                                speechSynthesis.onvoiceschanged = () => {
                                    voices = speechSynthesis.getVoices();
                                    resolve(voices);
                                }
                            })
                        }

                        let chooseVoice = async () => {
                            // let voices = (await getVoices()).filter((voice) => { 
                            //     voice.lang == app.local || voice.lang == app.localPC; 
                            // });
                            let voices = await getVoices();
                            let filterdVoice = [];

                            voices.forEach(voice=>{
                                if (voice.lang == app.localPC || voice.lang == app.local){
                                    filterdVoice.push(voice) 
                                }
                            })

                            return new Promise((resolve) => {
                               resolve(filterdVoice[voiceIndex]);
                            })
                        }

                        speak(node.innerText);

                    }
                }

            });


        },

        run: function () {

            if ( typeof mymap === undefined ||  typeof mymap === null) initLeafMap();

            function updateGpsData(gpsData) {
                if (app.latitude != gpsData.coords.latitude && app.longitude != gpsData.coords.longitude) {
                    app.latitude = gpsData.coords.latitude;
                    app.longitude = gpsData.coords.longitude;
                }
                return app.Tlatitude != gpsData.coords.latitude && app.Tlongitude != gpsData.coords.longitude;
            }

            function getFromWiki(mapGeo) {

                const LANGUAGE_LINK = app.lang;

                axios.get('https://' + LANGUAGE_LINK +'.wikipedia.org/w/api.php', {
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
                        console.log(response.data.query);
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

                    getDataOnLocations(locationsData[0].title);

                } else if (locationsData.length > 1) {

                    locationsData.forEach(element => {
                        //if not allready exists
                        if (!app.geoDataFull[element.title] && element.title) {
                            app.geoData.push(element.title);
                            app.geoDataFull[element.title] = {
                                'lat': element.lat,
                                'lon': element.lon,
                                'lang': app.lang,
                            };

                            getDataOnLocations(element.title);
                        }
                    });

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

                if (!mymap in window) {
                    mymap = L.map('mapid').setView([app.latitude, app.longitude], 13);
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

                const LANGUAGE_LINK = app.lang;

                axios.get('https://' + LANGUAGE_LINK +'.wikipedia.org/w/api.php', {
                        params: {
                            action: 'query',
                            titles: title,
                            prop: 'extracts|info|images|categories|pageimages',
                            inprop: 'url|talkid',
                            explaintext: 1,
                            pithumbsize: 110,
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
