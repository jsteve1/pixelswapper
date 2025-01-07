<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let mode: 'image' | 'video' = 'image';
  const dispatch = createEventDispatcher<{
    modeChange: { mode: 'image' | 'video' }
  }>();

  function toggleMode() {
    mode = mode === 'image' ? 'video' : 'image';
    dispatch('modeChange', { mode });
  }
</script>

<div class="flex justify-center gap-4 items-center">
  <button
    class="btn btn-sm {mode === 'image' ? 'btn-primary' : 'btn-ghost'}"
    on:click={() => mode = 'image'}
  >
    Images
  </button>
  <button
    class="btn btn-sm {mode === 'video' ? 'btn-primary' : 'btn-ghost'}"
    on:click={() => mode = 'video'}
  >
    Videos
  </button>
</div> 