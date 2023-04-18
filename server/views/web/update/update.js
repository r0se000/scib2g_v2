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
    $("#gen-input").val(userInfo.gender).prop('selected', true);

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

    // 입력한 데이터 검사 및 가져오기
    let inputList = getInput();

    if (!regOk) {
        return;
    }

    if (!confirm('관리 대상자 정보를 수정하시겠습니까?')) {
        console.log("dddd");
        return;
    }

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
            if (result.state) {
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
let regOk = false;

function getInput() {
    let inputList = {};
    let inputCheck = 0;
    let phoneCheck1 = 0,
        phoneCheck2 = 0;
    let noticeId;

    $('.form-control').each(function(index, item) {
        noticeId = "#" + $(item).attr('name') + "-notice"
        itemId = $(item).attr('id');

        switch ($(item).attr('id')) {
            case 'name-input':
                if (validator($(item).val(), 'isEmpty') || $(item).val().length < 2) {
                    $(noticeId).removeClass('deactive-notice')
                    $(noticeId).addClass('active-notice')
                } else {
                    $(noticeId).removeClass('active-notice')
                    $(noticeId).addClass('deactive-notice')
                    inputCheck++
                    inputList.name = $(item).val()
                }
                break
            case 'gen-input':
                if ($(item).val() == "선택") {
                    $(noticeId).removeClass('deactive-notice')
                    $(noticeId).addClass('active-notice')
                } else {
                    $(noticeId).removeClass('active-notice')
                    $(noticeId).addClass('deactive-notice')
                    inputCheck++
                    inputList.gender = $(item).val()
                }
                break
            case 'address1-input':
                if ($(item).val() == "시/도") {
                    $("#address1-notice").removeClass('deactive-notice')
                    $("#address1-notice").addClass('active-notice')
                } else {
                    $("#address1-notice").removeClass('active-notice')
                    $("#address1-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.address1 = $(item).val()
                }
                break
            case 'address2-input':
                if ($(item).val() == "시/도") {
                    $("#address2-notice").removeClass('deactive-notice')
                    $("#address2-notice").addClass('active-notice')
                } else {
                    $("#address2-notice").removeClass('active-notice')
                    $("#address2-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.address2 = $(item).val()
                }
                break
            case 'address3-input':
                if ($(item).val() == "") {
                    $("#address3-notice").removeClass('deactive-notice')
                    $("#address3-notice").addClass('active-notice')
                } else {
                    $("#address3-notice").removeClass('active-notice')
                    $("#address3-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.address_3 = $(item).val()
                }
                break
            case 'user-phone2-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#user2-notice").removeClass('deactive-notice')
                    $("#user2-notice").addClass('active-notice')
                    phoneCheck1++;
                } else {
                    $("#user2-notice").removeClass('active-notice')
                    $("#user2-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.phone_middle = $(item).val()
                }
                break
            case 'user-phone3-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#user3-notice").removeClass('deactive-notice')
                    $("#user3-notice").addClass('active-notice')
                    phoneCheck1++;
                } else {
                    $("#user3-notice").removeClass('active-notice')
                    $("#user3-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.phone_last = $(item).val()
                }
                break
            case 'protect-phone2-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#protector2-notice").removeClass('deactive-notice')
                    $("#protector2-notice").addClass('active-notice')
                    phoneCheck2++;
                } else {
                    $("#protector2-notice").removeClass('active-notice')
                    $("#protector2-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.protector_phone_middle = $(item).val()
                }
                break
            case 'protect-phone3-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#protector3-notice").removeClass('deactive-notice')
                    $("#protector3-notice").addClass('active-notice')
                    phoneCheck2++;
                } else {
                    $("#protector3-notice").removeClass('active-notice')
                    $("#protector3-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.protector_phone_last = $(item).val()
                }
                break
        }
        if (phoneCheck1 > 0) {
            $("#user1-notice").removeClass('deactive-notice')
            $("#user1-notice").addClass('active-notice')
        }
        if (phoneCheck2 > 0) {
            $("#protector1-notice").removeClass('deactive-notice')
            $("#protector1-notice").addClass('active-notice')
        }
        if (inputCheck == 9) {
            inputList.name = $("#name-input").val();
            inputList.birth_year = $("#birth-year-input").val();
            inputList.birth_month = $("#birth-month-input").val();
            inputList.birth_date = $("#birth-date-input").val();
            inputList.gender = $("#gen-input").val();
            inputList.phone_first = $("#user-phone1-input").val();
            inputList.protector_phone_first = $("#protect-phone1-input").val();
            regOk = true;
        }
    });
    return inputList;
}