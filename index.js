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
        page.open('http://docs.dvatonline.gov.in/gms01/admin/logint2forweb.aspx');
    },
    function() {
        page.injectJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            $('input[name="ctl00$ContentPlaceHolder1$txtID"]').val('07960404046');
            $("#ctl00_ContentPlaceHolder1_btnNext").click();
            console.log('ID filled');
        });
        page.render('IDPage.png');
    },
    function() {
        console.log('Captcha page');
        page.render('captchaPage.png');
        page.injectJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            $('input[name="ctl00$ContentPlaceHolder1$txtPwd"]').val('unevensparrow@21');
            // $("#ctl00_ContentPlaceHolder1_imgPictureRendum").render("captcha.png");
            $("#ctl00_ContentPlaceHolder1_btnSubmit").click();
            console.log('login button clicked');
        });
    },
    function() {
        console.log('main page:'); // This function is for navigating deeper than the first-level form submission
        page.render('mainPage.png');
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