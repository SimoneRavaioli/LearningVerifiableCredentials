import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';

const origin=process.env.TEST_URL??'http://127.0.0.1:4182';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??(process.env.CI?chromium.executablePath():'/usr/bin/chromium'),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const start=new Date('2026-10-20T12:00:00Z');
const later=days=>new Date(start.getTime()+days*86400000);
const receive=()=>page.getByRole('button',{name:'Receive credential',exact:true});
async function studio(){await page.getByRole('button',{name:'Demo tools'}).click();await page.getByRole('button',{name:'University · issue & manage status'}).click();}
async function wallet(){await page.getByRole('navigation',{name:'Learner wallet'}).getByRole('button',{name:'Wallet',exact:true}).click();}
try{
 await page.clock.install({time:start});
 await page.goto(origin);await receive().waitFor({timeout:30000});
 // Preserve the real encrypted database and original credential across a five-day absence.
 await page.getByRole('navigation',{name:'Learner wallet'}).getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByText('Your wallet identifier',{exact:true}).click();const originalDid=await page.locator('code').textContent();
 await page.clock.setSystemTime(later(5));await page.reload();await receive().waitFor({timeout:30000});
 await receive().click();
 await page.getByText('Credential checked and saved. You can now review the employer request.',{exact:true}).waitFor({timeout:10000});
 await page.getByRole('button',{name:/Bachelor of Science/}).click();await page.getByRole('button',{name:'Check this credential',exact:true}).click();
 await page.getByRole('heading',{name:'Verified and matches this request',exact:true}).waitFor();
 // A refresh must preserve suspension and revocation, never reset issuer records.
 await studio();await page.getByRole('button',{name:'Suspend',exact:true}).click();
 await page.clock.setSystemTime(later(10));await wallet();await page.getByRole('button',{name:/Bachelor of Science/}).click();
 await page.getByRole('button',{name:'Check this credential',exact:true}).click();await page.getByRole('heading',{name:'Suspended',exact:true}).waitFor();
 await studio();await page.getByRole('button',{name:'Revoke permanently',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Revoke permanently',exact:true}).click();
 await page.clock.setSystemTime(later(15));await wallet();await page.getByRole('button',{name:/Bachelor of Science/}).click();
 await page.getByRole('button',{name:'Check this credential',exact:true}).click();await page.getByRole('heading',{name:'Revoked',exact:true}).waitFor();
 // An expired offline cache stays incomplete. Reconnecting repairs only local demo evidence.
 await studio();await page.getByRole('button',{name:'Sign and deliver credential',exact:true}).click();await page.getByText('New credential delivered to the learner inbox.',{exact:true}).waitFor();
 await wallet();await receive().waitFor();await page.clock.setSystemTime(later(20));await context.setOffline(true);
 await receive().click();await page.getByRole('alert').filter({hasText:'Fresh signed status evidence is unavailable'}).waitFor();assert.equal(await receive().count(),1);
 await context.setOffline(false);await receive().click();await page.getByText('Credential checked and saved. You can now review the employer request.',{exact:true}).waitFor();
 // Verification must also refresh aged evidence when no receipt/inspection ran first.
 await page.clock.setSystemTime(later(25));await page.getByRole('button',{name:'Demo tools'}).click();await page.getByRole('button',{name:'Employer · request & verify'}).click();await page.getByRole('button',{name:'Create new evidence request'}).click();
 await page.getByRole('navigation',{name:'Learner wallet'}).getByRole('button',{name:'Requests',exact:true}).click();
 const choices=page.locator('fieldset input[type=checkbox]');await choices.nth(1).check();
 await page.getByRole('button',{name:'Review request',exact:true}).click();await page.getByRole('checkbox',{name:/I approve sending/}).check();await page.getByRole('button',{name:'Approve and share'}).click();
 await page.getByText('Your evidence is on its way.',{exact:true}).waitFor();await page.getByRole('button',{name:'Demo tools'}).click();await page.getByRole('button',{name:'Employer · request & verify'}).click();await page.getByRole('button',{name:'Verify presentation',exact:true}).click();await page.getByRole('heading',{name:'Verified and matches this request',exact:true}).waitFor();
 await page.getByRole('navigation',{name:'Learner wallet'}).getByRole('button',{name:'Settings',exact:true}).click();await page.getByText('Your wallet identifier',{exact:true}).click();assert.equal(await page.locator('code').textContent(),originalDid);
 // A clean device has no original issuer keys. It cannot renew an old backup's evidence.
 await page.getByLabel('Backup password · 12–200 characters').fill('returning wallet test password');const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download encrypted backup'}).click();const backupPath=await(await download).path();
 const recovered=await browser.newContext({viewport:{width:390,height:844}}),recovery=await recovered.newPage();await recovery.clock.install({time:later(30)});await recovery.goto(origin);await recovery.getByRole('button',{name:'Receive credential',exact:true}).waitFor({timeout:30000});await recovery.getByRole('navigation',{name:'Learner wallet'}).getByRole('button',{name:'Settings',exact:true}).click();
 await recovery.getByLabel('Backup password · 12–200 characters').fill('returning wallet test password');await recovery.getByRole('checkbox',{name:/I trust the original source/}).check();await recovery.locator('input[type=file]').first().setInputFiles(backupPath);await recovery.getByText('2 credentials recovered with the original wallet identity.',{exact:true}).waitFor();
 await recovery.getByRole('navigation',{name:'Learner wallet'}).getByRole('button',{name:'Wallet',exact:true}).click();await recovery.getByRole('button',{name:/Bachelor of Science/}).last().click();await recovery.getByRole('button',{name:'Check this credential',exact:true}).click();await recovery.getByRole('heading',{name:'Could not complete checks',exact:true}).waitFor();await recovery.getByText('Fresh signed status evidence is unavailable',{exact:true}).waitFor();await recovered.close();
 assert.deepEqual(errors,[]);
 const manifest=JSON.parse(await readFile('dist/build-manifest.json','utf8'));
 await writeFile('evidence/returning-browser.json',JSON.stringify({recordedAtUTC:new Date().toISOString(),buildId:manifest.buildId,passed:true,fiveDayReturn:true,identityPreserved:true,suspensionPreserved:true,revocationPreserved:true,offlineStaleEvidenceRejected:true,reconnectRecovery:true,agedPresentationVerified:true,foreignRestoredEvidenceNotRenewed:true,browserErrors:errors},null,2));
 console.log('Returning-browser regression passed: aged evidence, suspension, revocation, offline refusal and reconnect recovery');
}finally{await browser.close();}
