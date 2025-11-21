<script lang="ts">
  import { goto } from "$app/navigation";
  import { signOut } from "firebase/auth";
  import { auth } from "$lib/firebase.client";
  import { session } from "$lib/session";
  import TopAppBar, {
    Row,
    Section,
    Title,
    AutoAdjust,
  } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";

  let topAppBar: TopAppBar;
  let menu: Menu;

  export function logout() {
    signOut(auth)
      .then(() => {
        goto("/login");
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
</script>

<TopAppBar bind:this={topAppBar} variant="fixed" class="glass-app-bar">
  <Row>
    <Section>
      <IconButton
        on:click={() => menu.setOpen(true)}
        class="material-icons menu-icon">menu</IconButton
      >
      <Menu bind:this={menu} anchorCorner="BOTTOM_LEFT">
        <List>
          <Item on:SMUI:action={() => goto("/route")}>
            <Text>Route</Text>
          </Item>
          <Item on:SMUI:action={() => goto("/logs")}>
            <Text>Logs</Text>
          </Item>
          {#if $session?.isLoggedIn && $session?.user?.uid}
            <Item
              on:SMUI:action={() => {
                if ($session?.user?.uid) {
                  goto(`/user/${$session.user.uid}`);
                }
              }}
            >
              <Text>My</Text>
            </Item>
          {/if}
          <Separator />
          <Item on:SMUI:action={logout}>
            <Text>Logout</Text>
          </Item>
        </List>
      </Menu>
      <a href="/" class="logo-link"><span class="logo-text">rollro</span></a>
    </Section>
  </Row>
</TopAppBar>
<AutoAdjust {topAppBar}>
  <slot />
</AutoAdjust>

<style>
  /* Clean Light Effect for TopAppBar */
  :global(.glass-app-bar) {
    background-color: var(--glass-bg) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    box-shadow:
      0 1px 2px 0 rgba(60, 64, 67, 0.3),
      0 1px 3px 1px rgba(60, 64, 67, 0.15) !important;
    border-bottom: 1px solid var(--glass-border);
    /* Reset floating styles */
    border-radius: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    top: 0;
    left: 0;
    right: 0;
    transition: all 0.3s ease !important;
    color: var(--color-text-heading) !important;
  }

  /* Logo Styling */
  .logo-link {
    text-decoration: none;
    display: flex;
    align-items: center;
    margin-left: 8px;
  }

  .logo-text {
    font-family: var(--font-sans);
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--color-text-heading);
    letter-spacing: -0.03em;
    transition: color 0.2s ease;
  }

  .logo-link:hover .logo-text {
    color: var(--color-primary);
  }

  /* Menu Icon Styling */
  :global(.menu-icon) {
    color: var(--color-text-body) !important;
    transition: color 0.2s ease !important;
  }

  :global(.menu-icon:hover) {
    color: var(--color-text-heading) !important;
    background-color: rgba(0, 0, 0, 0.05) !important;
    /* Remove glow and rotation for clean look */
    box-shadow: none !important;
    transform: none !important;
  }
</style>
