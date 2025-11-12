export const toBatteryPercentage = (rawValue: number): number =>
  Math.max(Math.min(((rawValue - 3.5) / (4.2 - 3.5)) * 100, 100), 0);

