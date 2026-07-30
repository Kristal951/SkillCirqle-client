import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

const secret = process.env.MESSAGE_ENCRYPTION_KEY;

if (!secret) {
  throw new Error("Missing MESSAGE_ENCRYPTION_KEY");
}

const KEY = Buffer.from(secret, "hex");

export const decryptMessage = (
  encryptedText: string,
  fallback = "[unable to decrypt message]",
): string => {
  console.log(encryptedText)
  try {
    const [ivHex, encrypted] = encryptedText.split(":");

    if (!ivHex || !encrypted) {
      throw new Error("Malformed encrypted content");
    }

    const iv = Buffer.from(ivHex, "hex");

    if (iv.length !== 16) {
      throw new Error("Invalid IV length");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("❌ decryptMessage failed:", (err as Error).message);
    return fallback;
  }
};
