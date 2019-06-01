
  let app5 = new Vue({
    el: '#app-5',
    data: {
      message: 'Hello Vue.js!',
      geoData: []
    },
    methods: {
     

      reverseMessage: function () {
        let self = this;
        self.Tlatitude = 0; 
        self.Tlongitude = 0;
        self.latitude = 0;
        self.longitude = 0;  
        self.geoData = [];

        let updateGpsData = (gpsData)=>{
          if (self.latitude != gpsData.coords.latitude && self.longitude != gpsData.coords.longitude){
            self.latitude = gpsData.coords.latitude; 
            self.longitude = gpsData.coords.longitude; 
          }
          return self.Tlatitude != gpsData.coords.latitude && self.Tlongitude != gpsData.coords.longitude;
        };

        self.getFromWiki = ()=>{
          axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
              // headers: {
              //   'Origin': 'https://5a6b54b1.ngrok.io/',
              //   'Content-Type':'application/json; charset=UTF-8'
              //   },
              action : 'query',
              list : 'geosearch',
              gsradius : 1000,
              gscoord: self.latitude + '|' + self.longitude,
              format: 'json',
              origin: '*',
            }
          })
          .then(function (response) {
            console.log('respons: ', response.data.query);
            if (response.data.query.geosearch.length === 1 ){
              self.geoData.push(response.data.query.geosearch[0].title);
            } if ( response.data.query.geosearch.length > 1 ) {
                response.data.query.geosearch.forEach(element => {
                  self.geoData.push(element.title);
                });
            }
            
            console.log('self.geoData: ', self.geoData);
          })
          .catch(function (error) {
            console.error(error);
          })
          .then(function () {
            // always executed
          });  
        }

        let handle = (gpsData)=>{
          let shouldUpdate = updateGpsData(gpsData);

          self.Tlatitude = self.latitude;
          self.Tlongitude = self.longitude;
          
          if ( shouldUpdate ){
            self.getFromWiki();
          }
         
        }

        if (window.navigator && window.navigator.geolocation){
          window.navigator.geolocation.getCurrentPosition(handle);
      
          
          setInterval(()=>{
              navigator.geolocation.getCurrentPosition(handle);
          }, 30000);
        }
      },

     

      

    },


  });

  Vue.component('todo-item', {
    props: ['todo'],
    template: '<li>{{ todo.text }}</li>'
  })
  
  let app7 = new Vue({
    el: '#app-7',
    data: {
      answer: false,
      groceryList: [
        { id: 0, text: 'Vegetables' },
        { id: 1, text: 'Cheese' },
        { id: 2, text: 'Whatever else humans are supposed to eat' }
      ]
    }
  })
  