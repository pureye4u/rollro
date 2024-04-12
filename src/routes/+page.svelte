<div id="map"></div>

<script lang="ts">
import { onMount } from 'svelte';

onMount(() => {
  let map: naver.maps.Map;
  const center: naver.maps.LatLng = new naver.maps.LatLng(37.431057, 127.102147);

  map = new naver.maps.Map('map', {
      center: center,
      zoom: 16
  });
});
</script>

<style>
#map {
  height: 100%;
}
</style>

