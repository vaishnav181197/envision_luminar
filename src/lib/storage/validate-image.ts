const IMAGE_MIME = /^image\//i;
export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

export function isImageMimeType(value: string | undefined | null): boolean {
  return Boolean(value && IMAGE_MIME.test(value));
}

export function validateImageFile(
  file: { type: string; size: number; name?: string },
): string | null {
  if (!file.size) {
    return "Please choose an image file.";
  }

  if (!isImageMimeType(file.type)) {
    return "Thumbnail must be an image. Other file types are not allowed.";
  }

  if (file.size > MAX_THUMBNAIL_BYTES) {
    return "Thumbnail must be 5 MB or smaller.";
  }

  return null;
}

export function extensionFromImageName(filename: string, mimeType: string): string {
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName) && fromName !== filename.toLowerCase()) {
    return fromName;
  }

  const fromMime = mimeType.split("/")[1]?.split("+")[0];
  return fromMime || "img";
}
