import { converter } from './converter.js';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropzone = document.getElementById('dropzone');
    const options = document.getElementById('options');
    const progress = document.getElementById('progress');
    const download = document.getElementById('download');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const fileProgress = document.getElementById('file-progress');
    const batchProgress = document.getElementById('batch-progress');
    const status = document.getElementById('status');
    const batchStatus = document.getElementById('batch-status');
    const qualityInput = document.getElementById('quality');
    const qualityValue = document.getElementById('quality-value');
    const convertBtn = document.getElementById('convert-btn');
    const convertAnotherBtn = document.getElementById('convert-another');
    const cancelBtn = document.getElementById('cancel-conversion');
    const formatSelect = document.getElementById('format-select');
    const selectedFilesList = document.getElementById('selected-files');
    const downloadList = document.getElementById('download-list');
    const premiumNotice = document.getElementById('premium-notice');
    const upgradeBtn = document.getElementById('upgrade-btn');
    const errorDismiss = document.getElementById('error-dismiss');
    const themeToggle = document.getElementById('theme-toggle');
    const infoBtn = document.getElementById('info-btn');
    const infoDropdown = document.getElementById('info-dropdown');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const infoMessage = document.getElementById('info-message');
    const downloadZipBtn = document.getElementById('download-zip');
    const imageBtn = document.getElementById('image-mode');
    const videoBtn = document.getElementById('video-mode');

    let currentFiles = [];
    let convertedFiles = [];
    let isPremium = false;
    let conversionCount = 0;
    let isConverting = false;

    // Initialize converter
    converter.init().catch(showError);

    // Update video mode button to show premium modal
    videoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPremiumModal();
    });

    // Keep image mode always active
    imageBtn.classList.add('active');

    function updateFormatOptions() {
        // Only show image formats
        formatSelect.innerHTML = `
            <option value="webp">WebP</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="gif">GIF</option>
        `;
    }

    // Initial format options update
    updateFormatOptions();

    // Event Listeners
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    dropzone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/webp,image/png,image/jpeg,image/gif';
        
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFiles(Array.from(e.target.files));
            }
        });
        
        input.click();
    });

    function handleFiles(files) {
        // Validate file types
        const invalidFiles = files.filter(file => !file.type.startsWith('image/'));

        if (invalidFiles.length > 0) {
            showError('Invalid file type(s). Please select only image files (WebP, PNG, JPG, GIF).');
            return;
        }

        // Check file count limit
        if (files.length > 10) {
            showError('Maximum 10 files allowed at once. Please select fewer files.');
            return;
        }

        currentFiles = files;
        showOptions();
        updateFilesList();
    }

    function showPremiumModal() {
        const modal = document.createElement('div');
        modal.className = 'modal premium-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Premium Feature</h2>
                <p>Video conversion is available with our premium subscription.</p>
                <ul class="premium-benefits">
                    <li>Convert videos to any format (MP4, WebM, MOV)</li>
                    <li>High-quality server-side conversion</li>
                    <li>Advanced codec options</li>
                    <li>Custom quality parameters</li>
                    <li>Resolution control</li>
                </ul>
                <div class="modal-actions">
                    <a href="https://pixelparkour.com/premium" class="button primary" target="_blank">Upgrade to Premium</a>
                    <button class="button secondary close-modal">Maybe Later</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        error.style.display = 'block';
    }

    function showOptions() {
        dropzone.style.display = 'none';
        options.style.display = 'block';
        progress.style.display = 'none';
        download.style.display = 'none';
        error.style.display = 'none';
    }

    function resetUI() {
        dropzone.style.display = 'flex';
        options.style.display = 'none';
        progress.style.display = 'none';
        download.style.display = 'none';
        error.style.display = 'none';
        fileProgress.value = 0;
        batchProgress.value = 0;
        currentFiles = [];
        convertedFiles = [];
        isConverting = false;
    }

    async function updateFilesList() {
        const filesGrid = document.getElementById('files-grid');
        filesGrid.innerHTML = '';

        for (let i = 0; i < currentFiles.length; i++) {
            const file = currentFiles[i];
            const dimensions = await getFileDimensions(file);
            
            const tile = document.createElement('div');
            tile.className = 'file-tile';
            
            // Create preview
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            tile.appendChild(img);
            
            // Add file info
            const info = document.createElement('div');
            info.className = 'file-info';
            
            const name = document.createElement('div');
            name.className = 'file-name';
            name.textContent = file.name;
            
            const size = document.createElement('div');
            size.className = 'file-size';
            size.textContent = `${dimensions.width}×${dimensions.height} • ${formatFileSize(file.size)}`;
            
            info.appendChild(name);
            info.appendChild(size);
            tile.appendChild(info);
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => {
                URL.revokeObjectURL(tile.querySelector('img').src);
                currentFiles.splice(i, 1);
                updateFilesList();
                if (currentFiles.length === 0) {
                    resetUI();
                }
            };
            tile.appendChild(removeBtn);
            
            filesGrid.appendChild(tile);
        }
    }

    async function handleBatchConversion() {
        isConverting = true;
        options.style.display = 'none';
        progress.style.display = 'block';
        error.style.display = 'none';
        download.style.display = 'none';
        convertedFiles = [];

        // Disable all interactive elements during conversion
        convertBtn.disabled = true;
        downloadZipBtn.disabled = true;
        cancelBtn.disabled = false;
        
        const format = formatSelect.value;
        const quality = parseInt(qualityInput.value) / 100;
        
        for (let i = 0; i < currentFiles.length; i++) {
            if (!isConverting) break;
            
            const file = currentFiles[i];
            batchStatus.textContent = `Converting file ${i + 1}/${currentFiles.length}`;
            batchProgress.value = (i / currentFiles.length) * 100;
            
            try {
                status.textContent = `Converting ${file.name}...`;
                const blob = await converter.convertImage(file, {
                    format: `image/${format === 'jpg' ? 'jpeg' : format}`,
                    quality
                });

                const extension = format === 'jpg' ? 'jpeg' : format;
                convertedFiles.push({
                    blob,
                    name: `${file.name.split('.')[0]}.${extension}`
                });
            } catch (error) {
                console.error(`Error converting ${file.name}:`, error);
                showError(`Error converting ${file.name}: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Re-enable interactive elements
        convertBtn.disabled = false;
        downloadZipBtn.disabled = false;
        cancelBtn.disabled = true;

        if (isConverting && convertedFiles.length > 0) {
            showDownloadList();
        } else {
            resetUI();
        }
        isConverting = false;
    }

    function showDownloadList() {
        progress.style.display = 'none';
        download.style.display = 'block';
        
        // Clear the download section
        downloadList.innerHTML = '';
        
        // Create the grid for file previews
        const grid = document.createElement('div');
        grid.className = 'files-grid-downloads';
        downloadList.appendChild(grid);
        
        convertedFiles.forEach((file, index) => {
            const tile = document.createElement('div');
            tile.className = 'file-tile';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file.blob);
            img.alt = file.name;
            tile.appendChild(img);
            
            // Add file info overlay
            const info = document.createElement('div');
            info.className = 'file-info';
            
            const name = document.createElement('div');
            name.className = 'file-name';
            name.textContent = file.name;
            
            info.appendChild(name);
            tile.appendChild(info);
            
            // Make tile clickable for download
            tile.addEventListener('click', () => {
                downloadFile(file);
            });
            
            grid.appendChild(tile);
        });

        // Create action buttons container
        const actions = document.createElement('div');
        actions.className = 'download-actions';

        // Add download files button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'primary-btn';
        downloadBtn.textContent = 'Download Files';
        downloadBtn.addEventListener('click', async () => {
            for (const file of convertedFiles) {
                downloadFile(file);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        });

        // Add zip download button if multiple files
        if (convertedFiles.length > 1) {
            const zipBtn = document.createElement('button');
            zipBtn.className = 'primary-btn';
            zipBtn.textContent = 'Download ZIP';
            zipBtn.addEventListener('click', async () => {
                try {
                    const zip = new JSZip();
                    convertedFiles.forEach(file => {
                        zip.file(file.name, file.blob);
                    });
                    
                    const zipBlob = await zip.generateAsync({ 
                        type: 'blob',
                        compression: 'DEFLATE',
                        compressionOptions: { level: 6 }
                    });
                    
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(zipBlob);
                    link.download = `converted-files-${timestamp}.zip`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    showError('Failed to create zip file: ' + error.message);
                }
            });
            actions.appendChild(zipBtn);
        }

        const convertBtn = document.createElement('button');
        convertBtn.className = 'secondary-btn';
        convertBtn.textContent = 'Convert More Files';
        convertBtn.addEventListener('click', resetUI);

        actions.appendChild(downloadBtn);
        actions.appendChild(convertBtn);
        downloadList.appendChild(actions);
    }

    function downloadFile(file) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file.blob);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function getFileDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                resolve({ width: img.width, height: img.height });
            };
            img.src = URL.createObjectURL(file);
        });
    }

    // Add event listeners for conversion
    convertBtn.addEventListener('click', () => {
        if (currentFiles.length > 0 && !isConverting) {
            handleBatchConversion();
        }
    });

    convertAnotherBtn.addEventListener('click', resetUI);

    cancelBtn.addEventListener('click', () => {
        isConverting = false;
        resetUI();
    });

    // Add zip download functionality
    downloadZipBtn.addEventListener('click', async () => {
        if (convertedFiles.length === 0) return;

        try {
            const zip = new JSZip();
            
            // Add all files to the zip
            convertedFiles.forEach(file => {
                zip.file(file.name, file.blob);
            });
            
            // Generate the zip file
            const zipBlob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            
            // Create a timestamp for the zip file name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const zipName = `converted-files-${timestamp}.zip`;
            
            // Download the zip file
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipName;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            showError('Failed to create zip file: ' + error.message);
        }
    });

    // Initialize theme
    initializeTheme();

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save theme preference
        chrome.storage.local.set({ theme: newTheme });
    });

    function initializeTheme() {
        // Check storage for saved theme
        chrome.storage.local.get(['theme'], (result) => {
            if (result.theme) {
                document.documentElement.setAttribute('data-theme', result.theme);
            } else {
                // Check system preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            }
        });
    }

    // Info dropdown functionality
    let activeDropdown = null;

    function closeDropdowns() {
        if (activeDropdown) {
            activeDropdown.classList.remove('show');
            activeDropdown = null;
        }
    }

    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // If clicking the same dropdown that's already open, close it
        if (activeDropdown === infoDropdown) {
            closeDropdowns();
            return;
        }
        
        // Close any open dropdown
        closeDropdowns();
        
        // Open this dropdown
        infoDropdown.classList.add('show');
        activeDropdown = infoDropdown;
    });

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // If clicking the same dropdown that's already open, close it
        if (activeDropdown === settingsDropdown) {
            closeDropdowns();
            return;
        }
        
        // Close any open dropdown
        closeDropdowns();
        
        // Open this dropdown
        settingsDropdown.classList.add('show');
        activeDropdown = settingsDropdown;
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeDropdowns();
        }
    });
}); 