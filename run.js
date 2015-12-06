var phantom = require('phantom');
var uuid = require('uuid');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('crawler', 'root', null, {host:'localhost'});

var Record = sequelize.define('Record', {
    RecordId : { type: Sequelize.STRING, primaryKey: true },
    Url : Sequelize.STRING,
    Content: Sequelize.STRING
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

var urlQueue = [];

var processing = false;
var siteRegex = new RegExp('http:\/\/[^\/]*.jd.com\/.*');
var contentRegex = new RegExp('http:\/\/item.jd.com\/.*.html');

function findRecord(url, cb) {
    return Record.count({
        where: {
            Url: url,
            createdAt: {
                $lt: new Date(new Date() + 24 * 60 * 60 * 1000),
                $gt: new Date()
            }
        }
    }).then(function(count){
        cb(count);
    });
}

function saveRecord(url, content, cb) {
    Record.create({
        RecordId : uuid.v4(),
        Url : url,
        Content : content
    }).then(function(record) {
       cb(record);
    });
}

function processPage() {
    if (urlQueue.length > 0 && processing == false) {
        processing = true;
        var lastUrl = urlQueue.pop();
        console.log('Url: ' + lastUrl);
        getPhantomInstance(function(page) {
            if (contentRegex.test(lastUrl)) {
                console.log('Content');
                page.open(lastUrl, function(status) {
                    console.log(status);
                    page.evaluate(
                        function() {
                            return {
                                links: $('a').map(function(index, item) { return item.href; }).get(),
                                body: document.body
                            };
                        },
                        function(result) {
                            findRecord(lastUrl, function(existing) {
                                if (existing == 0) {
                                    saveRecord(lastUrl, result.body, function(record) {
                                        console.log('saved ' + lastUrl);
                                    })
                                }
                            });
                            for(var i=0;i<result.length;i++) {
                                if(siteRegex.test(result[i])) {
                                    urlQueue.splice(0, 0, result[i]);
                                }
                            }
                            processing = false;
                        }
                    );
                });
            }
            else {
                console.log('Page');
                page.open(lastUrl, function(status) {
                    console.log(status);
                    page.evaluate(
                        function() {
                            return $('a').map(function(index, item) { return item.href; }).get();
                        },
                        function(result) {
                            for(var i=0;i<result.length;i++) {
                                if(siteRegex.test(result[i])) {
                                    urlQueue.splice(0, 0, result[i]);
                                }
                            }
                            processing = false;
                        }
                    );
                });
            }
        });
    }
}

function getPhantomInstance(cb) {
    phantom.create('--load-images=no', function(ph) {
        ph.createPage(function(page) {
            cb(page);
        });
    });
}

urlQueue.push('http://www.jd.com');

setInterval(function(){
    processPage();
}, 1000);