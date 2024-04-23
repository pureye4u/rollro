<div class="left-container">
  <Fab color="primary" on:click={() => history.back()}>
    <Icon class="material-icons">arrow_back</Icon>
  </Fab>
</div>

<script lang="ts">
import Fab, { Icon } from '@smui/fab';
</script>

<style>
.left-container {
  position: absolute;
  z-index: 1000;
  top: 10px;
}
.left-container {
  left: 10px;
}
</style>