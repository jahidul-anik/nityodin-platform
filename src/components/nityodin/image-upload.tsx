'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageUploadProps {
  /** Called with the relative URL of the uploaded file. */
  onUpload: (url: string) => void;
  /** If provided, shows a preview of the current image. */
  currentUrl?: string;
  /** Upload category: product, farm, avatar, report, medical */
  category: 'product' | 'farm' | 'avatar' | 'report' | 'medical';
  /** Accepted MIME types (default: jpeg, png, webp, gif) */
  accept?: string;
  /** Max file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Optional class name for the outer wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageUpload({
  onUpload,
  currentUrl,
  category,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSize = 5 * 1024 * 1024,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate type
      const allowedTypes = accept.split(',');
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        return;
      }

      // Validate size
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Upload failed');
          return;
        }

        const url: string = data.data?.url ?? data.url;
        if (!url) {
          setError('Upload failed: no URL returned');
          return;
        }

        setPreview(url);
        onUpload(url);
      } catch {
        setError('Network error during upload');
      } finally {
        setUploading(false);
      }
    },
    [accept, category, maxSize, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [uploadFile],
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onUpload('');
    setError(null);
  }, [onUpload]);

  // If we have a preview, show image with remove button
  if (preview) {
    return (
      <div className={cn('relative group', className)}>
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-muted/30">
          <img
            src={preview}
            alt="Uploaded preview"
            className="object-contain w-full h-full"
          />
        </div>
        {!uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }

  // Drop zone
  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {dragOver ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drag & drop or{' '}
                <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, GIF — max {(maxSize / (1024 * 1024)).toFixed(0)}MB
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload image"
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}