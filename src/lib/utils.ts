import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CallDirection } from "../../shared/types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export interface ParsedFilenameData {
  name: string;
  phone: string;
  direction: CallDirection;
  timestamp: string;
}
export function parseCallFilename(filename: string): ParsedFilenameData | null {
  const regex = /^(.*?)\s\(\+1\s(.*?)\)\s(↗|↙)\s\(phone\)\s(\d{4}-\d{2}-\d{2})\s(\d{2}-\d{2}-\d{2})/;
  const match = filename.match(regex);
  if (!match) {
    return null;
  }
  const [, name, phone, directionSymbol, date, time] = match;
  const direction: CallDirection = directionSymbol === '↗' ? 'outbound' : 'inbound';

  const formattedPhone = `+1 ${phone}`;

  const timestamp = new Date(`${date}T${time.replace(/-/g, ':')}`).toISOString();
  return {
    name: name.trim(),
    phone: formattedPhone,
    direction,
    timestamp
  };
}