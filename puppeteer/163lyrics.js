const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
let {chromePath} = require('./config');
let downloadPath =  path.resolve(__dirname, 'download');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();
  // 进入页面
  await page.goto('https://music.163.com/#');

  // 点击搜索框拟人输入 鬼才会想起
  const musicName = 'yellow';
  const artist = ''
  await page.type('.txt.j-flag', musicName, {delay: 0});

  // 回车
  await page.keyboard.press('Enter');

  // 获取歌曲列表的 iframe
  await page.waitFor(2000);
  let iframe = await page.frames().find(f => f.name() === 'contentFrame');
  const SONG_LS_SELECTOR = await iframe.$('.srchsongst');

  // 获取歌曲的地址
  const selectedSongHref = await iframe.evaluate((e, artist) => {
    const songList = Array.from(e.childNodes);
    const idx = songList.findIndex(v => ~v.textContent.indexOf(artist));
    return songList[idx].childNodes[1].firstChild.firstChild.firstChild.href;
  }, SONG_LS_SELECTOR, artist);

  // 进入歌曲页面
  await page.goto(selectedSongHref);

  // 获取歌曲页面嵌套的 iframe
  await page.waitFor(2000);
  iframe = await page.frames().find(f => f.name() === 'contentFrame');
  getMp3(iframe, page)
  getLyric(iframe)
  getComments(iframe)
 
})();

async function getLyric(iframe, fileName) {  
  // 点击 展开按钮
  const unfoldButton = await iframe.$('#flag_ctrl');
  if (unfoldButton) {
    await unfoldButton.click();
    
    // 获取歌词
    const LYRIC_SELECTOR = await iframe.$('#lyric-content');
    const lyricCtn = await iframe.evaluate(e => {
      return e.innerText;
    }, LYRIC_SELECTOR);
    // 写入文件
    let fileName = await iframe.$eval('.tit > em', e => e.textContent)
    let writerStream = fs.createWriteStream(path.resolve(downloadPath, `${fileName}.txt`));
    writerStream.write(lyricCtn, 'UTF8');
    writerStream.end();
    console.log(`${fileName}.txt downloaded`);
  }
}

async function getMp3(iframe, page) {
   // 下载歌
   await iframe.waitForSelector('.u-btni-addply')
   await iframe.click('.u-btni-addply')
   let fileName = await iframe.$eval('.tit > em', e => e.textContent)
   page.on('response',async (response) => {
     if (response.url().endsWith('mp3')) {
       let writerStream = fs.createWriteStream(path.resolve(downloadPath, `${fileName}.mp3`));
       let buffer = await response.buffer()
       writerStream.write(buffer);
       writerStream.end();
       console.log(`${fileName}.mp3 downloaded`);
     }
   })
}

async function getComments(iframe) { 
  // 获取评论数量
  let commentCount = await iframe.$eval('.sub.s-fc3', e => e.innerText);
  console.log(commentCount);

  // 获取评论
  let commentList = await iframe.$$eval('.itm', elements => {
    let ctn = elements.map(v => {
      return v.innerText.replace(/\s/g, '');
    });
    return ctn;
  });
  console.log(commentList);
}