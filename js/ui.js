function I(i) { return document.getElementById(i); }

//CODE FOR GAUGES
function drawMeter(c, amount, bk, fg, progress, prog) {
    var ctx = c.getContext("2d");
    var dp = window.devicePixelRatio || 1;
    var cw = c.clientWidth * dp, ch = c.clientHeight * dp;
    var sizScale = ch * 0.0055;
    if (c.width == cw && c.height == ch) {
        ctx.clearRect(0, 0, cw, ch);
    } else {
        c.width = cw;
        c.height = ch;
    }
    ctx.beginPath();
    ctx.strokeStyle = bk;
    ctx.lineWidth = 12 * sizScale;
    ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, Math.PI * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = fg;
    ctx.lineWidth = 12 * sizScale;
    ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, amount * Math.PI * 1.2 - Math.PI * 1.1);
    ctx.stroke();
    if (typeof progress !== "undefined") {
        ctx.fillStyle = prog;
        ctx.fillRect(c.width * 0.3, c.height - 16 * sizScale, c.width * 0.4 * progress, 4 * sizScale);
    }
}
function mbpsToAmount(s) {
    return 1 - (1 / (Math.pow(1.3, Math.sqrt(s))));
}
function format(d) {
    d = Number(d);
    if (d < 10) return d.toFixed(2);
    if (d < 100) return d.toFixed(1);
    return d.toFixed(0);
}

//UI CODE
var uiData = null;
function startStop() {
    if (s.getState() == 3) {
        //speed test is running, abort
        s.abort();
        data = null;
        I("startStopBtn").className = "";
        I("server").disabled = false;
        initUI();
        umami.track('Abort');
    } else {
        //test is not running, begin
        I("startStopBtn").className = "running";
        hidden("shareArea");
        I("server").disabled = true;
        s.onupdate = function (data) {
            uiData = data;
        };
        umami.track('Start');
        s.onend = function (aborted) {
            I("startStopBtn").className = "";
            I("server").disabled = false;
            updateUI(true);
            if (!aborted) {
                //if testId is present, show sharing panel, otherwise do nothing
                try {
                    var testId = uiData.testId;
                    if (testId != null) {
                        var shareURL = window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/results/?id=" + testId;
                        I("resultsImg").src = shareURL;
                        I("resultsURL").value = shareURL;
                        I("testId").innerHTML = testId;
                        visible("shareArea");
                    }
                } catch (e) { }
            }
        };
        s.start();
    }
}
//this function reads the data sent back by the test and updates the UI
function updateUI(forced) {
    if (!forced && s.getState() != 3) return;
    if (uiData == null) return;
    var status = uiData.testState;
    I("ip").textContent = uiData.clientIp;
    I("dlText").textContent = (status == 1 && uiData.dlStatus == 0) ? "..." : format(uiData.dlStatus);
    drawMeter(I("dlMeter"), mbpsToAmount(Number(uiData.dlStatus * (status == 1 ? oscillate() : 1))), meterBk, dlColor, Number(uiData.dlProgress), progColor);
    I("ulText").textContent = (status == 3 && uiData.ulStatus == 0) ? "..." : format(uiData.ulStatus);
    drawMeter(I("ulMeter"), mbpsToAmount(Number(uiData.ulStatus * (status == 3 ? oscillate() : 1))), meterBk, ulColor, Number(uiData.ulProgress), progColor);
    I("pingText").textContent = format(uiData.pingStatus);
    I("jitText").textContent = format(uiData.jitterStatus);
    var progBar = (Number(uiData.dlProgress) * 2 + Number(uiData.ulProgress) * 2 + Number(uiData.pingProgress)) / 5;
    I("progress").style.width = (100 * progBar) + "%";
}
function oscillate() {
    return 1 + 0.02 * Math.sin(Date.now() / 100);
}
//update the UI every frame
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || (function (callback, element) { setTimeout(callback, 1000 / 60); });
function frame() {
    requestAnimationFrame(frame);
    updateUI();
}
frame(); //start frame loop
//function to (re)initialize UI
function initUI() {
    drawMeter(I("dlMeter"), 0, meterBk, dlColor, 0);
    drawMeter(I("ulMeter"), 0, meterBk, ulColor, 0);
    I("dlText").textContent = "";
    I("ulText").textContent = "";
    I("pingText").textContent = "";
    I("jitText").textContent = "";
    I("ip").textContent = "";
    var progBar = 0;
    I("progress").style.width = (100 * progBar) + "%";
}

//make element visible
function visible(eid) {
    I(eid).className = 'visible';
}

//hide element
function hidden(eid) {
    I(eid).className = 'hidden';
}

//open Privacy Policy window
function privacyOPN() {
    visible('privacyPolicy');
    umami.track('PrivacyOPN');
}

//close Privacy Policy window
document.onkeydown = function (esc) {
    if (I("privacyPolicy").className == 'visible' && esc.key == 'Escape') {
        hidden('privacyPolicy');
        umami.track('PrivacyCLSEscape');
    }
};

/*function privacyCLSClick() {
    privacyPolicy.onclick = hidden('privacyPolicy');
}*/

function privacyCLSText() {
    hidden('privacyPolicy');
    umami.track('PrivacyCLSText');
}

//autoscroll to given element
function autoscroll(eid) {
    I(eid).scrollIntoView({ behavior: "smooth", block: "end" });
}

//copy to clipboard
function copyToClipboard(eid) {
    copy = I(eid);
    copy.focus();
    copy.select();
    copy.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copy.value);
    alert('Link copied');
    umami.track('URL click copy');
}