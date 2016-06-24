var page = require('webpage').create();
var loadInProgress = false;
var testindex = 0;

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onAlert = function(msg) {
    console.log('alert!!> ' + msg);
};

page.onLoadStarted = function() {
    loadInProgress = true;
    console.log("load started");
};

page.onLoadFinished = function(status) {
    loadInProgress = false;
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    } else {
        console.log("load finished");
    }
};

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};



var steps = [
    function() {
        page.open('http://docs.dvatonline.gov.in/gms01/AfterLoginT2.aspx');
    },
    function() {
        page.injectJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            $("#ctl00_ContentPlaceHolder1_btnT2EntryForm").click();
            console.log('Moving to Form Page');
        });
        page.render('MainPage.png');
    },
    function() {
        console.log('Form page');
        page.render('FormPage.png');
        page.injectJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            console.log("\n *START* \n");
            var fs = require("fs");
            var content = fs.readFileSync("data.json");
            var json = JSON.parse(content);
            for(key in json)
            {
              if(json.hasOwnProperty(key))
                $('input[name='+key+']').val(json[key]);
            }
            console.log("\n *EXIT* \n");
            // $("#ctl00_ContentPlaceHolder1_imgPictureRendum").render("captcha.png");
            console.log('form Filled');
        });
    },
    function() {
        console.log('Form Filled from json'); // This function is for navigating deeper than the first-level form submission
        page.render('filledForm.png');
        page.injectJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            // console.log('More Stuff: ' + document.body.innerHTML);
        });
    },
    function() {
        console.log('Exiting');
    }
];

interval = setInterval(function() {
    if (!loadInProgress && typeof steps[testindex] == "function") {
        console.log("step " + (testindex + 1));
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function") {
        console.log("Complete!");
        phantom.exit();
    }
}, 500);