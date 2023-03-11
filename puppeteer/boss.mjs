import puppeteer from 'puppeteer'
const onemin = 60000

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    // devtools: true,
  })
  const page = await browser.newPage()

  await page.goto('https://www.zhipin.com/shenzhen/')

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 })
  const searchResultSelector = '.btn.btn-outline.header-login-btn'
  await page.waitForSelector(searchResultSelector, { timeout: onemin })
  await Promise.all([
    page.click(searchResultSelector),
    page.waitForNavigation({
      waitUntil: 'networkidle2',
    }),
  ])
  await page.waitForSelector('.btn-sign-switch.ewm-switch', { timeout: onemin })
  await page.click(`.btn-sign-switch.ewm-switch`)
  await page.waitForSelector(
    '#header > div.inner.home-inner a[ka=header-job]',
    { timeout: onemin * 3 }
  )
  const joblist = `https://www.zhipin.com/web/geek/job`
  await page.goto(joblist, {
    waitUntil: 'networkidle2',
    timeout: onemin,
  })

  await page.waitForTimeout(10000)
  for (let i = 0; i < 10; i++) {
    await curpage(page, browser)
    await loadNext(page)
  }
  await browser.close()
})()

const loadNext = async (page) => {
  const 下一页 = `.search-job-result .ui-icon-arrow-right`
  await Promise.all([page.click(下一页), page.waitForTimeout(10000)])
}

const curpage = async (page, browser) => {
  let bodyHandle = await page.$$('.job-card-body')
  bodyHandle = [].slice.call(bodyHandle)
  for (const element of bodyHandle) {
    const lt = await element.evaluate((ele) => {
      return !!ele.inner
    }, element)
    if (lt) {
      continue
    }
    await element.click()
    await page.waitForTimeout(2000)

    const np = await (await browser.pages()).pop()
    const chat = `.btn.btn-startchat`
    await np.waitForSelector(chat, { timeout: onemin })
    await np.click(chat)
    try {
      const resume = '.btn-resume'
      await np.waitForSelector(resume, { timeout: 300 })
      await np.click(resume)
    } catch (error) {
      error
    }
    try {
      const btnSure = '.btn-sure'
      await np.waitForSelector(btnSure, { timeout: 300 })
      await np.click(btnSure)
    } catch (error) {
      error
    }
    await np.close()
  }
}

const newPage = async (browser) => {
  const p = await browser.pages()
  return p.length ? p[p.length - 1] : null
}
