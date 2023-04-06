let $idInput = $('#id-input'),
    $pwInput = $('#pw-input');
$(function() {
    $(".preloader").fadeOut();
});
$(function() {
    $('[data-toggle="tooltip"]').tooltip()
});

$('#login-btn').on("click", function() {
    if ($idInput.val() != null && $pwInput.val() != null) {
        let cmmContentType = 'application/json',
            cmmType = 'post',
            cmmUrl = '/api/users/adminlogin',
            cmmReqDataObj = {
                accountId: $idInput.val(),
                accountPw: $pwInput.val(),
            },
            cmmAsync = false,
            cmmSucc = function(result) {
                let userCode = result.userCode
                let userName = result.userName
                if (result.messageCode == 'ExistUser') {
                    setSessionStorage('userCode', '' + userCode);
                    setSessionStorage('accessToken', '' + result.accessToken)

                    culPageUrl = serverUrl + 'api/rtime_web/' + userCode;
                    setSessionStorage('culPageUrl', culPageUrl)

                    changeView(culPageUrl, '');

                } else {
                    alert('올바르지 않은 id, 비밀번호 입니다.')
                }
            },
            cmmErr = function() {
                alert('로그인 실패');
                location.href = '/api';
            };


        commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
})

$('#signup-btn').on("click", function() {
    window.location = baseUrl + "/signUp"
})

$('#find-id').on("click", function() {
    window.location = baseUrl + "/findUserId"
})

$('#find-pw').on("click", function() {
    window.location = baseUrl + "/findUserPw"
})


/** ================================================================
 *  로그인 폼 enter 이벤트
 *  @author SY
 *  @since 2023.03.27
 *  @history 2023.03.27 초기 작성
 *  ================================================================
 */
$(".form-group").on('keyup', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $("#login-btn").click();
    }
})