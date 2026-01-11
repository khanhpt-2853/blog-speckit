"use client";

import { useState } from "react";
import { normalizeTag, isValidTag } from "@/lib/utils/tags";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
  value,
  onChange,
  maxTags = 5,
  placeholder = "Enter tags (comma-separated)",
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);

    // Parse tags from comma-separated input
    const rawTags = newValue
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Show preview of normalized tags
    const normalizedTags = rawTags.map((t) => normalizeTag(t));

    // Validate
    if (normalizedTags.length > maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
    } else {
      // Check for invalid tags
      const invalidTags = normalizedTags.filter((t) => !isValidTag(t));
      if (invalidTags.length > 0) {
        setError(
          `Invalid tags: ${invalidTags.join(", ")} (use lowercase letters, numbers, and hyphens only)`
        );
      }
    }

    onChange(normalizedTags);
  };

  const handleBlur = () => {
    // Clean up input on blur
    const cleanedTags = value.filter((t) => t.length > 0 && isValidTag(t));
    if (cleanedTags.length !== value.length) {
      onChange(cleanedTags);
      setInputValue(cleanedTags.join(", "));
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
    setInputValue(newTags.join(", "));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        {value.length > 0 && (
          <span className="absolute top-2 right-3 text-sm text-gray-500">
            {value.length}/{maxTags}
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-blue-900"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Tags will be normalized to lowercase with hyphens (e.g., "Web Dev" → "web-dev")
      </p>
    </div>
  );
}
