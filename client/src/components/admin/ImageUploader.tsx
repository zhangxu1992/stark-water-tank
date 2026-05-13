'use client';

import { useState, useRef } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, max = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const token = getToken();
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const result = await apiClient.upload<{ url: string }>('/api/upload', formData, token!);
        newImages.push(result.url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    onChange([...images, ...newImages].slice(0, max));
    setUploading(false);

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function setCover(index: number) {
    const cover = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([cover, ...rest]);
  }

  return (
    <div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {images.map((img, i) => (
          <div key={i} className="relative group aspect-square rounded-xl border border-border overflow-hidden bg-bg-alt">
            <img
              src={img.startsWith('http') ? img : `${getApiUrl()}${img}`}
              alt={`Image ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => setCover(i)}
                  className="p-1.5 bg-white rounded-lg text-text-secondary hover:text-accent transition-colors"
                  title="Set as cover"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              )}
              {i === 0 && (
                <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">Cover</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="p-1.5 bg-white rounded-lg text-text-secondary hover:text-red-500 transition-colors"
                title="Remove"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center text-text-secondary hover:text-accent disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-sm">Uploading...</span>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                <span className="text-xs">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
