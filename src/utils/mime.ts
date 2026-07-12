/**
 * Content-based file type detection (magic-byte sniffing).
 *
 * Client-supplied `file.type` / `file.name` are attacker-controlled and must never be
 * trusted as a security boundary. This module inspects the first bytes of a File/Blob/Buffer
 * (or the head of a file on disk in Node) to determine the real MIME type.
 */

export interface MimeSignature {
  mime: string;
  /** Leading bytes that must match exactly. */
  prefix?: number[];
  /** Optional bitmask applied to each prefix byte before comparison. */
  mask?: number[];
  /** If set, the signature is matched at this absolute byte offset (e.g. RIFF/ftyp). */
  offset?: number;
  /** Exact bytes to compare against at `offset` (used for container formats). */
  at?: number[];
}

const SIGNATURES: MimeSignature[] = [
  { mime: 'image/png', prefix: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/jpeg', prefix: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', prefix: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
  { mime: 'image/gif', prefix: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  { mime: 'image/bmp', prefix: [0x42, 0x4d] },
  { mime: 'image/webp', prefix: [0x52, 0x49, 0x46, 0x46], offset: 8, at: [0x57, 0x45, 0x42, 0x50] }, // RIFF....WEBP
  { mime: 'image/tiff', prefix: [0x49, 0x49, 0x2a, 0x00] }, // TIFF LE
  { mime: 'image/tiff', prefix: [0x4d, 0x4d, 0x00, 0x2a] }, // TIFF BE
  { mime: 'application/pdf', prefix: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'application/zip', prefix: [0x50, 0x4b, 0x03, 0x04] }, // also docx/xlsx/pptx/odt/jar
  { mime: 'application/x-7z-compressed', prefix: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c] },
  { mime: 'application/vnd.rar', prefix: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07] },
  { mime: 'application/gzip', prefix: [0x1f, 0x8b] },
  { mime: 'video/webm', prefix: [0x52, 0x49, 0x46, 0x46], offset: 8, at: [0x57, 0x45, 0x42, 0x4d] }, // RIFF....WEBM
  { mime: 'video/quicktime', offset: 8, at: [0x71, 0x74, 0x20, 0x20] }, // 'qt  ' major brand
  { mime: 'audio/mp4', offset: 8, at: [0x4d, 0x34, 0x41, 0x20] }, // 'M4A ' major brand
  { mime: 'video/mp4', offset: 4, at: [0x66, 0x74, 0x79, 0x70] }, // 'ftyp' box (mp4/m4v/isom)
  { mime: 'video/x-msvideo', prefix: [0x52, 0x49, 0x46, 0x46], offset: 8, at: [0x41, 0x56, 0x49, 0x20] }, // RIFF....AVI
  { mime: 'audio/wav', prefix: [0x52, 0x49, 0x46, 0x46], offset: 8, at: [0x57, 0x41, 0x56, 0x45] }, // RIFF....WAVE
  { mime: 'video/x-matroska', prefix: [0x1a, 0x45, 0xdf, 0xa3] }, // EBML / matroska
  { mime: 'video/x-ms-wmv', prefix: [0x30, 0x26, 0xb2, 0x75] }, // ASF header
  { mime: 'video/x-flv', prefix: [0x46, 0x4c, 0x56] }, // FLV
  { mime: 'video/mpeg', prefix: [0x00, 0x00, 0x01, 0xba] }, // MPEG-PS
  { mime: 'audio/ogg', prefix: [0x4f, 0x67, 0x67, 0x53] }, // OggS
  { mime: 'audio/flac', prefix: [0x66, 0x4c, 0x61, 0x43] }, // fLaC
  { mime: 'application/x-tar', prefix: [0x75, 0x73, 0x74, 0x61, 0x72], offset: 257, at: [0x75, 0x73, 0x74, 0x61, 0x72] }, // "ustar" at 257
];

const HEAD_BYTES = 4096;

/**
 * Detect the MIME type from the leading bytes of a file.
 * Returns the detected MIME string, or `null` if it could not be determined.
 */
export function detectMime(bytes: Uint8Array | null | undefined): string | null {
  if (!bytes || bytes.length === 0) return null;

  for (const sig of SIGNATURES) {
    const offset = sig.offset ?? 0;

    if (sig.at && sig.at.length) {
      if (bytes.length < offset + sig.at.length) continue;
      let matched = true;
      for (let i = 0; i < sig.at.length; i++) {
        const expected = sig.at[i];
        const actual = bytes[offset + i];
        if (expected === undefined || actual === undefined || actual !== expected) {
          matched = false;
          break;
        }
      }
      if (matched) return sig.mime;
      continue;
    }

    const prefix = sig.prefix;
    if (!prefix || prefix.length === 0) continue;
    if (bytes.length < offset + prefix.length) continue;
    let matched = true;
    for (let i = 0; i < prefix.length; i++) {
      const expected = prefix[i];
      const raw = bytes[offset + i];
      if (expected === undefined || raw === undefined) {
        matched = false;
        break;
      }
      const actual = sig.mask ? raw & (sig.mask[i] ?? 0xff) : raw;
      if (actual !== expected) {
        matched = false;
        break;
      }
    }
    if (matched) return sig.mime;
  }

  // SVG is text-based; detect a leading XML/svg declaration.
  if (looksLikeSvg(bytes)) return 'image/svg+xml';

  // MP3: ID3v2 tag ("ID3") or an MPEG-1/2 audio frame sync (0xFF followed by
  // a byte whose top three bits are set).
  if (bytes.length >= 3) {
    const b0 = bytes[0];
    const b1 = bytes[1];
    const b2 = bytes[2];
    if (b0 === 0x49 && b1 === 0x44 && b2 === 0x33) return 'audio/mpeg';
    if (b0 === 0xff && b1 !== undefined && (b1 & 0xe0) === 0xe0) return 'audio/mpeg';
  }

  return null;
}

function looksLikeSvg(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  // Optional BOM/whitespace, then "<?xml" or "<svg"
  let i = 0;
  while (i < 100 && (bytes[i] === 0x20 || bytes[i] === 0x09 || bytes[i] === 0x0a || bytes[i] === 0x0d || bytes[i] === 0xef || bytes[i] === 0xbb || bytes[i] === 0xbf)) {
    i++;
  }
  const head = String.fromCharCode(...bytes.subarray(i, i + 5)).toLowerCase();
  return head.startsWith('<?xml') || head.startsWith('<svg');
}

let nodeFs: any = null;
let nodeFsPromise: Promise<any> | null = null;

function loadNodeFs(): Promise<any> {
  if (nodeFs) return Promise.resolve(nodeFs);
  if (nodeFsPromise) return nodeFsPromise;
  if (typeof process === 'undefined' || !(process as any).versions?.node) {
    return Promise.resolve(null);
  }
  nodeFsPromise = import('node:fs/promises')
    .then((mod) => {
      nodeFs = mod;
      return mod;
    })
    .catch(() => {
      nodeFs = null;
      return null;
    });
  return nodeFsPromise;
}

function toHeadBytes(input: Uint8Array | ArrayBuffer): Uint8Array {
  const view = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  return view.length > HEAD_BYTES ? view.subarray(0, HEAD_BYTES) : view;
}

/**
 * Sniff the real MIME type of a File/Blob/Buffer/ArrayBuffer, or a filesystem path (Node).
 * Returns the detected MIME string, or `null` when content is unavailable or unrecognized.
 */
export async function sniffFile(input: any): Promise<string | null> {
  if (!input) return null;

  let bytes: Uint8Array | null = null;

  try {
    if (typeof input === 'string') {
      const fsMod = await loadNodeFs();
      if (!fsMod) return null;
      let fh: any;
      try {
        fh = await fsMod.open(input, 'r');
        const buf = new Uint8Array(HEAD_BYTES);
        const { bytesRead } = await fh.read(buf, 0, HEAD_BYTES, 0);
        bytes = bytesRead > 0 ? buf.subarray(0, bytesRead) : null;
      } catch {
        return null;
      } finally {
        if (fh) await fh.close().catch(() => undefined);
      }
    } else if (input instanceof Uint8Array) {
      bytes = toHeadBytes(input);
    } else if (input instanceof ArrayBuffer) {
      bytes = toHeadBytes(input);
    } else if (typeof input.arrayBuffer === 'function') {
      const ab = await input.arrayBuffer();
      bytes = toHeadBytes(ab);
    } else if (input.buffer instanceof ArrayBuffer) {
      bytes = toHeadBytes(input.buffer);
    }
  } catch {
    return null;
  }

  return detectMime(bytes);
}
