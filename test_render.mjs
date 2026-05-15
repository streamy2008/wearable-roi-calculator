import puppeteer from 'puppeteer';

async function run() {
  console.log('Starting puppeteer check...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request => console.log('BROWSER REQ FAIL:', request.url(), request.failure()?.errorText));
  page.on('response', response => {
    if (response.status() >= 400) console.log('BROWSER ERROR STATUS:', response.status(), response.url());
  });
  
  try {
    // Check dev server first (locally)
    console.log('Visiting localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    const content = await page.content();
    console.log('Localhost content length:', content.length);
    
    // Check if "root" has contents
    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML);
    console.log('Root innerHTML length:', rootHtml?.length || 0);

  } catch (err) {
    console.error('Puppeteer error:', err.message);
  } finally {
    await browser.close();
  }
}
run();
