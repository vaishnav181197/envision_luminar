import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extensionFromImageName } from "@/lib/storage/validate-image";

export const THUMBNAIL_BUCKET = "project-thumbnails";

async function storageClient() {
  return createServiceClient() ?? (await createClient());
}

async function ensureThumbnailBucket() {
  const supabase = await storageClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === THUMBNAIL_BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(THUMBNAIL_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });

    if (error && !error.message.toLowerCase().includes("already exists")) {
      throw new Error(error.message);
    }
  }

  return supabase;
}

export async function uploadProjectThumbnail(
  file: File,
  ownerId: string,
): Promise<string> {
  const supabase = await ensureThumbnailBucket();
  const extension = extensionFromImageName(file.name, file.type);
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(THUMBNAIL_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
