import check from './generated-validator.mjs';
import context from './openbadges/context-3.0.3.json' with { type: 'json' };
import schema from './openbadges/learning-passport-profile.schema.json' with { type: 'json' };

export const CONTEXT = ['https://www.w3.org/ns/credentials/v2', 'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'];
export const documents = { [CONTEXT[1]]: context };

/** An application subset of OB3, not the complete official conformance schema. */
export function makeSubject({holder, name, qualification, awardDate, code}) {
    return {
        id: holder,
        type: ['AchievementSubject'],
        name,
        activityEndDate: awardDate.slice(0, 10),
        achievement: {
            id: `https://example.edu/achievements/${encodeURIComponent(code)}`,
            type: ['Achievement'],
            achievementType: 'BachelorDegree',
            humanCode: code,
            name: qualification,
            description: `Synthetic demonstration award: ${qualification}.`,
            criteria: { narrative: 'Complete the prescribed programme and pass all required assessments. Synthetic demonstration criteria.' }
        }
    };
}

export function viewCredential(c) {
    const s = Array.isArray(c.credentialSubject) ? c.credentialSubject[0] : c.credentialSubject;
    const a = s?.achievement;
    let code = a?.humanCode || '';
    if (!code && a?.id) {
        try { code = decodeURIComponent(new URL(a.id).pathname.split('/').pop()); } catch { code = ''; }
    }
    return {
        id: c.id,
        name: a?.name || c.name || 'Learning credential',
        learner: s?.name || '',
        holder: s?.id || '',
        code,
        awardDate: (c.awardedDate || s?.activityEndDate || '').slice(0, 10),
        issued: c.validFrom || c.issuanceDate || '',
        issuer: typeof c.issuer === 'string' ? c.issuer : c.issuer?.id,
        type: a?.achievementType || 'Achievement'
    };
}
export function validateEducationCredential(credential) {
    const valid = check(credential);
    return { valid, errors: valid ? [] : structuredClone(check.errors) };
}
export {schema};
