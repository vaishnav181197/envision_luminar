"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { validateImageFile } from "@/lib/storage/validate-image";
import type { ImageUploadProps } from "@/types/ui";

export function ImageUpload({
  id,
  label = "Thumbnail",
  hint = "Optional. Images only, any format, up to 5 MB.",
  error,
  required,
  disabled,
  value,
  previewUrl,
  onChange,
}: ImageUploadProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const [localError, setLocalError] = useState<string | null>(null);

  const objectUrl = useMemo(() => {
    if (!value) return null;
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const preview = objectUrl ?? previewUrl ?? null;
  const shownError = error ?? localError;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      setLocalError(null);
      onChange(null);
      return;
    }

    const invalid = validateImageFile(file);
    if (invalid) {
      setLocalError(invalid);
      onChange(null);
      return;
    }

    setLocalError(null);
    onChange(file);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-error-500">*</span>}
      </label>

      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border bg-surface p-3",
          shownError ? "border-error-500" : "border-border",
        )}
      >
        {preview ? (
          <div className="relative overflow-hidden rounded-md bg-neutral-100">
            {/* Blob previews are local object URLs, so a native img is required. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Thumbnail preview"
              className="aspect-[16/10] w-full object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 bg-surface/90"
                onClick={() => {
                  setLocalError(null);
                  onChange(null);
                }}
                aria-label="Remove thumbnail"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-md bg-neutral-50 text-text-muted">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">No image selected</span>
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={handleChange}
          className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700"
        />
      </div>

      {shownError && (
        <p id={`${inputId}-error`} className="text-xs text-error-600" role="alert">
          {shownError}
        </p>
      )}
      {hint && !shownError && (
        <p id={`${inputId}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
