const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://',
    headless: false
  })
  let pages = await browser.pages()
  if (pages.length < 2) {
    await browser.newPage()
  }
  pages = await browser.pages()
  let [page, detailPage] = pages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  let applyCount = 0
  const skipRec = true
  async function pageOne(page, detailPage) {
    let host = 'https://m'
    let sites = await page.evaluate(() => {
      let p = document.querySelectorAll('.job-card-wrapper')
      let sites = []
      for (let i = 0; i < p.length; i++) {
        const element = p[i]
        if (element.querySelector('img[alt=猎头]')) {
          continue
        }
        let link = element.querySelector('.job-card-left')
        sites.push(link.getAttribute('href'))
      }
      return sites
    })
    sites = sites.map(job => {
      return host + job
    })
    console.log(`飞lt数量: `, sites.length)
    for (let i = 0; i < sites.length; i++) {
      const element = sites[i]
      await detailPage.goto(element)
      await detailPage.waitForTimeout(5000 + ((Math.random() * 5000) | 0))
      let applySuccess = false

      try {
        applySuccess = await detailPage.evaluate(() => {
          let suc = false
          const jd = document.querySelector('.job-detail')
          if (jd.innerText.toLowerCase().includes('vue')) {
            const info = document.querySelector('.company-info-box')
            if (info) {
              info.scrollIntoView()
            }
            const chat = document.querySelector('.btn.btn-startchat')
            if (chat) {
              if (chat.innerText !== '继续沟通') {
                chat.click()
                suc = true
              } else {
                suc = 'wait'
              }
            }
          }
          return suc
        })
      } catch (error) {
        console.log('详情页处理失败')
      }
      if (applySuccess === true) {
        applyCount++
        console.log(applyCount)
      }
      if (applySuccess === 'wait' && !skipRec) {
        await detailPage.waitForTimeout(3000)

        const input = await detailPage.$('.chat-input')
        const sendBtn = await detailPage.$('.btn-v2.btn-send')
        if (input && sendBtn) {
          await input.type(`您好          `)
          applyCount++
          console.log(applyCount)
        }
      }
      await detailPage.waitForTimeout(5000)
    }
  }
  while (true) {
    await pageOne(page, detailPage)
    let nextPage = await page.$('.pagination-area .ui-icon-arrow-right')
    if (applyCount > 90) {
      // break
    }
    const nextPageDisabled = await page.$(
      '.pagination-area a.disabled .ui-icon-arrow-right'
    )
    if (nextPage && !nextPageDisabled) {
      await nextPage.click()
      await detailPage.waitForTimeout(10000)
    } else {
      break
    }
  }
  process.exit()
  // await page.goto('https://om', {waitUntil: 'networkidle2'})
  // await page.screenshot({path: './yqq.png', fullPage: true})
  // await browser.close()
})()
