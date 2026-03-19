export type OcrTime = { hour: string; minute: string };

export interface ParseEventResponse {
  rawText: string;
  title: string | null;
  startTime: OcrTime | null;
  endTime: OcrTime | null;
  confidence?: number;
  warnings?: string[];
}

function getBaseUrl() {
  const fromEnv = import.meta.env.VITE_OCR_NLP_URL as string | undefined;
  return (fromEnv && fromEnv.trim().length > 0 ? fromEnv.trim() : "http://localhost:8010").replace(/\/+$/, "");
}

export async function parseHandwrittenEventImage(image: Blob, signal?: AbortSignal): Promise<ParseEventResponse> {
  const form = new FormData();
  form.append("image", image, "handwriting.png");

  const res = await fetch(`${getBaseUrl()}/parse-event`, {
    method: "POST",
    body: form,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OCR service error (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as ParseEventResponse;
}

