export const toNat = (id: string | number | bigint) =>
  BigInt(String(id).replace(/[^0-9]/g, "") || "0");
