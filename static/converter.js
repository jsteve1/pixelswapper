class Converter {
    constructor() {
        // No need for video-related properties
    }

    async init() {
        // No initialization needed for image-only converter
        return true;
    }

    async convertImage(file, options) {
        try {
            // Create a bitmap from the file
            const bitmap = await createImageBitmap(file);
            
            // Create a canvas with the image dimensions
            const canvas = document.createElement('canvas');
            let width = bitmap.width;
            let height = bitmap.height;
            
            // Handle resizing if maxWidth or maxHeight is specified
            if (options.maxWidth && width > options.maxWidth) {
                const ratio = options.maxWidth / width;
                width = options.maxWidth;
                height = height * ratio;
            }
            if (options.maxHeight && height > options.maxHeight) {
                const ratio = options.maxHeight / height;
                height = options.maxHeight;
                width = width * ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }
            
            ctx.drawImage(bitmap, 0, 0, width, height);
            
            // Convert to the desired format
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to convert image'));
                        }
                    },
                    options.format,
                    options.quality || 0.92
                );
            });

            return blob;
        } catch (error) {
            console.error('Image conversion failed:', error);
            throw new Error(`Failed to convert image: ${error.message}`);
        }
    }

    // Video conversion is now a premium feature
    async convertVideo(file, options) {
        throw new Error('Video conversion is a premium feature. Please upgrade to convert videos.');
    }
}

function getExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function getMimeType(format) {
    const mimeTypes = {
        'webp': 'image/webp',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime'
    };
    return mimeTypes[format] || 'application/octet-stream';
}

export const converter = new Converter(); 