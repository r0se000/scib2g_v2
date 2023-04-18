let serviceCheck = 'Y'; // 서비스 이용, 종료 여부


/** ================================================================
 *  관리 대상자 조회 페이지 init()
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
function init() {
    // 관리 대상자 목록 세팅
    setUserList(userList);
}

/* -------------- 엑셀 다운로드 관련 코드 -------------- */
const excelDownload = document.querySelector('#excelDownload');
document.addEventListener('DOMContentLoaded', () => {
    excelDownload.addEventListener('click', exportExcel);
});

$('#emDetailDownload').on('click', function() {
    let wb = XLSX.utils.book_new();
    // step 2. 시트 만들기
    let newWorksheet = emExcelHandler.getWorksheet();
    // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
    XLSX.utils.book_append_sheet(wb, newWorksheet, emExcelHandler.getSheetName());
    // step 4. 엑셀 파일 만들기
    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    // step 5. 엑셀 파일 내보내기
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), emExcelHandler.getExcelFileName());
});

let emExcelHandler = {
    getExcelFileName: function() {
        return 'emergency_list.xlsx'; //파일명
    },
    getSheetName: function() {
        return 'Table Test Sheet'; //시트명
    },
    getExcelData: function() {
        return document.getElementById('user-detail-table'); //TABLE id
    },
    getWorksheet: function() {
        return XLSX.utils.table_to_sheet(this.getExcelData());
    }
}

// 엑셀 다운로드 함수
function exportExcel() {
    // step 1. workbook 생성
    let wb = XLSX.utils.book_new();
    // step 2. 시트 만들기
    let newWorksheet = excelHandler.getWorksheet();
    // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName());
    // step 4. 엑셀 파일 만들기
    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    // step 5. 엑셀 파일 내보내기
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), excelHandler.getExcelFileName());
}

let excelHandler = {
    getExcelFileName: function() {
        return '관리 대상자 목록.xlsx'; //파일명
    },
    getSheetName: function() {
        return '관리 대상자'; //시트명
    },
    getExcelData: function() {
        return document.getElementById('user-table'); //TABLE id
    },
    getWorksheet: function() {
        return XLSX.utils.table_to_sheet(this.getExcelData());
    }
}

function s2ab(s) {
    let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    let view = new Uint8Array(buf); //create uint8array as viewer
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}
/* -------------- 엑셀 다운로드 관련 코드 -------------- */


/** ================================================================
 *  관리 대상자 정보 select, 상세정보 세팅
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
function selectUserInfo(userCode) {
    let userInfo;
    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/userList/select/userInfo',
        cmmReqDataObj = { userCode: userCode },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength == 1) {
                let userInfo = result.rows[0];
                $("#user-info-title").text(userInfo.name + "님의 상세정보");
                $("#user-info-name").text(userInfo.name);
                $("#user-info-birth").text(userInfo.birth_year + "년 " + userInfo.birth_month + "월 " + userInfo.birth_date + "일");
                if (userInfo.gender == 'M') {
                    $("#user-info-gender").text('남성');
                } else if (userInfo.gender == 'W') {
                    $("#user-info-gender").text('여성');
                }
                $("#user-info-address").text(userInfo.address_1 + " " + userInfo.address_2 + " " + userInfo.address_3);
                $("#user-info-phone1").text(userInfo.phone_first + "-" + userInfo.phone_middle + "-" + userInfo.phone_last);
                $("#user-info-phone2").text(userInfo.protector_phone_first + "-" + userInfo.protector_phone_middle + "-" + userInfo.protector_phone_last);
                $("#user-info-note").text(userInfo.user_note + " (" + userInfo.note_created_date + ")");
                $("#user-code-modal").val(userCode);

                // 서비스 종료, 재시작 세팅
                $("#service-btn-area").text('');
                if (userInfo.user_status == 'Y') {
                    $("#user-service-text").text('서비스 시작일');
                    $("#user-info-register").text(userInfo.user_register_date);
                    $("#service-btn-area").append('<button type="button" class="btn btn-danger" onclick="endService();">서비스 종료</button>');
                } else if (userInfo.user_status == 'N') {
                    $("#user-service-text").text('서비스 종료일');
                    $("#user-info-register").text(userInfo.user_delete_date);
                    $("#service-btn-area").append('<button type="button" class="btn btn-success" onclick="startService();">서비스 재시작</button>');
                }
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

    return userInfo;
}


/** ================================================================
 *  관리 대상자 목록 세팅
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  userList : 관리 대상자 목록
 *  ================================================================
 */
function setUserList(userList) {
    $("#service-text").text('서비스 시작일'); // 테이블 th 텍스트 변경
    $("#search-user-name").val(''); //검색어 초기화
    $('#userList').text(''); //테이블 초기화

    if (userList.rowLength != 0) {
        for (let i = 0; i < userList.rowLength; i++) {
            let userListHtml = "<tr class='user-list' onclick=\"userInfoModal('" + userList.rows[i].user_code + "');\">" +
                "<td id='user-name'>" + userList.rows[i].name + "</td>" +
                "<td id='user-code'>" + userList.rows[i].user_code + "</td>" +
                "<td id='user-date'>" + userList.rows[i].user_register_date + "</td>" +
                "<td id='em-count'>" + userList.rows[i].emCount + "건 </td>" +
                "</tr>";
            $('#userList').append(userListHtml);
        }
    }
}

/** ================================================================
 *  관리 대상자 목록 세팅(서비스 종료)
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  userList : 관리 대상자 목록
 *  ================================================================
 */
function setUserListEnd(userList) {

    $("#service-text").text('서비스 종료일'); // 테이블 th 텍스트 변경
    $("#search-user-name").val(''); //검색어 초기화
    $('#userList').text(''); //테이블 초기화

    if (userList.rowLength != 0) {
        for (let i = 0; i < userList.rowLength; i++) {
            let userListHtml = "<tr class='user-list' onclick=\"userInfoModal('" + userList.rows[i].user_code + "');\">" +
                "<td id='user-name'>" + userList.rows[i].name + "</td>" +
                "<td id='user-code'>" + userList.rows[i].user_code + "</td>" +
                "<td id='user-date'>" + userList.rows[i].user_delete_date + "</td>" +
                "<td id='em-count'>" + userList.rows[i].emCount + "건 </td>" +
                "</tr>";
            $('#userList').append(userListHtml);
        }
    }
}


/** ================================================================
 *  관리 대상자 리스트 클릭 이벤트
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
function userInfoModal(userCode) {
    $("#user-detail-modal").modal(); // 모달창 로드
    let userInfo = selectUserInfo(userCode);

}


/** ================================================================
 *  수정 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 초기 작성
 *  ================================================================
 */
$("#user-edit-btn").on('click', function() {
    changeView(baseUrl + "/update/" + $("#user-code-modal").val()); // 정보 수정 페이지 이동
});


/** ================================================================
 *  이름 검색 폼 enter 이벤트
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
$("#search-user-name").on('keyup', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $("#searchBtn").click();
    }
})


/** ================================================================
 *  조회 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
$("#searchBtn").on('click', function() {

    if ($("#search-user-name").val() == '') {
        alert('이름을 입력해 주세요.');
        $("#search-user-name").focus();
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/userList/select/searchName',
        cmmReqDataObj = {
            userCode: userCode,
            searchStr: $("#search-user-name").val(),
            serviceCheck: serviceCheck
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                setUserList(result);
            } else {
                alert('관리 대상자가 존재하지 않습니다.');
                $('#userList').text(''); // 테이블 초기화
                $("#search-user-name").val(''); //검색어 초기화
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});


/** ================================================================
 *  서비스 이용 버튼 클릭 이벤트(서비스 사용 중인 대상자 목록 출력)
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */
$("#service-user-btn").on('click', function() {
    serviceCheck = 'Y';
    $("#user-list-h3").text('관리 대상자 조회');

    setUserList(userList);
});


/** ================================================================
 *  서비스 종료 버튼 클릭 이벤트(서비스 종료 대상자 목록 출력)
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
$("#service-end-btn").on('click', function() {

    serviceCheck = 'N';

    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/userList/select/endService',
        cmmReqDataObj = {
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                setUserListEnd(result);
                $("#user-list-h3").text('관리 대상자 조회(서비스 종료)');
            } else {
                alert('관리 대상자가 존재하지 않습니다.');
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});


/** ================================================================
 *  서비스 종료
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
function endService() {

    if (!confirm("선택하신 사용자의 서비스를 종료하시겠습니까?")) {
        return;
    }

    let userCode = $("#user-code-modal").val();
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/userList/userStatusN',
        cmmReqDataObj = {
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('서비스 종료 처리되었습니다.');
                window.location.reload();

            } else {
                alert('서비스 종료 처리 실패.');
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}


/** ================================================================
 *  서비스 재시작
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
function startService() {

    if (!confirm("선택하신 사용자의 서비스를 재시작하시겠습니까?")) {
        return;
    }

    let userCode = $("#user-code-modal").val();
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/userList/userStatusY',
        cmmReqDataObj = {
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('서비스 재시작 처리되었습니다.');
                window.location.reload();
            } else {
                alert('서비스 재시작 처리 실패.');
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}