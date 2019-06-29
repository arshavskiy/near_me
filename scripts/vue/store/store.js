Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        geoDataFull: [],
        latitude: 0,
        longitude: 0,
    },
    mutations: {
        addCard: (state, card) => {
            state.geoDataFull.push(card);
        },
        latitudeUpdate: (state, latitude) => {
            state.latitude = latitude;
        },
        longitudeUpdate: (state, longitude) => {
            state.longitude = longitude;
        }
    },
    getters: {
        geoDataFull: state => state.geoDataFull,
        latitude: state => state.latitude,
        longitude: state => state.longitude,
    }

});
