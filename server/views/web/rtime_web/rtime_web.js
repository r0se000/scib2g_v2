let $clockTarget = $('#clock-target'),
    $allBtn = $("#allBtn"),
    $unconnectedBtn = $("#unconnectedBtn"),
    $noteUploadBtn = $("#note-uploadBtn"),
    $asUploadBtn = $("#as-uploadBtn"),
    $datePicker = $("#as-datepicker");

// 날짜 관련 변수
let date = new Date();
let year = date.getFullYear(),
    month = date.getMonth() + 1,
    nowDate = date.getDate(),
    day = date.getDay();
let today = year + "-" + String(month).padStart(2, "0") + "-" + String(nowDate).padStart(2, "0");


let interval; // interval 변수


/** ================================================================
 *  실시간 모니터링 페이지 init()
 *  @author SY
 *  @since 2023.03.22
 *  @history 2023.03.22 초기 작성
 *  ================================================================
 */
async function init() {
    // 오늘 날짜 세팅
    $datePicker.val(today);
    // 오늘 이후의 날짜를 비활성화
    $datePicker.attr('max', today);
    $clockTarget.html(getTime());
    setInterval(function() {
        $clockTarget.html(getTime());
    }, 1000);

    $datePicker.val(year + "-" + String(month).padStart(2, "0") + "-" + String(nowDate).padStart(2, "0"));

    // 실시간 관리 대상자 목록 초기 세팅
    if (userCount != 0) {
        $('#user-rtime > tbody').html('');
        for (let i = 0; i < userCount; i++) {
            let userListHtml = "<tr id=\"user" + userList['user' + i].user_code + "\" onclick=\"userInfoModal('" + userList['user' + i].user_code + "');\">" +
                "<td id='user-name'>" + userList['user' + i].name + "</td>" +
                "<td id='user-code'>" + userList['user' + i].user_code + "</td>" +
                "<td id='hr'>데이터 수집중</td>" +
                "<td id='state'>데이터 수집중</td>" +
                "<td class='note' onclick='userNoteModal(event, \"" + userList['user' + i].user_code + "\");' style='cursor:pointer;'>" + userList['user' + i].user_note + "</td>" +
                "<td><button class='btn btn-info' name='" + userList['user' + i].user_code + "' onclick='userASModal(event,\"" + userList['user' + i].user_code + "\");'' style='width:80px;'>입력</button></td>"
            "</tr>";
            $('#user-rtime > tbody:last').append(userListHtml);
        }
    }

    interval = setInterval(function() { // 5초마다 갱신
        selectRtime();
    }, 5000);
}


/** ================================================================
 *  관리 대상자 실시간 데이터 로드
 *  @author SY
 *  @since 2023.03.22
 *  @history 2023.03.22 초기 작성
 *  ================================================================
 */
function selectRtime() {
    if (userCount != 0) {
        $('#user-rtime > tbody').html('');
        for (let i = 0; i < userCount; i++) {
            let userListHtml = "<tr id=\"user" + userList['user' + i].user_code + "\" onclick=\"userInfoModal('" + userList['user' + i].user_code + "');\">" +
                "<td id='user-name'>" + userList['user' + i].name + "</td>" +
                "<td id='user-code'>" + userList['user' + i].user_code + "</td>" +
                "<td id='hr'>데이터 수집중</td>" +
                "<td id='state'>데이터 수집중</td>" +
                "<td class='note' onclick='userNoteModal(event, \"" + userList['user' + i].user_code + "\");' style='cursor:pointer;'>" + userList['user' + i].user_note + "</td>" +
                "<td><button class='btn btn-info' name='" + userList['user' + i].user_code + "' onclick='userASModal(event,\"" + userList['user' + i].user_code + "\");'' style='width:80px;'>입력</button></td>"
            "</tr>";
            $('#user-rtime > tbody:last').append(userListHtml);
        }
    }

    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/rtime_web/select/rtimeData',
        cmmReqDataObj = {
            userCode: userCode,
            selectUserList: userCodeList
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            let rtimeData = JSON.parse(result.rtimeData),
                rtimeLength = Object.keys(rtimeData).length;

            for (let i = 0; i < rtimeLength; i++) {
                let selectUserCode = userCodeList[i]
                let rData = rtimeData[selectUserCode][4]

                $('#user' + selectUserCode + '>#user-code').css("color", "black");
                $('#user' + selectUserCode + '>#user-name').css("color", "black");
                $('#user' + selectUserCode + '>#hr').css("color", "black");
                $('#user' + selectUserCode + '>#state').css("color", "black");
                $('#user' + selectUserCode + '>#hr').text(rData[0])

                if (rData[1] == 0) {
                    $('#user' + selectUserCode + '>#state').text('빈 침대')

                } else if (rData[1] == 1) {
                    $('#user' + selectUserCode + '>#state').text('침대 점유')

                } else if (rData[1] == 2) {
                    $('#user' + selectUserCode + '>#state').text('움직임');

                } else { // 센서 연결 없음
                    $('#user' + selectUserCode + '>#state').text('연결없음')
                    $('#user' + selectUserCode + '>#hr').css("color", "red");
                    $('#user' + selectUserCode + '>#user-code').css("color", "red");
                    $('#user' + selectUserCode + '>#user-name').css("color", "red");
                    $('#user' + selectUserCode + '>#state').css("color", "red");
                }
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}


/** ================================================================
 *  전체조회 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
$allBtn.on('click', function() {
    selectRtime();
    interval = setInterval(function() {
        selectRtime();
    }, 5000);
});


/** ================================================================
 *  연결없음 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
$unconnectedBtn.on('click', function() {

    clearInterval(interval); //인터벌 종료

    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/rtime_web/select/unconnectedData',
        cmmReqDataObj = {
            selectUserList: userCodeList
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.legnth != 0) {
                $('#user-rtime > tbody').html('');
                for (let i = 0; i < result.length; i++) {
                    let userInfo = selectUserInfo(result[i]);

                    let userListHtml = "<tr id=\"user" + userInfo.user_code + "\" onclick=\"userInfoModal('" + userInfo.user_code + "');\">" +
                        "<td id='user-name'>" + userInfo.name + "</td>" +
                        "<td id='user-code'>" + userInfo.user_code + "</td>" +
                        "<td id='state'>연결없음</td>" +
                        "<td class='note' onclick='userNoteModal(event, \"" + userInfo.user_code + "\");' style='cursor:pointer; white-space:nowrap; text-overflow:ellipsis;'>" + userInfo.user_note + "</td>" +
                        "<td><button class='btn btn-info' name='" + userInfo.user_code + "' onclick='userASModal(event,\"" + userInfo.user_code + "\");'' style='width:80px;'>입력</button></td>"
                    "</tr>";
                    $('#user-rtime > tbody:last').append(userListHtml);


                    $('#user' + result[i] + '>#user-code').css("color", "red");
                    $('#user' + result[i] + '>#user-name').css("color", "red");
                    $('#user' + result[i] + '>#state').css("color", "red");
                }
            }

        },
        cmmErr = null;

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});



/** ================================================================
 *  관리 대상자 정보 select
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
function selectUserInfo(userCode) {
    let userInfo;
    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/rtime_web/select/userInfo',
        cmmReqDataObj = { userCode: userCode },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.success) {
                userInfo = result.rows[0];
            } else {
                console.log("에러");
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null)
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

    return userInfo;
}


/** ================================================================
 *  관리 대상자 목록 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
function userInfoModal(userCode) {

    $('#user-detail-modal').modal();

    let userInfo = selectUserInfo(userCode);
    $("#user-info-title").text(userInfo.name + "님의 상세정보");
    $("#user-info-name").text(userInfo.name);
    $("#user-info-birth").text(userInfo.birth_year + "년 " + userInfo.birth_month + "월 " + userInfo.birth_date + "일");
    $("#user-info-gender").text(userInfo.sex);
    $("#user-info-address").text(userInfo.address_1 + " " + userInfo.address_2 + " " + userInfo.address_3);
    $("#user-info-phone1").text(userInfo.phone_first + "-" + userInfo.phone_middle + "-" + userInfo.phone_last);
    $("#user-info-phone2").text(userInfo.protector_phone_first + "-" + userInfo.protector_phone_middle + "-" + userInfo.protector_phone_last);
    $("#user-recent-data-time").text(" " + userInfo.recentDate);

};


/** ================================================================
 *  관리 대상자 특이사항 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
function userNoteModal(event, userCode) {
    event.stopPropagation();
    let userInfo = selectUserInfo(userCode);
    $("#note-user-name").text(userInfo.name + "님의 특이사항");
    $("#note-detail").text(userInfo.user_note);
    $("#note-date").text(userInfo.note_created_date);
    $("#note-user-code").val(userInfo.user_code);

    $('#user-note-modal').modal();
}


/** ================================================================
 *  관리 대상자 A/S 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
function userASModal(event, userCode) {
    event.stopPropagation(); // 중복 클릭 이벤트 방지

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/rtime_web/selectAS',
        cmmReqDataObj = { userCode: userCode },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength == 1) {
                $("#as-detail").attr('placeholder', "작성일: " + result.rows[0].as_created_date + "\n" + result.rows[0].as_detail);
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    let userInfo = selectUserInfo(userCode);
    $("#as-user-code").val(userInfo.user_code);
    $("#as-user-name").text(userInfo.name + "님의 A/S 등록")
    $('#user-as-modal').modal();
}


/** ================================================================
 *  특이사항 등록 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
$noteUploadBtn.on('click', function() {

    if ($("#note-detail").val() == '') {
        alert('특이사항을 입력해 주세요.');
        $("#note-detail").focus();
        return;
    }

    if (!confirm("특이사항을 등록하시겠습니까?\n확인 버튼을 클릭하면 기존에 작성된 특이사항이 업데이트됩니다.")) {
        return;
    }

    let userCode = $("#note-user-code").val();
    let noteDetail = $("#note-detail").val();

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/rtime_web/updateNote',
        cmmReqDataObj = {
            userCode: userCode,
            noteDetail: noteDetail
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                $("#user-note-modal").hide();
                location.reload();

            } else {
                console.log("에러");
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});


/** ================================================================
 *  A/S 등록 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.24
 *  @history 2023.03.24 초기 작성
 *  ================================================================
 */
$asUploadBtn.on('click', function() {
    let userCode = $("#as-user-code").val();
    let asDetail = $("#as-detail").val(); // A/S 조치사항
    let asDate = $datePicker.val(); // A/S 입력 날짜


    if (asDetail == '') {
        alert('A/S 조치 내용을 입력해 주세요.');
        $("#as-detail").focus();
        return;
    }
    if (asDate == '') {
        alert('조치 날짜를 선택해 주세요.');
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/rtime_web/insertAS',
        cmmReqDataObj = {
            userCode: userCode,
            asDetail: asDetail,
            asDate: asDate
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('A/S 조치사항이 등록되었습니다.');
                $('#user-as-modal').hide();
                location.reload();
            } else {
                console.log("에러");
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null)
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});