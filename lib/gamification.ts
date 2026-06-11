// Gamification model for Rutherford Academy.
//
// Pure, dependency-free helpers shared by the server (account route, progress
// API) and the client (account page, course page). Keep this file free of any
// data or Supabase imports so it stays cheap to include in the client bundle.
//
// The model is deliberately simple and "language-app" flavoured: every module
// you finish earns XP, finishing a whole course earns a bonus, XP unlocks
// ranks (levels), and each 25 % step inside a course is a "palier" worth a
// little celebration.

export const XP_PER_MODULE = 10;
export const XP_PER_COURSE = 50;
export const XP_PER_CERTIFICATE = 50;

/** Minimum XP to reach each rank. Index 0 = rank 1 (level is 1-based). */
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700] as const;
export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export type LevelInfo = {
  /** 1-based rank. */
  level: number;
  isMax: boolean;
  /** XP at which the current rank starts. */
  currentThreshold: number;
  /** XP at which the next rank starts, or null at max rank. */
  nextThreshold: number | null;
  /** XP earned inside the current rank. */
  xpIntoLevel: number;
  /** Width of the current rank in XP (next - current); 0 at max rank. */
  xpForLevel: number;
  /** XP still needed to reach the next rank; 0 at max rank. */
  xpToNext: number;
  /** Fill of the rank progress bar, 0..100. */
  percentIntoLevel: number;
};

export function levelForXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (safeXp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const isMax = level >= MAX_LEVEL;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = isMax ? null : LEVEL_THRESHOLDS[level];
  const xpIntoLevel = safeXp - currentThreshold;
  const xpForLevel = nextThreshold === null ? 0 : nextThreshold - currentThreshold;
  const xpToNext = nextThreshold === null ? 0 : nextThreshold - safeXp;
  const percentIntoLevel = xpForLevel === 0 ? 100 : Math.round((xpIntoLevel / xpForLevel) * 100);
  return {
    level,
    isMax,
    currentThreshold,
    nextThreshold,
    xpIntoLevel,
    xpForLevel,
    xpToNext,
    percentIntoLevel,
  };
}

export type CourseStat = { completedCount: number; total: number; certified?: boolean };

/** Completion of a single course, rounded to a whole percent (0..100). */
export function coursePercent({ completedCount, total }: CourseStat): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(completedCount, total) / total) * 100);
}

export function isCourseComplete({ completedCount, total }: CourseStat): boolean {
  return total > 0 && completedCount >= total;
}

export const PALIERS = [25, 50, 75, 100] as const;
export type Palier = (typeof PALIERS)[number];

/** Highest palier reached for a given percent (0 when below 25 %). */
export function highestPalier(percent: number): Palier | 0 {
  let reached: Palier | 0 = 0;
  for (const p of PALIERS) if (percent >= p) reached = p;
  return reached;
}

/**
 * Paliers crossed when progress moves oldPercent -> newPercent. Used to fire a
 * celebration only on the step that actually unlocked it.
 */
export function newlyCrossedPaliers(oldPercent: number, newPercent: number): Palier[] {
  return PALIERS.filter((p) => oldPercent < p && newPercent >= p);
}

export type OverallStats = {
  completedModules: number;
  totalModules: number;
  coursesCompleted: number;
  coursesStarted: number;
  certifiedCount: number;
  totalCourses: number;
  xp: number;
  level: LevelInfo;
};

/**
 * Roll up a set of per-course stats into the headline numbers shown on the
 * account dashboard. Denominators are the user's own library (the courses
 * passed in), so progress reads honestly rather than against the full catalog.
 * Passing a course's final assessment (`certified`) earns a separate XP bonus.
 */
export function overallStats(courses: CourseStat[]): OverallStats {
  let completedModules = 0;
  let totalModules = 0;
  let coursesCompleted = 0;
  let coursesStarted = 0;
  let certifiedCount = 0;
  for (const c of courses) {
    const done = Math.min(c.completedCount, c.total);
    completedModules += done;
    totalModules += c.total;
    if (done > 0) coursesStarted += 1;
    if (isCourseComplete(c)) coursesCompleted += 1;
    if (c.certified) certifiedCount += 1;
  }
  const xp =
    completedModules * XP_PER_MODULE +
    coursesCompleted * XP_PER_COURSE +
    certifiedCount * XP_PER_CERTIFICATE;
  return {
    completedModules,
    totalModules,
    coursesCompleted,
    coursesStarted,
    certifiedCount,
    totalCourses: courses.length,
    xp,
    level: levelForXp(xp),
  };
}
