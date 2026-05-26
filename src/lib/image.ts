/**
 * Client-side image compression and WebP conversion utility.
 * Compresses files in the browser using HTML5 Canvas.
 */
export async function compressAndConvertToWebp(
  file: File,
  maxWidth = 1600,
  quality = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If it's not a compressible image (like PDF, SVG, etc.), return the original file
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize down if it exceeds maximum dimensions
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original if canvas context fails
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with target quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // Fallback
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback on image loading error
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file); // Fallback on file read error
    reader.readAsDataURL(file);
  });
}
