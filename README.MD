### node爬虫下载头像
- crawler.js node-crawler demo
- crawler.download.js node-crawler 下载头像
- demo.js express服务显示读取的头像图片地址
- download.js 下载头像
- puppeteer yarn add puppeteer
##### 参考:
- [node：爬虫爬取网页图片](https://juejin.im/post/5b729759e51d4566295cefac)
- [一只node爬虫的升级打怪之路](https://github.com/wuomzfx/blog/blob/master/zhihu-spider.md)
- [https://github.com/bda-research/node-crawler](https://github.com/bda-research/node-crawler)

### node-crawler 
1. 异常处理: 超时和重试的实现比较好
2. 有些操作自由度没有自己写的代码高, 如基于当前页面结果来判断下一步操作

### puppeteer
#### node version >6.4, await >7.6
#### 安装
- 1. `set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1`
- 2. `npm i --save puppeteer --ignore-scripts`
- 3. 翻出去下载chrome https://download-chromium.appspot.com, 解压后在启动时指定路径
      ```js
      await puppeteer.launch({
        executablePath: '../chrome-win/chrome.exe', // 指定路径
        headless: false // 打开浏览器
      });
      ```
- 4. 版本1.7后`yarn add puppeteer-core`不直接下载chromium
##### 参考:
- [Puppeteer API文档](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-browser)
- [无头浏览器性能对比与Puppeteer的优化文档](https://blog.it2048.cn/article-headless-puppeteer/)
- [node.js使用puppeteer无头浏览器爬取豆瓣电影](https://blog.csdn.net/squirrelpineal/article/details/81260312)