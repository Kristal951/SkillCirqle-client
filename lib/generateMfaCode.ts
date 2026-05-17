import crypto from "crypto";

export const generateRecoveryCodes = (count = 8) => {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();

    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  });
};
