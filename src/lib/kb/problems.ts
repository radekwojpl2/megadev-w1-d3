// One ticket per problem. causes.ts says why a report went wrong (parser or hint); the desk's
// notes add the reports whose date moved by one day, which neither cause can produce.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  if (oneDayMove.includes(r.id)) return 'shift';
  return causeOf(r, t);
}

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; groups: ProblemGroup[]; unplaced: Report[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  const unplaced: Report[] = [];
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    if (p) by.set(p, [...(by.get(p) ?? []), r]);
    else unplaced.push(r);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged: merged.length, groups, unplaced };
}
