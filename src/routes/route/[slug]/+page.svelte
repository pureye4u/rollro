<Dialog
  bind:open={isOpenSearchDialog}
  aria-labelledby="searchTitle"
  aria-describedby="searchContent"
>
  <Title id="searchTitle">검색</Title>
  <Content id="searchContent">
    <div class="editing-text">
      <Textfield on:keypress={keyDidPress} bind:value={searchKeyword} label="검색어" />
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={submitSearch} action="accept">
      <Label>확인</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenPointEditDialog}
  aria-labelledby="editingTitle"
  aria-describedby="editingContent"
>
  <Title id="editingTitle">편집</Title>
  <Content id="editingContent">
    <div class="editing-text">
      <Textfield bind:value={editingPointTitle} label="Title" />
    </div>
    <div class="editing-point">
      <div>
        <span>LatLng</span>
        <Switch bind:checked={isPointEditDialogCoordModeEPSG4236} icons={false} />
        <span>EPSG4236</span>
      </div>
      {#if isPointEditDialogCoordModeEPSG4236}
      <Textfield bind:value={editingPointX} on:change={applyEditingPointEPSG4236} label="X" />
      <Textfield bind:value={editingPointY} on:change={applyEditingPointEPSG4236} label="Y" />
      {:else}
      <Textfield bind:value={editingPointLat} on:change={applyEditingPoint} label="Latitude" />
      <Textfield bind:value={editingPointLng} on:change={applyEditingPoint} label="Longitude" />
      {/if}
    </div>
  </Content>
  <Actions>
    <Button on:click={completeEditing} action="accept">
      <Label>완료</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenDeleteDialog}
  aria-labelledby="confirmTitle"
  aria-describedby="confirmContent"
>
  <Title id="confirmTitle">편집</Title>
  <Content id="confirmContent">
    <div class="editing-text">
      <Textfield bind:value={confirmDeleteTitle} label="Confirm Title" />
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={submitDelete} action="accept">
      <Label>확인</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenImportURLDialog}
  aria-labelledby="importURLTitle"
  aria-describedby="importURLContent"
>
  <Title id="importURLTitle">네이버 지도 주소 입력</Title>
  <Content id="importURLContent">
    <div class="editing-text">
      <Textfield bind:value={importURL} label="URL" />
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={submitImportURL} action="accept">
      <Label>확인</Label>
    </Button>
  </Actions>
</Dialog>

<Snackbar bind:this={snackbar}>
  <Label>{snackbarMessage}</Label>
</Snackbar>

<div class="container">
	<header class:open={editMode}>
    <nav>
      <Fab class="nav-btn" color="primary" on:click={() => history.back()}>
        <Icon class="material-icons">arrow_back</Icon>
      </Fab>
      <!--<Fab class="nav-btn" color="primary" on:click={() => isOpenSearchDialog = true}>
        <Icon class="material-icons">search</Icon>
      </Fab>-->
    </nav>
		<ul class="menu">
      {#each points as point, index}
      <li class:selected={selectedPointIndex === index}>
        {#if editMode}
        <button class="icon" on:click={() => {editPoint(index)}}>
          <Icon class="material-icons">edit</Icon>
        </button>
        <button class="icon" on:click={() => {toggleSplit(index)}}>
          <Icon class="material-icons">{index === 0 || (index + 1) === points.length || split.indexOf(index) != -1 ? 'location_on' : 'location_off'}</Icon>
        </button>
        {/if}
        <button on:click={() => selectPoint(index)}>
          <span class="seq">{index + 1}</span>
          <span class="title">{point.title}</span>
        </button>
      </li>
      {/each}
		</ul>
    <div class="bottom">
      <div class="point-action">
        <Fab color="secondary" on:click={removeAlldPoint} mini disabled={points.length === 0}>
          <Icon class="material-icons">playlist_remove</Icon>
        </Fab>
        <Fab color="secondary" on:click={removeSelectedPoint} mini>
          <Icon class="material-icons">remove</Icon>
        </Fab>
        <Fab color="primary" on:click={moveSelectedPointDown} mini disabled={selectedPointIndex === (points.length - 1)}>
          <Icon class="material-icons">arrow_drop_down</Icon>
        </Fab>
        <Fab color="primary" on:click={moveSelectedPointUp} mini disabled={selectedPointIndex === 0}>
          <Icon class="material-icons">arrow_drop_up</Icon>
        </Fab>
        <Fab color="primary" on:click={addCurrentPoint} mini>
          <Icon class="material-icons">add</Icon>
        </Fab>
        <Fab color="primary" on:click={openImportURLDialog} mini>
          <Icon class="material-icons">input</Icon>
        </Fab>
      </div>
      <div class="route-action">
        <Fab color="primary" on:click={showAllPoints} mini>
          <Icon class="material-icons">zoom_out_map</Icon>
        </Fab>
        <Fab color="primary" on:click={loadAllDirections} mini>
          <Icon class="material-icons">route</Icon>
        </Fab>
        <Fab color="primary" on:click={makeAllLinks} mini>
          <Icon class="material-icons">link</Icon>
        </Fab>
        {#if userID === model.author}
        <Fab color="secondary" on:click={deleteRoute} mini>
          <Icon class="material-icons">delete</Icon>
        </Fab>
        {/if}
        <Button on:click={saveEdit} variant="raised" color="secondary">
          <Label>저장</Label>
        </Button>
        <Button on:click={cancelEdit} variant="raised" color="primary">
          <Label>취소</Label>
        </Button>
      </div>
    </div>
    <button class="drawer" on:click={toggleEdit}>
      <Icon class="material-icons">{editMode ? 'arrow_back' : 'arrow_forward'}</Icon>
    </button>
	</header>
  <main>
    <div id="map"></div>
  </main>
  <div class="title-layer">
    <Textfield bind:value={title} label="제목" disabled={!editMode} />
  </div>
  <ul class="link-box">
    {#each links as link, index}
    <li>
      <Button on:click={() => copyToClipboard(link)} variant="raised">
        <Label>경로{index + 1} 링크복사</Label>
      </Button>
    </li>
    {/each}
  </ul>
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
import type { Point, RouteModel } from '../../../models/RouteModel';

let model: RouteModel = {
  title: '',
  author: undefined,
  points: [],
  split: [],
  paths: [],
  links: [],
};

let userID: string;
let title = '';
let snackbar: Snackbar;
let snackbarMessage = '';
const maxPoints = 6;
let isOpenSearchDialog = false;
let isOpenPointEditDialog = false;
let isPointEditDialogCoordModeEPSG4236 = false;
let isOpenDeleteDialog = false;
let isOpenImportURLDialog = false;
let editMode: boolean = false;
let selectedPointIndex = -1;
let editingPointIndex = -1;
let editingPointTitle = '';
let editingPointLat = 0;
let editingPointLng = 0;
let editingPointX = 0;
let editingPointY = 0;
let points: Point[] = [];
let markers: naver.maps.Marker[] = [];
let split: number[] = [];
let paths: number[][] = [];
let map: naver.maps.Map;
let routeLine: naver.maps.Polyline;
let links: (string | null)[] = [];
let confirmDeleteTitle = '';
let importURL = '';
let searchKeyword = '';

function showSnackbar(message: string) {
  snackbarMessage = message;
  snackbar.open();
}

async function loadRouteModel() {
  let ref = doc(db, 'route', data.id);
  const document = await getDoc(ref);
  model = { id: document.id, ...document.data() } as RouteModel;
  title = model.title;
  if (Array.isArray(model.split)) {
    split = model.split;
  } else {
    split = [];
  }
  if (Array.isArray(model.paths)) {
    paths = model.paths.map(path => [path.lng, path.lat]);
    drawPath(paths.map(point => (new naver.maps.LatLng(point[1], point[0]))));
  } else {
    paths = [];
  }
  if (Array.isArray(model.links)) {
    links = model.links;
  }
  if (Array.isArray(model.points)) {
    applyPoints(model.points);
    showAllPoints();
  }
}

async function saveRouteModel(): Promise<boolean> {
  let ref = doc(db, 'route', data.id);
  const updateData = {
    title,
    points,
    split,
    paths: paths.map(path => ({ lat: path[1], lng: path[0] } as Point)),
    links,
  };
  try {
    await setDoc(ref, updateData, { merge: true });
    return true;
  } catch (error) {
    console.error('Save route model error:', error);
    return false;
  }
}

function deleteRoute() {
  isOpenDeleteDialog = true;
}

async function submitDelete() {
  if (userID != model.author) {
    showSnackbar('삭제 권한이 없습니다.');
    return;
  }
  if (model.title != confirmDeleteTitle) {
    showSnackbar('입력 내용이 일치하지 않습니다.');
    return;
  }

  try {
    let ref = doc(db, 'route', data.id);
    await deleteDoc(ref);
    goto('/route');
  } catch (error) {
    console.error('Delete route model error:', error);
  }
}

function keyDidPress(event: CustomEvent<any>) {
  const keyboardEvent = event as unknown as KeyboardEvent
  console.log(event)
  console.log(keyboardEvent)
  if (keyboardEvent?.keyCode === 13) {
    submitSearch()
    isOpenSearchDialog = false
  }
}

async function submitSearch() {
  console.log('search', searchKeyword)
}

function openImportURLDialog() {
  importURL = '';
  isOpenImportURLDialog = true;
}

function submitImportURL() {
  const prefix = 'https://map.naver.com/p/directions/';
  if (importURL.length === 0 || !importURL.startsWith(prefix)) {
    showSnackbar('URL이 유호하지 않습니다. 단축URL은 지원되지 않습니다');
    return;
  }
  const path = importURL.slice(prefix.length);
  const segments = path.split('/');
  if (segments.length < 2) {
    showSnackbar('URL이 유호하지 않습니다.');
    return;
  }
  const start = getPointFromSegments(segments[0]);
  if (start === null) {
    showSnackbar('출발지 정보가 유효하지 않습니다.');
    return;
  }
  const end = getPointFromSegments(segments[1]);
  if (end === null) {
    showSnackbar('도착지 정보가 유호하지 않습니다.');
    return;
  }

  const lastPoint = getLastPoint();
  if (start != null && (lastPoint == null || !getIsSamePoint(start, lastPoint))) {
    pushPoint(start);
  }
  const waypointPath = segments[2];
  if (waypointPath != '-') {
    const waypointSegments = waypointPath.split(':');
    if (waypointSegments.length > 0) {
      for (const waypointSegment of waypointSegments) {
        const point = getPointFromSegments(waypointSegment);
        if (point != null) {
          pushPoint(point);
        }
      }
    }
  }
  
  if (end != null) {
    pushPoint(end);
  }

  showAllPoints();
}

function getPointFromSegments(path: string): Point | undefined {
  const segments = path.split(',');
  if (segments.length < 2) {
    return;
  }
  const x = parseFloat(segments[0]);
  const y = parseFloat(segments[1]);
  const epsg4236 = naver.maps.TransCoord.fromEPSG3857ToLatLng({ x, y } as naver.maps.Point);
  let point = { lat: epsg4236.y, lng: epsg4236.x } as Point;
  if (segments.length > 2) {
    point.title = decodeURIComponent(segments[2]);
  }
  return point;
}

function editPoint(index: number) {
  const { title, lat, lng } = points[index];
  const epsg3857 = naver.maps.TransCoord.fromLatLngToEPSG3857({ x: lng, y: lat } as naver.maps.Coord);
  editingPointIndex = index;
  editingPointTitle = title ?? '';
  editingPointLat = lat;
  editingPointLng = lng;
  editingPointX = epsg3857.x;
  editingPointY = epsg3857.y;
  isOpenPointEditDialog = true;
}

function startEdit() {
  editMode = true;
  resetEditData();
}

async function saveEdit() {
  if (await saveRouteModel()) {
    editMode = false;
    resetEditData();
    showSnackbar('저장되었습니다.');
  }
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
  selectedPointIndex = -1;
  editingPointIndex = -1;
  editingPointTitle = '';
  editingPointLat = 0;
  editingPointLng = 0;
  editingPointX = 0;
  editingPointY = 0;
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

function removeSelectedPoint() {
  if (selectedPointIndex < 0 || selectedPointIndex >= points.length) {
    showSnackbar('삭제할 포인트를 선택해주세요');
    return;
  }

  points.splice(selectedPointIndex, 1);
  applyPoints([...points], true);
  selectedPointIndex = -1;
}

function removeAlldPoint() {
  applyPoints([], true);
  selectedPointIndex = -1;
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

function selectPoint(index: number) {
  if (index < 0 || index >= points.length) {
    return;
  }
  const point = points[index];
  goPoint(point);
  if (!editMode) {
    return;
  }
  selectedPointIndex = index;
}

function toggleSplit(index: number) {
  if (index === 0) {
    showSnackbar('출발지입니다');
    return;
  }
  if ((index + 1) === points.length) {
    showSnackbar('목적지입니다');
    return;
  }

  const splitIndex = split.indexOf(index);
  if (splitIndex < 0) {
    let i: number;
    for (i = 0; i < split.length; ++i) {
      if (index < split[i]) {
        break;
      }
    }
    split.splice(i, 0, index);
  } else {
    const previousIndex = split[splitIndex - 1];
    const nextIndex = split[splitIndex + 1];
    if ((nextIndex - previousIndex) > maxPoints) {
      showSnackbar(`경유지 간격은 최대 ${maxPoints - 1}개를 넘을 수 없습니다`);
      return;
    }
    split.splice(splitIndex, 1);
  }
  split = [...split];
}

function goPoint(point: Point) {
  const coord = { x: point.lng, y: point.lat } as naver.maps.Coord;
  map.morph(coord, 15);
}

function addCurrentPoint() {
  const center = map.getCenter();
  addPoint({ lat: center.y, lng: center.x, title: getPointName() } as Point);
}

function pushPoint(point: Point) {
  addPoint(point, points.length);
}

function getLastPoint(): Point | undefined {
  const lastIndex = points.length - 1;
  if (lastIndex < 0) {
    return;
  }
  return points[lastIndex];
}

function getIsSamePoint(lfs: Point, rfs: Point): boolean {
  return lfs.lat === rfs.lat && lfs.lng === rfs.lng;
}

function addPoint(point: Point, at?: number) {
  const length = points.length;
  const index = !!at ? (at <= length ? at : length) : (length > 1 ? length - 1 : length);
  let newPoints: Point[];
  if (length === 0) {
    newPoints = [point];
  } else {
    newPoints = [...points];
    newPoints.splice(index, 0, point);
  }
  applyPoints(newPoints, true);
  applySection();
  selectedPointIndex = index;
}

function applyPoints(newPoints: Point[], isModified: boolean = false) {
  points = newPoints;
  routeLine.setStyles('strokeOpacity', isModified ? 0.5 : 1);
  syncMarker();
}

function applySection() {
  const lastIndex = split.length - 1;
  const last = lastIndex < 0 ? 0 : split[lastIndex];
  const count = points.length - last;
  if (count > maxPoints) {
    split.push(last + maxPoints);
  }
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
  if (points.length < markers.length) {
    for (let i = points.length; i < markers.length; ++i) {
      markers[i].setMap(null);
    }
    markers.length = points.length;
  }
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
  return String(index + 1);
}

async function loadAllDirections() {
  if (points.length < 2) {
    showSnackbar('두개 이상의 포인트가 필요해요');
    drawPath([]);
    return;
  }
  let newPaths: number[][] = [];
  let first = 0;
  console.log('split', split);
  for (let i = 0; i < split.length; ++i) {
    const last = split[i];
    console.log('load', i);
    const sectionPaths = await loadDirection(points.slice(first, last + 1)) ?? [];
    newPaths = newPaths.concat(sectionPaths);
    first = last;
  }
  const last = points.length - 1;
  if (first < last) {
    console.log('load last');
    const sectionPaths = await loadDirection(points.slice(first, last + 1)) ?? [];
    newPaths = newPaths.concat(sectionPaths);
  }

  paths = newPaths;
  drawPath(newPaths.map(point => (new naver.maps.LatLng(point[1], point[0]))));
}

async function loadDirection(points: Point[]): Promise<number[][] | null> {
  if (points.length < 1) {
    return null;
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
    return data.responseData.route.traavoidcaronly[0].path as number[][];
  } else {
    console.error('Failed to fetch data:', response.status);
    return null;
  }
}

function drawPath(path: naver.maps.LatLng[]) {
  if (path.length === 0) {
    routeLine.setMap(null);
  } else {
    routeLine.setOptions({
      map: map,
      strokeOpacity: 1,
      path: path,
    });
  }
}

function makeAllLinks() {
  let first = 0;
  let i = 0;
  links = [];
  for (i = 0; i < split.length; ++i) {
    const last = split[i];
    const link = makeLink(points.slice(first, last + 1));
    links[i] = link;
    first = last;
  }
  const last = points.length - 1;
  if (first < last) {
    const link = makeLink(points.slice(first, last + 1));
    links[i] = link;
  }
}

function makeLink(points: Point[]): string | null {
  if (points.length < 1) {
    return null;
  }
  
  let buffer = 'https://map.naver.com/p/directions/';
  let waypoints = [...points];
  const start = waypoints.shift()!;
  const end = waypoints.pop()!;
  const startCoord = convertPoint(start);
  const endCoord = convertPoint(end);
  buffer += `${startCoord.x},${startCoord.y},${start.title}/${endCoord.x},${endCoord.y},${end.title}/`;
  if (waypoints.length > 0) {
    buffer += waypoints.map(point => {
      const coord = convertPoint(point);
      return `${coord.x},${coord.y},${point.title}`;
    }).join(':');
  } else {
    buffer += '-';
  }
  buffer += '/car';
  return buffer;
}

async function copyToClipboard(link: string | null) {
  if (typeof link != 'string') {
    showSnackbar('링크에 문제가 있어요!');
    return;
  }
  try {
    await navigator.clipboard.writeText(link);
    showSnackbar('링크가 복사됐어요!');
  } catch (err) {
    showSnackbar('링크 복사에 실패했어요!');
  }
}

function convertPoint(point: Point) {
  return naver.maps.TransCoord.fromLatLngToEPSG3857({ x: point.lng, y: point.lat } as naver.maps.Coord);
}

function applyEditingPoint() {
  const epsg3857 = naver.maps.TransCoord.fromLatLngToEPSG3857({ x: editingPointLng, y: editingPointLat } as naver.maps.Coord);
  editingPointX = epsg3857.x;
  editingPointY = epsg3857.y;
}

function applyEditingPointEPSG4236() {
  const epsg4236 = naver.maps.TransCoord.fromEPSG3857ToLatLng({ x: editingPointX, y: editingPointY } as naver.maps.Point);
  editingPointLat = epsg4236.y;
  editingPointLng = epsg4236.x;
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
      strokeColor: '#536f93',
      strokeWeight: 3
  });
}

onMount(async () => {
	const user: any = await data.getAuthUser();
  userID = user.uid;
  loadRouteModel()
  initMap();
});

export let data;
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
