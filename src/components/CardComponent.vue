<template>
  <div class="card">
    <div class="card__title-container">
      <div class="card__title">{{ card.title }}</div>
      <i
        class="fas fa-star"
        :class="{ selected: card.selected }"
        @click="toggleFavorite"
      ></i>
    </div>
    <div class="card__content">
      <div class="card__address">{{ card.address }}</div>
      <div class="card__distance">{{ formatDistance(card.distance) }}</div>
      <div class="card__actions">
        <a :href="card.directions" target="_blank" class="card__button">
          <i class="fas fa-directions"></i> Directions
        </a>
        <button @click="showOnMap" class="card__button">
          <i class="fas fa-map-marked-alt"></i> Show on Map
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMapStore } from "../stores/map";

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
});

const mapStore = useMapStore();

function formatDistance(distance) {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

function showOnMap() {
  if (mapStore.map && props.card.lat && props.card.lng) {
    mapStore.map.setView([props.card.lat, props.card.lng], 16);
  }
}

function toggleFavorite() {
  if (props.card.selected) {
    mapStore.removeFromFavorites(props.card);
  } else {
    mapStore.addToFavorites(props.card);
  }
}
</script>
