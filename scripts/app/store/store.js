Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        cardsData: [],
        latitude: 0,
        longitude: 0,
        Tlatitude: 0,
        Tlongitude: 0,
    },
    mutations: {
        addCard: (state, card) => {
            state.cardsData.push(card);
        },
        addCardData: (state, card) => {
            state.cardsData[card.id] = card;
            console.debug('state.cardsData[store.getters.Index]', state.cardsData[store.getters.Index]);
            console.debug('card', card);
        },
        adFavorite: (state, card) =>{
            state.cardsData[card.id].selected = true;
        },
        removeFavorite: (state, card) =>{
            state.cardsData[card.id].selected = false;
        },
        updateCardInfo: (state, card)=>{
            state.cardsData[card.id].img = card;
        },
        setCardExtract: (state, card)=>{
            state.cardsData[card.id].extract = card.extract;
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
        cardsData: state => state.cardsData,
        Index: state => state.cardsData.length,
        latitude: state => state.latitude,
        longitude: state => state.longitude,
        Tlatitude: state => state.Tlatitude,
        Tlongitude: state => state.Tlongitude,
    }

});
