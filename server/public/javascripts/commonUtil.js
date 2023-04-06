/** ================================================================
 *  프론트 엔드 공통 함수들
 *  @author JG, Jo
 *  @since 2021.04.14
 *  @history 
 *  ================================================================
 */
const authTokenUrl = baseUrl + '/users/token';
const retryLoginUrl = serverUrl + 'error/auth?';

function loadSong() {

    var player = document.getElementById('player');
    var sourceOgg = document.getElementById('player');
    var sourceMp3 = document.getElementById('player');

    sourceOgg.src = 'http://scikorea.co.kr/sound/emergency.ogg';
    sourceMp3.src = 'http://scikorea.co.kr/sound/emergency.mp3';

    player.load(); //just start buffering (preload)
    player.play(); //start playing
}

$('.sd-list').on('click', function(evnt) {
    switch (evnt.currentTarget.id) {
        case 'page-title':
            let mainUrl = baseUrl + "/rtime_web/" + userCode;
            changeView(mainUrl)
            break;
        case 'side-menu-rtime':
            let rtimeUrl = baseUrl + "/rtime_web/" + userCode;
            changeView(rtimeUrl)
            break;
        case 'side-menu-register':
            let registerUrl = baseUrl + "/register/" + userCode;
            changeView(registerUrl)
            break;
        case 'side-menu-health':
            let healthUrl = baseUrl + "/health/" + userCode;
            changeView(healthUrl)
            break;
        case 'side-menu-user-list1':
            let userListUrl1 = baseUrl + "/monitList/" + userCode;
            changeView(userListUrl1)
            break;
        case 'side-menu-user-list':
            let userListUrl = baseUrl + "/userList/" + userCode;
            changeView(userListUrl)
            break;
        case 'side-menu-emergency-list':
            let emergencyListUrl = baseUrl + "/asList/" + userCode;
            changeView(emergencyListUrl)
            break;
        case 'side-menu-user-graph':
            let userGraphUrl = baseUrl + "/usergraph/" + userCode;
            changeView(userGraphUrl)
            break;
        case 'side-menu-emergency-graph':
            let emergencyGraphUrl = baseUrl + "/monitStat/" + userCode;
            changeView(emergencyGraphUrl)
            break;
    }
});

//관리자 정보
$('#admin-info').on('click', function() {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '',
        cmmReqDataObj = {
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            window.location = baseUrl;
        },
        cmmErr = function() {};

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
})

//로그아웃
$('#logout-btn').on('click', function() {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/users/adminlogout',
        cmmReqDataObj = {
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            removeSessionStorage('userCode');
            // removeSessionStorage('userName');
            removeSessionStorage('accessToken');
            removeSessionStorage('culPageUrl')
            window.location = baseUrl;
        },
        cmmErr = function() {};

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
})

function changeView(pageUrl, reqData) {
    // 페이지 요청 전 jwt access token 검증
    let changePageUrl
    let failPage = retryLoginUrl + 'userCode=' + getSessionStorage('userCode');
    $.ajax({
        async: true,
        type: 'post',
        url: authTokenUrl,
        data: { userCode: getSessionStorage('userCode') },
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('authorization', 'Bearer ' + getSessionStorage('accessToken'));
        },
        success: function(result) {
            let succ = result.success;
            if (succ == 2) { // accessToken이 갱신되면
                getSessionStorage('accessToken', result.accessToken);

            } else if (succ == 0) {
                let errorCode = result.errorCode,
                    alertMsg = result.alertMsg;

                console.log('User Authentication Error!: ' + errorCode);
                changePageUrl = failPage
                location.href = changePageUrl;
                removeLocalStorage('accessToken');
                removeLocalStorage('userCode');
                removeLocalStorage('familyId');
                removeLocalStorage('userName');
                removeLocalStorage('homepage');
                removeLocalStorage('homepageTitle');
            }
        },
        error: function() {
            changePageUrl = failPage
            location.href = changePageUrl;
        }
    });

    if (changePageUrl == failPage) { // 아래 로직 실행 방지
        return true;
    }

    let showPageUrl = pageUrl;

    if (pageUrl == null || pageUrl == 'undefined' || pageUrl == '') {
        showPageUrl = getSessionStorage('curPageUrl');
    }

    if (reqData != null && typeof reqData !== 'undefined' && reqData != '') {
        let objKeys = Object.keys(reqData);

        objKeys.forEach(key => {
            let value = reqData[key];

            showPageUrl += '&' + key + '=' + value;
        });
    }

    showPageUrl += ('?accessToken=Bearer_' + getSessionStorage('accessToken')); // access token 추가 2021.04.20 JG
    setSessionStorage('culPageUrl', showPageUrl);
    location.href = showPageUrl;
}
/**
 * ajax 호출 공통
 * @params cmmUrl - RequestMapping url(String)
 * @params cmmType - ajax type 지정 ex) post, get (string)
 * @params cmmReqDataObj - 서버 요청 시 보낼 데이터(Object)
 * @params cmmAsync - async 적용(비동기 처리: true/ 동기 처리: false)
 * @params cmmSucc - 성공 후 실행할 함수(callback fn)
 * @params cmmErr - 에러 시 실행할 함수(callback fn)
 * @author JG, Jo 
 * @since  2021.04.14
 * @history 2021.05.10 JG data json 오류 수정 - 'application/json'형식의 get type 전송이 아닌 경우 data JSON.stringify처리 
 */
function commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr) {
    if (cmmContentType == 'application/json' && cmmType.toLowerCase() !== 'get') {
        cmmReqDataObj = JSON.stringify(cmmReqDataObj);
    }
    $.ajax({
        url: cmmUrl,
        data: cmmReqDataObj,
        type: cmmType,
        async: cmmAsync,
        contentType: cmmContentType,
        success: function(data) {
            if (cmmSucc != null && cmmSucc instanceof Function) {
                cmmSucc(data);
            }
        },
        error: function(xhr, status, error) {
            const xhrStatus = xhr.status;

            console.log('code: ' + xhrStatus + '\n' +
                'message: ' + status + '\n' +
                'error: ' + error);

            if (xhrStatus == 404) {
                alert('[HTTP.' + xhrStatus + '] URL이 잘못 지정 되었습니다. - (url) ' + cmmUrl);
            } else if (xhrStatus == 403) {
                alert('[HTTP.' + xhrStatus + '] 권한이 없습니다. - (url) ' + cmmUrl);
            } else {
                alert('[HTTP.' + xhrStatus + '] 오류가 발생했습니다. - (url) ' + cmmUrl);
            }

            if (cmmErr != null && cmmErr instanceof Function) {
                cmmErr();
            }
        }
    });
}

/** ================================================================
 *  날짜 관련 공통 함수
 *  @author JG, Jo
 *  @since 2021.05.03
 *  @history 
 *  ================================================================
 */

/** 
 * 년 select box option 생성하기
 * 
 * @params $selBox - option을 추가하기 위한 기준 selectbox 요소(jquery 객체)
 * @author JG, Jo 
 * @since  2021.05.03
 */
function setYearSelBox($selBox) {
    let date = new Date(),
        startYear = 1900,
        thisYear = date.getFullYear(),
        optStr = '';

    for (let i = thisYear; i >= startYear; i--) {
        optStr += '<option value="' + i + '">' + i + '</option>';
    }

    $selBox.append(optStr);
    $selBox.val('1970').prop('selected', true);
}

/** 
 * 월 select box option 생성하기
 * 
 * @params $selBox - option을 추가하기 위한 기준 selectbox 요소(jquery 객체)
 * @author JG, Jo 
 * @since  2021.05.03
 */
function setMonthSelBox($selBox) {
    let optStr = '';

    for (let i = 1; i <= 12; i++) {
        if (i < 10) {
            optStr += '<option value="0' + i + '">' + i + '</option>';
        } else {
            optStr += '<option value="' + i + '">' + i + '</option>';
        }
    }

    $selBox.append(optStr);
    $selBox.val('01').prop('selected', true);
}

/** 
 * 일 select box option 생성하기
 * 
 * @params $selBox - option을 추가하기 위한 기준 selectbox 요소(jquery 객체)
 *        selYear - 기준 년도
 *        selMonth - 기준 월
 * @author JG, Jo 
 * @since  2021.05.03
 */
function setDaySelBox($selBox, selYear, selMonth) {
    let lastDay = 31,
        optStr = '';

    if (selMonth == 4 || selMonth == 6 || selMonth == 9 || selMonth == 11) {
        lastDay = 30;
    } else if (selMonth == 2) {
        if ((selYear % 4 == 0 && selYear % 100 != 0) || selYear % 400 == 0) {
            lastDay = 29;
        } else {
            lastDay = 28;
        }
    }

    for (let i = 1; i <= lastDay; i++) {
        if (i < 10) {
            optStr += '<option value="0' + i + '">' + i + '</option>';
        } else {
            optStr += '<option value="' + i + '">' + i + '</option>';
        }
    }

    $selBox.not('[value=""]').empty();
    $selBox.append(optStr);
    $selBox.val('01').prop('selected', true);
}

//현재시간 표시
function getTime() {
    let date = new Date();
    let year = date.getFullYear(),
        month = date.getMonth(),
        nowDate = date.getDate(),
        day = date.getDay(),
        week = ['일', '월', '화', '수', '목', '금', '토'],
        hour = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds();
    let now = year + '년 ' + (month + 1) + '월 ' + nowDate + '일 ' + week[day] + '요일 ' + (hour < 10 ? '0' + hour : hour) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);

    // $clockTarget.html(now)
    return now
}


/* 세션 스토리지 관련 함수들 */
/**
 * parameter type 검사
 * @params chkVal - type 검사할 값
 * @params chkType - 검사할 값의 예상 type
 * @return isMath - 예상 type과 실제 type 일치 여부(true/false)
 * @since 2021.04.09
 * @author JG, Go
 * */
function chkParamType(chkVal, chkType) {
    var valType = typeof(chkVal);
    var isMatch = (valType.toLowerCase() == chkType.toLowerCase());
    return isMatch;
}

/**
 * 현재 브라우저가 세션 스토리지를 지원하는지 확인한다.
 * @return Session Storage 사용 가능 여부(true/false)
 * @since 2021.04.09
 * @author JG, Go
 * */
function chkSessionStorage() {
    if (('sessionStorage' in window) && window['sessionStorage'] != null) {
        return true;
    } else {
        return false;
    }
}

/**
 * 세션 스토리지에 값을 저장한다.
 * @params setKey - 스토리지에 저장할 데이터의 key
 * @params setVal - 스토리지에 해당 key로 저장할 값(String) 
 * @author JG, Jo
 * @since 2021.04.09
 * */
function setSessionStorage(setKey, setVal, backPage) {
    if (chkSessionStorage()) { // 세션 스토리지 사용 가능할 때 
        var isValOk = (chkParamType(setVal, 'string') && setVal != undefined); // 세션 스토리지에 저장 가능한 값인지 확인한다.
        if (isValOk) {
            sessionStorage.setItem(setKey, setVal);
        } else {
            alert('Session Storage에 저장 불가능한 값입니다.');
            return;
        }
    } else {
        alert('현재 브라우저는 Session Storage를 지원하지 않아 시스템을 이용할 수 없습니다.');
        //location.href = backPage;
    }
}

/**
 * 세션 스토리지에서 key 값에 해당하는 값을 가져온다.
 * @params key - 스토리지에 저장된 key 값
 * @return key 값에 해당하는 값(String) 
 * @author JG, Jo
 * @since 2021.04.09
 * */
function getSessionStorage(key) {
    return window.sessionStorage.getItem(key);
}


/**
 * 세션 스토리지에서 key 값에 해당하는 값을 삭제한다.
 * @params key - 스토리지에 삭제할 key 값(String)
 * @author JG, Jo 
 * @since 2021.04.09
 * */
function removeSessionStorage(key) {
    window.sessionStorage.removeItem(key);
}


/**
 * form 값 유효성 검사
 * @params chkVal - 유효성 검사할 값
 * @params mode - 값 유효성 검사 방식 (string)
 * @params option - 값 유효성 검사에 필요한 데이터들 (object)
 * @return result - true/ false, byte length, string length
 * @since 2021.05.03
 * @author JG, Go
 * */
function validator(chkVal, mode, option) {
    let result = false;

    switch (mode) {
        case 'bytesLength': // 입력 글자 바이트 확인
            var bytes = encodeURI(chkVal).split(/%..|./).length - 1;
            result = bytes;
            break;
        case 'isBytesLess': // 기준 바이트 보다 작은지 확인
            var chkValByteLen = validator(chkVal, 'bytesLenth');
            var standardByteLen = option.standard;

            if (chkValByteLen < standardByteLen) {
                result = true;
            }
            break;
        case 'isBytesMore': // 기준 바이트 보다 큰지 확인
            var chkValByteLen = validator(chkVal, 'bytesLenth');
            var standardByteLen = option.standard;

            if (chkValByteLen > standardByteLen) {
                result = true;
            }
            break;
        case 'stringLength':
            result = chkVal.length;
            break;
        case 'isEmpty':
            var valLen = validator(chkVal, 'stringLength');
            if (chkVal == '' || valLen == 0) {
                result = true;
            }
            break;
        case 'isSpChar':
            var spCharPattern = /[~!@\#$%^&*\()\-=+_:;<>?{}'",`/]/gi;
            if (spCharPattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isKorean':
            var korPattern = /[ㄱ-힣]/;
            if (korPattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isKorConsonantOrVowel':
            var korPattern = /[가-힣]/,
                otherPattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/; // 일본어, 중국어, 한자

            if (validator(chkVal, 'isKorean') && !otherPattern.test(chkVal) && !korPattern.test(chkVal)) {
                return true;
            }
            break;
        case 'isEngAndNum':
            var pattern = /^[A-Za-z0-9+]*$/;
            if (pattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isNotCombEngNum':
            var patternEng = /[a-z]/ig,
                patternNum = /[0-9]/g;
            if (chkVal.search(patternEng) < 0 || chkVal.search(patternNum) < 0) {
                result = true;
            }
            break;
        case 'isCombEngNumSp':
            var pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{9,}$/
            if (pattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isNumber':
            var chars = '0123456789';
            for (let i = 0; i < chkVal.length; i++) {
                if (chars.indexOf(chkVal.charAt(i)) != -1) {
                    result = true;
                }
            }
            break;
        case 'isRepeated4':
            var repeatPattern = /(\w)\1\1\1/;
            if (repeatPattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isIncludeStr':
            if (chkVal.search(option.compareStr) > -1) {
                result = true;
            }
            break;
        case 'isDomain':
            var pattern = /^[^((http(s?))\:\/\/)]([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/; // http, https 미포함
            if (pattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isEmail':
            var pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
            if (pattern.test(chkVal)) {
                result = true;
            }
            break;

    }
    return result;
};