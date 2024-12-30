export const OPERATIING_SYSTEMS = [
  "Windows",
  "MacOS",
  "Linux",
  "Android",
  "iOS",
];
export const enum DocumentType {
  NDA = "Non-Disclosure Agreement",
  IDENTITY_PROOF = "Identity proof",
  OTHER = "Other",
}

export const DOCUMENT_TYPES = [
  DocumentType.NDA,
  DocumentType.IDENTITY_PROOF,
  DocumentType.OTHER,
];

export const enum ContentType {
  // Image types
  JPEG = "image/jpeg",
  JPG = "image/jpg",
  PNG = "image/png",
  GIF = "image/gif",
  SVG = "image/svg+xml",
  WEBP = "image/webp",

  // Document types
  PDF = "application/pdf",
  DOC = "application/msword",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPT = "application/vnd.ms-powerpoint",
  PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Audio types
  MP3 = "audio/mpeg",
  WAV = "audio/wav",
  OGG = "audio/ogg",

  // Video types
  MP4 = "video/mp4",
  WEBM = "video/webm",
  AVI = "video/x-msvideo",

  // Text types
  PLAIN_TEXT = "text/plain",
  HTML = "text/html",
  CSS = "text/css",
  JSON = "application/json",
  JAVASCRIPT = "application/javascript",

  // Compressed file types
  ZIP = "application/zip",
  RAR = "application/vnd.rar",
  TAR = "application/x-tar",
  GZIP = "application/gzip",

  // Other types
  XML = "application/xml",
  BIN = "application/octet-stream",
  CSV = "text/csv",
}
