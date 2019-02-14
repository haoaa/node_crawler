const Crawler = require("crawler");

let c = new Crawler({
    // is the minimum time gap between two tasks. When rateLimit is set to a non-zero value, maxConnections will be forced to 1.
    rateLimit: 300, 
    // Maximum number of tasks that can be running at the same time
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});

const baseUrl = 'https://www.qqtn.com'
// queue with Custom callback
c.queue([{
  uri: 'https://www.baidu.com',
  callback: function (err, res, done) {
    if (err) {
      console.log(err);
    } else {
      console.log('Grabbed', res.body.length, 'bytes');
    }
    done()
  }
}])

// queue HTML code directly 
c.queue([{
  html: '1咯',
  callback: function (err, res, done) {
    if (err) {
      console.log(err);
    } else {
      console.log('Grabbed', res.body.length, 'bytes');
    }
    done()
  }
}]);
