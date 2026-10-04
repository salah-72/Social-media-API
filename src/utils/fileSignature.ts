type SignatureCheck = (buffer: Buffer) => boolean;

const IMAGE_SIGNATURES: SignatureCheck[] = [
  (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  (b) =>
    b.length > 7 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  (b) =>
    b.length > 5 &&
    b.toString('ascii', 0, 3) === 'GIF' &&
    ['87a', '89a'].includes(b.toString('ascii', 3, 6)),
  (b) =>
    b.length > 11 &&
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP',
];

const VIDEO_SIGNATURES: SignatureCheck[] = [
  (b) => b.length > 11 && b.toString('ascii', 4, 8) === 'ftyp',
  (b) =>
    b.length > 3 &&
    b[0] === 0x1a &&
    b[1] === 0x45 &&
    b[2] === 0xdf &&
    b[3] === 0xa3,
];

export const isImageBuffer = (buffer: Buffer): boolean =>
  IMAGE_SIGNATURES.some((check) => check(buffer));

export const isVideoBuffer = (buffer: Buffer): boolean =>
  VIDEO_SIGNATURES.some((check) => check(buffer));

export const isAllowedMediaBuffer = (buffer: Buffer): boolean =>
  isImageBuffer(buffer) || isVideoBuffer(buffer);
