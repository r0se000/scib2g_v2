let $formInput = $('.form-control'),
    $formNotice = $('.form-notice') // 모든 form notice

const inputFailClass = 'form-control-danger';
const inputSuccClass = 'form-control-success';

let $modal = $('#result-modal') // modal
    ,
    $modalInsideBtns = $('.modal-btn') // all modal buttons
    ,
    $modalIdResult = $('#id-result') // 사용자 ID 출력 span  
    ,
    $backbtn = $('#findAccount-back');

let authCheck; // 이메일 인증 여부

const accountApiUrl = baseUrl + 'users/find/account';
const loginPage = 'login.html';
const findPwPage = 'find-pw.html';

//뒤로가기 버튼 2021.06.02 MY
$backbtn.on('click', function() {
    location.href = loginPage;
});

/** ================================================================
 *  ID 찾기 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$('#findId-btn').on('click', function() {

    // 사용자 이름 유효성 검사
    if (validator($('#name-input').val(), 'isEmpty')) {
        $('#name-notice').text('사용자 이름을 정확히 입력해 주세요.');
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


    // 사용자 이름, 이메일 모두 입력한 경우
    if ($('.' + inputFailClass).length < 1) {
        if (authCheck != 1) {
            $("#email-notice").text('이메일 인증을 완료해 주세요.');
            $("#email-notice").addClass('active-notice');
            $("#email-notice").removeClass('deactive-notice');
            $("#authnumber").focus();
            return;
        }

        let cmmContentType = 'application/json',
            cmmDataType = 'json',
            cmmType = 'get',
            cmmUrl = accountApiUrl,
            cmmReqDataObj = {
                name: $("#name-input").val(),
                eId: $("#email-input").val(),
                eDomain: $("#email-input2").val()
            },
            cmmAsync = false,
            cmmSucc = function(result) {
                if (result.messageCode === 'foundId') {
                    $modal.modal();
                    $modalIdResult.text(result.id);
                } else {
                    alert('해당 정보와 일치하는 사용자가 없습니다.');
                }
            },
            cmmErr = null;

        commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
    return;
});


/** ================================================================
 *  모달창 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$modalInsideBtns.on('click', function(evnt) {
    let targetId = evnt.target.id;
    switch (targetId) {
        case 'modal-login-btn': // 로그인
            location.href = loginPage;
            break;
        case 'modal-pw-btn': // 비밀번호 찾기
            location.href = findPwPage;
            break;
    }
});


/** ================================================================
 *  인증번호 전송 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$("#sendnumber").on('click', function() {

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
    } else {
        $("#email-notice").addClass('deactive-notice');
        $("#email-notice").removeClass('active-notice');

        $("#email-notice").removeClass('active-notice');
        $("#email-notice").addClass('deactive-notice');


        // 이메일 유무 확인 ajax
        let cmmContentType = 'application/json',
            cmmDataType = 'json',
            cmmType = 'post',
            cmmUrl = baseUrl + 'users/authEmail',
            cmmReqDataObj = {
                name: $('#name-input').val(),
                eId: $('#email-input').val(),
                eDomain: $('#email-input2').val()
            },
            cmmAsync = false,
            cmmSucc = function(result) {
                if (result.success == 0) { // 메일 전송 실패시
                    alert('인증번호 전송에 실패했습니다.');
                    $('#sendnumber').addClass("active-notice");
                    $('#sendnumber').removeClass("deactive-notice");
                } else if (result.success == 2) { // 사용자 정보 존재하지 않을 시
                    alert('일치하는 사용자가 존재하지 않습니다.');
                    $('#sendnumber').addClass("active-notice");
                    $('#sendnumber').removeClass("deactive-notice");
                } else { // 메일 전송 성공 시
                    $("#sendnumber").text('재전송');
                    $('#input-authnumber').addClass("active-notice");
                    $('#input-authnumber').removeClass("deactive-notice");
                    authnumber = result.authNumber;
                }
            },
            cmmErr = null;
        commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

    }
})


/** ================================================================
 *  인증번호 확인 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
$('#checknumber').on('click', function(evnt) {
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