<NavBarContainer>
  <List class="route-list" dense>
    {#each routeList as route}
    <Item on:SMUI:action={() => goto(`/route/${route.id}`)}>
      <Text>{route.title}</Text>
    </Item>
    {/each}
  </List>
  <div class="floating-control">
    <Fab color="primary" on:click={addRoute} disabled={isAddDisabled}>
      <Icon class="material-icons">add</Icon>
    </Fab>
  </div>
</NavBarContainer>

<script lang="ts">
import { onMount } from 'svelte';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import List, { Item, Text } from '@smui/list';
import Fab, { Icon } from '@smui/fab';
import { goto } from '$app/navigation';
import { db } from '$lib/firebase.client';
import NavBarContainer from '../../components/NavBarContainer.svelte';

let routeList: any[] = [];
let isAddDisabled = true;
let userID: string;

async function loadRouteList() {
  const ref = collection(db, 'route');
  const q = query(ref, orderBy('title'));
  const snapshot = await getDocs(q);
  routeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

onMount(async () => {
	const user: any = await data.getAuthUser();
  userID = user.uid;
  loadRouteList()
  isAddDisabled = false;
});

async function addRoute() {
  if (isAddDisabled) {
    return;
  }
  isAddDisabled = true;
  const id = await createRoute();
  if (typeof id === 'string') {
    goto(`/route/${id}`);
  }
  isAddDisabled = false;
}

async function createRoute(): Promise<string | undefined> {
  if (typeof userID != 'string') {
    return;
  }
  try {
    let ref = collection(db, 'route');
    const doc = await addDoc(ref, {
      title: '새로운 경로',
      author: userID,
    });
    return doc.id;
  } catch (err) {
    console.error('Error adding document:', err);
  }
}

export let data;
</script>

<style>
.floating-control {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
</style>
