let {chromePath} = require('./config')
let fs = require('fs')
let path = require('path')
const puppeteer = require('puppeteer')
let downloadPath =  path.resolve(__dirname, 'download');
const hireSite = 'https://www.lagou.com/';
const searchKey = '前端';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,//运行Chromium或Chrome可执行文件的路径
      headless: false, //是否运行在浏览器headless模式，true为不打开浏览器执行，默认为true
      args: ['--window-size=300,200'],//
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0)
    await page.goto(hireSite, {
      waitUntil: 'networkidle2' //等待页面不动了，说明加载完毕了
    });

    // type key word && earch
    await page.waitForSelector('#cboxClose', {timeout: 1000})
    await page.evaluate(() => {
      let closee = document.querySelector('#cboxClose')
      if (closee){
        closee.click()
      }
    })
    await page.type('#search_input', searchKey, {delay: 20})
    await page.waitFor(1000)
    await page.click('#search_button', {delay: 20})
    await page.waitForNavigation({waitUntil: 'networkidle2'})

    // todo traverse jobs get required skills
    let links = await page.evaluate(() => {
      let links = document.querySelectorAll('.item_con_list > li a.position_link')
      return Array.from(links).map(link => link.href)
    })
    let reqs = []
    for (var i = 0, len = links.length; i < len; i++) {
      let detail = await getJobDetail(browser, links[i])
      detail && reqs.push(detail)
    }
    fs.writeFileSync(
      downloadPath + '/detail.txt',
      reqs,
      {encoding: 'utf8'}
    )
    browser.close()
  } catch(e) {
    console.log(e)
  }


})()

async function getJobDetail(browser, jobLink) {
  const page = await browser.newPage();
  await page.goto(jobLink, {
    waitUntil: 'networkidle2' //等待页面不动了，说明加载完毕了
  })
  let test = await page.evaluate(() => {
    let detail = document.querySelector('.job_bt');
    return detail ? detail.innerText.replace('\n\n', '\n') : ''
  });
  await page.close();
  return test
}

