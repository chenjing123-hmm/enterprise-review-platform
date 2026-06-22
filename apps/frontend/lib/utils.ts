import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 CSS 类名，使用 clsx 组合类名并用 tailwind-merge 智能合并 Tailwind 冲突类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}