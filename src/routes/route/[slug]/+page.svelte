<Dialog
  bind:open
  aria-labelledby="editingTitle"
  aria-describedby="editingContent"
>
  <Title id="editingTitle">편집</Title>
  <Content id="editingContent">
    <div class="editing-title">
      <Textfield bind:value={editingPointTitle} label="Title" />
    </div>
    <div class="editing-point">
      <Textfield bind:value={editingPointLat} label="Latitude" />
      <Textfield bind:value={editingPointLng} label="Longitude" />
    </div>
  </Content>
  <Actions>
    <Button on:click={completeEditing} action="accept">
      <Label>완료</Label>
    </Button>
  </Actions>
</Dialog>

<FloatingNavBar></FloatingNavBar>
<div class="container">
  <div id="map"></div>
  <div class="point-layer">
    <div class="edit-mode">
      {#if editMode}
      <Button on:click={saveEdit} variant="raised" color="secondary">
        <Label>저장</Label>
      </Button>
      {:else}
      <Button on:click={startEdit} variant="raised" color="secondary">
        <Label>편집</Label>
      </Button>
      {/if}
    </div>
    {#if editMode}
    <div class="point-item">
      {#if points.length > 0}
      <Fab color="primary" on:click={showAllPoints} extended>
        <Icon class="material-icons">zoom_out_map</Icon>
        <Label>모두보기</Label>
      </Fab>
      {/if}
      <Fab color="primary" on:click={addPoint} extended>
        <Icon class="material-icons">add</Icon>
        <Label>추가</Label>
      </Fab>
    </div>
    {/if}
    {#each points as point, index}
    {#if index === 0 || split.indexOf(index) != -1}
    <div>-----</div>
    {/if}
    <div class="point-item">
      {#if editMode}
      <Fab color="primary" class="edit" on:click={() => {editPoint(index)}} mini>
        <Icon class="material-icons">edit</Icon>
      </Fab>
      {/if}
      <Fab color="primary" on:click={() => goPoint(point)} extended>
        <Label>{point.title}</Label>
      </Fab>
      {#if editMode}
      <Radio
        bind:group={selectedPointIndex}
        value={index}
      />
      {/if}
    </div>
    {#if index === 0 || split.indexOf(index) != -1}
    <div>-----</div>
    {/if}
    {/each}
    {#if editMode && points.length > 0}
    <div class="point-item">
      <Fab color="primary" on:click={loadDirection} extended>
        <Icon class="material-icons">route</Icon>
        <Label>경로탐색</Label>
      </Fab>
    </div>
    {/if}
    {#if selectedPointIndex >= 0}
    <div class="point-control">
      <IconButton class="material-icons" on:click={moveSelectedPointDown} size="button" disabled={selectedPointIndex === (points.length - 1)}>arrow_drop_down</IconButton>
      <IconButton class="material-icons" on:click={moveSelectedPointUp} size="button" disabled={selectedPointIndex === 0}>arrow_drop_up</IconButton>
      <IconButton class="material-icons" on:click={() => selectedPointIndex = -1} size="button" disabled={selectedPointIndex < 0}>close</IconButton>
    </div>
    {/if}
  </div>
</div>

<script lang="ts">
/** @type {import('./$types').PageData} */
import { onMount } from 'svelte';
import { doc, getDoc } from 'firebase/firestore';
import Textfield from '@smui/textfield';
import Button from '@smui/button';
import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
import Fab, { Label, Icon } from '@smui/fab';
import IconButton from '@smui/icon-button';
import Radio from '@smui/radio';
import Switch from '@smui/switch';
import { db } from '$lib/firebase.client';
import FloatingNavBar from '../../../components/FloatingNavBar.svelte';
import SubNavBarContainer from "../../../components/SubNavBarContainer.svelte";
import type { Point, RouteModel } from '../../../models/RouteModel';

let model: RouteModel = {
  title: '',
  points: [],
};

const maxPoints = 6;
let open = false;
let editMode: boolean = false;
let selectedPointIndex = -1;
let editingPointIndex = -1;
let editingPointTitle = '';
let editingPointLat = 0;
let editingPointLng = 0;
let points: Point[] = [];
let markers: naver.maps.Marker[] = [];
let split: number[] = [];
let map: naver.maps.Map;
let routeLine: naver.maps.Polyline;
let link: string = '';
let actions = [
  { name: 'Link', icon: 'arrow_drop_down', count: 0 },
  { name: 'Image', icon: 'arrow_drop_up', count: 0 },
];

async function loadRouteModel() {
  let ref = doc(db, 'route', data.id);
  const document = await getDoc(ref);
  model = { id: document.id, ...document.data() } as RouteModel;
  if (Array.isArray(model.points)) {
    applyPoints(model.points);
    showAllPoints();
  }
}

function editPoint(index: number) {
  const { title, lat, lng } = points[index];
  editingPointIndex = index;
  editingPointTitle = title ?? '';
  editingPointLat = lat;
  editingPointLng = lng;
  open = true;
}

function startEdit() {
  editMode = true;
  resetEditData();
}

function saveEdit() {
  editMode = false;
  resetEditData();
}

function resetEditData() {
  selectedPointIndex = -1;
  editingPointIndex = -1;
  editingPointTitle = '';
  editingPointLat = 0;
  editingPointLng = 0;
}

function completeEditing() {
  if (editingPointIndex < 0) {
    return;
  }
  const origin = points[editingPointIndex];
  const isSetPoint = origin.lat != editingPointLat || origin.lng != editingPointLng;
  if (
    !isSetPoint &&
    origin.title === editingPointTitle
  ) {
    console.log('no changes');
    return;
  }
  setPoint(editingPointIndex, editingPointLat, editingPointLng, editingPointTitle);
  if (isSetPoint) {
    goPoint({ lat: editingPointLat, lng: editingPointLng } as Point);
  }
}

function moveSelectedPointUp() {
  if (selectedPointIndex < 1) {
    return;
  }

  const point = points[selectedPointIndex];
  points.splice(selectedPointIndex, 1);
  points.splice(--selectedPointIndex, 0, point);
  applyPoints([...points], true);
}

function moveSelectedPointDown() {
  if (selectedPointIndex < 0 || (selectedPointIndex + 1) >= points.length) {
    return;
  }
  
  const point = points[selectedPointIndex];
  points.splice(selectedPointIndex, 1);
  points.splice(++selectedPointIndex, 0, point);
  applyPoints([...points], true);
}

function setPoint(index: number, lat: number, lng: number, title?: string) {
  if (!!title) {
    points[index].title = title;
  }
  points[index].lat = lat;
  points[index].lng = lng;
  markers[index].setPosition(points[index]);
  applyPoints(points, true);
}

function showAllPoints() {
  let min = points.reduce((point, current) => {
    return { lat: Math.min(point.lat, current.lat), lng: Math.min(point.lng, current.lng) } as Point;
  }, { lat: Number.MAX_SAFE_INTEGER, lng: Number.MAX_SAFE_INTEGER } as Point);
  let max = points.reduce((point, current) => {
    return { lat: Math.max(point.lat, current.lat), lng: Math.max(point.lng, current.lng) } as Point;
  }, { lat: 0, lng: 0 } as Point);
  const bounds = new naver.maps.LatLngBounds(
    new naver.maps.LatLng(min.lat, min.lng),
    new naver.maps.LatLng(max.lat, max.lng)
  );
  map.panToBounds(bounds);
}

function goPoint(point: Point) {
  const coord = { x: point.lng, y: point.lat } as naver.maps.Coord;
  map.morph(coord, 15);
}

function addPoint() {
  const length = points.length;
  const index = length > 1 ? length - 1 : length;
  const center = map.getCenter();
  const newPoint: Point = { lat: center.y, lng: center.x, title: getPointName() };
  let newPoints: Point[];
  if (points.length > 1) {
    const last = points.pop()!;
    newPoints = [...points, newPoint, last];
  } else if (points.length > 0) {
    newPoints = [...points, newPoint];
  } else {
    newPoints = [newPoint];
  }
  applyPoints(newPoints, true);
  applySplit();
  selectedPointIndex = index;
}

function applyPoints(newPoints: Point[], isModified: boolean = false) {
  points = newPoints;
  routeLine.setStyles('strokeOpacity', isModified ? 0.5 : 1);
  syncMarker();
}

function applySplit() {
  const lastIndex = split.length - 1;
  const last = lastIndex < 0 ? 0 : split[lastIndex];
  const count = points.length - last;
  if (count > maxPoints) {
    split.push(last + maxPoints);
  }
  console.log(split);
}

function syncMarker() {
  points.forEach((point, index) => {
    const position = { x: point.lng, y: point.lat } as naver.maps.Coord;
    const content = `<div class="marker">${getMarkerLabel(index, points.length)}</div>`;
    const size = new naver.maps.Size(30, 30);
    const anchor = new naver.maps.Point(15, 15);
    const icon = { content, size, anchor };
    if (index < markers.length) {
      markers[index].setOptions({ position, icon });
    } else {
      markers.push(new naver.maps.Marker({ position, map, icon }));
    }
  });
}

function getPointName() {
  const index = points.length;
  switch (index) {
    case 0:
      return '출발';
    case 1:
      return '도착';
    default:
      return `경유${index - 1}`;
  }
}

function getMarkerLabel(index: number, length: number): string {
  return index === 0 ? '출발' : index === length - 1 ? '도착' : String(index);
}

async function loadDirection() {
  if (points.length < 2) {
    return;
  }

  let waypoints = [...points];
  const start = waypoints.shift()!;
  const end = waypoints.pop()!;
  let query = [
    'xid=j8gkbz5wnq',
    'xkey=sRl2fIHNaDkgF79kK5Sx51TboKIThdM6fBAj5ApB',
    `start=${start.lng},${start.lat}`,
    `goal=${end.lng},${end.lat}`,
    'option=traavoidcaronly',
  ];
  query.push('action=' + (waypoints.length > 5 ? 'direction15' : 'direction5'));
  if (waypoints.length > 0) {
    query.push('waypoints=' + waypoints.map((point) => (`${point.lng},${point.lat}`)).join('|'));
  }
  const path = `https://cgf0g5fahf.apigw.ntruss.com/direction5/v1/0nIvwzk5bm/json/?${query.join('&')}`;
  const response = await fetch(path);
  if (response.ok) {
    const data = await response.json();
    const path = data.responseData.route.traavoidcaronly[0].path as number[][];
    drawPath(path.map(point => new naver.maps.LatLng(point[1], point[0])))
  } else {
    console.error('Failed to fetch data:', response.status);
  }
}

function drawPath(path: naver.maps.LatLng[]) {
  routeLine.setStyles('strokeOpacity', 1);
  routeLine.setPath(path);
}

function makeLink() {
  if (points.length < 2) {
    return;
  }
  
  let buffer = 'https://map.naver.com/p/directions/';
  let waypoints = [...points];
  const start = convertPoint(waypoints.shift()!);
  const end = convertPoint(waypoints.pop()!);
  buffer += `${start.x},${start.y},START/${end.x},${end.y},END/`;
  if (waypoints.length > 0) {
    buffer += waypoints.map(convertPoint).map((point, index) => (`${point.x},${point.y},${index + 1}`)).join(':');
  }
  buffer += '/car';
  link = buffer;
}

function convertPoint(point: Point) {
  //console.log(point);
  //const RADIUS = 6378137;
  //const originShift = Math.PI * RADIUS;

  //const x = point.lng * originShift / 180.0;
  //const latRad = point.lat * Math.PI / 180.0
  //const y = Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0)) * RADIUS;

  //console.log(x, y);
  //console.log(naver.maps.EPSG3857Coord.fromLatLngToEPSG3857({ x: point.lng, y: point.lat } as naver.maps.Coord))

  return naver.maps.TransCoord.fromLatLngToEPSG3857({ x: point.lng, y: point.lat } as naver.maps.Coord);
  //const { x, y } = naver.maps.TransCoord.fromLatLngToEPSG3857({ x: point.lng, y: point.lat } as naver.maps.Coord);
  //return { x, y };
}

function initMap() {
  const initialPoint = new naver.maps.LatLng(37.5666805, 126.9784147);
  const center: naver.maps.LatLng = initialPoint;

  map = new naver.maps.Map('map', {
      center: center,
      zoom: 14
  });

  naver.maps.Event.addListener(map, 'click', function(e) {
    if (selectedPointIndex < 0) {
      return;
    }

    const point = e.coord;
    setPoint(selectedPointIndex, point.y, point.x);
  });

  routeLine = new naver.maps.Polyline({
      map: map,
      path: [],
      strokeColor: '#00f',
      strokeWeight: 3
  });
}

onMount(() => {
  loadRouteModel()
  initMap();
});

export let data;
</script>

<style>
.container {
  position: relative;
  height: 100%;
}

#map {
  position: fixed !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.point-layer {
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
  user-select: none;
}

.point-item {
  /*display: inline-block;*/
  margin: 10px;
}

/*.point-item .title {
  box-sizing: border-box;
  display: inline-block;
  padding: 0 20px;
  height: 50px;
  background-color: #fff;
  border-radius: 25px;
  line-height: 52px;
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 1px 14px 0px rgba(0, 0, 0, 0.12);
}*/

.edit-mode {
  padding: 10px;
}

:global(.point-item button.edit, .point-item .mdc-radio) {
  vertical-align: middle;
  margin-right: 5px;
}

.editing-title,
.editing-point {
  padding: 10px;
}

:global(.editing-title > label) {
  width: 100%;
}

.editing-point {
  padding: 10px;
}

:global(.editing-point > label) {
  margin: 0 10px;
}

.point-control {
  box-sizing: border-box;
  margin: 5px 10px;
  padding: 5px;
  float: right;
  width: fit-content;
  background-color: #fff;
  border-radius: 10px;
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 1px 14px 0px rgba(0, 0, 0, 0.12);
}

/*.flex-container {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
}

.flex-container .left {
  width: 600px;
}

.flex-container .right {
  flex-grow: 1;
}
.flex-container .right {
  min-height: 500px;
}

@media(max-width: 1200px) {
  .flex-container .left,
  .flex-container .right {
    width: 100%;
  }
}

.row {
  padding: 5px 0;
}
*/
</style>