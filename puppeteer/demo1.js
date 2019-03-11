let {chromePath} = require('./config')
const puppeteer = require('puppeteer');

(async() => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless      : false,
  })
  const page = await browser.newPage()
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))

  await page.goto('https://y.qq.com', {waitUntil: 'networkidle2'})
  await page.evaluate(() => console.log(`url is ${location.href}`))
  await page.setViewport({width: 1310, height: 800})
  await page.screenshot({path: './yqq.png', fullPage: true})
  await browser.close()
})();

(async() => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless      : true // 不打开浏览器
  })
  const page = await browser.newPage()

  // 保存PDF
  await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'})
  await page.pdf({path: 'hn.pdf', format: 'A4'})
  await browser.close()
})();

(async() => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless      : true // 不打开浏览器
  })
  const page = await browser.newPage()

  await page.goto('https://y.qq.com')
  const dimensions = await page.evaluate(() => {
    debugger
    return {
      width            : document.documentElement.clientWidth,
      height           : document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    }
  })

  console.log('Dimensions:', dimensions)

  await browser.close()
})()
/**
 *
node hn.js
See Page.pdf() for more information about creating pdfs.

Example - evaluate script in the context of the page

Save file as get-dimensions.js

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');

  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });

  console.log('Dimensions:', dimensions);

  await browser.close();
})();
Execute script on the command line

node get-dimensions.js
See Page.evaluate() for more information on evaluate and related methods like evaluateOnNewDocument and exposeFunction.

Default run
 */