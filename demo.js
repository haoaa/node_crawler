const fs = require('fs')
var path = require('path')

var superagent = require('superagent');
var charset = require('superagent-charset');
charset(superagent);
const cheerio = require('cheerio');
const baseUrl = 'https://www.qqtn.com/'

const express = require('express');
const app = express();
let imgs = fs.readdirSync('.')
app.get('/index', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  var type = req.query.type;
  //页码
  var page = req.query.page;
  type = type || 'weixin';
  page = page || '1';
  var route = `tx/${type}tx_${page}.html`
  //网页页面信息是gb2312，所以chaeset应该为.charset('gb2312')，一般网页则为utf-8,可以直接使用.charset('utf-8')
  superagent.get(baseUrl + route)
    .charset('gb2312')
    .end(function(err, sres) {
        var items = [];
        if (err) {
            console.log('ERR: ' + err);
            res.json({ code: 400, msg: err, sets: items });
            return;
        }
        var $ = cheerio.load(sres.text);
        $('div.g-main-bg ul.g-gxlist-imgbox li a').each(function(idx, element) {
            var $element = $(element);
            var $subElement = $element.find('img');
            var thumbImgSrc = $subElement.attr('src');
            items.push({
                title: $(element).attr('title'),
                href: $element.attr('href'),
                thumbSrc: thumbImgSrc
            });
        });
        res.json({ code: 200, msg: "", data: items });
    });
})
var server = app.listen(9000, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})

let getType = require('./download')
getType()