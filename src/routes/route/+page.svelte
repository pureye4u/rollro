<NavBarContainer>
  <List class="route-list" dense>
    {#each routeList as route}
    <Item on:SMUI:action={() => goto(`/route/${route.id}`)}>
      <Text>{route.title}</Text>
    </Item>
    {/each}
  </List>
</NavBarContainer>

<script lang="ts">
import { onMount } from 'svelte';
import { collection, getDocs } from 'firebase/firestore';
import List, { Item, Text } from '@smui/list';
import { goto } from '$app/navigation';
import { db } from '$lib/firebase.client';
import NavBarContainer from '../../components/NavBarContainer.svelte';

let routeList: any[] = [];

async function loadRouteList() {
  let ref = collection(db, 'route');
  const snapshot = await getDocs(ref);
  routeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

onMount(() => {
  loadRouteList()
});

</script>
