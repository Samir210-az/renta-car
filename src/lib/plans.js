export const PLAN_OPTIONS = [
  { id: "trial", label: "3 gün pulsuz", days: 3 },
  { id: "1ay", label: "1 Ay", days: 30 },
  { id: "6ay", label: "6 Ay", days: 182 },
  { id: "1il", label: "1 İl", days: 365 },
];

export function planLabel(planId) {
  return PLAN_OPTIONS.find((p) => p.id === planId)?.label || planId;
}

export function planDays(planId) {
  return PLAN_OPTIONS.find((p) => p.id === planId)?.days || 0;
}
