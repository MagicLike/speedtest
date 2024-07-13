function I(i) { return document.getElementById(i); }

//LIST OF TEST SERVERS. See documentation for details if needed
var SPEEDTEST_SERVERS = [
    {
        name: "[DE1] Dresden, Germany (ALL-INKL.COM)", //user friendly name for the server
        server: "//de1.backend.speedtest.magiclike.net/", //URL to the server. // at the beginning will be replaced with http:// or https:// automatically
        dlURL: "backend/garbage.php",  //path to download test on this server (garbage.php or replacement)
        ulURL: "backend/empty.php",  //path to upload test on this server (empty.php or replacement)
        pingURL: "backend/empty.php",  //path to ping/jitter test on this server (empty.php or replacement)
        getIpURL: "backend/getIP.php"  //path to getIP on this server (getIP.php or replacement)
    },
    {
        name: "[DE2] Nuremberg, Germany (Hetzner)", //user friendly name for the server
        server: "//de2.backend.speedtest.magiclike.net/", //URL to the server. // at the beginning will be replaced with http:// or https:// automatically
        dlURL: "backend/garbage.php",  //path to download test on this server (garbage.php or replacement)
        ulURL: "backend/empty.php",  //path to upload test on this server (empty.php or replacement)
        pingURL: "backend/empty.php",  //path to ping/jitter test on this server (empty.php or replacement)
        getIpURL: "backend/getIP.php"  //path to getIP on this server (getIP.php or replacement)
    }
    //add other servers here, comma separated
];

//INITIALIZE SPEEDTEST
var s = new Speedtest(); //create speed test object
s.setParameter("telemetry_level", "full"); //enable telemetry

//GAUGE COLOURS
var meterBk = /Trident.*rv:(\d+\.\d+)/i.test(navigator.userAgent) ? "#EAEAEA" : "#80808040";
var dlColor = "#008BFF",
    ulColor = "#FFF500";
var progColor = "#404040";

//SERVER AUTO SELECTION
function initServers() {
    var noServersAvailable = function () {
        I("message").innerHTML = "No servers available";
    }
    var runServerSelect = function () {
        s.selectServer(function (server) {
            if (server != null) { //at least 1 server is available
                hidden("loading"); //hide loading message
                //populate server list for manual selection
                for (var i = 0; i < SPEEDTEST_SERVERS.length; i++) {
                    if (SPEEDTEST_SERVERS[i].pingT == -1) continue;
                    var option = document.createElement("option");
                    option.value = i;
                    option.textContent = SPEEDTEST_SERVERS[i].name;
                    if (SPEEDTEST_SERVERS[i] === server) option.selected = true;
                    I("server").appendChild(option);
                }
                //show test UI
                visible("testWrapper");
                initUI();
            } else { //no servers are available, the test cannot proceed
                noServersAvailable();
            }
        });
    }
    if (typeof SPEEDTEST_SERVERS === "string") {
        //need to fetch list of servers from specified URL
        s.loadServerList(SPEEDTEST_SERVERS, function (servers) {
            if (servers == null) { //failed to load server list
                noServersAvailable();
            } else { //server list loaded
                SPEEDTEST_SERVERS = servers;
                runServerSelect();
            }
        });
    } else {
        //hardcoded server list
        s.addTestPoints(SPEEDTEST_SERVERS);
        runServerSelect();
    }
}

