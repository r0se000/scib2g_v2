/** ================================================================
 *  관리자 조회 페이지 init()
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 초기 작성
 *  ================================================================
 */
function init() {
    setAdiminList(adminList);   // 관리자 목록 세팅
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
        return '관리자 목록.xlsx'; //파일명
    },
    getSheetName: function() {
        return '관리자'; //시트명
    },
    getExcelData: function() {
        return document.getElementById('admin-table'); //TABLE id
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
 *  관리자 목록 세팅
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 초기 작성
 *  userList : 관리 대상자 목록
 *  ================================================================
 */
function setAdiminList(adminList) {

    console.log(adminList);
    $("#search-admin-name").val(''); //검색어 초기화
    $('#adminList').text(''); //테이블 초기화

    if (adminList.rowLength != 0) {
        for (let i = 0; i < adminList.rowLength; i++) {
            let adminListHtml = "<tr class='admin-list'>" +
                "<td>" + adminList.rows[i].a_user_code + "</td>" +
                "<td>" + adminList.rows[i].a_user_account_id + "</td>" +
                "<td>" + adminList.rows[i].a_user_name + "</td>" +
                "<td>" + adminList.rows[i].a_user_phone_first +'-'+ adminList.rows[i].a_user_phone_middle +'-'+ adminList.rows[i].a_user_phone_last +"</td>" +
                "<td>" + adminList.rows[i].address + "</td>";

                if (adminList.rows[i].a_user_address1=='99'&adminList.rows[i].a_user_address2=='99'){   // 마스터 계정인 경우 변경 버튼 X
                    adminListHtml += "<td>-</td></tr>";
                }else{  // 마스터 계정 아닌 경우 변경 버튼 O
                    adminListHtml += "<td> <button class='btn btn-info' onclick='setMaster(\""+adminList.rows[i].a_user_code+"\");'>변경"+"</button></td></tr>";
                }
            $('#adminList').append(adminListHtml);
        }
    }
}


/** ================================================================
 *  이름 검색 폼 enter 이벤트
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 초기 작성
 *  ================================================================
 */
$("#search-admin-name").on('keyup', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $("#searchBtn").click();
    }
})


/** ================================================================
 *  조회 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 초기 작성
 *  ================================================================
 */
$("#searchBtn").on('click', function() {

    if ($("#search-admin-name").val() == '') {
        alert('이름을 입력해 주세요.');
        $("#search-user-name").focus();
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/adminList/searchName',
        cmmReqDataObj = {
            searchStr: $("#search-admin-name").val()
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                setAdiminList(result);
            } else {
                alert('해당하는 이름의 관리자가 존재하지 않습니다.');
                $('#adminList').text(''); // 테이블 초기화
                $("#search-admin-name").val(''); //검색어 초기화
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});


/** ================================================================
 *  마스터 계정 변경
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 초기 작성
 *  ================================================================
 */
function setMaster(adminCode){

    if (!confirm('마스터 계정으로 변경하시겠습니까?')) {
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/adminList/setMaster',
        cmmReqDataObj = {
            adminCode: adminCode,
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            console.log(result);
            if(result.state){
                alert('마스터 계정으로 변경되었습니다.');
                location.reload();
            }
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}