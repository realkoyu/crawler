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

function findRecord(url) {

}

function processPage() {
    var lastUrl = urlQueue.pop();
    getPhantomInstance(function(page) {
        if (contentRegex.test(lastUrl)) {
            getPageContent(page, lastUrl, function(result){
                var links = result.links;
                var body = result.body;

            });
        }
        else if (siteRegex.test(lastUrl)) {

        }
    });
}

function getPageContent(page, url, cb) {
    page.open(url, function(status) {
        console.log(status);
        page.evaluate(
            function() {
                var hrefs = $('a').map(function(index, item) { return item.href; }).get();
                return {
                    links: hrefs,
                    body: document.body
                }
            },
            function(result) {
                cb(result);
                page.close();
            }
        );
    });
}


function getPhantomInstance(cb) {
    phantom.create('--load-images=no', function(ph) {
        ph.createPage(function(page) {
            cb(page);
        });
    });
}