
<div class="container">
	<header class:open={editMode}>
    <nav>
      <Fab class="nav-btn" color="primary" on:click={() => history.back()}>
        <Icon class="material-icons">arrow_back</Icon>
      </Fab>
    </nav>
    <button class="drawer" on:click={toggleEdit}>
      <Icon class="material-icons">{editMode ? 'arrow_back' : 'arrow_forward'}</Icon>
    </button>
	</header>
  <main>
    <div id="map"></div>
  </main>
</div>

<script lang="ts">
import { onMount } from 'svelte';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { goto } from '$app/navigation';
import Textfield from '@smui/textfield';
import Button from '@smui/button';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Fab, { Label, Icon } from '@smui/fab';
import Switch from '@smui/switch';
import Snackbar from '@smui/snackbar';
import { db } from '$lib/firebase.client';
import type { Point, RouteModel } from '../../models/RouteModel';

let editMode: boolean = false;

onMount(() => {
  let map: naver.maps.Map;
  const center: naver.maps.LatLng = new naver.maps.LatLng(37.431057, 127.102147);

  map = new naver.maps.Map('map', {
      center: center,
      zoom: 16
  });
});

function startEdit() {
  editMode = true;
  resetEditData();
}

function cancelEdit() {
  editMode = false;
  resetEditData();
}

function toggleEdit() {
  if (editMode) {
    cancelEdit()
  } else {
    startEdit()
  }
}

function resetEditData() {
  //selectedPointIndex = -1;
  //editingPointIndex = -1;
  //editingPointTitle = '';
  //editingPointLat = 0;
  //editingPointLng = 0;
  //editingPointX = 0;
  //editingPointY = 0;
}
</script>

<style>
.container {
  display: flex;
  height: 100%;
}

header {
  display: flex;
  position: relative;
  z-index: 10;
  width: 0;
  flex-direction: column;
  background-color: #fff;
  user-select: none;
  transition: width .5s;
}

header.open {
  width: 400px;
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 1px 14px 0px rgba(0, 0, 0, 0.12);
}

nav {
  padding: 5px 10px;
  z-index: 9;
}

header.open nav {
  background-color: #fff;
}

:global(nav .nav-btn) {
  margin-top: 5px;
  margin-bottom: 5px;
}

.bottom {
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  right: 0;
  width: 400px;
  background-color: #fff;
}

.bottom .point-action,
.bottom .route-action {
  padding: 10px;
  border-top: #eee 1px solid;
}

.bottom .point-action {
  text-align: center;
}

.bottom .route-action {
  text-align: right;
}

:global(.bottom .route-action > button) {
  vertical-align: middle;
}

button.drawer {
  position: absolute;
  box-sizing: border-box;
  bottom: 25px;
  right: -40px;
  width: 40px;
  height: 50px;
  text-align: center;
  padding: 12px 8px;
  background-color: #000;
  cursor: pointer;
  color: #fff;
  border: none;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

ul.menu {
  overflow-x: visible;
  overflow-y: auto;
  min-width: 68px;
  margin-top: -38px;
  margin-bottom: 0;
  padding: 38px 4px 80px 4px;
}

header.open ul.menu {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 120px;
}

ul.menu > li {
  display: block;
  box-sizing: border-box;
  min-width: 40px;
  padding: 5px 14px;
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
}

ul.menu > li.selected {
  border: 1px #ccc solid;
  border-radius: 5px;
}

ul.menu > li > button {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  height: 40px;
  margin-right: 5px;
  padding: 0;
  border: none;
  border-radius: 20px;
  background-color: #000;
  cursor: pointer;
  color: #fff;
  font-size: 11px;
  line-height: 40px;
  text-align: left;
  vertical-align: middle;
}

ul.menu span.seq {
  display: inline-block;
  width: 40px;
  height: 40px;
  text-align: center;
  vertical-align: top;
}

ul.menu span.title {
  display: inline-block;
  overflow: hidden;
  max-width: 300px;
  text-align: left;
  height: 40px;
  padding-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

ul.menu > li > button.icon {
  padding: 8px;
}

ul.menu > li:first-of-type {
  z-index: 9;
}

main {
  position: relative;
  display: block;
  flex: 1 1 auto;
}

#map {
  position: absolute !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.title-layer {
  position: absolute;
  z-index: 10;
  box-sizing: border-box;
  top: 10px;
  left: 80px;
  height: 56px;
  user-select: none;
}

:global(.title-layer > label) {
  width: 300px;
}

:global(.point-item .node) {
  vertical-align: middle;
}

:global(.point-item > button, .point-item .mdc-radio) {
  vertical-align: middle;
  margin-right: 5px;
}

.editing-text,
.editing-point {
  padding: 10px;
}

:global(.editing-text > label) {
  width: 100%;
}

.editing-point {
  padding: 10px;
}

:global(.editing-point > label) {
  margin: 0 10px;
}

ul.link-box {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 5px;
  user-select: none;
}

ul.link-box > li {
  padding: 5px 10px;
}

:global(#map .marker) {
  display:block;
  margin: 0px;
  padding: 0px;
  border: 0px solid transparent;
  border-radius: 13px;
  overflow: hidden;
  background-color: #9ea6af;
  max-width: none;
  max-height: none;
  user-select: none;
  position: absolute;
  width: 26px;
  height: 26px;
  left: 0px;
  top: 0px;
  text-align: center;
  line-height: 28px;
  color: #fff;
  font-size: 11px;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
}

</style>
  