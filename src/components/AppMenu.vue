<template>
  <section class="menu">
    <i
      v-if="!toggleMenuOpen"
      class="fas fa-bars menu_btn"
      @click="toggleMenu"
    ></i>
    <i
      v-show="toggleMenuOpen"
      class="fas fa-bars menu_btn no_boder"
      @click="toggleMenu"
    ></i>

    <div class="menu_holder" :class="{ show: toggleMenuOpen }">
      <div class="menu_btn_holder">
        <i class="fas fa-times" style="padding: 0 5px" @click="toggleMenu"></i>
      </div>

      <div style="padding: 10px 0 0 10px">
        <section class="spaced mt-1">
          <v-select
            :modelValue="language"
            :options="languageOptions"
            label="language"
            @update:modelValue="updateLanguage"
          />
        </section>

        <div class="spaced mt-1">
          <span style="line-height: 30px">Map type </span>
          <select v-model="mapStyleSelected" class="menu_select">
            <option v-for="map in maps" :key="map.name" :value="map.name">
              {{ map.name }}
            </option>
          </select>
        </div>

        <div class="spaced">
          <span style="line-height: 30px">Search radius </span>
          <select v-model="gsradius" class="menu_select">
            <option v-for="radius in mapRadius" :key="radius" :value="radius">
              {{ radius }} m
            </option>
          </select>
        </div>

        <div>
          <h4>Favorites</h4>
          <div
            class="menu_select"
            style="overflow: auto; height: 200px; width: 100%"
          >
            <div v-for="place in favoriteLocations" :key="place.id">
              <div class="spaced">
                <span class="spaced-grow">{{ place.title }}</span>
                <i @click="showOnMap(place)" class="fas fa-map-marked-alt"></i>
                <i
                  class="fas fa-star selected-menu ml-1"
                  @click="removeFromFavorites(place)"
                >
                </i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useMapStore } from "../stores/map";

const mapStore = useMapStore();
const {
  geoDataFull,
  mapStyleSelected,
  gsradius,
  toggleMenuOpen,
  maps,
  mapRadius,
  language,
  languageOptions,
} = storeToRefs(mapStore);

const { toggleMenu, removeFromFavorites, updateLanguage } = mapStore;

const favoriteLocations = computed(() =>
  geoDataFull.value.filter((place) => place.selected)
);

function showOnMap(place) {
  if (mapStore.map) {
    mapStore.map.setView([place.lat, place.lon], 16);
  }
}
</script>

<style scoped>
.menu {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.menu_btn {
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.menu_btn.no_boder {
  box-shadow: none;
}

.menu_holder {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100vh;
  background: white;
  transition: left 0.3s ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.menu_holder.show {
  left: 0;
}

.menu_btn_holder {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.spaced {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.spaced-grow {
  flex-grow: 1;
  margin-right: 10px;
}

.menu_select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.mt-1 {
  margin-top: 10px;
}

.ml-1 {
  margin-left: 10px;
}

.selected-menu {
  color: gold;
}
</style>
