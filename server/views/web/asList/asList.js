// 날짜 관련 변수
let date = new Date();
let year = date.getFullYear(),
    month = date.getMonth() + 1,
    nowDate = date.getDate(),
    day = date.getDay();
let today = year + "-" + String(month).padStart(2, "0") + "-" + String(nowDate).padStart(2, "0");

let serviceCheck = 'Y'; // 서비스 이용, 종료 여부


/* -------------- 엑셀 다운로드 관련 코드 -------------- */
const excelDownload = document.querySelector('#excelDownload');
document.addEventListener('DOMContentLoaded', () => {
    excelDownload.addEventListener('click', exportExcel);
});

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
        return 'AS목록.xlsx'; //파일명
    },
    getSheetName: function() {
        return 'AS'; //시트명
    },
    getExcelData: function() {
        return document.getElementById('as-table'); //TABLE id
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
 *  A/S 조회 페이지 init()
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
function init() {
    setASList(asList);

    // 오늘 날짜 세팅
    $("#as-datepicker").val(today);
    // 오늘 이후의 날짜를 비활성화
    $("#as-datepicker").attr('max', today);
}


/** ================================================================
 *  A/S 목록 출력
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
function setASList(asList) {

    $('#asList').text('');

    if (asList.rowLength != 0) {
        for (let i = 0; i < asList.rowLength; i++) {
            let asListHtml = "<tr>" +
                "<td>" + asList.rows[i].as_num + "</td>" +
                "<td>" + asList.rows[i].name + "</td>" +
                "<td>" + asList.rows[i].user_code + "</td>" +
                "<td class='detail'>" + asList.rows[i].as_detail + "</td>" +
                "<td>" + asList.rows[i].as_created_date + "</td>" +
                "<td><button type='button' class='btn btn-secondary' onclick='editModal(\"" + asList.rows[i].as_num + "\");'>수정</button></td>" +
                "<td><button type='button' class='btn btn-secondary' onclick='deleteAS(\"" + asList.rows[i].as_num + "\");'>삭제</button></td>" +
                "</tr>";
            $('#asList').append(asListHtml);
        }
    }
}


/** ================================================================
 *  서비스 이용 버튼 클릭 이벤트(서비스 사용 중인 대상자 목록 출력)
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */
$("#service-user-btn").on('click', function() {
    serviceCheck = 'Y';
    $("#as-h3").text('관리 대상자 A/S 목록');
    setASList(asList);
});



/** ================================================================
 *  서비스 종료 버튼 클릭 이벤트(서비스 종료 대상자 AS 목록 출력)
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */
$("#service-end-btn").on('click', function() {

    serviceCheck = 'N';

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/endService',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                setASList(result);
                $("#as-h3").text('관리 대상자 A/S 목록(서비스 종료)');
            } else {
                alert('A/S 목록이 존재하지 않습니다.');
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});



/** ================================================================
 *  이름 검색 폼 enter 이벤트
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
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
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
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
        cmmUrl = '/api/asList/searchName',
        cmmReqDataObj = {
            searchStr: $("#search-user-name").val(),
            serviceCheck: serviceCheck
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                setASList(result);
            } else {
                alert('관리 대상자가 존재하지 않습니다.');
                $('#asList').text(''); // 테이블 초기화
                $("#search-user-name").val(''); //검색어 초기화
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});



/** ================================================================
 *  A/S 등록 버튼 클릭 (모달창 로드, 데이터 세팅)
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */
function insertAS() {
    $("#as-insert-modal").modal(); // A/S 등록 모달창 로드

    // 오늘 날짜 세팅
    $("#as-datepicker").val(year + "-" + String(month).padStart(2, "0") + "-" + String(nowDate).padStart(2, "0"));

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/selectUser',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                $("#selectUser").text('');
                $("#selectUser").append('<option value="none">선택</option>')
                for (let i = 0; i < result.rowLength; i++) {
                    // 관리 대상자 option 추가
                    let asListHtml = "<option value='" + result.rows[i].user_code + "'>" + result.rows[i].name + "</option>";
                    $("#selectUser").append(asListHtml);
                }
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

}

/** ================================================================
 *  A/S 등록 버튼 클릭 (모달창 로드, 데이터 세팅)
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */

$("#search-button").on('click', function() {

    if ($("#search-input").val() == '') {
        alert('대상자 이름을 입력해 주세요.');
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/searchUser',
        cmmReqDataObj = {
            searchStr: $("#search-input").val()
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            $("#search-user-list > tbody").html('');
            if (result.rowLength > 0) {
                for (let i = 0; i < result.rowLength; i++) {
                    let appendHtml =
                        "<tr>" +
                        "<td>" + result.rows[i].name + "</td>" +
                        "<td>" + result.rows[i].user_code + "</td>" +
                        "<td>" + result.rows[i].gender + "</td>" +
                        "<td>" + result.rows[i].birth_year.substring(2) + result.rows[i].birth_month + result.rows[i].birth_date + "</td>" +
                        "<td><button class='form-control' onclick='selectUser(\"" + result.rows[i].user_code + "\",\"" + result.rows[i].name + "\");'>선택</button></td>";
                    $("#search-user-list > tbody:last").append(appendHtml);
                }
                $("#search-user-modal").modal();

            } else {
                alert('관리 대상자가 존재하지 않습니다.');
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});


/** ================================================================
 *  관리 대상자 선택
 *  @author SY
 *  @since 2023.04.04
 *  @history 2023.04.04 초기 작성
 *  ================================================================
 */
function selectUser(userCode, name) {
    $("#search-user-modal").modal('hide');
    $("#search-input").val('');
    $("#as-user-code").attr('value', userCode);
    $("#as-modal-title").text(name + "(" + userCode + ") 님의 A/S");
}


/** ================================================================
 *  A/S 등록 버튼 클릭(DB insert)
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */
$("#as-uploadBtn").on('click', function() {

    if ($("#as-user-code").val() == '') {
        alert('관리 대상자를 선택해 주세요.');
        $("#search-input").focus();
        return;
    }
    if ($("#as-datepicker").val() == '') {
        alert("날짜를 선택해 주세요.");
        return;
    }
    if ($("#as-detail").val() == '') {
        alert('A/S 조치 내용을 입력해 주세요.');
        $("#as-detail").focus();
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/uploadAS',
        cmmReqDataObj = {
            as_created_date: $("#as-datepicker").val(),
            as_detail: $("#as-detail").val(),
            user_code: $("#as-user-code").val()
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('등록되었습니다.');
                window.location.reload();
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
})


/** ================================================================
 *  A/S 수정 모달창 세팅
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
function editModal(asNum) {
    $("#as-edit-modal").modal();

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/selectAS',
        cmmReqDataObj = { asNum: asNum },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength == 1) {
                $("#as-title").text(result.rows[0].name + "님의 A/S 수정")
                $("#as-date").text("작성 날짜:" + result.rows[0].as_created_date);
                $("#as-edit-detail").text(result.rows[0].as_detail);
                $("#edit-num").attr('value', result.rows[0].as_num);
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}


/** ================================================================
 *  A/S 수정
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 초기 작성
 *  ================================================================
 */
$("#as-edit-btn").on('click', function() {

    if ($("#as-edit-detail").val() == '') {
        alert('A/S 내용을 입력해 주세요.');
        $("#as-edit-detail").focus();
        return;
    }

    if(!confirm('A/S를 수정하시겠습니까?')){
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/editAS',
        cmmReqDataObj = {
            asNum: $("#edit-num").val(),
            asDetail: $("#as-edit-detail").val()
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.state) {
                alert('수정되었습니다.');
                window.location.reload();
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});


/** ================================================================
 *  A/S 삭제
 *  @author SY
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */
function deleteAS(asNum) {
    if (!confirm("A/S 기록을 삭제하시겠습니까?")) {
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/asList/deleteAS',
        cmmReqDataObj = {
            asNum: asNum
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('삭제되었습니다.');
                window.location.reload();
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}