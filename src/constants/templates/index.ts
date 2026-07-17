import { sportsTemplates } from './sports';
import { actionTemplates } from './action';
import { adventureTemplates } from './adventure';
import { shooterTemplates } from './shooter';
import { survivalTemplates } from './survival';
import { puzzleTemplates } from './puzzle';
import { racingTemplates } from './racing';
import { platformerTemplates } from './platformer';
import { otherTemplates } from './other';
import { classicTemplates } from './classic';
import { genreTemplates } from './genres';
import { battleTemplates } from './battle';
import { arcadeTemplates } from './arcade';
import { cycle9Templates } from './cycle9';
import { phase3Templates } from './phase3';
import { minecraftTemplates } from './minecraft';
import { validateAllTemplates } from '../../services/templateValidator';
import { generateQualityReport } from '../../services/templateQualityReport';

export const ALL_TEMPLATES = [
    ...sportsTemplates,
    ...actionTemplates,
    ...adventureTemplates,
    ...shooterTemplates,
    ...survivalTemplates,
    ...puzzleTemplates,
    ...racingTemplates,
    ...platformerTemplates,
    ...otherTemplates,
    ...classicTemplates,
    ...genreTemplates,
    ...battleTemplates,
    ...arcadeTemplates,
    ...cycle9Templates,
    ...phase3Templates,
    ...minecraftTemplates,
];

const validationResults = validateAllTemplates(ALL_TEMPLATES);
const qualityReport = generateQualityReport(ALL_TEMPLATES);

const validationErrors = validationResults.filter(r => r.errors.length > 0);
if (validationErrors.length > 0) {
    console.warn(`[Template Validation] ${validationErrors.length} templates have issues:`);
    for (const result of validationErrors) {
        console.warn(`  ${result.templateName} (${result.templateId}): ${result.errors.length} issues`);
    }
}

const templatesWithWarnings = qualityReport.templatesWithIssues.length;
if (templatesWithWarnings > 0) {
    console.info(`[Template Quality] ${templatesWithWarnings}/${qualityReport.totalTemplates} templates need quality improvements`);
}
