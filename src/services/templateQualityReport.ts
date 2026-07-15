import { CommandBlock } from '../types';
import { QualityReport, qualityCheckTemplate } from './templateValidator';

export function generateQualityReport(templates: Array<{
  id: string;
  name: string;
  commands: CommandBlock[];
}>): QualityReport {
  const results = templates.map(qualityCheckTemplate);
  const checkNames = ['hasWinLose', 'hasSoundEffects', 'hasScoreTracking', 'isComplete', 'hasDifficultyProgression'] as const;
  const passedChecks: Record<string, { passed: number; failed: number }> = {};
  for (const name of checkNames) {
    passedChecks[name] = { passed: 0, failed: 0 };
  }
  const templatesWithIssues: QualityReport['templatesWithIssues'] = [];

  for (const result of results) {
    const failedChecks: string[] = [];
    for (const name of checkNames) {
      if (result.checks[name]) {
        passedChecks[name].passed++;
      } else {
        passedChecks[name].failed++;
        failedChecks.push(name);
      }
    }
    if (failedChecks.length > 0) {
      templatesWithIssues.push({
        id: result.templateId,
        name: result.templateName,
        failedChecks,
      });
    }
  }

  return {
    totalTemplates: templates.length,
    passedChecks,
    templatesWithIssues,
  };
}

export function printQualityReport(report: QualityReport): void {
  console.info(`\n=== Template Quality Report ===`);
  console.info(`Total templates: ${report.totalTemplates}`);
  console.info(`Templates with issues: ${report.templatesWithIssues.length}`);
  console.info(`\nCheck Results:`);
  for (const [check, stats] of Object.entries(report.passedChecks)) {
    console.info(`  ${check}: ${stats.passed} passed, ${stats.failed} failed`);
  }
  if (report.templatesWithIssues.length > 0) {
    console.info(`\nTemplates with Issues:`);
    for (const t of report.templatesWithIssues) {
      console.info(`  ${t.name} (${t.id}): ${t.failedChecks.join(', ')}`);
    }
  }
  console.info('');
}
