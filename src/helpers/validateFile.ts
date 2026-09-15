import { ACCEPTED_MIME_TYPE, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "../constants/upload";
import type { FileValidationResult } from "../types/fileValidationResult";

export function validateFile(file: File): FileValidationResult {
  const isPdf =
    file.type === ACCEPTED_MIME_TYPE || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return { ok: false, message: "Ten plik nie jest PDF-em. Wgraj plik w formacie .pdf." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: `Plik jest za duży. Maksymalny rozmiar to ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { ok: true };
}
