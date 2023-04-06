/** ================================================================
 *  공통 함수
 *  @author JG, Jo
 *  @since 2021.04.20
 *  @history 2021.05.03 JG validator 함수 추가
 *           2021.06.01 MY 로컬스토리지 관련 함수 추가
 *  ================================================================
 */


/* 로컬 스토리지 관련 함수들 */
/**
 * 현재 브라우저가 로컬 스토리지를 지원하는지 확인한다.
 * @return Local Storage 사용 가능 여부(true/false)
 * @since 2021.06.01
 * @author MY, JANG
 * */
function chkLocalStorage() {
    if (('localStorage' in window) && window['localStorage'] != null) {
        return true;
    } else {
        return false;
    }
}


/**
 * 로컬 스토리지에 값을 저장한다.
 * @params setKey - 스토리지에 저장할 데이터의 key
 * @params setVal - 스토리지에 해당 key로 저장할 값(String) 
 * @author MY, JANG
 * @since 2021.06.01
 * */
function setLocalStorage(setKey, setVal, backPage) {
    if (chkLocalStorage()) { // 세션 스토리지 사용 가능할 때 
        var isValOk = (chkParamType(setVal, 'string') && setVal != undefined); // 세션 스토리지에 저장 가능한 값인지 확인한다.
        if (isValOk) {
            localStorage.setItem(setKey, setVal);
        } else {
            alert('Local Storage에 저장 불가능한 값입니다.');
            return;
        }
    } else {
        alert('현재 브라우저는 Local Storage를 지원하지 않아 시스템을 이용할 수 없습니다.');
        //location.href = backPage;
    }
}
/**
 * 로컬 스토리지에서 key 값에 해당하는 값을 가져온다.
 * @params key - 스토리지에 저장된 key 값
 * @return key 값에 해당하는 값(String) 
 * @author MY, JANG
 * @since 2021.06.01
 * */
function getLocalStorage(key) {
    return window.localStorage.getItem(key);
}


/**
 * 로컬 스토리지에서 key 값에 해당하는 값을 삭제한다.
 * @params key - 스토리지에 삭제할 key 값(String)
 * @author MY, JANG
 * @since 2021.06.01
 * */
function removeLocalStorage(key) {
    window.localStorage.removeItem(key);
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

/* ajax */
/**
 * ajax 호출 공통
 * @params cmmUrl - RequestMapping url(String)
 * @params cmmType - ajax type 지정 ex) post, get (string)
 * @params cmmContentType - ajax contentType 지정(string)
 * @params cmmDataType - ajax dataType 지정(string)
 * @params cmmReqDataObj - 서버 요청 시 보낼 데이터(Object)
 * @params cmmAsync - async 적용(비동기 처리: true/ 동기 처리: false)
 * @params cmmSucc - 성공 후 실행할 함수(callback fn)
 * @params cmmErr - 에러 시 실행할 함수(callback fn)
 * @author JG, Jo 
 * @since  2021.04.14
 * @history 2021.05.10 JG 'application/json'형식의 get type 전송이 아닌 경우 data JSON.stringify처리
 */
function commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr) {
    if (cmmContentType == 'application/json' && cmmType.toLowerCase() !== 'get') {
        cmmReqDataObj = JSON.stringify(cmmReqDataObj);
    }

    $.ajax({
        url: cmmUrl,
        data: cmmReqDataObj,
        type: cmmType,
        async: cmmAsync,
        contentType: cmmContentType,
        dataType: cmmDataType,
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

/**
 * 센서 로딩 창
 * @since 2021.05.28
 * @author MJ Kim
 * */
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
function searchingSensorLoading() {
    let timerInterval;
    Swal.fire({
        allowOutsideClick: false,
        title: 'Searching sensor!',
        html: 'I will close in <strong></strong> seconds.<br/><br/>',
        timer: 120000,
        onBeforeOpen: () => {
            const content = Swal.getContent()
            const $ = content.querySelector.bind(content)

            Swal.showLoading()

            timerInterval = setInterval(() => {
                Swal.getContent().querySelector('strong')
                    .textContent = (Swal.getTimerLeft() / 1000)
                    .toFixed(0)
            }, 100)
        },
        onClose: () => {
            clearInterval(timerInterval);
        }
    })
}
