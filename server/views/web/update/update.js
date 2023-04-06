/** ================================================================
 *  관리 대상자 정보 수정 init()
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
function init() {

    // 관리 대상자 이름 세팅
    $("#name-input").val(userInfo.name);

    // commonUtil.js - 생년월일 option 설정 메소드
    setYearSelBox($("#birth-year-input")); // 생년 날짜 option 설정
    setMonthSelBox($("#birth-month-input")); // 생월 날짜 option 설정
    setDaySelBox($("#birth-date-input"), userInfo.birth_year, userInfo.birth_month); // 생일 날짜 설정

    // 생년월일 세팅
    $("#birth-year-input").val(userInfo.birth_year).prop('selected', true);
    $("#birth-month-input").val(userInfo.birth_month).prop('selected', true);
    $("#birth-date-input").val(userInfo.birth_date).prop('selected', true);

    // 성별 세팅
    $("#gen-input").val(userInfo.sex).prop('selected', true);

    // 주소 세팅
    $("#address1-input").val(userInfo.address_1);
    $("#address2-input").val(userInfo.address_2);
    $("#address3-input").val(userInfo.address_3);

    // 관리 대상자 연락처 세팅
    $("#user-phone1-input").val(userInfo.phone_first).prop('selected', true);
    $("#user-phone2-input").val(userInfo.phone_middle);
    $("#user-phone3-input").val(userInfo.phone_last);

    // 보호자 연락처 세팅
    $("#protect-phone1-input").val(userInfo.protector_phone_first).prop('selected', true);
    $("#protect-phone2-input").val(userInfo.protector_phone_middle);
    $("#protect-phone3-input").val(userInfo.protector_phone_last);

}


/** ================================================================
 *  취소 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
$("#back-btn").on('click', function() {
    window.history.back(); // 이전 페이지로 이동
})


/** ================================================================
 *  수정 버튼 클릭 이벤트(관리 대상자 정보 업데이트)
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
$("#user-edit-btn").on('click', function() {

    // 수정 확인창 로드
    if (!confirm('수정하시겠습니까?')) {
        return;
    }
    // 입력한 데이터 검사 및 가져오기
    let inputList = getInput();
    // ajax
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/update/updateInfo',
        cmmReqDataObj = {
            userCode: user_code,
            inputList: inputList
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('수정 완료되었습니다.');
                changeView(baseUrl + "/userList/" + userCode); // commonUtil.js 참고_관리 대상자 조회 페이지로 이동
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});



/** ================================================================
 *  연락처 input 길이 제한
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
function maxLengthCheck(object) {
    if (object.value.length > object.maxLength) {
        object.value = object.value.slice(0, object.maxLength);
    }
}


/** ================================================================
 *  입력 데이터 검사, 가져오기
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
function getInput() {

    let inputList = {};

    if ($("#name-input").val() == '') {
        $("#name-notice").removeClass('deactive-notice');
        $("#name-notice").addClass('active-notice');
        $("#name-input").focus();
        return;
    }
    if ($("#address3-input").val() == '') {
        $("#address3-notice").removeClass('deactive-notice');
        $("#address3-notice").addClass('active-notice');
        $("#address3-input").focus();
        return;
    }
    if ($("#user-phone2-input").val() == '') {
        $("#phone1-notice").removeClass('deactive-notice');
        $("#phone1-notice").addClass('active-notice');
        $("#user-phone2-input").focus();
        return;
    }
    if ($("#user-phone3-input").val() == '') {
        $("#phone1-notice").removeClass('deactive-notice');
        $("#phone1-notice").addClass('active-notice');
        $("#user-phone3-input").focus();
        return;
    }
    if ($("#protect-phone1-input").val() == '') {
        $("#phone2-notice").removeClass('deactive-notice');
        $("#phone2-notice").addClass('active-notice');
        $("#protect-phone1-input").focus();
        return;
    }
    if ($("#protect-phone2-input").val() == '') {
        $("#phone2-notice").removeClass('deactive-notice');
        $("#phone2-notice").addClass('active-notice');
        $("#protect-phone2-input").focus();
        return;
    }
    if ($("#protect-phone3-input").val() == '') {
        $("#phone2-notice").removeClass('deactive-notice');
        $("#phone2-notice").addClass('active-notice');
        $("#protect-phone3-input").focus();
        return;
    }

    inputList.name = $("#name-input").val();
    inputList.birth_year = $("#birth-year-input").val();
    inputList.birth_month = $("#birth-month-input").val();
    inputList.birth_date = $("#birth-date-input").val();
    inputList.sex = $("#gen-input").val();
    inputList.address_3 = $("#address3-input").val();
    inputList.phone_first = $("#user-phone1-input").val();
    inputList.phone_middle = $("#user-phone2-input").val();
    inputList.phone_last = $("#user-phone3-input").val();
    inputList.protector_phone_first = $("#protect-phone1-input").val();
    inputList.protector_phone_middle = $("#protect-phone2-input").val();
    inputList.protector_phone_last = $("#protect-phone3-input").val();

    return inputList;
}