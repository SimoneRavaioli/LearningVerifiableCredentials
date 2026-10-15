import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>console.log('PAGE ERROR',e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await page.goto('http://127.0.0.1:4520');await page.getByRole('button',{name:'Receive credential'}).waitFor({timeout:30000});await page.getByRole('button',{name:'Receive credential'}).click();
await page.getByText('Credential checked and saved. You can now review the employer request.',{exact:true}).waitFor({timeout:20000});
console.log('receive passed');await page.screenshot({path:'evidence/mobile-wallet.png',fullPage:true});await browser.close();
