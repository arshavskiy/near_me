Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        geoDataFull: [],
        latitude: 0,
        longitude: 0,
        Tlatitude: 0,
        Tlongitude: 0,
    },
    mutations: {
        addCard: (state, card) => {
            state.geoDataFull.push(card);
        },
        adFavorite: (state, card) =>{
            state.geoDataFull[card.id].selected = true;
        },
        removeFavorite: (state, card) =>{
            state.geoDataFull[card.id].selected = false;
        },
        latitudeUpdate: (state, latitude) => {
            state.latitude = latitude;
        },
        longitudeUpdate: (state, longitude) => {
            state.longitude = longitude;
        },
        TlatitudeUpdate: (state, Tlatitude) => {
            state.Tlatitude = Tlatitude;
        },
        TlongitudeUpdate: (state, Tlongitude) => {
            state.Tlongitude = Tlongitude;
        }
    },
    getters: {
        geoDataFull: state => state.geoDataFull,
        latitude: state => state.latitude,
        longitude: state => state.longitude,
        Tlatitude: state => state.Tlatitude,
        Tlongitude: state => state.Tlongitude,
    }

});
