import { spawn } from 'child_process';
import assert from 'assert';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9222;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Launching headless Edge with Chrome DevTools Protocol on port', PORT);
  
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\temp\\edge_test_profile',
    'http://localhost:3000'
  ]);

  let connected = false;
  let targetWsUrl = null;

  // Wait for CDP to be available
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        targetWsUrl = list[0].webSocketDebuggerUrl;
        connected = true;
        break;
      }
    } catch (e) {
      // wait
    }
    await sleep(500);
  }

  if (!connected || !targetWsUrl) {
    console.error('❌ Could not connect to Edge DevTools Protocol');
    edge.kill();
    process.exit(1);
  }

  console.log('✅ Connected to Edge via WebSocket:', targetWsUrl);

  const ws = new WebSocket(targetWsUrl);
  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await new Promise((resolve) => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable Page and Runtime
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('CSS.enable');

  console.log('⏳ Navigating to http://localhost:3000 and waiting for load event...');
  const loadPromise = new Promise(resolve => {
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Page.loadEventFired') {
        resolve();
      }
    };
    ws.addEventListener('message', handler);
  });

  await send('Page.navigate', { url: 'http://localhost:3000' });
  await loadPromise;
  await sleep(1500);

  // Click the "Generate PO Draft" button
  console.log('👉 Triggering "Generate PO Draft" click...');
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const poBtn = btns.find(b => b.innerText.includes('Generate PO Draft') || b.innerText.includes('Draft PO'));
      if (poBtn) {
        poBtn.click();
        return { success: true, text: poBtn.innerText };
      }
      return { success: false, buttons: btns.map(b => b.innerText).slice(0, 5) };
    })()`,
    returnByValue: true
  });

  console.log('   Click Result:', clickResult.result?.result?.value || clickResult.result?.value);

  // Wait for Drawer animation
  await sleep(1000);

  // Emulate Print Media
  console.log('🖨️ Emulating CSS print media: Emulation.setEmulatedMedia { media: "print" }...');
  await send('Emulation.setEmulatedMedia', { media: 'print' });

  // Verify display and visibility of elements under print media
  const verification = await send('Runtime.evaluate', {
    expression: `(() => {
      const main = document.querySelector('main');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const poDrawerHeader = document.querySelector('.po-drawer-header');
      const poDrawerTabs = document.querySelector('.po-drawer-tabs');
      const poDrawerFooter = document.querySelector('.po-drawer-footer');
      const poSummaryStrip = document.querySelector('.po-summary-strip');
      const poReasoningStream = document.querySelector('.po-reasoning-stream');
      const printableAgreement = document.querySelector('#printable-po-agreement');

      const getDisplay = (el) => el ? window.getComputedStyle(el).display : 'NOT_FOUND';
      const getVisibility = (el) => el ? window.getComputedStyle(el).visibility : 'NOT_FOUND';

      return {
        mainDisplay: getDisplay(main),
        headerDisplay: getDisplay(header),
        footerDisplay: getDisplay(footer),
        poDrawerHeaderDisplay: getDisplay(poDrawerHeader),
        poDrawerTabsDisplay: getDisplay(poDrawerTabs),
        poDrawerFooterDisplay: getDisplay(poDrawerFooter),
        poSummaryStripDisplay: getDisplay(poSummaryStrip),
        poReasoningStreamDisplay: getDisplay(poReasoningStream),
        printableAgreementDisplay: getDisplay(printableAgreement),
        printableAgreementVisibility: getVisibility(printableAgreement),
        agreementExists: !!printableAgreement,
        agreementTitle: printableAgreement ? printableAgreement.querySelector('h1')?.innerText : null
      };
    })()`,
    returnByValue: true
  });

  const v = verification.result?.result?.value || verification.result?.value;
  console.log('\n🔍 --- PRINT MEDIA COMPUTED STYLES VERIFICATION ---');
  console.log('  main (Dashboard & Workbench Table) display :', v.mainDisplay, v.mainDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  header (App Navigation) display            :', v.headerDisplay, v.headerDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  footer (Institutional Footer) display      :', v.footerDisplay, v.footerDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  po-drawer-header display                   :', v.poDrawerHeaderDisplay, v.poDrawerHeaderDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  po-drawer-tabs display                     :', v.poDrawerTabsDisplay, v.poDrawerTabsDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  po-drawer-footer display                   :', v.poDrawerFooterDisplay, v.poDrawerFooterDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  po-summary-strip display                   :', v.poSummaryStripDisplay, v.poSummaryStripDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  po-reasoning-stream display                :', v.poReasoningStreamDisplay, v.poReasoningStreamDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  #printable-po-agreement display            :', v.printableAgreementDisplay, v.printableAgreementDisplay === 'block' ? '✅ VISIBLE' : '❌ NOT BLOCK');
  console.log('  #printable-po-agreement title              :', v.agreementTitle);

  // Assertions for Agreement Tab
  assert.strictEqual(v.mainDisplay, 'none', 'Dashboard <main> must be hidden in print');
  assert.strictEqual(v.headerDisplay, 'none', '<header> must be hidden in print');
  assert.strictEqual(v.footerDisplay, 'none', '<footer> must be hidden in print');
  assert.strictEqual(v.poDrawerHeaderDisplay, 'none', 'PO Drawer Header must be hidden in print');
  assert.strictEqual(v.poDrawerTabsDisplay, 'none', 'PO Drawer Tabs must be hidden in print');
  assert.strictEqual(v.poDrawerFooterDisplay, 'none', 'PO Drawer Footer must be hidden in print');
  assert.strictEqual(v.poSummaryStripDisplay, 'none', 'PO Summary Strip must be hidden in print');
  assert.strictEqual(v.poReasoningStreamDisplay, 'none', 'PO Reasoning Stream must be hidden in print');
  assert.strictEqual(v.printableAgreementDisplay, 'block', 'Only the PO Agreement must be visible in print');

  // NOW TEST TAB 2: Executive Memo Tab
  console.log('\n👉 Switching to Tab 2: "Executive Authorization Memo"...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tabs = Array.from(document.querySelectorAll('.po-drawer-tabs button'));
      const memoTab = tabs.find(b => b.innerText.includes('Executive Memo') || b.innerText.includes('Memo'));
      if (memoTab) memoTab.click();
    })()`
  });
  await sleep(300);

  const memoTabVerification = await send('Runtime.evaluate', {
    expression: `(() => {
      const memoScreen = document.querySelector('.po-memo-screen');
      const printableAgreement = document.querySelector('#printable-po-agreement');
      return {
        memoScreenDisplay: memoScreen ? window.getComputedStyle(memoScreen).display : 'NOT_FOUND',
        printableAgreementDisplay: printableAgreement ? window.getComputedStyle(printableAgreement).display : 'NOT_FOUND'
      };
    })()`,
    returnByValue: true
  });

  const mv = memoTabVerification.result?.result?.value;
  console.log('  Memo screen display in print mode         :', mv.memoScreenDisplay, mv.memoScreenDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  Printable Agreement display in print mode  :', mv.printableAgreementDisplay, mv.printableAgreementDisplay === 'block' ? '✅ VISIBLE' : '❌ NOT BLOCK');
  assert.strictEqual(mv.memoScreenDisplay, 'none');
  assert.strictEqual(mv.printableAgreementDisplay, 'block');

  // NOW TEST TAB 3: Itemized Schedule Tab
  console.log('\n👉 Switching to Tab 3: "Itemized Schedule"...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tabs = Array.from(document.querySelectorAll('.po-drawer-tabs button'));
      const linesTab = tabs.find(b => b.innerText.includes('Itemized Schedule') || b.innerText.includes('Lines'));
      if (linesTab) linesTab.click();
    })()`
  });
  await sleep(300);

  const linesTabVerification = await send('Runtime.evaluate', {
    expression: `(() => {
      const linesScreen = document.querySelector('.po-lines-screen');
      const printableAgreement = document.querySelector('#printable-po-agreement');
      return {
        linesScreenDisplay: linesScreen ? window.getComputedStyle(linesScreen).display : 'NOT_FOUND',
        printableAgreementDisplay: printableAgreement ? window.getComputedStyle(printableAgreement).display : 'NOT_FOUND'
      };
    })()`,
    returnByValue: true
  });

  const lv = linesTabVerification.result?.result?.value;
  console.log('  Lines screen display in print mode        :', lv.linesScreenDisplay, lv.linesScreenDisplay === 'none' ? '✅ HIDDEN' : '❌ VISIBLE');
  console.log('  Printable Agreement display in print mode  :', lv.printableAgreementDisplay, lv.printableAgreementDisplay === 'block' ? '✅ VISIBLE' : '❌ NOT BLOCK');
  assert.strictEqual(lv.linesScreenDisplay, 'none');
  assert.strictEqual(lv.printableAgreementDisplay, 'block');

  console.log('\n🏆 ALL ASSERTIONS PASSED: Only the Commercial Agreement is printed across all tabs and buttons, exactly as required!\n');

  ws.close();
  edge.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
