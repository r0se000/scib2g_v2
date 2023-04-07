/** =======================================================
 * 회원정보 화면 관련 스크립트
 * 관련 파일: signup.html
 * @author JG, Jo
 * @since 2021.05.26
 * @history 
 * ========================================================
 */

/*===============================================*/
/* client urls and global variables              */
/*===============================================*/
const mainPage = '../main-frame.html';
const indexPage = '../index.html';
const pageLang = getSessionStorage('defaultLang');

const successClass = 'has-success';
const failClass = 'has-danger';
const dangerTxtClass = 'text-danger';
const inputSuccClass = 'form-control-success';
const inputFailClass = 'form-control-danger';

const nameBytesMax = 70;
const pwBytesMin = 9;
const pwBytesMax = 16;
const emailIdBytesMax = 70;
const emailDomainBytesMax = 40;

/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
const $pageTitle = $('#page-title') // 페이지명
    ,
    $withdrawal = $('#withdrawal') // 회원탈퇴
    ,
    $userNmLabel = $('#label-userName') // 성명 라벨
    ,
    $pwdLabel = $('#label-new-pwd') // 비밀번호 라벨
    ,
    $pwdConfirmLabel = $('#label-confirm-pwd') // 비밀번호 확인 라벨
    ,
    $changePwBtn = $('#change-pw-btn') // 비밀번호 변경 버튼
    ,
    $genderLabel = $('#label-gender') // 성별 라벨
    ,
    $birthLabel = $('#label-birthday') // 생년월일 라벨
    ,
    $yearNotice = $('#year-notice') // 생년 라벨
    ,
    $monthNotice = $('#month-notice') // 생월 라벨
    ,
    $dayNotice = $('#day-notice') // 생일 라벨
    ,
    $submitBtn = $('#submit-btn') // 회원 정보 수정 버튼
    ,
    $cancelBtn = $('#cancel-btn') // 취소 버튼
    ,
    $formInputs = $('.form-control') // 전체 form 입력란
    ,
    $bYear = $('#birth-year-input') // 생년 select
    ,
    $bMonth = $('#birth-month-input') // 생월 select
    ,
    $bDay = $('#birth-day-input') // 생일 select
    ,
    $genderSelect = $('#gender-select') // 성별 select
    ,
    $nameNotice = $('#name-notice') // 이름 입력 조건 알림
    ,
    $pwdNotice = $('#new-pwd-notice') // pwd 입력 조건 알림
    ,
    $pwdConfirmNotice = $('#confirm-pwd-notice') // pwd confirm 입력 조건 알림
    ,
    $emailNotice = $('#email-notice') // email 입력 주의사항
    ,
    $emailNotice2 = $('#email-notice2') // email 입력 조건 알림
    ,
    $modalTitle = $('#modify-title') // modal popup title
    ,
    $newPwdNotice = $('#new-pwd-notice') // modal popup 새 비밀번호 입력 조건 알림
    ,
    $confimPwdNotice = $('#confirm-pwd-notice') // modal popup 새 비밀번호 입력 조건 알림
    ,
    $modalSubmitBtn = $('#modal-submit-btn') // modal submit button
    ,
    $backbtn = $('#userInfo-back');


/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/

// form 입력 값 검증
$formInputs.not('select').on('propertychange change keyup paste input', function(evnt) {
    realTimeformControl(evnt, '');
});

// birth day select event
$bYear.on('change', function() {
    $bMonth.trigger('change');
    return;
});

$bMonth.on('change', function() {
    setDaySelBox($bDay, $bYear.val(), $bMonth.val());
    return;
});

// 회원탈퇴 
$withdrawal.on('click', function() {
    withdrawal();
});

// 비밀번호 변경 실행
$modalSubmitBtn.on('click', function() {
    changePassword();
});

// submit button event
$submitBtn.on('click', function() {
    let isOk = beforeSubmit(inputFailClass);

    if (isOk) {
        submitForm();
    }
    return;
});

// cancel button event
$cancelBtn.on('click', function() {
    location.href = mainPage;
});

$backbtn.on('click', function() {
    location.href = mainPage;
})

/*===============================================*/
/* function  area                                */
/*===============================================*/

/**
 * 화면 초기화 작업
 * @author JG, Jo
 * @since 2021.05.26
 * @history 
 */
function init() {
    let defaultLang = getSessionStorage('defaultLang') || 'en';

    i18next.init({
            lng: defaultLang,
            debug: true,
            resources: transResource
        },
        function(err, t) {
            if (err) {
                console.error(err);
            } else {
                updateContent();
            }
        }
    );

    setYearSelBox($bYear); // 생년 날짜 설정
    setMonthSelBox($bMonth); // 생월 날짜 설정
    setDaySelBox($bDay, '1970', '1'); // 생일 날짜 설정

    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'get',
        cmmUrl = baseUrl + 'users/show/info',
        cmmReqDataObj = { 'userCode': getLocalStorage('userCode') },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.messageCode === 'ExistUser') {
                let keyArray = Object.keys(result);
                keyArray.forEach(function(key) {
                    let $input = $('[name=' + key + ']');
                    if ($input.length > 0) {
                        let inputVal = result[key];
                        $input.val(inputVal);

                        if (key === 'eId' || key === 'eDomain') {
                            $input.data('original', inputVal);
                        }
                    }
                });
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

    // back key 눌렀을 때 홈 페이지로 이동 
    document.addEventListener('deviceready', function() {
        document.addEventListener('backbutton', function() {
            location.href = mainPage;
        }, false);
    }, false);
}

/**
 * 메뉴 언어 변환하기(i18next)
 * @param 
 * @author JG, Jo
 * @since 2021.05.06
 */
function updateContent() {
    $pageTitle.text(i18next.t('pageTitle'));
    $userNmLabel.text(i18next.t('nameLabel'));
    $genderLabel.text(i18next.t('genderLabel'));
    $birthLabel.text(i18next.t('birthLabel'));
    $yearNotice.text(i18next.t('bYearLabel'));
    $monthNotice.text(i18next.t('bMonthLabel'));
    $dayNotice.text(i18next.t('bDayLabel'));
    $nameNotice.text(i18next.t('nameNotice'));
    $emailNotice.text(i18next.t('emailNotice'));
    $genderSelect.find('option[value="M"]').text(i18next.t('genderM'));
    $genderSelect.find('option[value="F"]').text(i18next.t('genderF'));
    $submitBtn.text(i18next.t('submitBtn'));
    $cancelBtn.text(i18next.t('cancelBtn'));
    $changePwBtn.text(i18next.t('pwChange'));
    $modalTitle.text(i18next.t('pwChange'));
    $pwdLabel.text(i18next.t('pwdLabel'));
    $pwdConfirmLabel.text(i18next.t('confirmPwdLabel'));
    $modalSubmitBtn.text(i18next.t('pwChange'));
    $withdrawal.text(i18next.t('withdrawal'));
}

/**
 * 중복 email 검사
 * @params emailIdStr - 검사할 email id string
 * @params emailDomainStr - 검사할 email domain string
 * @return isOk - 중복 여부(true/false)
 * @author JG, Jo
 * @since 2021.05.26
 */
function emailDuplicateCheck(emailIdStr, emailDomainStr) {
    let isOk = '';
    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'get',
        cmmUrl = baseUrl + 'users/duplicate/email',
        cmmReqDataObj = { 'eIdString': emailIdStr, 'eDomainString': emailDomainStr },
        cmmAsync = false,
        cmmSucc = function(result) {
            isOk = result;
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return isOk;
}


/**
 * 비밀번호 변경
 * @author JG, Jo
 * @since 2021.05.26
 */
function changePassword() {
    let $newPwd = $formInputs.filter('#new-pwd-input'),
        $pwdConfirm = $formInputs.filter('#confirm-pwd-input'),
        newPwd = $newPwd.val(),
        confirmPw = $pwdConfirm.val();

    if ($newPwd.hasClass(inputFailClass) || $pwdConfirm.hasClass(inputFailClass) ||
        newPwd == '' || confirmPw == '') {
        alert(i18next.t('noticeConfirmForm'));
        return;
    }

    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'post',
        cmmUrl = baseUrl + 'users/modify/password',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.state) {
                alert(i18next.t('modifySuccessMsg'));

                $newPwd.val('');
                $pwdConfirm.val('');

                $('#modal-close-btn').trigger('click');
                return;
            } else {
                alert(i18next.t('modifyErrorMsg'));
                return;
            }
            //location.href = mainPage;
        },
        cmmErr = function() {
            alert(i18next.t('modifyErrorMsg'));
            //location.href = indexPage;
        };

    cmmReqDataObj.userCode = getSessionStorage('userCode');
    cmmReqDataObj.pwd = $formInputs.filter('#new-pwd-input').val();

    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
}

/**
 * 회원탈퇴 변경
 * @author JG, Jo
 * @since 2021.05.26
 */
function withdrawal() {
    let conf = confirm(i18next.t('withdrawalNotice'));
    if (conf) {
        let cmmContentType = 'application/json',
            cmmDataType = 'json',
            cmmType = 'post',
            cmmUrl = baseUrl + 'users/withdrawal',
            cmmReqDataObj = {},
            cmmAsync = false,
            cmmSucc = function(result) {
                if (result.state) {
                    alert(i18next.t('withdrawalSuccessMsg'));
                    removeLocalStorage('accessToken');
                    removeLocalStorage('userCode');
                    removeLocalStorage('familyId');
                    removeLocalStorage('userName');
                    removeLocalStorage('homepage');
                    removeLocalStorage('homepageTitle');
                    location.href = indexPage;
                } else {
                    alert(i18next.t('withdrawalErrorMsg'));
                    return;
                }
            },
            cmmErr = function() {
                alert(i18next.t('withdrawalErrorMsg'));
                return;
            };

        cmmReqDataObj.userCode = getLocalStorage('userCode');
        cmmReqDataObj.activateYN = 'N';

        let date = new Date(),
            year = date.getFullYear(),
            month = (1 + date.getMonth()),
            day = date.getDate();

        month = month >= 10 ? month : ('0' + month);
        day = day >= 10 ? day : ('0' + day);

        cmmReqDataObj.deactivateDate = year + '-' + month + '-' + day;

        commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
    return;
}



/**
 * 회원가입 입력 양식 실시간 검사
 * @params evnt - event
 * @params triggerInputId - 검사가 필요한 입력 필드 ID(stirng)
 * @author JG, Jo
 * @since 2021.05.26 
 */
function realTimeformControl(evnt, triggerInputId) {
    let targetId = '',
        targetVal = '',
        activeClass = '',
        deactiveClass = '',
        $input = null,
        showNotice = false,
        noticeMsg = '',
        $notice = null,
        bytesMax = 0,
        bytesMin = 0,
        $bytesNotice = null;

    if (evnt != null) {
        targetId = evnt.target.id,
            targetVal = evnt.target.value,
            $input = $('#' + targetId),
            $bytesNotice = $input.parent().next('div').find('.bytes-check');
    } else {
        targetId = triggerInputId,
            $input = $('#' + targetId),
            targetVal = $input.val(),
            $bytesNotice = $input.parent().next('div').find('.bytes-check');
    }
    switch (targetId) {
        case 'name-input':
            {
                $notice = $nameNotice;
                bytesMax = nameBytesMax;

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    noticeMsg = 'nameNoticeEmpty';
                    showNotice = true;
                } else {
                    let byteLen = validator(targetVal, 'bytesLength');
                    if (byteLen > 0 && byteLen < bytesMax) {
                        let strArray = Array.from(targetVal);

                        for (let [idx, char] of strArray.entries()) {
                            /*한글입력 시 자음만, 모음만 입력되는 것 방지*/
                            // if (validator(char, 'isKorConsonantOrVowel')) {
                            //     strArray[idx] = '';
                            // }

                            if (validator(char, 'isSpChar') || validator(char, 'isNumber') ||
                                char === '.' || char === '[' || char === ']') {
                                strArray[idx] = '';
                            }
                            targetVal = strArray.join('');
                        }

                        if (validator(targetVal.replace(/\s/g, ''), 'bytesLength') > 0) {
                            activeClass = successClass;
                            deactiveClass = failClass;
                            noticeMsg = '';
                            showNotice = false;
                        } else {
                            activeClass = failClass;
                            deactiveClass = successClass;
                            noticeMsg = 'nameNoticeEmpty';
                            showNotice = true;
                        }
                        $bytesNotice.removeClass(dangerTxtClass);
                    } else if (validator(targetVal, 'bytesLength') > bytesMax) {
                        activeClass = failClass;
                        deactiveClass = successClass;
                        noticeMsg = 'noticeTooLong';
                        showNotice = true;
                        $bytesNotice.addClass(dangerTxtClass);
                    }
                }
                break;
            }
        case 'email-input':
            {
                $bytesNotice = $bytesNotice.filter('[id="email-bytes1"]');
                $notice = $emailNotice2;
                bytesMax = emailIdBytesMax;
                noticeMsg = 'emailNotice2';

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                } else {
                    let bytesLen = validator(targetVal, 'bytesLength');
                    if (bytesLen > 0 && bytesLen <= bytesMax) {
                        let strArray = Array.from(targetVal);

                        for (let [idx, char] of strArray.entries()) {
                            if (validator(char, 'isSpChar')) {
                                strArray[idx] = '';
                            }
                            if (!validator(char, 'isEngAndNum')) {
                                strArray[idx] = '';
                            }
                            targetVal = strArray.join('');
                        }

                        let $emailInput2 = $('#email-input2'),
                            emailIdStr = targetVal,
                            emailDomainStr = $emailInput2.val();

                        if (emailIdStr === $input.data('original') &&
                            emailDomainStr === $emailInput2.data('original')) {
                            activeClass = successClass;
                            deactiveClass = failClass;
                            noticeMsg = '';
                            showNotice = false;

                        } else {
                            if (!emailDuplicateCheck(emailIdStr, emailDomainStr)) {
                                activeClass = successClass;
                                deactiveClass = failClass;
                                noticeMsg = '';
                                showNotice = false;
                            } else {
                                activeClass = failClass;
                                deactiveClass = successClass;
                                showNotice = true;
                                noticeMsg = 'emailDuplicate';
                            }
                        }

                        $bytesNotice.removeClass(dangerTxtClass);
                    } else {
                        activeClass = failClass;
                        deactiveClass = successClass;
                        showNotice = true;
                        $bytesNotice.addClass(dangerTxtClass);
                    }
                }
                break;
            }
        case 'email-input2':
            {
                $bytesNotice = $bytesNotice.filter('[id="email-bytes2"]');
                $notice = $emailNotice2;
                bytesMax = emailDomainBytesMax;
                noticeMsg = 'emailNotice2';

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                } else {
                    let bytesLen = validator(targetVal, 'bytesLength');
                    if (bytesLen > 0 && bytesLen <= bytesMax) {

                        if (validator(targetVal, 'isDomain')) {
                            let $emailInput = $('#email-input'),
                                emailIdStr = $emailInput.val(),
                                emailDomainStr = targetVal;

                            if (emailIdStr === $emailInput.data('original') &&
                                emailDomainStr === $input.data('original')) {
                                activeClass = successClass;
                                deactiveClass = failClass;
                                noticeMsg = '';
                                showNotice = false;

                            } else {
                                if (!emailDuplicateCheck(emailIdStr, emailDomainStr)) {
                                    activeClass = successClass;
                                    deactiveClass = failClass;
                                    noticeMsg = '';
                                    showNotice = false;
                                } else {
                                    activeClass = failClass;
                                    deactiveClass = successClass;
                                    showNotice = true;
                                    noticeMsg = 'emailDuplicate';
                                }
                            }
                        } else {
                            activeClass = failClass;
                            deactiveClass = successClass;
                            showNotice = true;
                        }
                        $bytesNotice.removeClass(dangerTxtClass);
                    } else {
                        activeClass = failClass;
                        deactiveClass = successClass;
                        showNotice = true;
                        $bytesNotice.addClass(dangerTxtClass);
                    }
                }
                break;
            }
        case 'new-pwd-input':
            {
                $notice = $pwdNotice;
                bytesMax = pwBytesMax;
                bytesMin = pwBytesMin;
                noticeMsg = 'pwdNotice';

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                } else {
                    if ($('#confirm-pwd-input').val().length > 0) {
                        realTimeformControl(null, 'confirm-pwd-input');
                    }
                    let bytesLen = validator(targetVal, 'bytesLength');
                    if (bytesLen >= bytesMin && bytesLen <= bytesMax) {

                        if (validator(targetVal, 'isCombEngNumSp')) {
                            activeClass = successClass;
                            deactiveClass = failClass;
                            noticeMsg = '';
                            showNotice = false;
                        } else {
                            activeClass = failClass;
                            deactiveClass = successClass;
                            showNotice = true;
                        }
                        $bytesNotice.removeClass(dangerTxtClass);
                    } else {
                        activeClass = failClass;
                        deactiveClass = successClass;
                        showNotice = true;
                        $bytesNotice.addClass(dangerTxtClass);
                    }
                }
                break;
            }
        case 'confirm-pwd-input':
            {
                $notice = $pwdConfirmNotice;
                bytesMax = pwBytesMax;
                bytesMin = pwBytesMin;
                noticeMsg = 'pwdConfirmNotice';

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                } else {
                    let bytesLen = validator(targetVal, 'bytesLength');
                    if (bytesLen >= bytesMin && bytesLen <= bytesMax) {
                        let strArray = Array.from(targetVal);

                        if (targetVal === $('#new-pwd-input').val()) {
                            activeClass = successClass;
                            deactiveClass = failClass;
                            noticeMsg = '';
                            showNotice = false;
                        } else {
                            activeClass = failClass;
                            deactiveClass = successClass;
                            showNotice = true;
                        }
                        $bytesNotice.removeClass(dangerTxtClass);
                    } else {
                        activeClass = failClass;
                        deactiveClass = successClass;
                        showNotice = true;
                        $bytesNotice.addClass(dangerTxtClass);
                    }
                }
                break;
            }
    }

    $input.closest('.form-group').addClass(activeClass);
    $input.closest('.form-group').removeClass(deactiveClass);

    if (activeClass === successClass) {
        $input.addClass(inputSuccClass);
        $input.removeClass(inputFailClass);
    } else if (activeClass === failClass) {
        $input.addClass(inputFailClass);
        $input.removeClass(inputSuccClass);
    }

    targetVal = targetVal.replace(/\s/g, '');
    $input.val(targetVal);

    $bytesNotice.text('(' + validator(targetVal, 'bytesLength') + '/' + bytesMax + 'bytes)');

    if (showNotice) {
        $notice.text(i18next.t(noticeMsg));
        $notice.removeClass('deactive-notice');
        $notice.addClass('active-notice');
        //$input.focus();
    } else {
        $notice.removeClass('active-notice');
        $notice.addClass('deactive-notice');
    }

}

/**
 * 서버 데이터 전송 전 검사
 * @params failClassNm - form 입력 양식 정상 여부를 판단할 수 있는 기준 클래스명 
 * @return isOk - true/false 
 * @author JG, Jo
 * @since 2021.05.26
 */
function beforeSubmit(failClassNm) {
    let failCount = $('.' + failClassNm).length,
        isOk = false;

    if (failCount < 1) {
        isOk = true;
    } else {
        alert(i18next.t('noticeConfirmForm'));
    }
    return isOk;
}

/**
 * 서버로 회원정보 수정 form data 전송
 * @author JG, Jo
 * @since 2021.05.26
 * @history  
 */
function submitForm() {
    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'post',
        cmmUrl = baseUrl + 'users/modify/info',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            alert(i18next.t('modifySuccessMsg'));
            location.href = mainPage;
        },
        cmmErr = function() {
            alert(i18next.t('modifyErrorMsg'));
            //location.href = indexPage;
        };

    // input(text), select box
    $formInputs.each(function(idx, item) {
        let $item = $(item),
            inputVal = $item.val(),
            inputName = $item.attr('name');

        if (inputName != 'undefined' || inputName != null) {
            cmmReqDataObj[inputName] = inputVal;
        }
    });

    cmmReqDataObj.userCode = getLocalStorage('userCode');

    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
}