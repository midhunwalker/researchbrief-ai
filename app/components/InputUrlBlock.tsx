"use client";

import React, { useCallback } from "react";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { validateUrls } from "@/lib/api";

interface InputUrlBlockProps {
  onSubmit: (urls: string[]) => Promise<void>;
  loading?: boolean;
}

export const InputUrlBlock = React.forwardRef<
  HTMLTextAreaElement,
  InputUrlBlockProps
>(({ onSubmit, loading = false }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState<string>("");
  const [validCount, setValidCount] = React.useState(0);

  const exampleUrls = [
    "https://example.com/article-1",
    "https://example.com/article-2",
    "https://example.com/article-3",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Validate URLs
    const validatedUrls = validateUrls(value);
    setValidCount(validatedUrls.length);

    if (value.trim() && validatedUrls.length === 0) {
      setError("No valid URLs detected. URLs must start with http:// or https://");
    } else {
      setError("");
    }
  };

  const handleUseExample = () => {
    const exampleText = exampleUrls.join("\n");
    setInput(exampleText);
    setValidCount(exampleUrls.length);
    setError("");
  };

  const handleGenerate = async () => {
    const validatedUrls = validateUrls(input);

    if (validatedUrls.length === 0) {
      setError("Please enter at least one valid URL");
      return;
    }

    try {
      await onSubmit(validatedUrls);
      setInput("");
      setValidCount(0);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to generate brief"
      );
    }
  };

  const handleClear = () => {
    setInput("");
    setValidCount(0);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          ref={textareaRef}
          label="Research URLs"
          placeholder="Enter URLs (one per line)&#10;https://example.com/article-1&#10;https://example.com/article-2"
          value={input}
          onChange={handleInputChange}
          disabled={loading}
          error={error}
          rows={6}
          helperText={
            validCount > 0
              ? `${validCount} valid URL${validCount !== 1 ? "s" : ""} detected`
              : "Enter URLs starting with http:// or https://"
          }
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={handleUseExample}
          disabled={loading}
          className="text-accent hover:text-accent-dark underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Use Example
        </button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={validCount === 0 || loading}
          loading={loading}
          size="md"
        >
          Generate Brief
        </Button>
        <Button
          variant="secondary"
          onClick={handleClear}
          disabled={!input || loading}
          size="md"
        >
          Clear
        </Button>
      </div>
    </div>
  );
});

InputUrlBlock.displayName = "InputUrlBlock";
