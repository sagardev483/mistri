type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs.flat(Infinity as 1).filter(Boolean).join(" ");
}