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
        addCardData: (state, card) => {
            state.geoDataFull[store.getters.Index] = card;
        },
        adFavorite: (state, card) =>{
            state.geoDataFull[card.id].selected = true;
        },
        removeFavorite: (state, card) =>{
            state.geoDataFull[card.id].selected = false;
        },
        setCardImage: (state, card)=>{
            state.geoDataFull[state.geoDataFull.length-1] = card;
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
        Index: state => state.geoDataFull.length,
        latitude: state => state.latitude,
        longitude: state => state.longitude,
        Tlatitude: state => state.Tlatitude,
        Tlongitude: state => state.Tlongitude,
    }

});
