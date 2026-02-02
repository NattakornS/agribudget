import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ColorPalette {
  base: string;
  border: string;
}

export function generateColors(count: number): ColorPalette[] {
  // Define a base set of colors for financial data visualization
  const baseColors: ColorPalette[] = [
    { base: "rgba(54, 162, 235, 0.6)", border: "rgba(54, 162, 235, 1)" }, // Blue
    { base: "rgba(75, 192, 192, 0.6)", border: "rgba(75, 192, 192, 1)" }, // Teal
    { base: "rgba(255, 159, 64, 0.6)", border: "rgba(255, 159, 64, 1)" }, // Orange
    { base: "rgba(153, 102, 255, 0.6)", border: "rgba(153, 102, 255, 1)" }, // Purple
    { base: "rgba(255, 99, 132, 0.6)", border: "rgba(255, 99, 132, 1)" }, // Red
    { base: "rgba(255, 205, 86, 0.6)", border: "rgba(255, 205, 86, 1)" }, // Yellow
    { base: "rgba(201, 203, 207, 0.6)", border: "rgba(201, 203, 207, 1)" }, // Grey
    { base: "rgba(100, 181, 246, 0.6)", border: "rgba(100, 181, 246, 1)" }, // Light Blue
  ];

  // If we need more colors than our base set, generate them
  if (count > baseColors.length) {
    const additionalColors: ColorPalette[] = [];
    for (let i = baseColors.length; i < count; i++) {
      const hue = (i * 137.5) % 360; // Use golden angle approximation for even distribution
      additionalColors.push({
        base: `hsla(${hue}, 70%, 65%, 0.6)`,
        border: `hsla(${hue}, 70%, 65%, 1)`,
      });
    }
    return [...baseColors, ...additionalColors];
  }

  return baseColors.slice(0, count);
}
export function getDuration(started_date: string, end_date: string, language: string = 'en') {
  const start = new Date(started_date);
  if (isNaN(start.getTime())) return "";
  let now = new Date();
  if (end_date) {
    now = new Date(end_date);
  }
  if (start > now) return language === 'th' ? "0วัน" : "0d";

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    // borrow days from previous month
    const prevMonthLastDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).getDate();
    days += prevMonthLastDay;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years}${language === 'th' ? 'ปี' : 'y'}`);
  }
  if (months > 0) {
    parts.push(`${months}${language === 'th' ? 'เดือน' : 'm'}`);
  }
  // always show days (if everything is zero, show "0d")
  if (days > 0 || parts.length === 0) {
    parts.push(`${days}${language === 'th' ? 'วัน' : 'd'}`);
  }

  return parts.join("");
}

export function formatArea(area: number, language: string): string {
  if (language === 'th') {
    const rai = area / 1600;
    return `${rai.toFixed(2)} ไร่`;
  } else {
    const hectares = area / 10000;
    return `${hectares.toFixed(2)} hectares`;
  }
}

export function convertToSqm(value: number, language: string): number {
  if (language === 'th') {
    return value * 1600; // rai to sqm
  } else {
    return value * 10000; // hectares to sqm
  }
}

export function convertFromSqm(area: number, language: string): number {
  if (language === 'th') {
    return area / 1600; // sqm to rai
  } else {
    return area / 10000; // sqm to hectares
  }
}