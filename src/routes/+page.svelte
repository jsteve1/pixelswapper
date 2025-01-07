<script lang="ts">
  import DropZone from '$lib/components/DropZone.svelte';
  import FormatSelector from '$lib/components/FormatSelector.svelte';
  import { onMount } from 'svelte';
  import { convertImage, isImageFile, type SupportedImageFormat } from '$lib/services/imageConverter';
  import ModeToggle from '$lib/components/ModeToggle.svelte';
  
  let conversionCount = 0;
  let isPremium = false;
  let currentFormat: SupportedImageFormat = 'image/webp';
  let quality = 0.92;
  let converting = false;
  let error: string | null = null;
  let mode: 'image' | 'video' = 'image';
  
  onMount(async () => {
    // Load user data from chrome.storage
    if (chrome?.storage?.local) {
      const data = await chrome.storage.local.get(['conversionCount', 'isPremium']);
      conversionCount = data.conversionCount || 0;
      isPremium = data.isPremium || false;
    }
  });
  
  async function handleFileDropped(event: CustomEvent) {
    const files = event.detail.files as File[];
    error = null;
    
    // Check if user has premium or free conversions remaining
    if (!isPremium && conversionCount >= 10) {
      error = 'You have reached your free conversion limit. Please upgrade to premium!';
      return;
    }
    
    converting = true;
    
    try {
      for (const file of files) {
        if (!isImageFile(file)) {
          error = 'Please drop only image files.';
          continue;
        }
        
        const result = await convertImage(file, {
          format: currentFormat,
          quality
        });
        
        // Create download link
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Increment conversion count
        if (!isPremium) {
          chrome.runtime.sendMessage({ type: 'INCREMENT_CONVERSION' });
          conversionCount++;
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred during conversion';
    } finally {
      converting = false;
    }
  }
  
  function handleFormatChange(event: CustomEvent) {
    currentFormat = event.detail.format;
    quality = event.detail.quality;
  }
  
  function handleModeChange(event: CustomEvent<{ mode: 'image' | 'video' }>) {
    mode = event.detail.mode;
    // Clear any existing files and errors when switching modes
    error = null;
  }
</script>

<div class="container mx-auto p-4 max-w-3xl">
  <header class="text-center mb-8">
    <h1 class="text-3xl font-bold mb-2">Parkour Pixel</h1>
    <p class="text-base-content/70">
      Privacy-focused file format converter - Your files never leave your device!
    </p>
    <div class="mt-4">
      <ModeToggle {mode} on:modeChange={handleModeChange} />
    </div>
  </header>

  <div class="mb-8">
    <DropZone on:fileDropped={handleFileDropped} />
  </div>
  
  <div class="mb-8">
    <FormatSelector
      currentFormat={currentFormat}
      on:formatChange={handleFormatChange}
    />
  </div>

  {#if error}
    <div class="alert alert-error mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  {/if}

  {#if converting}
    <div class="flex justify-center mb-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {/if}

  <div class="text-center">
    {#if !isPremium}
      <p class="mb-4">
        Free conversions remaining: {10 - conversionCount}
      </p>
      <button class="btn btn-primary">
        Upgrade to Premium
      </button>
    {/if}
  </div>
</div> 