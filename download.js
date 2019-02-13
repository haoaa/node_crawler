const fs = require('fs')
const path = require('path')
const superagent = require('superagent');
const charset = require('superagent-charset');
const cheerio = require('cheerio');

charset(superagent);


async function getAvatars() {
  let cateUrl = 'https://www.qqtn.com/tx/t/'
  let data = await superagent.get(cateUrl).charset('gb2312')
  let $ = cheerio.load(data.text)
  $('.g-big-box > ul > li > a').each(async (i, element) => {
    var $element = $(element);
    let cateName = $element.text()
    let url = $element.attr('href')
    await getSubTypes(cateName, url)
  })
}



async function getSubTypes(cateName, url) {
  let totalCount = 0
  let pageIndex = 1
  url = 'https://www.qqtn.com' + url
  while (true) {
    let newUrl = url.replace(/(\d+)/, pageIndex)
    let pageSize = await singePage(cateName, newUrl)
    totalCount += pageSize
    if(pageSize < 20) {
      break
    }
    pageIndex++
  }
  console.log(`${cateName} 头像 ${totalCount} 个`);
}

async function singePage(categoryName, url) {
  let data = await superagent.get(url).charset('gb2312')
  var $ = cheerio.load(data.text);
  let doms = $('div.g-main-bg ul.g-gxlist-imgbox li a')
  let dirPath = path.resolve(__dirname + '/pic/' + categoryName)
  if(!fs.existsSync(path.resolve(__dirname + '/pic/'))){
    fs.mkdirSync(path.resolve(__dirname + '/pic/'))
  }
  if(!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
  doms.each(function(idx, element) {
    var $element = $(element);
    var $subElement = $element.find('img');
    var thumbImgSrc = $subElement.attr('src');
    let match = thumbImgSrc.match(/.*\/(\w+\.\w+)$/)
    let fileName = match ? match[1] : 'undefine.jpg'
    superagent.get(thumbImgSrc).end(function(err, sres) {
      try {
        fs.writeFileSync(path.resolve(__dirname + '/pic/' + categoryName ,fileName), sres.body)
      } catch (error) {
        console.log(`${categoryName} ${thumbImgSrc} 下载出错 ${error}`);
      }
    })
  });
  return doms.length
}


// getSubTypes('测试', '/tx/nvshengtx_202.html')
// getAvatars()
module.exports = getAvatars
