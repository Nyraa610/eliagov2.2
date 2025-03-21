
/**
 * Get the color for a risk score badge based on the score value
 */
export function getRiskScoreColor(score: number): string {
  if (score <= 3) return "bg-green-100 text-green-800";
  if (score <= 6) return "bg-yellow-100 text-yellow-800";
  if (score <= 8) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}
