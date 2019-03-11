/**
 * 读取博客文字, 分享到http://blogread.cn/news/
 */

let {chromePath} = require('./config')
const puppeteer = require('puppeteer')
const shareTargetPath = 'http://blogread.cn/news/submit.php'
const news = 'http://news.baidu.com/ns?word=vuejs&bs=vuejs&sr=0&cl=2&rn=20&tn=news&ct=0&clk=sortbytime'
let browser
(async() => {
  try {
    browser = await puppeteer.launch({
      args          : ['--window-size=1824,768'], //
      dumpio        : false,
      executablePath: chromePath, // 运行Chromium或Chrome可执行文件的路径
      headless      : false, // 是否运行在浏览器headless模式，true为不打开浏览器执行，默认为true
      // devtools: true,
    })

    const page = await browser.newPage()
    await page.goto(shareTargetPath, {
      waitUntil: 'networkidle2' // 等待页面不动了，说明加载完毕了
    })
    await page.waitFor(() => {
      return document.querySelector('img') !== null
    }) // 异步的，等待元素加载之后，否则获取不到异步加载的元素
    await loginWeibo(page)
    const page2 = await browser.newPage()
    await page2.goto(news, {
      waitUntil: 'networkidle2' // 等待页面不动了，说明加载完毕了
    })
    // let a = await page.content()
    let repoList = await page2.evaluate(() => {
      let links = []
      let list = Array.from(document.querySelectorAll('.result'))
      list.forEach(a => {
        let link = a.querySelector('.c-title a')
        let title = link.textContent.trim()
        let href = link.href
        debugger
        let intro = a.querySelector('.c-summary')
        try {
          intro.querySelector('.c-author') && intro.removeChild(intro.querySelector('.c-author'))
          intro.querySelector('.c-info') && intro.removeChild(intro.querySelector('.c-info'))
          intro = intro.innerText.trim()
          links.push({
            title,
            href,
            intro
          })
        } catch (error) {
          console.log(error)
        }
      })
      return links
    })
    await page2.close()
    if (repoList.length) {
      await page.waitFor(() => {
        return document.querySelector('#urlUrl') !== null
      })
      await page.focus('#textTitle')
      await page.type('#textTitle', repoList[1].title, { delay: 20 })
      await page.type('#urlUrl', repoList[1].href, { delay: 20 })
      await page.type('#summary', repoList[1].intro, { delay: 20 })
      await page.click('.btn-default')
    }
    // await browser.close()
  } catch (error) {
    console.log(error)
    browser.close()
  }
})()

async function loginWeibo(page) {
  // await page.evaluate(() => {
  //   let link = document.querySelector('.panel-body > a')
  //   link.click()
  // })
  await page.click('.panel-body > a')
  await page.waitForSelector('#userId')
  await page.waitFor(1000)
  await page.type('#userId', '18396050651', { delay: 20 })
  await page.type('#passwd', 'qqq111', { delay: 20 })

  await page.waitFor(1000)
  await page.click('.WB_btn_login')
  await page.waitFor(3000)
  await page.evaluate(() => {
    if (location.href === 'https://api.weibo.com/oauth2/authorize') {
      let auth = document.querySelector('a.WB_btn_oauth.formbtn_01')
      auth.click()
    }
  })
}

// todo 1. page跳转监视 2. 跨页数据传递
