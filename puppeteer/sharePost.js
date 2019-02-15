/**
 * 读取博客文字, 分享到http://blogread.cn/news/
 */

let {chromePath} = require('./config')
const puppeteer = require('puppeteer')
const shareTargetPath = 'http://blogread.cn/news/submit.php';

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['–ash-host-window-bounds=1324x768'],//不是沙箱模式
      dumpio: false,
      executablePath: chromePath,//运行Chromium或Chrome可执行文件的路径
      headless: false //是否运行在浏览器headless模式，true为不打开浏览器执行，默认为true
    });
    
    const page = await browser.newPage();
    await page.goto(shareTargetPath, {
      waitUntil: 'networkidle2' //等待页面不动了，说明加载完毕了
    });
    await page.waitForSelector('img')  //异步的，等待元素加载之后，否则获取不到异步加载的元素
    await loginWeibo(page)
    await browser.close()
  } catch (error) {
    console.log(error)
  }
})()

async function loginWeibo(page) {
  await page.evaluate(() => {
    let link = document.querySelector('.panel-body > a')
    link.click()
  })
  await page.waitForSelector('#userId') 
  await page.waitFor(1000)
  await page.type('#userId', '18396050651', { delay: 20 })
  await page.type('#passwd', 'qqq111', { delay: 20 })
  
  let loginBtn = await page.$('.WB_btn_login')
  await loginBtn.click({delay: 20})
  await page.waitFor(3000)
  await page.evaluate(() => {
    if (location.href === "https://api.weibo.com/oauth2/authorize") {
      let auth = document.querySelector('a.WB_btn_oauth.formbtn_01')
      auth.click()
    }    
  })
}

// todo 1. page跳转监视 2. 跨页数据传递
