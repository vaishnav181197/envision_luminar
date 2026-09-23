import { validateImageFile } from "@/lib/storage/validate-image";
import { uploadProjectThumbnail } from "@/lib/storage/thumbnails";

export interface ProjectFormFields {
  title?: string;
  description?: string;
  demoUrl?: string;
  authorName?: string;
  batch?: string;
  thumbnailUrl?: string | null;
}

export async function readProjectRequest(
  request: Request,
  ownerId: string,
  existingThumbnailUrl?: string | null,
): Promise<
  | { fields: ProjectFormFields; error: null }
  | { fields: null; error: string }
> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const thumbnail = form.get("thumbnail");

    let thumbnailUrl: string | null | undefined;
    if (thumbnail instanceof File && thumbnail.size > 0) {
      const invalid = validateImageFile(thumbnail);
      if (invalid) {
        return { fields: null, error: invalid };
      }

      try {
        thumbnailUrl = await uploadProjectThumbnail(thumbnail, ownerId);
      } catch (error) {
        return {
          fields: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to upload thumbnail",
        };
      }
    } else if (form.get("clearThumbnail") === "true") {
      thumbnailUrl = null;
    } else {
      thumbnailUrl = existingThumbnailUrl;
    }

    return {
      fields: {
        title: stringField(form.get("title")),
        description: stringField(form.get("description")),
        demoUrl: stringField(form.get("demoUrl")),
        authorName: stringField(form.get("authorName")),
        batch: stringField(form.get("batch")),
        thumbnailUrl,
      },
      error: null,
    };
  }

  try {
    const body = (await request.json()) as ProjectFormFields;
    return { fields: body, error: null };
  } catch {
    return { fields: null, error: "Invalid request body" };
  }
}

function stringField(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value : undefined;
}
