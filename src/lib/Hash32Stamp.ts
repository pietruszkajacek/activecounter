import { xxHash32 } from "js-xxhash";

export function Hash32Stamp(str: string, seed: number = 0) {
  const hashNum = xxHash32(str, seed);

  return hashNum.toString(16);
}
