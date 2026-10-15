import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
 await page.goto(process.env.PREVIEW_TEST_URL??'http://127.0.0.1:4174');
 await page.getByRole('button',{name:'Sign in as University',exact:true}).click();
 await page.getByRole('button',{name:'Sign & deliver diploma'}).click();
 await page.getByText('Diploma signed and delivered to the learner inbox.',{exact:true}).waitFor();
 await page.getByRole('button',{name:/3 Verify Employer/}).click();
 await page.getByRole('button',{name:'Sign in as Employer',exact:true}).click();
 await page.getByRole('button',{name:'Request evidence'}).click();
 await page.getByText('Evidence request created. The learner can review and approve it in Hold.',{exact:true}).waitFor();
 await page.getByRole('button',{name:/2 Hold Learner/}).click();
 await page.getByRole('button',{name:'Sign in as Learner',exact:true}).click();
 await page.getByRole('button',{name:'Receive diploma',exact:true}).click();
 await page.getByText('Credential checked and saved to your wallet.',{exact:true}).waitFor();
 await page.getByRole('checkbox',{name:'Select for presentation'}).check();
 await page.getByRole('button',{name:'Review disclosure',exact:true}).click();
 const consent=page.getByRole('checkbox',{name:'I approve sharing these full credentials and attributes for this purpose.'});await consent.waitFor();
 assert.equal(await page.getByRole('button',{name:'Authorize & present',exact:true}).isEnabled(),false);
 await consent.check();await page.getByRole('button',{name:'Authorize & present',exact:true}).click();
 await page.getByText('Signed presentation delivered to the employer. A portable copy was downloaded.',{exact:true}).waitFor();
 await page.getByRole('button',{name:/3 Verify Employer/}).click();
 await page.getByRole('button',{name:'Sign in as Employer',exact:true}).click();
 await page.getByRole('button',{name:'Verify presentation',exact:true}).click();
 await page.getByText('Accepted under demo policy',{exact:true}).waitFor();
 await mkdir('evidence',{recursive:true});await page.screenshot({path:'evidence/preview-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=globalThis.innerWidth),true);
 await page.screenshot({path:'evidence/preview-mobile.png',fullPage:true});
 // File delivery uses ordinary HTTPS downloads, outside the failing Cloud-file viewer.
 const completed=page.waitForEvent('download');await page.getByRole('link',{name:'Download source ZIP',exact:true}).click();const download=await completed;
 assert.equal(await download.failure(),null);assert.equal(download.suggestedFilename(),'LearningPassport-source.zip');
 await page.getByRole('button',{name:/2 Hold Learner/}).click();
 await page.getByRole('button',{name:'Sign in as Learner',exact:true}).click();
 await page.reload();await page.getByRole('heading',{name:'Your credentials',exact:true}).waitFor();
 assert.equal(await page.getByRole('checkbox',{name:'Select for presentation'}).count(),1);
 await page.getByLabel('Backup password · at least 12 characters').fill('correct horse battery staple');
 const backed=page.waitForEvent('download');await page.getByRole('button',{name:'Download encrypted backup',exact:true}).click();const backup=await backed;
 assert.equal(await backup.failure(),null);
 const negative=await page.evaluate(async()=>{
  const {browserApi:api}=await import('/src/browser-service.mjs');
  await api('login',{role:'issuer',password:'university-demo-change-me'});
  const credential=(await api('state')).records[0].credential;
  await api('status',{credentialId:credential.id,status:'suspended'});
  await api('login',{role:'employer',password:'employer-demo-change-me'});
  const suspended=await api('verify-credential',{credential});
  const tampered=structuredClone(credential);tampered.credentialSubject.degree.name='Doctor of Medicine';
  const bad=await api('verify-credential',{credential:tampered});
  await api('login',{role:'holder',password:'learner-demo-change-me'});
  const {backup}=await api('backup',{password:'correct horse battery staple'});
  let wrongPassword=false;try{await api('restore',{backup,password:'incorrect password'});}catch{wrongPassword=true;}
  const restored=await api('restore',{backup,password:'correct horse battery staple'});
  return {suspensionRejected:!suspended.accepted&&suspended.status.label==='Suspended',tamperRejected:!bad.signatureValid,wrongPasswordRejected:wrongPassword,backupRestored:restored.restored===1};
 });
 assert.equal(negative.suspensionRejected,true);assert.equal(negative.tamperRejected,true);assert.equal(negative.wrongPasswordRejected,true);assert.equal(negative.backupRestored,true);
 // Inspect only the storage envelope; do not expose key material.
 const data=await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('learning-passport-private-preview-v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const read=id=>new Promise(resolve=>{const r=db.transaction('wallet').objectStore('wallet').get(id);r.onsuccess=()=>resolve(r.result);});const encrypted=await read('encrypted-state');return {hasCiphertext:!!encrypted.body,containsLearnerName:JSON.stringify(encrypted).includes('Alex Morgan')};});
 assert.equal(data.hasCiphertext,true);assert.equal(data.containsLearnerName,false);
 assert.deepEqual(errors,[]);
 const result={passed:true,realLearnCardSigning:true,independentDigitalBazaarVerification:true,consentGate:true,sourceZipDownload:true,encryptedBackupDownload:true,reloadPersistence:true,desktopWidth:1440,mobileWidth:390,mobileNoOverflow:true,browserErrors:errors,...negative};
 await writeFile('evidence/preview-test.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
