Vue.component('card-component', {
    props: [geoDataFull],
    template : `<section class="card_holder__container">
    <div v-for="card in geoDataFull.slice().reverse()" :key="card.id" class="card_holder">
        <div class="card" :data-local="card.local" :data-lang="card.lang">
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
                            <p>
                                {{card.extract}}
                            </p>
                        </div>
                        <label :for="card.id" class="button return" aria-hidden="true">
                            <i class="fas fa-arrow-left"></i>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`,
    data() {
        return {
            
        }
    },

    methods: {
        
    },
})