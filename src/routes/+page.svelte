<TopAppBar bind:this={topAppBar} variant="fixed">
  <Row>
    <Section>
      <IconButton on:click={() => menu.setOpen(true)} class="material-icons">menu</IconButton>
      <Menu
        bind:this={menu}
        anchorCorner="BOTTOM_LEFT"
      >
        <List>
          <Item on:SMUI:action={() => goto('/route')}>
            <Text>Route</Text>
          </Item>
          <Item on:SMUI:action={() => goto('/logs')}>
            <Text>Logs</Text>
          </Item>
          <Separator />
          <Item on:SMUI:action={logout}>
            <Text>Logout</Text>
          </Item>
        </List>
      </Menu>
      <Title>rollro</Title>
    </Section>
  </Row>
</TopAppBar>
<AutoAdjust {topAppBar}>
  <div>rollro</div>
</AutoAdjust>
 
<script lang="ts">
	import { goto } from '$app/navigation';
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase.client';
  import TopAppBar, {
    Row,
    Section,
    Title,
    AutoAdjust,
  } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
 
  let topAppBar: TopAppBar;
  let menu: Menu;
  let clicked = 'nothing yet';

  export function logout() {
    signOut(auth)
      .then(() => {
        goto('/login');
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
</script>
 