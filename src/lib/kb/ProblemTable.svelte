<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // Where each problem is tracked: one issue per problem, in this repo.
  let { ticket, issues, repo }: { ticket: number; issues: Record<Problem, number>; repo: string } = $props();

  const LABEL: Record<Problem, string> = {
    parser: 'shared parser reads dates month first',
    hint: 'booking-v3 form hint says MM/DD/YYYY',
    shift: 'date moves by one day (time zone)',
  };

  const split = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong> problems{#if split.unplaced.length} · <strong>{split.unplaced.length}</strong> not placed{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> {LABEL[g.problem]}</td>
        <td>{g.reports.length}{#if g.alsoIn}<sup>*</sup>{/if}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td><a href="https://github.com/{repo}/issues/{issues[g.problem]}">#{issues[g.problem]}</a></td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.groups.filter((g) => g.alsoIn) as g (g.problem)}
  <p class="note">* {g.alsoIn} of these read as a one-day move: counted here, where the desk files them, and again under <code>shift</code>.</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
