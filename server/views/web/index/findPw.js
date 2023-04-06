let $formInput = $('.form-control'),
    $formNotice = $('.form-notice') // 모든 form notice

const inputFailClass = 'form-control-danger';
const inputSuccClass = 'form-control-success';
const successClass = 'has-success';
const failClass = 'has-danger';
const dangerTxtClass = 'text-danger';

const pwBytesMin = 9;
const pwBytesMax = 16

let $modal = $('#modify-modal') // modal
    ,
    $modalTitle = $('#modify-title') // modal popup title
    ,
    $newPwdNotice = $('#new-pwd-notice') // modal popup 새 비밀번호 입력 조건 알림
    ,
    $modalSubmitBtn = $('#modal-submit-btn') // modal submit button  
    ,
    $formInputs = $('.form-control', $modal) // 전체 modal form 입력란  
    ,
    $pwdNotice = $('#new-pwd-notice') // pwd 입력 조건 알림
    ,
    $pwdConfirmNotice = $('#confirm-pwd-notice') // pwd confirm 입력 조건 알림
    ;

let authCheck;  // 이메일 인증 여부

/** ================================================================
 *  계정정보 확인 버튼 클릭
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$('#findPw-btn').on('click', function () {

    // ID 유효성 검사
    if (validator($('#id-input').val(), 'isEmpty')) {
        $('#id-notice').text('ID를 입력해 주세요.');
        $('#id-notice').addClass('active-notice');
        $('#id-notice').removeClass('deactive-notice');
        $('#id-notice').addClass(inputFailClass);
        $('#id-notice').removeClass(inputSuccClass);
    } else {
        $('#id-notice').addClass('deactive-notice');
        $('#id-notice').removeClass('active-notice');
        $('#id-notice').addClass(inputSuccClass);
        $('#id-notice').removeClass(inputFailClass);
    }


    // 사용자 이름 유효성 검사
    if (validator($('#name-input').val(), 'isEmpty')) {
        $('#name-notice').text('사용자 이름을 입력해 주세요.');
        $('#name-notice').addClass('active-notice');
        $('#name-notice').removeClass('deactive-notice');
        $('#name-notice').addClass(inputFailClass);
        $('#name-notice').removeClass(inputSuccClass);
    } else {
        $('#name-notice').addClass('deactive-notice');
        $('#name-notice').removeClass('active-notice');
        $('#name-notice').addClass(inputSuccClass);
        $('#name-notice').removeClass(inputFailClass);
    }

    // 이메일 유효성 검사
    if (validator($('#email-input').val(), 'isEmpty') | validator($('#email-input2').val(), 'isEmpty')) {
        $('#email-notice').addClass('active-notice');
        $('#email-notice').removeClass('deactive-notice');
        $('#email-notice').addClass(inputFailClass);
        $('#email-notice').removeClass(inputSuccClass);
    } else {
        $('#email-notice').addClass('deactive-notice');
        $('#email-notice').removeClass('active-notice');
        $('#email-notice').addClass(inputSuccClass);
        $('#email-notice').removeClass(inputFailClass);
    }


    // ID, 사용자 이름, 이메일 모두 입력한 경우
    if ($('.' + inputFailClass).length < 1) {
        if (authCheck != 1) {
            $("#email-notice").text('이메일 인증을 완료해 주세요.');
            $("#email-notice").addClass('active-notice');
            $("#email-notice").removeClass('deactive-notice');
            $("#authnumber").focus();
            return;
        }

        $modal.modal(); // 비밀번호 변경 모달창 로드
    }
    return;
});


/** ================================================================
 *  비밀번호 변경 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$modalSubmitBtn.on('click', function () {
    changePassword();
});


/** ================================================================
 *  비밀번호 변경
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
function changePassword() {
    let $newPwd = $formInputs.filter('#new-pwd-input'),
        $pwdConfirm = $formInputs.filter('#confirm-pwd-input'),
        newPwd = $newPwd.val(),
        confirmPw = $pwdConfirm.val();

    if ($newPwd.hasClass(inputFailClass) || $pwdConfirm.hasClass(inputFailClass) ||
        newPwd == '' || confirmPw == '') {
        alert('입력 양식을 다시 확인해주세요.');
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/modify/password',
        cmmReqDataObj = {
            userCode : $("#modal-user-code").val(),
            pwd: newPwd
        },
        cmmAsync = false,
        cmmSucc = function (result) {
            if (result.state) {
                alert('변경되었습니다.');

                location.href = baseUrl;
                return;
            } else {
                alert('수정 실패하였습니다. 다시 시도해 주세요.');
                return;
            }
            //location.href = mainPage;
        },
        cmmErr = function () {
            alert(i18next.t('수정 실패! 잠시후 다시 실행해주세요.'));
            //location.href = indexPage;
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
}


/** ================================================================
 *  form-control 입력값 유효성 검사
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$formInputs.not('select').on('propertychange change keyup paste input', function (evnt) {
    realTimeformControl(evnt, '');
});


/** ================================================================
 *  form-control 입력값 유효성 검사
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
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


/** ================================================================
 *  인증번호 전송 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$("#sendnumber").on('click', function () {

    // ID 입력 X인 경우
    if (validator($('#id-input').val(), 'isEmpty')) {
        $("#id-notice").addClass('active-notice');
        $("#id-notice").removeClass('deactive-notice');
        return;
    } else {
        $("#id-notice").addClass('deactive-notice');
        $("#id-notice").removeClass('active-notice');
    }

    // 사용자 이름 입력 X인 경우
    if (validator($('#name-input').val(), 'isEmpty')) {
        $("#name-notice").addClass('active-notice');
        $("#name-notice").removeClass('deactive-notice');
        return;
    } else {
        $("#name-notice").addClass('deactive-notice');
        $("#name-notice").removeClass('active-notice');
    }
    // 이메일 아이디, 도메인 입력 X인 경우
    if (validator($('#email-input').val(), 'isEmpty') | validator($('#email-input2').val(), 'isEmpty')) {
        $("#email-notice").removeClass('deactive-notice');
        $("#email-notice").addClass('active-notice');
        return;
    }
    else {
        $("#email-notice").removeClass('active-notice');
        $("#email-notice").addClass('deactive-notice');


        // 이메일 유무 확인 ajax
        let cmmContentType = 'application/json',
            cmmType = 'post',
            cmmUrl = '/api/users/authEmail',
            cmmReqDataObj = {
                id: $("#id-input").val(),
                name: $('#name-input').val(),
                eId: $('#email-input').val(),
                eDomain: $('#email-input2').val()
            },
            cmmAsync = false,
            cmmSucc = function (result) {
                if (result.success == 0) { // 메일 전송 실패시
                    alert('인증번호 전송에 실패했습니다.');
                    $('#sendnumber').addClass("active-notice");
                    $('#sendnumber').removeClass("deactive-notice");
                } else if (result.success == 2) { // 사용자 정보 존재하지 않을 시
                    alert('일치하는 사용자가 존재하지 않습니다.');
                    $('#sendnumber').addClass("active-notice");
                    $('#sendnumber').removeClass("deactive-notice");
                } else {    // 메일 전송 성공 시
                    $("#sendnumber").text('재전송');
                    $('#input-authnumber').addClass("active-notice");
                    $('#input-authnumber').removeClass("deactive-notice");
                    $("#modal-user-code").attr('value', result.userCode);
                    authnumber = result.authNumber;
                }
            },
            cmmErr = null;
        commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

    }
})

/** ================================================================
 *  인증번호 확인 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$('#checknumber').on('click', function (evnt) {
    if (authCheck == 1) {
        alert('이미 인증된 번호입니다.\nID 찾기 버튼을 클릭해 주세요.');
        return;
    }
    if (validator($('#authnumber').val(), 'isEmpty')) {
        alert('인증번호를 입력해 주세요.');
        authCheck = 0;
    } else {
        if ($('#authnumber').val() == authnumber) {
            alert('이메일 인증에 성공하였습니다.');
            $("#checknumber").text('인증 완료');

            $("#e-auth-notice").removeClass('active-notice');
            $("#e-auth-notice").addClass('deactive-notice');

            $("#checknumber").prop('disabled', false);
            $("#email-input").prop('readonly', true);
            $("#email-input2").prop('readonly', true);

            authCheck = 1;
        } else {
            alert('인증에 실패하였습니다. 다시 시도해 주세요.');
            authCheck = 0;
        }
    }
})