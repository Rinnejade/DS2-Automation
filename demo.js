var page = require('webpage').create();
var fs = require("fs");

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

page.onError = function(msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};



var steps = [
    function() {
        page.open('file:///home/vinod/workspace/DS2%20Automation/1.html');
    },
    function() {
        var content = fs.read('test.json')
        var json = JSON.parse(content)
        console.log(json)
        page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js", function() {
            page.evaluate(function(json) {
                for (key in json) {
                    console.log(json)
                    if (json.hasOwnProperty(key)) {
                        $('input[name=' + key + ']').val(json[key]);
                        $("#" + key).val(json[key])
                    }
                }
            }, json);
        })
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
        page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js');

        var arg1 = consoleRead();

        // page.evaluate(function(arg1) {
        //     $('.yourFormBox').val(arg1);
        //     $('.yourForm').submit();
        // }, arg1);

        console.log('enered : ', arg1);

    },
    function() {

        console.log('Exiting');

    }
];

function consoleRead() {
    var system = require('system');

    system.stdout.writeLine('CaptchaCode: ');
    var line = system.stdin.readLine();

    return line;
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
}, 500);