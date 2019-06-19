Vue.component('v-select', VueSelect.VueSelect);


Vue.prototype.filters = {
    reverse: function (array) {
        return array.slice.reverse();
    },

    capitalize: function (value) {
        if (!value) return '';
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
};



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
        cardIndex: 0,
        geoDataFull: [],
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
        mapRadius: [500,1000,1500,2000,2500,3000],
        gsradius: 1000,
        reading: false,
        selected: cardTitle => localStorage.getItem(cardTitle),
        toggleMenuOpen : false,
        maps: [
            {name:'Simple', value: ()=>{
                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}')
                .addTo(mymap);
            }},
            {name:'Map',value: ()=>{
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mymap);
            }},
            {name:'Satellite',value: ()=>{
                var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    // attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }).addTo(mymap);
            }},
            {name:'Detailed',value: ()=>{
                var OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
                maxZoom: 20,
                // attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mymap);
            }},
        ],
        mapStyle: ['Simple', 'Bicycle'],
        mapStyleSelected:'Detailed'
    },

    mounted: function () {
        this.$nextTick(function () {
          // Code that will run only after the`
          // entire view has been rendered

          console.debug('app.geoDataFull', app.geoDataFull );

          var values = [],
          keys = Object.keys(localStorage),
          i = keys.length;
  
            while ( i-- ) {
                let favCard =  JSON.parse(localStorage.getItem(keys[i]));
                favCard.selected = true;
                values.push( favCard );
                app.geoDataFull.push( favCard );
            }

            if ( app.geoDataFull.length > 0 ){
                app.cardIndex = app.geoDataFull.length-1;
            }
  
        });
      },


    created() {
        console.log('created called.');
        // initLeafMap();
        document.getElementById('app-5').style.display = 'initial';
    },

    watch: { 
        mapStyleSelected: function(data) { 
            app.maps.forEach(item=>{
                if (item.name === data){
                    item.value();
                }
            });
            // app.maps[data].value();
        }
    },

    methods: {
        locate: ()=>{
            mymap.setView([app.latitude, app.longitude], 15);
        },
        runMap: (map)=>{
            app.maps[map].value();
        },

        toggleMenu :()=>{
            app.toggleMenuOpen = !app.toggleMenuOpen;
        },

        expendMap: window.resizeClickMap,
        
        adFavorite: function(card, e){
           
            localStorage.setItem(card.title, JSON.stringify(app.geoDataFull[card.id]));
            // app.geoDataFull[card.id].selected = true;
            // Vue.set(app.geoDataFull[card.id], 'selected', true);
            card.selected = !card.selected;
        },

        removeFavorite: function(card, e){
          
            localStorage.removeItem(card.title);
            // app.geoDataFull[card.id].selected = false;
            // Vue.set(app.geoDataFull[card.id], 'selected', false);
            card.selected = !card.selected;
        },

        onLanguageUpdate: function (e) {

            if (e && e.code){
                app.lang = e.code;
                app.local = e.local;
                app.localPC = e.localPC;
                window.run();
            }
            //   app.geoData = [], app.geoDataFull = {};
           
        },

        stopText: function () {
            window.speechSynthesis.cancel();
            app.reading = false;
        },

        readText: function (textNode) {

            window.speechSynthesis.cancel();

            let text = textNode.extract;
            let local = textNode.local;

            if ('speechSynthesis' in window) {
                const voiceIndex = 0;

                const speak = async (text) => {
                    if (!speechSynthesis) {
                        return;
                    }
                    let message = new SpeechSynthesisUtterance(text);
                    message.voice = await chooseVoice();
                    message.lang = message.voice.lang;
                    speechSynthesis.speak(message);
                    console.table(message);
                };

                let voices = app.voices;

                let getVoices = () => {
                    return new Promise((resolve) => {
                        voices = app.voices = speechSynthesis.getVoices()
                        if (voices.length) {
                            resolve(voices);
                            return;
                        }
                        if (speechSynthesis.onvoiceschanged !== undefined) {
                            // Chrome gets the voices asynchronously so this is needed
                            speechSynthesis.onvoiceschanged = () => {
                                voices = app.voices = speechSynthesis.getVoices();
                                resolve(voices);
                            };
                        } else {
                            speechSynthesis.onvoiceschanged = () => {
                                voices = app.voices = speechSynthesis.getVoices();
                                resolve(voices);
                            };
                        }
                    });
                };

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
                };

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
                mymap.setView([cardName.lat , cardName.lon], 16, {
                    "animate": true,
                   });
            // }
           
        },

        drawCircle: ()=>{
            let circleCenter = [];
            app.mapClickedlatlng ? circleCenter = app.mapClickedlatlng: circleCenter = [ app.latitude, app.longitude ]
            // var circleCenter = [app.mapClickedlatlng] || [app.latitude, app.longitud ];
            var circleOptions = {
                color:'green',
                weight: 2,
                radius : app.gsradius,
                fillOpacity: 0.05,
                dashArray: '1 4 8'
             };
             var circle = L.circle(circleCenter, app.gsradius, circleOptions);
             circle.addTo(mymap);
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
                            gsradius: app.gsradius,
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

                    app.geoData.push(locationsData[0].title);

                    Vue.set(app.geoDataFull, app.cardIndex, {
                        'lat': locationsData[0].lat,
                        'lon': locationsData[0].lon,
                        'lang': app.lang,
                        'local': app.local,
                        'title': locationsData[0].title,
                        'id':app.cardIndex
                    });


                    let favorite = localStorage.getItem(locationsData[0].title);

                    if (favorite){
                        app.geoDataFull[app.cardIndex].selected = true;
                    } else {
                        app.geoDataFull[app.cardIndex].selected = false;
                    }

                    app.cardIndex ++;
                    getDataOnLocations(locationsData[0].title);

                } else if (locationsData.length > 1) {

                    locationsData.forEach(element => {
                        //if not allready exists
                        if (!app.geoData[element.title] && element.title) {

                            app.geoData.push(element.title);

                            Vue.set(app.geoDataFull, app.cardIndex, {
                                'lat': element.lat,
                                'lon': element.lon,
                                'lang': app.lang,
                                'local': app.local,
                                'title': element.title,
                                'id':app.cardIndex
                            });

                            let favorite = localStorage.getItem(element.title);

                            if (favorite){
                                app.geoDataFull[app.cardIndex].selected = true;
                            } else {
                                app.geoDataFull[app.cardIndex].selected = false;
                            }
                        }

                        app.cardIndex ++;
                        getDataOnLocations(element.title);
                    });
                }
                console.table('app.geoDataFull: ', app.geoDataFull);

                app.drawCircle();

                loader.classList.add("hide");

            }

            function handle(gpsData) {
                let shouldUpdate = updateGpsData(gpsData);


                app.Tlatitude = app.latitude;
                app.Tlongitude = app.longitude;

                // if (shouldUpdate) {
                    let mapGeo;
                    getFromWiki();
                    InitMap();
                // }

            }

            function InitMap() {
                if (typeof mymap == 'undefined') {

                    console.debug('mapfromapp');
                    
                    mymap = L.map('mapid').setView([app.latitude, app.longitude], 16);
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
                    .openPopup();

                // .bindPopup("You Are here!")

                var popup = L.popup();

                function onMapClick(e) {
                    app.mapClickedlatlng = e.latlng;
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

                            console.debug('respons: ', response.data.query.pages);

                            let page = response.data.query.pages;
                            let pageId = Object.keys(response.data.query.pages)[0];
                            let dataObject = page[pageId];
                            let url = dataObject.fullurl;
                            // dataObject.extract;

                            app.geoDataFull.forEach(card=>{
                                if(card.title == title){
                                    app.geoDataFull[card.id].extract = dataObject.extract;
                                    Vue.set(app.geoDataFull[card.id], 'extract', dataObject.extract);

                                    if (dataObject.thumbnail) {

                                        preloadImages(dataObject.thumbnail.source, true);
        
                                        Vue.set(app.geoDataFull[card.id], 'img', dataObject.thumbnail.source);
                                        app.geoDataFull[card.id].img = dataObject.thumbnail.source;
        
                                        let myIcon = L.icon({
                                            iconUrl: app.geoDataFull[card.id].img,
                                            iconSize: [45, 45],
                                            iconAnchor: [10, 10],
                                            popupAnchor: [20, -5],
                                        });
        
                                        L.marker([ app.geoDataFull[card.id].lat,  app.geoDataFull[card.id].lon], {
                                                icon: myIcon
                                            }).addTo(mymap)
                                            .bindPopup("<b>" + dataObject.title + "</b>").openPopup();
        
                                    } else {
                                        L.marker([ app.geoDataFull[card.id].lat,  app.geoDataFull[card.id].lon]).addTo(mymap)
                                            .bindPopup("<b>" + dataObject.title + "</b>").openPopup();
                                    }
        


                                }
                            })

                            // window.resizeClickMap();
                            // app.extract.unshift(page[pageId].extract);
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
                // }, 5 * 60 * 1000);
            }
        },
        
    }

   

});

Vue.config.devtools = true;