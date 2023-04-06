/** =======================================================
 * 비밀번호 찾기 화면 관련 스크립트
 * 관련 파일: find-account.html, find-pw.html
 * @author JG, Jo
 * @since 2021.05.26
 * @history 
 * ========================================================
 */

/*===============================================*/
/* client urls and variables                     */
/*===============================================*/
const introPage = '../index.html';
const loginPage = 'login.html';
const findPwPage = 'find-pw.html';

const successClass = 'has-success';
const failClass = 'has-danger';
const dangerTxtClass = 'text-danger';
const inputSuccClass = 'form-control-success';
const inputFailClass = 'form-control-danger';

const pwBytesMin = 9;
const pwBytesMax = 16;
/*===============================================*/
/* node-server views urls                        */
/*===============================================*/
const accountApiUrl = baseUrl + 'users/find/account/code';

/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
let $submitBtn = $('#submit-btn'),
    $formInput = $('.form-control') // 모든 form 입력란
    ,
    $loginBtn = $('#modal-login-btn') // 로그인 화면 이동  버튼 
    ,
    $pageTitle = $('#page-title') // 화면명
    ,
    $formNotice = $('.form-notice') // 모든 form notice
    ,
    $pwdLabel = $('#label-new-pwd') // 비밀번호 라벨
    ,
    $pwdConfirmLabel = $('#label-confirm-pwd') // 비밀번호 확인 라벨
    ,
    $pwdNotice = $('#new-pwd-notice') // pwd 입력 조건 알림
    ,
    $pwdConfirmNotice = $('#confirm-pwd-notice') // pwd confirm 입력 조건 알림
    ,
    $modal = $('#modify-modal') // modal
    ,
    $modalTitle = $('#modify-title') // modal popup title
    ,
    $newPwdNotice = $('#new-pwd-notice') // modal popup 새 비밀번호 입력 조건 알림
    ,
    $confimPwdNotice = $('#confirm-pwd-notice') // modal popup 새 비밀번호 입력 조건 알림
    ,
    $modalSubmitBtn = $('#modal-submit-btn') // modal submit button  
    ,
    $formInputs = $('.form-control', $modal) // 전체 modal form 입력란  
    ,
    $backbtn = $('#findPw-back') //뒤로가기 버튼;


/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/
// submitBtn button event
$submitBtn.on('click', function() {
    let tempObj = {};
    $formInput.each(function() {
        let $this = $(this),
            elemId = $this.attr('id'),
            elemName = $this.attr('name'),
            elemVal = $this.val(),
            $notice = null;

        switch (elemId) {
            case 'id-input':
                $notice = $formNotice.filter('#id-notice');

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticeId'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    $notice.text('');
                    $notice.addClass('deactive-notice');
                    $notice.removeClass('active-notice');

                    $this.addClass(inputSuccClass);
                    $this.removeClass(inputFailClass);

                    tempObj[elemName] = elemVal;
                }
                break;
            case 'name-input':
                $notice = $formNotice.filter('#name-notice');

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticeNm'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    $notice.text('');
                    $notice.addClass('deactive-notice');
                    $notice.removeClass('active-notice');

                    $this.addClass(inputSuccClass);
                    $this.removeClass(inputFailClass);

                    tempObj[elemName] = elemVal;
                }
                break;
            case 'phone1':
                $notice = $formNotice.filter('#email-notice');

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticePhone'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    let bytesLen = validator(elemVal, 'bytesLength');
                    bytesMax = 3;

                    if (bytesLen == bytesMax) {
                        $notice.text('');
                        $notice.addClass('deactive-notice');
                        $notice.removeClass('active-notice');

                        $this.addClass(inputSuccClass);
                        $this.removeClass(inputFailClass);

                        tempObj[elemName] = elemVal;
                    } else {
                        alert('값을 정확히 입력해주세요')
                        $notice.text(i18next.t('noticePhone'));
                        $notice.addClass('active-notice');
                        $notice.removeClass('deactive-notice');

                        $this.addClass(inputFailClass);
                        $this.removeClass(inputSuccClass);
                        $this.focus();
                    }
                }
                break;
            case 'phone2':
                $notice = $formNotice.filter('#email-notice');
                bytesMax = 4;

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticePhone'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    let bytesLen = validator(elemVal, 'bytesLength');
                    if (bytesLen == bytesMax) {
                        $notice.text('');
                        $notice.addClass('deactive-notice');
                        $notice.removeClass('active-notice');

                        $this.addClass(inputSuccClass);
                        $this.removeClass(inputFailClass);

                        tempObj[elemName] = elemVal;
                    } else {
                        alert('값을 정확히 입력해주세요')
                        $notice.text(i18next.t('noticePhone'));
                        $notice.addClass('active-notice');
                        $notice.removeClass('deactive-notice');

                        $this.addClass(inputFailClass);
                        $this.removeClass(inputSuccClass);
                        $this.focus();
                    }
                }
                break;
            case 'phone3':
                $notice = $formNotice.filter('#email-notice');
                bytesMax = 4;
                if (validator(elemVal, 'bytesLenth')) {
                    $notice.text(i18next.t('noticePhone'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    let bytesLen = validator(elemVal, 'bytesLength');
                    if (bytesLen == bytesMax) {
                        $notice.text('');
                        $notice.removeClass('active-notice');
                        $notice.addClass('deactive-notice');

                        $this.addClass(inputSuccClass);
                        $this.removeClass(inputFailClass);

                        tempObj[elemName] = elemVal;
                    } else {
                        alert('값을 정확히 입력해주세요')
                        $notice.text(i18next.t('noticePhone'));
                        $notice.addClass('active-notice');
                        $notice.removeClass('deactive-notice');

                        $this.addClass(inputFailClass);
                        $this.removeClass(inputSuccClass);
                        $this.focus();
                    }
                }
                break;
        }
    });

    if ($('.' + inputFailClass).length < 1) {
        let cmmContentType = 'application/json',
            cmmDataType = 'json',
            cmmType = 'get',
            cmmUrl = accountApiUrl,
            cmmReqDataObj = tempObj,
            cmmAsync = false,
            cmmSucc = function(result) {
                if (result.messageCode === 'foundUserCode') {
                    $modal.modal();
                    $modal.data('userCode', result.userCode);
                } else {
                    alert(i18next.t('noticeNoUser'));
                }
            },
            cmmErr = null;

        commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
    return;
});

// form 입력 값 검증
$formInputs.not('select').on('propertychange change keyup paste input', function(evnt) {
    realTimeformControl(evnt, '');
});

// 비밀번호 변경 실행
$modalSubmitBtn.on('click', function() {
    changePassword();
});

// 뒤로가기 버튼 2021.06.02 MY
$backbtn.on('click', function() {
    location.href = loginPage;
});
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

    // back key 눌렀을 때 로그인 페이지로 이동 
    document.addEventListener('deviceready', function() {
        document.addEventListener('backbutton', function() {
            location.href = loginPage;
        }, false);
    }, false);
}

/**
 * 메뉴 언어 변환하기(i18next)
 * @param 
 * @author JG, Jo
 * @since 2021.05.26 
 */
function updateContent() {
    // 페이지 언어 변환
    $pageTitle.text(i18next.t('pageTitle'));
    $loginBtn.text(i18next.t('loginBtn'));
    $submitBtn.text(i18next.t('submitBtn'));
    $modalTitle.text(i18next.t('pwChange'));
    $pwdLabel.text(i18next.t('pwdLabel'));
    $pwdConfirmLabel.text(i18next.t('confirmPwdLabel'));
    $modalSubmitBtn.text(i18next.t('pwChange'));
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

                location.href = loginPage;
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

    cmmReqDataObj.userCode = $modal.data('userCode');
    cmmReqDataObj.pwd = newPwd;

    commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
}

/**
 * 입력 양식 실시간 검사
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