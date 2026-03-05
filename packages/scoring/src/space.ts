import type { SessionScore } from "@useai/types";

/**
 * SPACE framework scoring for individual sessions.
 * Dimensions: Satisfaction, Performance, Activity, Communication, Efficiency
 */
export function computeSpaceScore(params: {
  durationMs: number;
  taskType: string;
  completedSuccessfully: boolean;
}): SessionScore {
  const { durationMs, taskType, completedSuccessfully } = params;

  const satisfaction = completedSuccessfully ? 0.8 : 0.3;
  const performance = computePerformance(durationMs, completedSuccessfully);
  const activity = Math.min(1, durationMs / (60 * 60 * 1000));
  const communication = 0.5; // placeholder — needs prompt analysis
  const efficiency = computePerformance(durationMs, completedSuccessfully);

  const components: Record<string, number> = {
    satisfaction,
    performance,
    activity,
    communication,
    efficiency,
  };

  const overall =
    Object.values(components).reduce((a, b) => a + b, 0) /
    Object.keys(components).length;

  return { overall, components, framework: "space" };
}

function computePerformance(
  durationMs: number,
  completed: boolean,
): number {
  if (!completed) return 0.2;
  const minutes = durationMs / 60_000;
  if (minutes < 5) return 0.9;
  if (minutes < 30) return 0.7;
  if (minutes < 60) return 0.5;
  return 0.3;
}
