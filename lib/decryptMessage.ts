import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

const secret = process.env.MESSAGE_ENCRYPTION_KEY;

if (!secret) {
  throw new Error("Missing MESSAGE_ENCRYPTION_KEY");
}

const KEY = Buffer.from(secret, "hex");

export const decryptMessage = (encryptedText: string): string => {
  const [ivHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");

  decrypted += decipher.final("utf8");

  return decrypted;
};
