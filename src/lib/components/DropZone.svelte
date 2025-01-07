<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  let dragOver = false;
  
  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }
  
  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      dispatch('fileDropped', {
        files: Array.from(files)
      });
    }
  }
  
  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      dispatch('fileDropped', {
        files: Array.from(files)
      });
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label="Drop files here or click to select"
  class="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200"
  class:border-primary={dragOver}
  class:border-base-300={!dragOver}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover|preventDefault
  on:drop={handleDrop}
  on:keydown={(e) => e.key === 'Enter' && document.querySelector('input[type="file"]')?.click()}
>
  <label class="flex flex-col items-center cursor-pointer">
    <input
      type="file"
      class="hidden"
      on:change={handleFileInput}
      multiple
      accept="image/*,video/*"
      aria-label="File input"
    />
    <svg
      class="w-12 h-12 mb-2 text-base-content"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
    <span class="text-base-content">Drop files here or click to select</span>
    <span class="text-sm text-base-content/70 mt-1">Supports images and videos</span>
  </label>
</div> 