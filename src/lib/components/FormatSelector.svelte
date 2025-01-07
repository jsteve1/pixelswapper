<script lang="ts">
  import type { SupportedImageFormat } from '$lib/services/imageConverter';
  import { supportedFormats } from '$lib/services/imageConverter';
  import { createEventDispatcher } from 'svelte';

  export let currentFormat: string;
  
  const dispatch = createEventDispatcher();
  let quality = 92; // 0-100 scale for user interface

  function handleFormatChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    dispatch('formatChange', {
      format: select.value as SupportedImageFormat,
      quality: quality / 100
    });
  }

  function handleQualityChange(e: Event) {
    const input = e.target as HTMLInputElement;
    quality = parseInt(input.value);
    dispatch('formatChange', {
      format: currentFormat as SupportedImageFormat,
      quality: quality / 100
    });
  }
</script>

<div class="flex flex-col gap-4 w-full max-w-xs mx-auto">
  <div class="form-control w-full">
    <label for="format-select" class="label">
      <span class="label-text">Target Format</span>
    </label>
    <select 
      id="format-select"
      class="select select-bordered w-full" 
      value={currentFormat}
      on:change={handleFormatChange}
    >
      {#each supportedFormats as format}
        <option value={format}>
          {format.split('/')[1].toUpperCase()}
        </option>
      {/each}
    </select>
  </div>

  <div class="form-control w-full">
    <label for="quality-slider" class="label">
      <span class="label-text">Quality</span>
      <span class="label-text-alt">{quality}%</span>
    </label>
    <input
      id="quality-slider"
      type="range"
      min="1"
      max="100"
      value={quality}
      class="range range-primary"
      on:input={handleQualityChange}
    />
  </div>
</div> 