/** =======================================================
 * cordova 화면 호출 관련 스크립트
 * 관련 파일: main-frame.html
 * @author JG, Jo
 * @since 2021.04.08
 * @history
 * ========================================================
 */

/*===============================================*/
/* client urls                                   */
/*===============================================*/
const loginPage = "../html/user/login.html";
const userInfoPage = "../html/user/user-info.html";
/*===============================================*/
/* node-server views urls                        */
/*===============================================*/
const authTokenUrl = baseUrl + "users/apptoken";
const logoutUrl = baseUrl + "users/logout";
const homeViewUrl = baseUrl + "p_apphome/p_apphome";
const manageViewUrl = baseUrl + "p_manage/p_manage/";
const rtimeViewUrl = baseUrl + "p_rtime/p_rtime/";
const sensorViewUrl = baseUrl + "sensor/";
const retryLoginUrl = serverUrl + "error/auth?lang=";
const alertTokenUrl = baseUrl + "users/alertToken";
//const testUrl = baseUrl + 'devGuide/viewTest';

/*===============================================*/
/* sensor ip                                     */
/*===============================================*/
// const sensorIp = 'http://192.168.253.1/localmodeset';
const sensorIp = "http://192.168.253.1/cloudmodeset";

/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
let $pageTitle = $("#app-page-title"), // 상단 영역 - 화면명
    $contents = $("#contents-area"), // 본문 영역(iframe)
    $setupContents = $("#contents-area-setup"),
    $lmUserNm = $("#lm-btn-user-nm"), // 왼쪽 메뉴 버튼 - 사용자 이름
    $lmSetting = $("#lm-btn-setting"), // 왼쪽 메뉴 버튼 - 장치 설정
    $bmEm = $("#bm-btn-em"), //하단 메뉴 버튼 - 모니터링현황
    $bmManage = $("#bm-btn-manage"), // 하단 메뉴 버튼 -
    $bmReport = $("#bm-btn-report"), // 하단 메뉴 버튼 - 건강 리포트
    $bmRtime = $("#bm-btn-rtime"), // 하단 메뉴 버튼 - 실시간 생체정보
    $allBottomMenu = $("footer a"), // 모든 하단 메뉴 버튼
    $topMenuBtn = $(".nav-toggler"), // 상단 메뉴 버튼
    $sidebarnav = $("#sidebarnav a"), // 모든 사이드 메뉴 버튼
    $sensormodal = $("#sensor-responsive-modal"), // 센서 목록 모달
    $sensormdtitle = $("#sensor-md-title"),
    $setupGridModal = $("#setup-grid-modal"),
    $wifilisttab = $("#wifi-list-tab"), // 센서 리스트
    $wifilistitem = $("#wifi-list-tab .wifi-list"), //센서 리스트 아이템
    $wifiboxtab = $("#wifi-box"), // 센서 리스트
    $wifiboxitem = $("#wifi-box .wifi-box-item"), //센서 리스트 아이템
    $wifiboxbutton = $("#wifi-button"), //와이파이 & 비밀번호 입력 후 corfirm 버튼
    $wifiboxpassword = $("#wifipassword"), //와이파이 비밀번호
    $networkSettingTitle = $("#grid-title"),
    $sensorListRefreshBtn = $("#sensor-list-refresh-btn"); // 센서 목록 갱신 버튼

/*===============================================*/
// sensorssid compare string
/*===============================================*/
const sensorcomparestring = "SCI_";
const sensorApPass = "24681012";
let sensorsecurelist = new Array();
const broadcasetip = "255.255.255.255";
const broadcasetport = 2000;
const broadcasetmessage = '{"type":"SCS-DISCOVER","hostname":"Host-SCS"}';
let datagram;
let broadcastSocket;
let sensorNodeid;
let sensorSsid;
let sensorPassword;
let searchSensorTimer;
let connectSensorTimer;
let sensorAp;
let wifiInfoList;
let searchLoadingflag = false;

/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/
// iframe postMessage에 따라 수행할 동작 지정 2021.04.27 JG
$(window).on("message", (evnt) => {
    let eventAction = evnt.originalEvent.data.action;
    if (eventAction == "searchsensor") {
        serConfiration();
    }
    switch (eventAction) {
        case "login":
            location.href = loginPage;
            break;
        case "removeClickEvent":
            $allBottomMenu.off("click");
            $topMenuBtn.off("click");
            break;
        case "setupsensor":
            hideSetupModal();
            searchSensor();
            break;
        case "sideOutside":
            if ($("body").hasClass("show-sidebar")) {
                $("body").removeClass("show-sidebar");
            }
            break;
    }
});

// i18next
i18next.on("languageChanged", () => {
    updateContent();
});

// 하단 메뉴 버튼 이벤트
$allBottomMenu.on("click", function(evnt) {
    let userCode = getLocalStorage("userCode");
    switch (evnt.currentTarget.id) {
        case "bm-btn-em":
            callPage("pageTitle_EmStatus", "", homeViewUrl + "/" + userCode, "");
            break;
        case "bm-btn-manage":
            callPage("pageTitle_ManageStatus", "", manageViewUrl + userCode, "");
            break;
        case "bm-btn-rtime":
            callPage("pageTitle_BioRealTime", "", rtimeViewUrl + userCode, "");
            break;
    }
    return;
});

// 사이드 메뉴 버튼 이벤트
$sidebarnav.on("click", function(evnt) {
    let userCode = getLocalStorage("userCode");
    switch (evnt.currentTarget.id) {
        case "sm-btn-sensor":
            callPage("pageTitle_Sensor", "", sensorViewUrl + userCode, "");
            break;
        case "sm-btn-log-out": // 로그아웃
            $.ajax({
                async: false,
                type: "post",
                url: logoutUrl,
                data: { userCode: getLocalStorage("userCode") },
                success: function(result) {
                    console.log("logout");
                },
                error: function() {},
            });
            removeLocalStorage("accessToken");
            removeLocalStorage("userCode");
            removeLocalStorage("familyId");
            removeLocalStorage("userName");
            removeLocalStorage("homepage");
            removeLocalStorage("homepageTitle");
            location.href = loginPage;
            break;
    }
    return;
});

function serConfiration() {
    getSetupPage();
    showSetupModal();
}

/*===============================================*/
/* function  area                                */
/*===============================================*/
/**
 * sever side(node)로부터 본문 영역 화면을 호출한다.(iframe)
 * @param pageUrl - node-sever에서 등록한 router url(string)
 * @param lang - 페이지 언어(string) ex) 'ko', 'en'
 * @param reqData - server에 보낼 data(object) ex) {data1: 'testdata', data2: 'testdata2}
 * @author JG, Jo
 * @since 2021.04.08
 * @history 2021.04.11 JG server에 보낼 data 처리 로직 추가
 *          2021.04.20 JG jwt token 인증 로직 추가
 *          2021.05.18 JG 사용자 인증 실패 시 로그인 페이지 이동 안내 메시지 보여주도록 수정
 *          2021.06.02 MY 세션스토리지->로컬스토리지로 변경
 */
function changeView(pageUrl, lang, reqData) {
    // 페이지 요청 전 jwt access token 검증
    let failPage =
        retryLoginUrl +
        getLocalStorage("defaultLang") +
        "&userCode=" +
        getLocalStorage("userCode");
    $.ajax({
        async: true,
        type: "post",
        url: authTokenUrl,
        data: { userCode: getLocalStorage("userCode") },
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader(
                "authorization",
                "Bearer " + getLocalStorage("accessToken")
            );
        },
        success: function(result) {
            let succ = result.success;
            if (succ == 2) {
                // accessToken이 갱신되면
                getLocalStorage("accessToken", result.accessToken);
            } else if (succ == 0) {
                let errorCode = result.errorCode,
                    alertMsg = result.alertMsg;

                console.log("User Authentication Error!: " + errorCode);
                $contents.attr("src", failPage);
                removeLocalStorage("accessToken");
                removeLocalStorage("userCode");
                removeLocalStorage("userName");
                removeLocalStorage("homepage");
                removeLocalStorage("homepageTitle");
            }
        },
        error: function() {
            $contents.attr("src", failPage);
        },
    });

    if ($contents.attr("src") == failPage) {
        // 아래 로직 실행 방지
        return true;
    }

    let showPageUrl = pageUrl;

    if (pageUrl == null || pageUrl == "undefined" || pageUrl == "") {
        showPageUrl = getSessionStorage("curPageUrl");
    }
    if (lang == null || lang == "undefined" || lang == "") {
        let defaultLang = getSessionStorage("defaultLang") || "en";

        showPageUrl += "?lang=" + defaultLang;
    } else {
        showPageUrl += "?lang=" + lang;
    }
    if (reqData != null && typeof reqData !== "undefined" && reqData != "") {
        let objKeys = Object.keys(reqData);

        objKeys.forEach((key) => {
            let value = reqData[key];

            showPageUrl += "&" + key + "=" + value;
        });
    }
    showPageUrl += "&accessToken=Bearer_" + getLocalStorage("accessToken"); // access token 추가 2021.04.20 JG
    $contents.attr("src", showPageUrl);
}

/**
 * 메뉴 언어 변환하기(i18next)
 * @author JG, Jo
 * @since 2021.04.09
 * @history 2021.04.30 JG 제목 언어 변환 코드 수정
 */
function updateContent() {
    // 제목 언어 변환
    $pageTitle.text(i18next.t(getSessionStorage("curPageTitle")));

    // 하단 메뉴 언어 변환
    $bmEm.find("p").text(i18next.t("bmBtn1title"));
    $bmManage.find("p").text(i18next.t("bmBtn3title"));
    $bmRtime.find("p").text(i18next.t("bmBtn5title"));

    // 왼쪽 사이드 메뉴 언어 변환
    $lmUserNm.text(getLocalStorage("userName"));
    $lmSetting.text(i18next.t("lmBtn3title"));

    //센서목록 모달 번역
    $sensormdtitle.text(i18next.t("sensormdtitle"));
    $wifiboxbutton.text(i18next.t("wifiboxbutton"));
    $wifiboxpassword.text(i18next.t("wifiboxpassword"));
    $networkSettingTitle.text(i18next.t("networkSettingTitle"));
    changeView("", i18next.language);
}

/**
 * 페이지 번역 실행
 * @params lang(string)
 * @author JG, Jo
 * @since 2021.04.30
 */
function translatePage(lang) {
    setSessionStorage("defaultLang", lang);
    setLocalStorage("defaultLang", lang);
    i18next.changeLanguage(lang);
}

/**
 * 센서정보저장
 * @author Minjung, Kim
 * @since 2021.05.20
 */

var timerId = null;

function searchSensorInterval() {
    let zeroCount = 0;
    timerId = setInterval(function() {
        console.log(sensorNodeid);
        let errorcount = 0;

        $.ajax({
            // url: "http://211.62.105.193:9000/api/rtime/rtime/alive/" + sensorNodeid,
            url: "http://192.168.3.164:7070/api/rtime/rtime/alive/" + sensorNodeid,
            type: "get",
            dataType: "json",
            success: function(data) {
                console.log(data.rtimeData);
                if (data["rtimeData"] != "0") {
                    let cmmContentType = "application/json",
                        cmmDataType = "json",
                        cmmType = "post",
                        cmmUrl = sensorViewUrl,
                        cmmReqDataObj = {
                            userCode: $("#select-user-code").val(),
                            nodeid: sensorNodeid,
                            ssid: $("#wifi-box option:selected").val(),
                            sensorIp: "0.0.0.0",
                        },
                        cmmAsync = false,
                        cmmSucc = function(result) {
                            let msgCode = result.succ;
                            console.log(msgCode);
                            if (msgCode == 1) {
                                Swal.close();
                                clearInterval(timerId);
                                callPage(
                                    "pageTitle_Sensor",
                                    "",
                                    sensorViewUrl + getLocalStorage("userCode"),
                                    ""
                                );
                            }
                        },
                        cmmErr = null;
                    let result = commAjax(
                        cmmContentType,
                        cmmDataType,
                        cmmType,
                        cmmUrl,
                        cmmReqDataObj,
                        cmmAsync,
                        cmmSucc,
                        cmmErr
                    );
                    Swal.close();
                    clearInterval(timerId);
                } else {
                    zeroCount++;
                    console.log("zeroCount: " + zeroCount);
                    if (zeroCount > 10) {
                        if (getLocalStorage("defaultLang") == "ko") {
                            alert(
                                "센서에 마그네틱 판이 부착되지 않았거나, 연결할 와이파이 비밀번호가 잘못되었습니다. 센서연결을 다시 시도해주세요."
                            );
                        } else {
                            alert(
                                "The sensor is not equipped with a magnetic plate, or the Wi-Fi password to connect to is invalid. Please try to connect the sensor again."
                            );
                        }
                        Swal.close();
                        clearInterval(timerId);
                        callPage(
                            "pageTitle_Sensor",
                            "",
                            sensorViewUrl + getLocalStorage("userCode"),
                            ""
                        );
                    }
                }
            },
            error: function(request, status, error) {
                errorcount += 1;
                console.log(errorcount);
                if (errorcount >= 5) {
                    if (request.status == 0) {
                        alert("check network");
                    } else {
                        alert(
                            "code:" +
                            request.status +
                            "\n" +
                            "message:" +
                            request.responseText +
                            "\n" +
                            "error:" +
                            error
                        );
                    }
                }
            },
        });
    }, 5000);
}

//new_Ver
function searchSensor() {
    let connectSensorTimers;
    connectSensorTimers = setInterval(function() {
        searchSensorInterval();
        clearInterval(connectSensorTimers);
    }, 10000);
}

/**
 * 페이지 호출 실행
 * @params callPageTitle - 호출할 화면명(string)
 * @params callPageLang - 호출할 화면 적용 언어(string)
 * @params callPageUrl - 호출할 화면 url(string)
 * @params callPageReqData - 화면 호출 시 넘겨줄 데이터(object)
 * @author JG, Jo
 * @since 2021.04.30
 */
function callPage(callPageTitle, callPageLang, callPageUrl, callPageReqData) {
    setSessionStorage("curPageTitle", callPageTitle);
    setSessionStorage("curPageUrl", callPageUrl);

    // 제목 언어 변환
    $pageTitle.text(i18next.t(callPageTitle));
    switch (callPageTitle) {
        case "pageTitle_EmStatus":
            $bmEm.css("color", "black");
            $bmManage.css("color", "white");
            $bmRtime.css("color", "white");
            break;
        case "pageTitle_ManageStatus":
            $bmEm.css("color", "white");
            $bmManage.css("color", "black");
            $bmRtime.css("color", "white");
            break;
        case "pageTitle_BioRealTime":
            $bmEm.css("color", "white");
            $bmManage.css("color", "white");
            $bmRtime.css("color", "black");
            break;
        default:
            $bmEm.css("color", "white");
            $bmManage.css("color", "white");
            $bmRtime.css("color", "white");
    }
    changeView(callPageUrl, callPageLang, callPageReqData);
}

/**
 * 화면 초기화 작업
 * @author JG, Jo
 * @since 2021.04.08
 * @history 2021.04.09 JG 다국어 지원, 세션 스토리지 기능 추가
 *          2021.04.21 JG 세션 스토리지 저장 값, i18next 제목 문구 추가
 *          2021.04.30 JG 뒤로가기 버튼 누를 때 앱 종료하도록 이벤트 리스너 추가
 *          2021.05.04 JG 중국어, 일본어 추가 및 note, status, report 페이지명 추가
 *          2021.05.10 JG 페이지 번역 기능 개선
 *          2021.05.21 JG 사이드 메뉴 상단 사용자 이름 추가
 *          2021.06.02 MY 세션스토리지->로컬스토리지로 변경
 */
function init() {
    const pageLang = getLocalStorage("defaultLang");
    console.log(pageLang);
    i18next.init({
            lng: pageLang,
            debug: true,
            resources: transResource, // appMainTrans.js
        },
        function(err, t) {
            if (err) {
                console.error(err);
            } else {
                updateContent();
            }
        }
    );

    if (getLocalStorage("homepageTitle") != null) {
        callPage(
            getLocalStorage("homepageTitle"),
            pageLang,
            getLocalStorage("homepage"),
            ""
        );
    }

    //fcm Token DB 저장
    let cmmContentType = "application/json",
        cmmDataType = "json",
        cmmType = "post",
        cmmUrl = alertTokenUrl,
        cmmReqDataObj = {
            // userCode: getSessionStorage('userCode'),
            userCode: getLocalStorage("userCode"),
            alertToken: getLocalStorage("alertToken"),
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            console.log(result);
        },
        cmmErr = null;
    commAjax(
        cmmContentType,
        cmmDataType,
        cmmType,
        cmmUrl,
        cmmReqDataObj,
        cmmAsync,
        cmmSucc,
        cmmErr
    );

    // back key 눌렀을 때 종료 알림 띄우기 2021.04.30 JG
    document.addEventListener(
        "deviceready",
        function() {
            document.addEventListener(
                "backbutton",
                function() {
                    let confirmMsg = i18next.t("confirmMsg"),
                        cancelBtn = i18next.t("cancelBtn"),
                        exitBtn = i18next.t("exitBtn"),
                        callBack = function(button) {
                            // calback
                            if (button == 2) {
                                console.log(getLocalStorage("accessToken"));
                                navigator.app.exitApp();
                                console.log(getLocalStorage("accessToken"));
                            }
                        };
                    navigator.notification.confirm(confirmMsg, callBack, "", [
                        cancelBtn,
                        exitBtn,
                    ]);
                },
                false
            );
        },
        false
    );
}

// 아래로 싹다 MJ 추가;

// 센서설정 모달창 보이기
function showSetupModal() {
    $setupGridModal.show();
}

// 센서 임베디드 웹페이지 가져오기
function getSetupPage(event) {
    SpinnerDialog.show(null, "Finding Sensor");
    let selectUserCode = $("#select-user-code").val();

    $.ajax({
        url: "http://192.168.253.1/sys/comm",
        type: "get",
        dataType: "text",
        timeout: 2000,
        success: function(data) {
            var positions = data.indexOf("node_id");
            sensorNodeid = data.substring(positions + 10, positions + 10 + 17);
            console.log(sensorNodeid);
            setTimeout(function() {
                $.ajax({
                    url: "http://192.168.253.1/sys/scan",
                    type: "get",
                    dataType: "json",
                    success: function(data) {
                        $wifiboxtab.children("option").remove();
                        wifiInfoList = data["networks"];
                        for (var i in data["networks"]) {
                            $wifiboxtab.append(
                                "<option class = 'wifi-box-item' value='" +
                                data["networks"][i][0] +
                                "'>" +
                                data["networks"][i][0] +
                                "</option>"
                            );
                        }
                        $wifiboxbutton.bind("click", function() {
                            searchingSensorLoading();
                            if ($("#wifi-box option:selected").val() != "") {
                                $.ajax({
                                    url: "http://192.168.253.1/sys/comm",
                                    type: "post",
                                    // 데이터 받아들이는 시간이 필요해서 공백 입력.
                                    data: '                                                                                                                                                    {"mode" : 1 , "https_enable" : 0 , "url" : "192.168.3.164:7070" , "username" : "user" , "network_id" : "user" , "new_password" : "12345678" , "report_interval" : 5}"',
                                    timeout: 1000,

                                    beforeSend: function(xhr) {
                                        xhr.setRequestHeader("Accept", "application/json");
                                        xhr.setRequestHeader(
                                            "Authorization",
                                            "Basic YWRtaW46YWRtaW4="
                                        );
                                    },

                                    success: function(request, status, error) {
                                        console.log(status);
                                    },
                                    error: function(request, status, error) {
                                        console.log(status, "1");

                                        setTimeout(function() {
                                            $.ajax({
                                                url: "http://192.168.253.1/sys/network",
                                                type: "post",
                                                data: '                                                                                                                  {"sta" :{ "ssid" :"' +
                                                    $("#wifi-box option:selected").val() +
                                                    '", "security" : "' +
                                                    wifiInfoList[
                                                        $("#wifi-box option").index(
                                                            $("#wifi-box option:selected")
                                                        )
                                                    ][2] +
                                                    '","passphrase" : "' +
                                                    $("#wifi-password").val() +
                                                    '","dhcp" : 1}}',
                                                timeout: 1000,
                                                beforeSend: function(xhr) {
                                                    xhr.setRequestHeader("Accept", "application/json");
                                                    xhr.setRequestHeader(
                                                        "Authorization",
                                                        "Basic YWRtaW46YWRtaW4="
                                                    );
                                                },
                                                success: function(data) {
                                                    console.log("data2");
                                                },
                                                error: function(request, status, error) {
                                                    console.log(status, "2");

                                                    setTimeout(function() {
                                                        $.ajax({
                                                            url: "http://192.168.253.1/sys/cmd",
                                                            type: "post",
                                                            data: '                                                                                                        { "cmd": "reboot" }',
                                                            timeout: 1000,
                                                            beforeSend: function(xhr) {
                                                                xhr.setRequestHeader(
                                                                    "Accept",
                                                                    "application/json"
                                                                );
                                                                xhr.setRequestHeader(
                                                                    "Authorization",
                                                                    "Basic YWRtaW46YWRtaW4="
                                                                );
                                                            },

                                                            success: function(data) {
                                                                console.log("data3");
                                                            },
                                                            error: function(request, status, error) {
                                                                $wifiboxbutton.unbind("click");
                                                                console.log(status, "3");
                                                                hideSetupModal();
                                                                searchSensor();
                                                            },
                                                        });
                                                    }, 1000);
                                                },
                                            });
                                        }, 1000);
                                    },
                                });
                            } else {
                                alert("Select wifi and retry!");
                            }
                        });
                    },
                    error: function(request, status, error) {
                        alert(
                            "code:" +
                            request.status +
                            "\n" +
                            "message:" +
                            request.responseText +
                            "\n" +
                            "error:" +
                            error
                        );
                    },
                });
                SpinnerDialog.hide();
            }, 5000);
        },
        error: function(request, status, error) {
            setTimeout(function() {
                SpinnerDialog.hide();
                if (getLocalStorage("defaultLang") == "ko") {
                    alert("센서와이파이를 연결하고 다시 시도해주세요");
                } else {
                    alert("Please  Check sensor!!");
                }
                hideSetupModal();
            }, 3000);
        },
    });
}

function callbackJavascript() {
    alert("react");
}

// 센서설정 모달창 숨기기
function hideSetupModal() {
    $setupGridModal.hide();
}