let {chromePath} = require('./config')

const puppeteer = require('puppeteer')
const url = `https://movie.douban.com/tag/#/?sort=T&range=0,10&tags=`

const sleep = time => {
  /* eslint-disable no-new */
  new Promise(resolve => {
    // 成功执行
    try {
      setTimeout(resolve, time)
    } catch (err) {
      console.log(err)
    }
  })
};

(async() => {
  try {
    console.log('start visit the target page')
    const browser = await puppeteer.launch({
      args          : ['--no-sandbox'], // 不是沙箱模式
      dumpio        : false,
      executablePath: chromePath, // 运行Chromium或Chrome可执行文件的路径
      headless      : false // 是否运行在浏览器headless模式，true为不打开浏览器执行，默认为true
    })
    // args :传递给 chrome 实例的其他参数，比如你可以使用”–ash-host-window-bounds=1024x768” 来设置浏览器窗口大小。更多参数参数列表可以参考这里
    // dumpio 是否将浏览器进程stdout和stderr导入到process.stdout和process.stderr中。默认为false。

    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: 'networkidle2' // 等待页面不动了，说明加载完毕了
    })
    await sleep(3000)
    await page.waitForSelector('.tab[index="2"]') // 异步的，等待元素加载之后，否则获取不到异步加载的元素
    await page.click('.tab[index="2"]')
    await page.waitFor(1000)
    await page.waitForSelector('.more') // 异步的，等待元素加载之后，否则获取不到异步加载的元素
    for (let i = 0; i < 2; i++) {
      await sleep(3000)
      await page.click('.more') // 点击按钮一次
    }
    // evaluate 方法中注册回调函数，并分析dom结构，从下图可以进行详细分析，并通过document.querySelectorAll('ol li a')拿到文章的所有链接
    const result = await page.evaluate(() => {
      // 这里调用了了windows里的jQuary的方法
      var $ = window.$
      var items = $('.list-wp a')
      var links = []
      // 判断这里是否列表有数值
      debugger
      if (items.length >= 1) {
        items.each((index, item) => {
          let it = $(item)
          // console.log(it)
          let doubanID = it.find('div').data('id')
          let title = it.find('.title').text()
          let rate = Number(it.find('.rate').text())
          let poster = it.find('img').attr('src').replace('s_retio', 'l_retio')
          links.push({
            doubanID,
            title,
            rate,
            poster
          })
        })
      }
      return links
    })
    console.log(result)
    await browser.close()
  } catch (err) {
    console.log(err)
  }
})()