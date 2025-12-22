/**
 * Global type declarations for web APIs available in React Native
 *
 * React Native polyfills these APIs, but TypeScript doesn't recognize them by default.
 */

// Blob is available in React Native for file handling
declare class Blob {
  constructor(parts?: any[], options?: { type?: string });
  readonly size: number;
  readonly type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
}

// FormData is available in React Native for multipart/form-data uploads
declare class FormData {
  append(name: string, value: any, fileName?: string): void;
  delete(name: string): void;
  get(name: string): any;
  getAll(name: string): any[];
  has(name: string): boolean;
  set(name: string, value: any, fileName?: string): void;
}

// URLSearchParams is available for constructing query strings
declare class URLSearchParams {
  constructor(init?: string | Record<string, string> | URLSearchParams);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  toString(): string;
}

// FileReader is available for reading files as data URLs (minimal declaration)
declare class FileReader {
  onload: ((this: FileReader, ev: any) => any) | null;
  onerror: ((this: FileReader, ev: any) => any) | null;
  readAsDataURL(blob: Blob): void;
  result: string | ArrayBuffer | null;
}
