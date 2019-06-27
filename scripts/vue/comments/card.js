
let card = Vue.component('card-component', {
    props: {
        card: {
            type: Object,
            requires: true
        },
        // showOnMap: { type: Function },
    },
    mounted() {
        // Use the parent function directly here
        
    },
    data() {
        return {
            reading: false,
        }
    },

    template: `<div class="card" :data-local="card.local" :data-lang="card.lang">
                    <input type="checkbox" :id="card.id" class="more" aria-hidden="true">
                    <div class="content">
                        <div class="front" :style="{ 'background-image': 'url(' + card.img + ')' }">
                            <div class="inner">
                                <i v-if="card.selected" class="fas fa-star selected" v-bind:value="card.selected"
                                @click="removeFavorite(card, $event)"></i>
                                <h3> {{card.title}}</h3>
                            
                                <label :for="card.id" class="button" aria-hidden="true" v-on:click="resize">
                                    <div class="icon">
                                        <i class="fas fa-book-reader"></i>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div class="back">
                            <div class="inner">
                                <div class="info">
                                    <div v-if="!reading && card.lang!='he'" class="icon" v-on:click="readText(card)"
                                        style="min-width: 21.5px">
                                        <i class="fas fa-volume-off"></i>
                                    </div>
                                    <div v-if="reading" class="icon" v-on:click="stopText"
                                        style="min-width: 21.5px">
                                        <i class="fas fa-volume-up"></i>
                                    </div>
                                    <div class="icon" v-on:click="showOnMap($event, card)">
                                        <i class="fas fa-map-marked-alt"></i>
                                    </div>
                                    <div v-show="!card.selected" class="icon" v-bind:value="card.selected"
                                        @click="adFavorite(card, $event)">
                                        <!-- <div v-if="!selected(card.title)" class="icon" v-on:click="adFavorite(card, $event)"> -->
                                        <i class="far fa-star"></i>
                                    </div>
                                    <div v-show="card.selected" class="icon" v-bind:value="card.selected"
                                        @click="removeFavorite(card, $event)">
                                        <i class="fas fa-star"></i>
                                    </div>
                                </div>
                                <div v-if="card.distance" class="distance_container">
                                    <span style="color: #000; font-size: 15px;">{{ card.distance.toFixed(0)}}m.</span>
                                </div>
                                <div class="description">
                                    <p :class="{ right : card.lang=='he'}">
                                        {{card.extract}}
                                    </p>
                                </div>
                                <label :for="card.id" class="button return" aria-hidden="true">
                                    <i class="fas fa-arrow-left"></i>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>`,
                
   
    methods: {
        showOnMap: (e, cardName) => {
            console.debug(e, cardName);
            e.stopPropagation();
            // if ( e.target.className.includes('fa-map-marked-alt') ) {
            mymap.setView([cardName.lat, cardName.lon], 16, {
                "animate": true,
            });
            // }

        },
        resize: window.resizeClickCard,

        adFavorite: function (card, e) {
            card.selected = true;
            // app.geoDataFull[card.id].selected = true;
            Vue.set(app.geoDataFull[card.id], 'selected', true);
            localStorage.setItem(card.title, JSON.stringify(app.geoDataFull[card.id]));
        },

        removeFavorite: function (card, e) {
            card.selected = false;
            // app.geoDataFull[card.id].selected = false;
            Vue.set(app.geoDataFull[card.id], 'selected', false);
            localStorage.removeItem(card.title);
        },

        stopText: function () {
            window.speechSynthesis.cancel();
            this.reading = false;
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
                this.reading = true;
                return;

            }

        },

    },
})