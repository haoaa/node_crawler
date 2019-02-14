const Crawler = require("crawler");


// 用crawler实现download.js效果
const fs = require('fs')
const path = require('path')

// 处理每个图片的请求
let imgDownload = new Crawler({
  encoding:null, // Crawler shouldn't convert it to string.
  jQuery:false,// set false to suppress warning message. `CRAWLER response body is not HTML`
  callback : function (error, res, done) {
      if(error){
          console.log(`${res.options.path} ${error}`);
      }else{
          let $ = res.$;
          fs.writeFileSync(res.options.path, res.body);
      }
      done();
  }
});

// 图片链接页
let imgListPage = new Crawler({
  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
          let categoryName = res.options.cateName
          let $ = res.$;
          let links = $('div.g-main-bg ul.g-gxlist-imgbox li a')
          let dirPath = path.resolve(__dirname + '/pic/' + categoryName)
          if(!fs.existsSync(path.resolve(__dirname + '/pic/'))){
            fs.mkdirSync(path.resolve(__dirname + '/pic/'))
          }
          if(!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
          }
          links.each(async function(idx, element) {
            let $element = $(element);
            let $subElement = $element.find('img');
            let thumbImgSrc = $subElement.attr('src');
            let match = thumbImgSrc.match(/.*\/(\w+\.\w+)$/)
            let fileName = match ? match[1] : 'undefine.jpg'
            imgDownload.queue({uri: thumbImgSrc, fileName: fileName, path: path.resolve(__dirname + '/pic/' + categoryName ,fileName)})
          });
          // 有下一页加载下一页
          let nextPage = $('.tsp_next')
          if (nextPage.length) {
            let nextHref = nextPage.attr('href')
            if (nextHref) {
              imgListPage.queue({uri: baseUrl + nextHref, cateName: categoryName})
            }
          }
      }
      done();
  }
});


// 目录页
// let catalogPage = new Crawler({
//   callback : function (error, res, done) {
//       if(error){
//           console.log(error);
//       }else{
//         let $ = res.$;
//         $('.g-big-box > ul > li > a').each((i, element) => {
//           let $element = $(element);
//           let cateName = $element.text()
//           let url = $element.attr('href')
//           imgListPage.queue({uri: baseUrl + url, cateName})
//         })  
//       }
//     }
// })
imgListPage.queue({
  uri: 'https://www.qqtn.com/tx/t/',
  callback : function (error, res, done) {
      if(error){
          console.log(error);
      }else{
        let $ = res.$;
        $('.g-big-box > ul > li > a').each((i, element) => {
          let $element = $(element);
          let cateName = $element.text()
          let url = $element.attr('href')
          imgListPage.queue({uri: baseUrl + url, cateName})
        })  
      }
    }
})
// catalogPage.queue('https://www.qqtn.com/tx/t/')
