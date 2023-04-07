/** =======================================================
 * 회원가입 화면 관련 스크립트
 * 관련 파일: signup.html
 * @author JG, Jo
 * @since 2021.04.28
 * @history 2021.05.03 JG 회원 가입 및 다국어 처리
 *          2021.05.10 JG 페이지 번역 기능 개선
 *          2021.05.24 JG 입력 폼 검사 추가
 * ========================================================
 */

/*===============================================*/
/* client urls and global variables              */
/*===============================================*/
const introPage = '../index.html';
const loginPage = 'login.html';
const indexPage = '../index.html';
const pageLang = getSessionStorage('defaultLang');

const successClass = 'has-success';
const failClass = 'has-danger';
const dangerTxtClass = 'text-danger';
const inputSuccClass = 'form-control-success';
const inputFailClass = 'form-control-danger';

const nameBytesMax = 70;
const idBytesMin = 5;
const idBytesMax = 20;
const pwBytesMin = 9;
const pwBytesMax = 16;
const emailIdBytesMax = 70;
const emailDomainBytesMax = 40;

/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
const $pageTitle = $('#page-title') // 페이지명
    ,
    $userNmLabel = $('#label-userName') // 성명 라벨
    ,
    $pwdLabel = $('#label-pwd') // 비밀번호 라벨
    ,
    $pwdConfirmLabel = $('#label-pwd-confirm') // 비밀번호 확인 라벨
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
    $tosLabel = $('#label-ToS') // 약관동의 라벨
    ,
    $allRequire = $('#all-requirements') // 필수 약관 모두 선택 라벨
    ,
    $edlTosSpan = $('#edl-tos-span') // edl 서비스 이용 약관 동의 라벨
    ,
    $privateSpan = $('#private-span') // 개인정보 수집 동의 라벨
    ,
    $provideSpan = $('#provide-span') // 개인정보 제3자 제공 동의 라벨
    ,
    $allRequireChk = $allRequire.prev() // 필수 약관 모두 선택 check box
    ,
    $termsOfServiceChk = $('#edl-ToS-chk') // 서비스 이용약관 check box
    ,
    $privateChk = $('#private-policy-chk') // 개인정보 수집 이용동의 check box
    ,
    $provideChk = $('#provide-ToS-chk') // 개인정보 제3자 제공 동의 check boxs
    ,
    $viewDetailTos = $('.view-detail-modal') // 약관 상세 보기
    ,
    $submitBtn = $('#submit-btn') // 회원 가입 버튼
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
    $idNotice = $('#id-notice') // id 입력 조건 알림
    ,
    $pwdNotice = $('#pwd-notice') // pwd 입력 조건 알림
    ,
    $pwdConfirmNotice = $('#pwd-confirm-notice') // pwd confirm 입력 조건 알림
    ,
    $emailNotice = $('#email-notice') // email 입력 주의사항
    ,
    $emailNotice2 = $('#email-notice2') // email 입력 조건 알림
    ,
    $modalTitle = $('#ToS-title') // modal popup title
    ,
    $modalContents = $('#ToS-contents'), // modal poput contents
    $signupBack = $('#signup-back'), // back button
    $userType = $('#user-type');

/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/
//back button event
$signupBack.on('click', function() {
    location.href = introPage;
});
// form 입력 값 검증
$formInputs.not('.notval').on('click change keyup paste focusout', function(evnt) {
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

$('#user-type').on('change click', function() {
    var result = $('#selectBox option:selected').val();
    if (result == 'staff') {
        $('#gender-area').hide();
        $('#birth-area').hide();
        $('#address-area').hide();
        $('#staff-area').hide();
    } else {
        $('.div1').hide();
    }
})

// submit button event
$submitBtn.on('click', function() {
    let isOk = beforeSubmit(inputSuccClass, 6, $termsOfServiceChk, $privateChk);

    if (isOk) {
        submitForm();
    }
    return;
});

// cancel button event
$cancelBtn.on('click', function() {
    location.href = indexPage;
});

// 필수 동의 항목 check event
$allRequireChk.on('click', function() {
    if ($allRequireChk.prop('checked')) {
        $termsOfServiceChk.prop('checked', true);
        $privateChk.prop('checked', true);
    } else {
        $termsOfServiceChk.prop('checked', false);
        $privateChk.prop('checked', false);
    }
});

// 약관 modal popup event
$viewDetailTos.on('click', function(evnt) {
    let targetId = evnt.target.id;
    switch (targetId) {
        case 'detail-tos':
            $modalTitle.text(i18next.t('edlToSLabel'));
            $modalContents.text(i18next.t('edlTermsOfService'));
            break;
        case 'detail-private':
            $modalTitle.text(i18next.t('privateLabel'));
            $modalContents.text(i18next.t('privateTos'));
            break;
        case 'detail-provide':
            $modalTitle.text(i18next.t('provideLabel'));
            $modalContents.text(i18next.t('provideTos'));
            break;
    }
    return;
});

/*===============================================*/
/* function  area                                */
/*===============================================*/

/**
 * 화면 초기화 작업
 * @author JG, Jo
 * @since 2021.04.28 
 * @history 2021.05.10 JG 페이지 번역 기능 개선
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
}

/**
 * 메뉴 언어 변환하기(i18next)
 * @param 
 * @author JG, Jo
 * @since 2021.05.03 
 */
function updateContent() {
    $pageTitle.text(i18next.t('pageTitle'));
    $userNmLabel.text(i18next.t('nameLabel'));
    $pwdLabel.text(i18next.t('pwdLabel'));
    $pwdConfirmLabel.text(i18next.t('confirmPwdLabel'));
    $genderLabel.text(i18next.t('genderLabel'));
    $birthLabel.text(i18next.t('birthLabel'));
    $yearNotice.text(i18next.t('bYearLabel'));
    $monthNotice.text(i18next.t('bMonthLabel'));
    $dayNotice.text(i18next.t('bDayLabel'));
    $tosLabel.text(i18next.t('ToSLabel'));
    $allRequire.text(i18next.t('requiredCheckAll'));
    $edlTosSpan.text(i18next.t('edlToSLabel'));
    $privateSpan.text(i18next.t('privateLabel'));
    $provideSpan.text(i18next.t('provideLabel'));

    $nameNotice.text(i18next.t('nameNotice'));
    $idNotice.text(i18next.t('idNotice'));
    $pwdNotice.text(i18next.t('pwdNotice'));
    $pwdConfirmNotice.text(i18next.t('pwdConfirmNotice'));
    $emailNotice.text(i18next.t('emailNotice'));

    $genderSelect.find('option[value="M"]').text(i18next.t('genderM'));
    $genderSelect.find('option[value="F"]').text(i18next.t('genderF'));

    $submitBtn.text(i18next.t('submitBtn'));
    $cancelBtn.text(i18next.t('cancelBtn'));

    $viewDetailTos.text(i18next.t('viewDetailToS'));
}

/**
 * 중복 ID 검사
 * @params idStr - 검사할 id string
 * @return isOk - 중복 여부(true/false)
 * @author JG, Jo
 * @since 2021.05.25 
 */
function idDuplicateCheck(idStr) {
    let isOk = '';
    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'get',
        cmmUrl = baseUrl + 'users/duplicate/id',
        cmmReqDataObj = { 'idString': idStr },
        cmmAsync = false,
        cmmSucc = function(result) {
            isOk = result;
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return isOk;
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
 * 회원가입 입력 양식 실시간 검사
 * @params evnt - event
 * @params triggerInputId - 검사가 필요한 입력 필드 ID(stirng)
 * @author JG, Jo
 * @since 2021.05.24 
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
        targetId = evnt.target.id, //이벤트 발생 지점의 id
            targetVal = evnt.target.value, //이벤트 발생 지점의 value
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
        case 'id-input':
            {
                $notice = $idNotice;
                bytesMax = idBytesMax;
                bytesMin = idBytesMin;
                noticeMsg = 'idNotice';

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                } else {
                    let bytesLen = validator(targetVal, 'bytesLength');
                    if (bytesLen >= bytesMin && bytesLen <= bytesMax) {
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

                        if (validator(targetVal, 'isNotCombEngNum')) {
                            activeClass = failClass;
                            deactiveClass = successClass;
                            showNotice = true;
                        } else {
                            let isDupl = idDuplicateCheck(targetVal);
                            if (!isDupl) {
                                activeClass = successClass;
                                deactiveClass = failClass;
                                noticeMsg = '';
                                showNotice = false;
                            } else {
                                activeClass = failClass;
                                deactiveClass = successClass;
                                showNotice = true;
                                noticeMsg = 'idDuplicate';
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
        case 'pwd-input':
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
                    if ($('#pwd-confirm-input').val().length > 0) {
                        realTimeformControl(null, 'pwd-confirm-input');
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
        case 'pwd-confirm-input':
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

                        if (targetVal === $('#pwd-input').val()) {
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

                        let emailIdStr = targetVal,
                            emailDomainStr = $('#email-input2').val();

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
                            let emailIdStr = $('#email-input').val(),
                                emailDomainStr = targetVal;

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
    } else if (!showNotice) {
        if ($notice.hasClass('active-notice')) {
            $notice.removeClass('active-notice');
            $notice.addClass('deactive-notice');
        }

    }

}

/**
 * 서버 데이터 요청 전 검사
 * @params successClassNm - form 입력 양식 정상 여부를 판단할 수 있는 기준 클래스명 
 * @params requireSuccessCount - form 입력 양식 정상 판단 기준 클래스 개수 
 * @return isOk - true/false 
 * @author JG, Jo
 * @since 2021.05.25 
 */
function beforeSubmit(successClassNm, requireSuccessCount, $requiredToS1, $requiredToS2) {
    let successCount = $('.' + successClassNm).length,
        requiredToS1Chk = $requiredToS1.prop('checked'),
        requiredToS2Chk = $requiredToS2.prop('checked'),
        isOk = false;

    if (successCount >= requireSuccessCount && requiredToS1Chk && requiredToS2Chk) {
        isOk = true;
    } else if (!requiredToS1Chk || !requiredToS2Chk) {
        alert(i18next.t('noticeAgreement'), "title");
    } else {
        alert(i18next.t('noticeConfirmForm'));
    }
    return isOk;
}

/**
 * 서버로 회원 가입 form data 전송
 * @author JG, Jo
 * @since 2021.05.10
 * @history 2021.05.25 JG 개인정보 제3자 제공 동의 여부 추가 
 */
function submitForm() {
    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'post',
        cmmUrl = baseUrl + 'users/signup',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            alert(i18next.t('signupSuccessMsg'));
            location.href = loginPage;
        },
        cmmErr = function() {
            alert(i18next.t('signupErrorMsg'));
            location.href = indexPage;
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

    // check box
    let provideYN = $provideChk.prop('checked'); // 개인정보 제3자 동의 여부
    if (provideYN) {
        cmmReqDataObj.provideYN = 'Y';
    } else {
        cmmReqDataObj.provideYN = 'N';
    }

    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
}


/**
 * 주소 옵션 설정
 * @author MiYeong Jnag
 * @since 2021.09.16
 * @history 2021.09.16 MY 주소 옵션 생성
 */

function addressSet(value) {

    let seoul = ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"]
    let busan = ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"]
    let daegu = ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"]
    let incheon = ["강화군", "계양구", "남구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"]
    let gwangju = ["광산구", "남구", "동구", "북구", "서구"]
    let daejeon = ["대덕구", "동구", "서구", "유성구", "중구"]
    let ulsan = ["남구", "동구", "북구", "울주군", "중구"]
    let sejong = ["세종시"]
    let gyeonggi = ["가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"]
    let gangwon = ["강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"]
    let chungbuk = ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시", "충주시"]
    let chungnam = ["계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군"]
    let jeonbuk = ["고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군"]
    let jeonnam = ["강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"]
    let gyeongbuk = ["경산시", "경주시", "고령군", "구미시", "군위군", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시"]
    let gyeongnam = ["거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군"]
    let jeju = ["서귀포시", "제주시"]
    let target = document.getElementById("address2-input");
    let data

    for (i = target.length - 1; i >= 0; i--) {
        target.options[i] = null
    }
    if (value == "seoul") data = seoul
    else if (value == "busan") data = busan
    else if (value == "daegu") data = daegu
    else if (value == "incheon") data = incheon
    else if (value == "gwangju") data = gwangju
    else if (value == "daejeon") data = daejeon
    else if (value == "ulsan") data = ulsan
    else if (value == "sejong") data = sejong
    else if (value == "gyeonggi") data = gyeonggi
    else if (value == "gangwon") data = gangwon
    else if (value == "chungbuk") data = chungbuk
    else if (value == "chungnam") data = chungnam
    else if (value == "jeonbuk") data = jeonbuk
    else if (value == "jeonnam") data = jeonnam
    else if (value == "gyeongbuk") data = gyeongbuk
    else if (value == "gyeongnam") data = gyeongnam
    else if (value == "jeju") data = jeju


    for (x in data) {
        var opt = document.createElement("option");
        opt.value = data[x];
        opt.innerHTML = data[x];
        target.appendChild(opt);
    }


}