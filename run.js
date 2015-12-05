var phantom = require('phantom');
var uuid = require('uuid');
var Schema = require('jugglingdb').Schema;

var Record;

function searchDatabase(url, cb) {
    Record.findOne({where: {Url: url}, order: 'CreatedAt DESC'}, cb)
}

function saveToDatabase() {
    Record.create()
}

function initDatabase() {
    var schema = new Schema('mysql', {
        host: '127.0.0.1',
        username: 'root',
        database: 'crawler'
    });
    Record = schema.define('Record', {
        RecordId : {type: String, length: 36},
        Url : {type: String, length: 255},
        Content: {type: String, dataType: 'text'},
        CreatedAt: {type: Date, dataType: 'timestamp'}
    });

    var newRecord = new Record();
    newRecord.RecordId = uuid.v4();

    newRecord.save();
}

phantom.create('--load-images=no', function(ph) {
    ph.createPage(function(page) {
        page.open("http://item.jd.com/1231336926.html", function(status) {
            console.log(status);
            page.evaluate(function() {return document.title}, function(result) {
                console.log('Page Title is ' + result);
                ph.exit();
            });
        })
    })
});