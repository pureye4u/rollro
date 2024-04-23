<TopAppBar bind:this={topAppBar} variant="fixed">
  <Row>
    <Section>
      <IconButton on:click={() => history.back()} class="material-icons">arrow_back_ios</IconButton>
      <Title>{ title }</Title>
    </Section>
  </Row>
</TopAppBar>
<AutoAdjust {topAppBar}>
  <slot/>
</AutoAdjust>
 
<script lang="ts">
import TopAppBar, {
  Row,
  Section,
  Title,
  AutoAdjust,
} from '@smui/top-app-bar';
import IconButton from '@smui/icon-button';

let topAppBar: TopAppBar;
export let title: string = '';
  
</script>
