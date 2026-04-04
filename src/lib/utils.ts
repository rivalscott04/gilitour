import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Digits only for wa.me (strips spaces, dashes, parentheses, +). */
export function digitsForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}
