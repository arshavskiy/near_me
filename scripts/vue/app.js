
  let app = new Vue({
    el: '#app-5',
    data: {
      message: 'Hello Vue.js!',
      Tlatitude : 0, 
      Tlongitude : 0,
      latitude : 0,
      longitude : 0,  
      geoData : [],
      extract: [],
      geoDataFull: {}
    },
    methods: {

      reverseMessage: function () {

        function updateGpsData (gpsData){
          if (app.latitude != gpsData.coords.latitude && app.longitude != gpsData.coords.longitude){
            app.latitude = gpsData.coords.latitude; 
            app.longitude = gpsData.coords.longitude; 
          }
          return app.Tlatitude != gpsData.coords.latitude && app.Tlongitude != gpsData.coords.longitude;
        };

        function getFromWiki(mapGeo){
          axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
              // headers: {
              //   'Origin': 'https://5a6b54b1.ngrok.io/',
              //   'Content-Type':'application/json; charset=UTF-8'
              //   },
              action : 'query',
              list : 'geosearch',
              gsradius : 1000,
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
          if (response.data.query.geosearch.length === 1 ){
            app.geoData.push(response.data.query.geosearch[0].title);
          } if ( response.data.query.geosearch.length > 1 ) {

            response.data.query.geosearch.forEach(element => {
                //if not allready exists 
                if (!app.geoDataFull[element.title]){
                  app.geoData.push(element.title);
                  app.geoDataFull[element.title] = { 'lat':element.lat, 'lon':element.lon };

                
                  getDataOnLocations(element.title);
                }
              });

          }
          console.log('app.geoData: ', app.geoDataFull);
          // getDataOnLocations();
        }

        function handle(gpsData){
          let shouldUpdate = updateGpsData(gpsData);

          app.Tlatitude = app.latitude;
          app.Tlongitude = app.longitude;

          if ( shouldUpdate ){
            let mapGeo;
            getFromWiki();
            InitMap();
          }
         
        }

        function InitMap() {

          L.marker([app.latitude,app.longitude]).addTo(mymap)
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
        
            axios.get('https://en.wikipedia.org/w/api.php', {
              params: {
                action : 'query',
                titles: title, 
                prop : 'extracts|info|images|categories|pageimages',
                inprop: 'url|talkid',
                explaintext:1,
                pithumbsize:100,
                format: 'json',
                origin: '*',
              }
            })
            .then(function (response) {
              if (response.data.query) {
                console.log('respons: ', response.data.query.pages);
                let page =  response.data.query.pages;
                let pageId = Object.keys(response.data.query.pages)[0];
                let dataObject = page[pageId];
                let url = dataObject.fullurl;

                app.geoDataFull[dataObject.title].extract = dataObject.extract;

                if (dataObject.thumbnail){
                  app.geoDataFull[dataObject.title].img = dataObject.thumbnail.source;

                  let myIcon = L.icon({
                    iconUrl: app.geoDataFull[dataObject.title].img,
                    iconSize: [50, 50],
                    iconAnchor: [10, 10],
                    popupAnchor: [20, -5],
                  });

                  L.marker([app.geoDataFull[dataObject.title].lat, app.geoDataFull[dataObject.title].lon],{ icon:myIcon } ).addTo(mymap)
                  .bindPopup("<b>" + dataObject.title + "</b>").openPopup();
                } else {
                  L.marker([app.geoDataFull[dataObject.title].lat, app.geoDataFull[dataObject.title].lon] ).addTo(mymap)
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

        if (window.navigator && window.navigator.geolocation){
          window.navigator.geolocation.getCurrentPosition( handle );
      
          
          setInterval(()=>{
              navigator.geolocation.getCurrentPosition(handle);
          }, 30000);
        }
      },

     

      

    },


  });
