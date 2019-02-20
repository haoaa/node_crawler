/**
 * 自动投简历
 */

let {chromePath} = require('./config')
let fs = require('fs')
let path = require('path')
const puppeteer = require('puppeteer')
let downloadPath =  path.resolve(__dirname, 'download');
const loginSite = 'https://passport.lagou.com/login/login.html';
const hireSite = 'https://www.lagou.com/';
const searchKey = '前端';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,//运行Chromium或Chrome可执行文件的路径
      headless: false, //是否运行在浏览器headless模式，true为不打开浏览器执行，默认为true
      //args: ['--window-size=600,400'],
    });


    await login(browser, loginSite, user, pass)

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0)
    await page.goto(hireSite, {
      waitUntil: 'networkidle2' //等待页面不动了，说明加载完毕了
    });

    // type key word && earch
    await page.type('#search_input', searchKey, {delay: 20})
    await page.waitFor(1000)
    await page.click('#search_button', {delay: 20})
    await page.waitForNavigation({waitUntil: 'networkidle2'})

    await singlePages(browser, page)

    while(await nextPage(page)) {
      await singlePages(browser, page)
    }
    // fs.writeFileSync(
    //   downloadPath + '/detail.txt',
    //   reqs,
    //   {encoding: 'utf8'}
    // )
    browser.close()
  } catch(e) {
    console.log(e)
  }


})()

async function nextPage(page) {
  await page.click('.pager_next', {delay: 20})
  let links = await page.evaluate(() => {
    let links = document.querySelectorAll('.item_con_list > li a.position_link')
    return Array.from(links).map(link => link.href)
  })
  return links.length
}

async function singlePages(browser, page) {
   // traverse jobs get required skills
  let links = await page.evaluate(() => {
    let links = document.querySelectorAll('.item_con_list > li a.position_link')
    return Array.from(links).map(link => link.href)
  })
  let reqs = []
  for (var i = 0, len = links.length; i < len; i++) {
    let detail = await sendResume(browser, links[i])
    // detail && reqs.push(detail)
  }
}

async function sendResume(browser, jobLink) {
  const page = await browser.newPage();
  await page.goto(jobLink, {
    waitUntil: 'networkidle2' //等待页面不动了，说明加载完毕了
  })
  let test = await page.evaluate(() => {
    let detail = document.querySelector('.job_bt');
    return detail ? detail.innerText.replace('\n\n', '\n') : ''
  });
  let salary = await page.evaluate(() => {
    return document.querySelector('.salary').textContent;
  });
  
  let company = await page.evaluate(() => {
    return document.querySelector('.company').textContent;
  });
  
  let dispoint = false
  if (salary.indexOf('-') !== -1) {
    dispoint = parseInt(salary.split('-')[1]) <= 15
  } else {
    dispoint = parseInt(salary) <= 15
  }
  
  if (test.toLocaleLowerCase().indexOf('vue') !== -1 && !dispoint) {
    await page.click('.s-send-btn')
    console.log(company);
  }  
  await page.close();
  return test
}

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


async function login(browser, loginSite, user, pass) {  
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0)
  await page.goto(loginSite, {
    waitUntil: 'networkidle2' //等待页面不动了，说明加载完毕了
  });

  await page.type('form > div:nth-child(1) > input', user, {delay: 20})
  await page.waitFor(999)
  await page.type('form > div:nth-child(2) > input', pass, {delay: 20})
  await page.waitFor(999)
  await page.click('form > div.input_item.btn_group.clearfix.sense_login_password > input')
  await page.waitFor(10000) // 图片识别要手点
}