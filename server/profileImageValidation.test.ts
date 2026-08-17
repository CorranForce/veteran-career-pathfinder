import { describe, expect, it } from "vitest";
import { decodeProfileImageData } from "./profileImageValidation";

function imageData(mimeType: string, bytes: number[]) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

describe("decodeProfileImageData", () => {
  it("accepts a PNG payload with a matching MIME type and signature", () => {
    const decoded = decodeProfileImageData(
      imageData("image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png"
    );

    expect(decoded).toHaveLength(8);
  });

  it("rejects a payload whose data URL type differs from the declared type", () => {
    expect(() => decodeProfileImageData(imageData("image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/jpeg")).toThrow(
      "does not match"
    );
  });

  it("accepts a legacy raw base64 payload after validating its file signature", () => {
    const base64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64");

    expect(decodeProfileImageData(base64, "image/png")).toHaveLength(8);
  });

  it("rejects an image whose file signature does not match its declared type", () => {
    expect(() => decodeProfileImageData(imageData("image/jpeg", [0x89, 0x50, 0x4e, 0x47]), "image/jpeg")).toThrow(
      "not a valid image"
    );
  });
});
