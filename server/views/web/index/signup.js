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
const phoneFirstBytesMax = 3;
const phoneLastBytesMax = 4;

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
    $tosLabel = $('#label-ToS') // 약관동의 라벨
    ,
    $allRequire = $('#all-requirements') // 필수 약관 모두 선택 라벨
    ,
    $b2gTosSpan = $('#b2g-tos-span') // b2g 서비스 이용 약관 동의 라벨
    ,
    $privateSpan = $('#private-span') // 개인정보 수집 동의 라벨
    ,
    $provideSpan = $('#provide-span') // 개인정보 제3자 제공 동의 라벨
    ,
    $allRequireChk = $allRequire.prev() // 필수 약관 모두 선택 check box
    ,
    $termsOfServiceChk = $('#b2g-ToS-chk') // 서비스 이용약관 check box
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
    $nameNotice = $('#name-notice') // 이름 입력 조건 알림
    ,
    $idNotice = $('#id-notice') // id 입력 조건 알림
    ,
    $pwdNotice = $('#pwd-notice') // pwd 입력 조건 알림
    ,
    $pwdConfirmNotice = $('#pwd-confirm-notice') // pwd confirm 입력 조건 알림
    ,
    $phoneConfirmNotice = $('#phone-notice'),
    $address1Notice = $('#address1-notice'), //주소 입력 주의사항
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

// submit button event
$submitBtn.on('click', function() {
    let isOk = beforeSubmit(inputSuccClass, 10, $termsOfServiceChk, $privateChk);
    if (isOk) {
        submitForm();
    }
    return isOk;
});

// cancel button event
$cancelBtn.on('click', function() {
    location.href = '/api';
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
// $viewDetailTos.on('click', function(evnt) {
//     let targetId = evnt.target.id;
//     switch (targetId) {
//         case 'detail-tos':
//             $modalTitle.text(i18next.t('b2gToSLabel'));
//             $modalContents.text(i18next.t('b2gTermsOfService'));
//             break;
//         case 'detail-private':
//             $modalTitle.text(i18next.t('privateLabel'));
//             $modalContents.text(i18next.t('privateTos'));
//             break;
//         case 'detail-provide':
//             $modalTitle.text(i18next.t('provideLabel'));
//             $modalContents.text(i18next.t('provideTos'));
//             break;
//     }
//     return;
// });

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
    $b2gTosSpan.text(i18next.t('b2gToSLabel'));
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
        cmmType = 'get',
        cmmUrl = '/api/users/duplicate/id',
        cmmReqDataObj = { idString: idStr },
        cmmAsync = false,
        cmmSucc = function(result) {
            isOk = result;
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
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
        cmmType = 'get',
        cmmUrl = '/api/users/duplicate/email',
        cmmReqDataObj = { 'eIdString': emailIdStr, 'eDomainString': emailDomainStr },
        cmmAsync = false,
        cmmSucc = function(result) {
            isOk = result;
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
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
        $idDuplNotice = null,
        bytesMax = 0,
        bytesMin = 0,
        $bytesNotice = null;
    let isDupl = null;

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
                $idDuplNotice = $('#id-dupl-notice');
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
                            if (validator(char, 'isSpCharId')) {
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
                            isDupl = idDuplicateCheck(targetVal);
                            if (!isDupl) {
                                activeClass = successClass;
                                deactiveClass = failClass;
                                noticeMsg = '';
                                $idDuplNotice.addClass('deactive-notice');
                                $idDuplNotice.removeClass('active-notice');
                                showNotice = false;

                            } else {
                                activeClass = failClass;
                                deactiveClass = successClass;
                                showNotice = true;
                                $idDuplNotice.removeClass('deactive-notice');
                                $idDuplNotice.addClass('active-notice');
                                noticeMsg = '';

                            }
                        }
                        $notice.removeClass('deactive-notice');
                        $notice.addClass('active-notice');
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
        case 'phone1':
            {
                bytesMax = phoneFirstBytesMax;
                $notice = $phoneConfirmNotice;

                let bytesLen = validator(targetVal, 'bytesLength');
                if (bytesLen == bytesMax) {
                    if (targetVal === $('#phone1').val()) {
                        activeClass = successClass;
                        deactiveClass = failClass;
                        noticeMsg = '';
                        showNotice = false;
                    }
                    $bytesNotice.removeClass(dangerTxtClass);
                } else {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                    $bytesNotice.addClass(dangerTxtClass);
                }
                break;
            }
        case 'phone2':
            {
                bytesMax = phoneLastBytesMax;
                $notice = $phoneConfirmNotice;

                let bytesLen = validator(targetVal, 'bytesLength');
                if (bytesLen >= bytesMin && bytesLen <= bytesMax) {
                    if (targetVal === $('#phone2').val()) {
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
                break;
            }
        case 'phone3':
            {
                bytesMax = phoneLastBytesMax;
                $notice = $phoneConfirmNotice;

                let bytesLen = validator(targetVal, 'bytesLength');
                if (bytesLen == bytesMax) {
                    if (targetVal === $('#phone3').val()) {
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
                break;
            }
        case 'email-input':
            {
                $bytesNotice = $bytesNotice.filter('[id="email-bytes1"]');
                $notice = $emailNotice2;
                bytesMax = emailIdBytesMax;
                noticeMsg = $emailNotice2;

                if (validator(targetVal, 'isEmpty')) {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                    $notice.text('이메일 아이디를 정확하게 입력해 주세요.');
                } else {
                    let bytesLen = validator(targetVal, 'bytesLength');
                    if (bytesLen > 0 && bytesLen <= bytesMax) {
                        let strArray = Array.from(targetVal);

                        for (let [idx, char] of strArray.entries()) {
                            if (validator(char, 'isEmChar')) {
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
                            $notice.text('중복된 이메일입니다. 다시 입력해 주세요.');
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
                    $notice.text('이메일 도메인을 정확하게 입력해 주세요.');
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
                                $notice.text('중복된 이메일입니다. 다시 입력해 주세요.');
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
        case 'address1-input':
            {
                $notice = $address1Notice;
                if ($('#address1-input').val() == "시/도") {
                    activeClass = failClass;
                    deactiveClass = successClass;
                    showNotice = true;
                } else {
                    activeClass = successClass;
                    deactiveClass = failClass;
                    showNotice = false;
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
        // $notice.text(i18next.t(noticeMsg));
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
        alert("필수 약관에 동의해주셔야 서비스를 이용할 수 있습니다.", "title");
    } else {
        alert("회원가입 입력 양식을 다시 확인해주세요.");
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
        cmmType = 'post',
        cmmUrl = '/api/users/signup',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.state == true) {
                alert('정상적으로 가입되었습니다.');
                location.href = '/api';
            } else {
                alert('가입에 실패하였습니다.')
            }
        },
        cmmErr = function() {
            alert(i18next.t('가입 실패. 잠시 후 다시 시도해주세요.'));
            location.href = '/api';
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

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
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
            var spCharPattern = /[~!@\#$%^&*\()\-_=+:;<>?{}'",`/]/gi;
            if (spCharPattern.test(chkVal)) {
                result = true;
            }
            break;
        case 'isSpCharId':
            var spCharPattern = /[~!@\#$%^&*\()\-=+:;<>?{}'",`/]/gi;
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


/** ================================================================
 *  모달 세팅
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
function showModal(idStr) {
    let txt;

    switch (idStr) {
        case 'detail-tos':
            $("#tos-title").text('B2G 서비스 이용약관');
            txt =
                `
            제1장 총칙
            제1조 (목적)
            이 약관은 주식회사 SCI (이하 “회사”라 합니다)가 제공하는
            건강관리 서비스 앱(이하 “APP“라 합니다)의 서비스 이용 및 제공에 관한 제반 사항의 규정을 목적으로 합니다.
            
            제2조 (용어의 정의)
            본 약관에서 사용하는 용어는 다음과 같이 정의한다.
            
            1. “서비스”라 함은 구현되는 PC, 모바일 기기를 통하여 “이용자”가 이용할 수 있는
                보장분석서비스 등 회사가 제공하는 제반 서비스를 의미합니다.
            2. “이용자”란 “APP”에 접속하여 서비스를 이용하는 회원 및 비회원을 말합니다.
            3. “회원”이란 “APP”에 개인정보를 제공하여 회원 등록을 한 자로서,
                “APP”에서 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
            4. “비회원”이란 “APP” 회원등록을 하지 않은 자를 말합니다.
            
            이 약관에서 사용하는 용어의 정의는 본 조 제1항에서 정하는 것을 제외하고는
            관계법령 및 서비스별 정책에서 정하는 바에 의하며,
            이에 정하지 아니한 것은 일반적인 상 관례에 따릅니다.

            제3조 (약관의 효력 및 변경)
            
            1. 본 약관은 회원가입 화면에 게시하여 공시하며 회사는 사정변경 및 영업상 중요한 사유가 있을 경우
               약관을 변경할 수 있으며 변경된 약관은 공지사항을 통해 공시한다.
            2. 본 약관 및 차후 회사 사정에 따라 변경된 약관은 이용자에게 공시함으로써 효력을 발생한다.
            
            제4조 (약관 외 준칙)
            
            본 약관에 명시되지 않은 사항이 전기통신기본법, 전기통신사업법, 정보통신촉진법,
            ‘전자상거래등에서의 소비자 보호에 관한 법률’, ‘약관의 규제에관한법률’, ‘전자거래기본법’,
            ‘전자서명법’, ‘정보통신망 이용촉진등에 관한 법률’, ‘소비자보호법’ 등 기타 관계 법령에
            규정되어 있을 경우 그 규정을 따르도록 한다.
            
            제 2장 이용계약
            제 5조 (이용신청)
            이용신청자가 회원가입 안내에서 본 약관과 개인정보보호정책에 동의하고
            등록절차(회사의 소정 양식의 가입 신청서 작성)를 걸쳐 동의하면 이용신청을 할 수 있다.
            이용신청자는 반드시 실명과 실제 정보를 사용해야 하며 1개의 생년월일에 대하여 1건의 이용신청을 할 수 있다.
            실명이나 실제 정보를 입력하지 않은 이용자는 법적인 보호를 받을 수 없으며, 서비스 이용에 제한을 받을 수 있다.
            
            제 6조 (이용신청의 승낙)
            회사는 제5조에 따른 이용신청자에 대하여 제2항 및 제3항의 경우를 예외로 하여 서비스 이용을 승낙한다.
            회사는 아래 사항에 해당하는 경우에 그 제한사유가 해소될 때까지 승낙을 유보할 수 있다.

            가. 서비스 관련 설비에 여유가 없는 경우
            나. 기술상 지장이 있는 경우
            다. 기타 회사 사정상 필요하다고 인정되는 경우
            3. 회사는 아래 사항에 해당하는 경우에 승낙을 하지 않을 수 있다.
            가. 다른 사람의 명의를 사용하여 신청한 경우
            나. 이용자 정보를 허위로 기재하여 신청한 경우
            다. 사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우
            라. 기타 회사가 정한 이용신청 요건이 미비한 경우
            
            제 3장 계약 당사자의 의무
            제 7조 (회사의 의무)
            
            회사는 사이트를 안정적이고 지속적으로 운영할 의무가 있다.
            회사는 이용자로부터 제기되는 의견이나 불만이 정당하다고 인정될 경우에는 즉시 처리해야 한다.
            단, 즉시 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 공지사항 또는 전자우편을 통해 통보해야 한다.
            제 1항의 경우 수사상의 목적으로 관계기관 및 정보통신윤리위원회의 요청이 있거나 영장 제시가 있는 경우,
            기타 관계 법령에 의한 경우는 예외로 한다.
            
            제 8조 (이용자의 의무)
            이용자는 본 약관 및 회사의 공지사항, APP 이용안내 등을 숙지하고 준수해야 하며
            기타 회사 업무에 방해되는 행위를 해서는 안된다.
            이용자는 회사의 사전 승인 없이 본 사이트를 이용해 어떠한 영리행위도 할 수 없다.
            이용자는 본 사이트를 통해 얻는 정보를 회사의 사전 승낙 없이 복사, 복제, 변경, 변역, 출판, 방송 및
            기타의 방법으로 사용하거나 이를 타인에게 제공할 수 없다.
            
            제 4장 서비스의 제공 및 이용
            
            제 9 조 (서비스 이용)
            이용자는 본 약관의 규정된 사항을 준수해 APP을 이용한다.
            본 약관에 명시되지 않은 서비스 이용에 관한 사항은 회사가 정해 ‘공지사항’에 게시하거나
            또는 별도로 공지하는 내용에 따른다.
            
            제 10 조 (정보의 제공)
            회사는 이용자가 서비스 이용 중 필요하다고 인정되는 다양한 정보에 대하여 전자메일이나
            서신우편 등의 방법으로 회원에게 정보를 제공할 수 있다.
            
            제 11 조 (광고게재)
            회사는 서비스의 운용과 관련하여 서비스 화면, 홈페이지, 전자우편 등에 광고 등을 게재할 수 있다.
            회사는 사이트에 게재되어 있는 광고주의 판촉활동에 회원이 참여하거나
            교신 또는 거래의 결과로서 발생하는 모든 손실 또는 손해에 대해 책임을 지지 않는다.
            
            제 12 조 (서비스 이용의 제한)
            본 사이트 이용 및 행위가 다음 각 항에 해당하는 경우 회사는 해당 이용자의 이용을 제한할 수 있다.
            
            1. 공공질서 및 미풍양속, 기타 사회질서를 해하는 경우
            2. 범죄행위를 목적으로 하거나 기타 범죄행위와 관련된다고 객관적으로 인정되는 경우
            3. 타인의 명예를 손상시키거나 타인의 서비스 이용을 현저히 저해하는 경우
            4. 타인의 의사에 반하는 내용이나 광고성 정보 등을 지속적으로 전송하는 경우
            5. 해킹 및 컴퓨터 바이러스 유포 등으로 서비스의 건전한 운영을 저해하는 경우
            6. 다른 이용자 또는 제3자의 지적재산권을 침해하거나 지적재산권자가 지적 재산권의 침해를
               주장할 수 있다고 판단되는 경우
            7. 타인의 아이디 및 비밀번호를 도용한 경우
            8. 기타 관계 법령에 위배되는 경우 및 회사가 이용자로서 부적당하다고 판단한 경우
            
            제 13 조 (서비스 제공의 중지)
            회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부의 제공을 중지할 수 있다.
            
            1. 전기통신사업법 상에 규정된 기간통신 사업자 또는 인터넷 망 사업자가 서비스를 중지했을 경우
            2. 정전으로 서비스 제공이 불가능할 경우
            3. 설비의 이전, 보수 또는 공사로 인해 부득이한 경우
            4. 서비스 설비의 장애 또는 서비스 이용의 폭주 등으로 정상적인 서비스 제공이 어려운 경우
            5. 전시, 사변, 천재지변 또는 이에 준하는 국가비상사태가 발생하거나 발생할 우려가 있는 경우
            
            제 14 조 (게시물 관리)
            회사는 건전한 통신문화 정착과 효율적인 사이트 운영을 위하여 이용자가 게시하거나 제공하는 자료가
            제12조에 해당한다고 판단되는 경우에 임의로 삭제, 자료이동, 등록거부를 할 수 있다.
            
            제 15 조 (서비스 이용 책임)
            이용자는 회사에서 권한 있는 사원이 서명한 명시적인 서면에 구체적으로 허용한 경우를 제외하고는
            서비스를 이용하여 불법상품을 판매하는 영업활동을 할 수 없으며 특히 해킹, 돈벌기 광고,
            음란 사이트를 통한 상업행위, 상용 S/W 불법제공 등을 할 수 없다.
            이를 어기고 발생한 영업활동의 결과 및 손실, 관계기관에 의한 구속 등 법적 조치 등에 관해서는
            회사가 책임을 지지 않는다.
            
            제 6 장 기타
            제 19 조 (면책 및 손해배상)
            1. 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
               회사의 서비스 제공 책임이 면제된다.
            2. 회사는 이용자간 또는 이용자와 제3자간의 상호거래 관계에서 발생되는 결과에 대하여
               어떠한 책임도 부담하지 않는다.
            3. 회사는 이용자가 게시판에 게재한 정보, 자료, 내용 등에 관하여 사실의 정확성, 신뢰도 등에
               어떠한 책임도 부담하지 않으며 이용자는 본인의 책임 아래 본 사이트를 이용해야 한다.
            4. 이용자가 게시 또는 전송한 자료 등에 관하여 손해가 발생하거나 자료의 취사선택,
              기타 무료로 제공되는 서비스 이용과 관련해 어떠한 불이익이 발생하더라도 이에 대한 모든 책임은 이용자에게 있다.
            5. 아이디와 비밀번호의 관리 및 이용자의 부주의로 인하여 발생되는 손해
               또는 제3자에 의한 부정사용 등에 대한 책임은 이용자에게 있다.
            6. 이용자가 본 약관의 규정을 위반함으로써 회사에 손해가 발생하는 경우 이 약관을 위반한 이용자는
               회사에 발생한 모든 손해를 배상해야 하며 동 손해로부터 회사를 면책시켜야 한다.
            
            제 20 조 (개인신용정보 제공 및 활용에 대한 동의서)
            회사가 회원 가입과 관련해 취득한 개인 신용 정보는 신용정보의 이용 및 보호에 관한 법률
            제23조의 규정에 따라 타인에게 제공 및 활용 시 이용자의 동의를 얻어야 한다.
            이용자의 동의는 회사가 회원으로 가입한 이용자의 신용정보를 신용정보기관, 신용정보업자 및 기타 이용자 등에게
            제공해 이용자의 신용을 판단하기 위한 자료로서 활용하거나
            공공기관에서 정책자료로 활용하는데 동의하는 것으로 간주한다.
            
            제 21 조 (분쟁의 해결)
            1. 회사와 이용자는 본 사이트 이용과 관련해 발생한 분쟁을 원만하게 해결하기 위하여 필요한 모든 노력을 해야 한다.
            2. 제1항의 규정에도 불구하고 동 분쟁으로 인하여 소송이 제기될 경우
               동 소송은 회사의 본사 소재지를 관할하는 법원의 관할로 본다.
            

            <부칙>
            본 약관은 2023년 03월 14일부터 적용한다.

            `;
            $("#tos-contents").text(txt);
            break;

        case 'detail-private':
            $("#tos-title").text('개인정보 수집 이용 동의');
            txt =
                `
            개인정보 수집ㆍ이용 동의(필수 사항)
            
            소프트웨어융합연구소 주식회사(이하 “SCI”)는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라
            다음과 같이 회원의 개인정보를 수집ㆍ이용합니다. 본 개인정보의 수집ㆍ이용에 동의하지 않으실 경우
            어플리케이션을 통한 회원가입이 불가능하며, SCI에서 제공하는 서비스를 이용할 수 없습니다.
                        
            1. 개인정보 수집ㆍ이용 목적

            (1) 홈페이지 회원 가입 및 관리
                회원가입 의사확인, 본인 식별ㆍ인증, 회원자격 유지ㆍ관리, 서비스 부정이용 방지,
                이용약관 위반 회원에 대한 이용제한 조치, 서비스의 원활한 운영에 지장을 미치는 행위 및
                서비스 부정이용행위 제재, 가입 및 가입횟수 제한, 탈퇴의사 확인

            (2) 재화 또는 서비스 제공
                웹/모바일 홈페이지, 어플리케이션을 통한 서비스(병원 별 환자 관리)제공,
                서비스 이용과 관련된 회원확인 등 문제해결
                        
            (3) 서비스 개선
                웹 홈페이지, 모바일 홈페이지, 어플리케이션(이용약관 상 정의에 따름)을 이용한 서비스를 이용자의 컴퓨터 등
                정보통신기기에 최적화된 방식으로 제공할 수 있도록 개선, 서비스 개발, 개선 등
                SCI의 업무와 관련된 통계자료의 작성
                        
            (4) 민원 처리
                민원인의 신원확인, 민원사항 확인, 사실조사를 위한 연락ㆍ통지, 처리결과 통보
                        
            2. 수집하는 개인정보
                        
            (1) 회원정보: 이름, 성별, 생년월일, 연락처, 생체데이터
            (2) 재화 또는 서비스 제공(센서 구매 시): 제품 배송 및 서비스 이행: 배송(조립)지 주소, 휴대전화번호
                        
            3. 개인정보의 보유ㆍ이용 기간
                        
            (1) 수집된 개인정보는 원칙적으로 회원가입 시부터 회원탈퇴 시까지 이용됩니다.          
            (2) 회원탈퇴 시 개인정보를 보유해야 하는 경우 또는 이미 발생한 민원처리 등
                회원탈퇴 이후에도 개인정보를 이용하여야 하는 사유가 있는 경우를 제외하고는
                개인정보를 지체 없이 관련 법령이 정한 바에 따라 파기합니다.
                        
            `;
            $("#tos-contents").text(txt);
            break;

        case 'detail-provide':
            $("#tos-title").text('개인정보 제3자 제공 동의');
            txt = `
            개인정보 제3자 제공 동의(선택 사항)
            
            본인은 아래의 수집 · 이용 목적을 위해 표에 열거된 본인의 개인(신용) 정보를
            제 3자에게 제공 및 이용하는 것에 대해 동의합니다.
                        
            1. 제공받는자
            (주)소프트웨어융합연구소, 기타 협력기관(서비스 이용 기관)     

            2. 이용목적
            관리 대상자 모니터링 및 
            협력기관과 협업을 통해 더 나은 서비스 제공하기 위함

            3. 개인정보 제공 항목
            사용자 이름, 연락처, 이메일 (관리자)
            사용자 이름, 생년월일, 성별, 주소, 연락처, 보호자 연락처 (관리 대상자)

            4. 보유기간
            회원 탈퇴 시까지
            
            `;
            $("#tos-contents").text(txt);
            break;
    }
}