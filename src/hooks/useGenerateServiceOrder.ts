import { useState, useCallback } from "react";
import type { ProgramSegment } from "../types";

interface GenerateServiceOrderResponse {
  serviceInfo?: {
    title: string;
    serviceDate: string;
    serviceTime: string;
  };
  segments: ProgramSegment[];
}

interface UseGenerateServiceOrderResult {
  generate: (text: string, model?: string) => Promise<GenerateServiceOrderResponse | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useGenerateServiceOrder(): UseGenerateServiceOrderResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      text: string,
      model?: string
    ): Promise<GenerateServiceOrderResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/generate-service-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, model }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${response.status}`
          );
        }

        const data: GenerateServiceOrderResponse = await response.json();
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate service order";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generate,
    isLoading,
    error,
    clearError,
  };
}
