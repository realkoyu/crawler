var phantom = require('phantom');

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