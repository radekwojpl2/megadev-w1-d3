// One ticket per problem. Counted the desk's way (CauseTable): every report stays under its cause,
// parser or hint. The one-day moves in the desk's notes are a third problem; they get their own
// ticket and are still counted where they're filed, so the rows overlap by exactly those reports.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string; alsoIn: number };

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; groups: ProblemGroup[]; unplaced: Report[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  const unplaced: Report[] = [];
  const add = (p: Problem, r: Report) => by.set(p, [...(by.get(p) ?? []), r]);
  for (const r of merged) {
    const cause = causeOf(r, tenantOf(r));
    if (cause) add(cause, r);
    else unplaced.push(r);
    if (oneDayMove.includes(r.id)) add('shift', r);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        // Reports this row shares with the shift row (or, for shift, with the cause rows).
        alsoIn: problem === 'shift' ? 0 : rs.filter((r) => oneDayMove.includes(r.id)).length,
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged: merged.length, groups, unplaced };
}
