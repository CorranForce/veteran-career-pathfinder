import { TRPCError } from "@trpc/server";

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

type SupportedProfileImageType = (typeof SUPPORTED_PROFILE_IMAGE_TYPES)[number];

function hasExpectedImageSignature(buffer: Buffer, mimeType: SupportedProfileImageType): boolean {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === "image/gif") {
    return buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  }

  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export function decodeProfileImageData(imageData: string, mimeType: string): Buffer {
  if (!SUPPORTED_PROFILE_IMAGE_TYPES.includes(mimeType as SupportedProfileImageType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Unsupported image format. Use PNG, JPEG, GIF, or WebP",
    });
  }

  const dataUrlMatch = imageData.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
  const rawBase64Match = imageData.match(/^([A-Za-z0-9+/]+={0,2})$/);
  const base64Data = dataUrlMatch?.[2] ?? rawBase64Match?.[1];

  if ((dataUrlMatch && dataUrlMatch[1] !== mimeType) || !base64Data) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The image data does not match the selected file type" });
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length === 0 || buffer.length > MAX_PROFILE_IMAGE_BYTES) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Profile pictures must be between 1 byte and 5MB" });
  }

  if (!hasExpectedImageSignature(buffer, mimeType as SupportedProfileImageType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The uploaded file is not a valid image of the selected type" });
  }

  return buffer;
}

export { MAX_PROFILE_IMAGE_BYTES, SUPPORTED_PROFILE_IMAGE_TYPES };
