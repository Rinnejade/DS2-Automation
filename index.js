var page = require('webpage').create();
var loadInProgress = false;
// page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
// page.settings.loadImages = false;//Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
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
        page.render('example.png');
        console.log("load finished");
    }
};

page.onError = function(msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};

page.onUrlChanged = function(targetUrl) {
    console.log('New URL: ' + targetUrl);
};

page.onNavigationRequested = function(url, type, willNavigate, main) {
    var myurl = page.url;
    if ( main && url != myurl && url.replace(/\/$/, "") != myurl && (type == "Other" || type == "Undefined")) {
        // main = navigation in main frame; type = not by click/submit etc

        log("\tfollowing " + myurl + " redirect to " + url)
        myurl = url;
        page.close();
    }
    console.log('Trying to navigate to: ' + url);
    console.log('Caused by: ' + type);
    console.log('Will actually navigate: ' + willNavigate);
    console.log('Sent from the page\'s main frame: ' + main);
}

page.onClosing = function(closingPage) {
    console.log('The page is closing! URL: ' + closingPage.url);
};
var steps = [
    function() {
        page.open('http://docs.dvatonline.gov.in/gms01/admin/logint2forweb.aspx');
    },
    function() {
        page.injectJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            $('input[name="ctl00$ContentPlaceHolder1$txtID"]').val('07960404046');
            $("#ctl00_ContentPlaceHolder1_btnNext").click();
            console.log('ID filled');
        });
        page.render('IDPage.png');
    },
    function() {
        console.log('Captcha page');
        page.render('captcha.png');
        // page.injectJs('https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js')

        //     var images = page.evaluate(function() {
        //         var images = [];

        //         function getImgDimensions($i) {
        //             return {
        //                 top: $i.offset().top,
        //                 left: $i.offset().left,
        //                 width: $i.width(),
        //                 height: $i.height()
        //             }
        //         }
        //         console.log("inside include")
        //         $('.recapcha1 img').each(function() {
        //             var img = getImgDimensions($(this));
        //             images.push(img);
        //         });

        //         return images;
        //     });

        //     images.forEach(function(imageObj, index, array) {
        //         page.clipRect = imageObj;
        //         page.render('captcha.png')
        //     });


        console.log('captcha recorded in file : captcha.png')
        var captcha = consoleRead();
        captcha.replace(/ /g, '')
        page.injectJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function(captcha) {
            $('input[name="ctl00$ContentPlaceHolder1$txtPwd"]').val('unevensparrow@21');
            $('input[name="ctl00$ContentPlaceHolder1$txtLetter"]').val(captcha);
        }, captcha);
    },
    function() {
        console.log('main page:'); // This function is for navigating deeper than the first-level form submission
        page.render('mainPage.png');
        page.injectJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            $("#ctl00_ContentPlaceHolder1_btnSubmit").click();
            console.log('login button clicked');
        });
        page.render("clicked.png")
    },
    function() {
        console.log('entered=------------------------------------------')
        page.injectJs("http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js");
        page.evaluate(function() {
            $("#ctl00_ContentPlaceHolder1_btnT2EntryForm").click();
            console.log("form button clicked")
        })
        page.render("site.png")
    },
    function() {
        page.render("form.png")
        console.log('Exiting');
    }
];

function consoleRead() {
    var system = require('system');

    system.stdout.writeLine('CaptchaCode: ');
    var line = system.stdin.readLine();

    return line;
}

function getCaptcha() {
    DeathByCatcha = require("deathbycaptcha")
    var fs = require("fs")
    var dbc = new DeathByCatcha("siddharth@accountingbots.com", "abots@21")
        // var captchaSolution = dbc.solve(fs.readFileSync("captcha.png"), function(err, id, solution){
        //     if(err) return console.error(err);
        //     console.log("CAPTCHA solution", solution)
        //     return solution
        // })
        // return captchaSolution;
    dbc.balance()

}

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
}, 9999);