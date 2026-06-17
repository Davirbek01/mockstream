// Netlify function: mock-pdf
// Renders site/print-mock.html for a given mock to a real PDF via headless Chrome
// and returns it as a one-click download. Quality = browser print engine: small,
// crisp, selectable, paginated (print CSS uses break-inside:avoid → no cut-offs).
//
//   /.netlify/functions/mock-pdf?type=<mock_type>&id=<row id>[&key=1]
//   /.netlify/functions/mock-pdf?type=<mock_type>&number=<mock_number>[&key=1]
//
// Deps (root package.json): puppeteer-core + @sparticuz/chromium (Lambda Chromium).

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const ALLOWED_TYPES = new Set([
  'cefr-reading', 'ielts-reading',
  'cefr-listening', 'ielts-listening',
  'cefr-writing', 'ielts-writing',
  'cefr-speaking', 'ielts-speaking'
]);

export const handler = async (event) => {
  const p = event.queryStringParameters || {};
  const type = p.type;
  const id = p.id || p.sbmock;
  const number = p.number;

  if (!type || !ALLOWED_TYPES.has(type)) {
    return { statusCode: 400, body: 'Missing or invalid ?type' };
  }
  if (!id && !number) {
    return { statusCode: 400, body: 'Missing ?id or ?number' };
  }

  // Build the print-view URL on the SAME deploy that served this function.
  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const qs = new URLSearchParams({ type });
  if (id) qs.set('id', id); else qs.set('number', number);
  if (p.key === '1') qs.set('key', '1');
  const printUrl = `${proto}://${host}/print-mock.html?${qs.toString()}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1240, height: 1754 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 22000 });
    // print-mock.html sets window.__printReady once content + images have settled.
    await page.waitForFunction('window.__printReady === true', { timeout: 12000 }).catch(() => {});

    let title = 'mock';
    try { title = (await page.title()) || 'mock'; } catch (_e) {}

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' }
    });

    const fname = String(title).replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'mock';
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fname}.pdf"`,
        'Cache-Control': 'public, max-age=600'
      },
      body: Buffer.from(pdf).toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: 'PDF generation failed: ' + (e && e.message ? e.message : String(e)) };
  } finally {
    if (browser) { try { await browser.close(); } catch (_e) {} }
  }
};
