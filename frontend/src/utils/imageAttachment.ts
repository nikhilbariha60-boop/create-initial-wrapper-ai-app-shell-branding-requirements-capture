/**
 * Utility functions for handling image attachments in chat
 */

/**
 * Convert a File object to Uint8Array for backend transmission
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert Uint8Array to Blob URL for display
 */
export function uint8ArrayToBlobUrl(
  bytes: Uint8Array,
  contentType: string = 'image/jpeg'
): string {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: contentType });
  return URL.createObjectURL(blob);
}

/**
 * Revoke a Blob URL to free memory
 */
export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validate image file size (max 1MB)
 */
export function isValidImageSize(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Get image dimensions from File
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
