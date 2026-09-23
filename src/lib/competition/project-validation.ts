export interface ProjectInput {
  title: string;
  description: string;
  demoUrl: string;
  authorName: string;
  batch: string;
  thumbnailUrl: string | null;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function readString(
  value: unknown,
  field: string,
): { value: string } | { error: string } {
  if (typeof value !== "string") {
    return { error: `${field} is required` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { error: `${field} is required` };
  }

  return { value: trimmed };
}

function readOptionalUrl(
  value: unknown,
  field: string,
): { value: string | null } | { error: string } {
  if (value === undefined || value === null) {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${field} must be a valid http(s) URL` };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { value: null };
  }

  if (!isHttpUrl(trimmed)) {
    return { error: `${field} must be a valid http(s) URL` };
  }

  return { value: trimmed };
}

export function validateProjectCreate(
  body: unknown,
): { data: ProjectInput } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const title = readString(input.title, "title");
  if ("error" in title) return title;

  if (title.value.length < 3 || title.value.length > 100) {
    return { error: "title must be between 3 and 100 characters" };
  }

  const description = readString(input.description, "description");
  if ("error" in description) return description;

  if (description.value.length < 10 || description.value.length > 500) {
    return { error: "description must be between 10 and 500 characters" };
  }

  const demoUrl = readString(input.demoUrl, "demoUrl");
  if ("error" in demoUrl) return demoUrl;

  if (!isHttpUrl(demoUrl.value)) {
    return { error: "demoUrl must be a valid http(s) URL" };
  }

  const authorName = readString(
    input.authorName ?? input.author_name,
    "authorName",
  );
  if ("error" in authorName) return authorName;

  if (authorName.value.length < 2 || authorName.value.length > 100) {
    return { error: "authorName must be between 2 and 100 characters" };
  }

  const batch = readString(input.batch, "batch");
  if ("error" in batch) return batch;

  if (batch.value.length < 2 || batch.value.length > 50) {
    return { error: "batch must be between 2 and 50 characters" };
  }

  const thumbnailUrl = readOptionalUrl(input.thumbnailUrl, "thumbnailUrl");
  if ("error" in thumbnailUrl) return thumbnailUrl;

  return {
    data: {
      title: title.value,
      description: description.value,
      demoUrl: demoUrl.value,
      authorName: authorName.value,
      batch: batch.value,
      thumbnailUrl: thumbnailUrl.value,
    },
  };
}

export function validateProjectUpdate(
  body: unknown,
  existing: ProjectInput,
): { data: ProjectInput } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const hasField =
    input.title !== undefined ||
    input.description !== undefined ||
    input.demoUrl !== undefined ||
    input.authorName !== undefined ||
    input.author_name !== undefined ||
    input.batch !== undefined ||
    input.thumbnailUrl !== undefined;

  if (!hasField) {
    return { error: "At least one field is required" };
  }

  return validateProjectCreate({
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    demoUrl: input.demoUrl ?? existing.demoUrl,
    authorName:
      input.authorName ?? input.author_name ?? existing.authorName,
    batch: input.batch ?? existing.batch,
    thumbnailUrl:
      input.thumbnailUrl === undefined
        ? existing.thumbnailUrl
        : input.thumbnailUrl,
  });
}

export function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}
