let $clockTarget = $('#clock-target');

// 날짜 관련 변수
let now = new Date();
let yesterday = new Date(now.setDate(now.getDate() - 1));

function getToday(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay;

    return nowtime
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
        return '관리 대상자 건강상태.xlsx'; //파일명
    },
    getSheetName: function() {
        return '건강상태'; //시트명
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
 *  건강상태 페이지 init()
 *  @author SY
 *  @since 2023.03.27
 *  @history 2023.03.27 초기 작성
 *  ================================================================
 */
function init() {

    // 현재 시간 실시간 세팅
    $clockTarget.html(getTime());
    setInterval(function() {
        $clockTarget.html(getTime());
    }, 1000);
    // 어제 날짜 세팅
    $("#trip-start").val(yesterday.getFullYear() + "-" + String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + String(yesterday.getDate()).padStart(2, "0"));
    // 오늘 이후의 날짜를 비활성화
    $("#trip-start").attr('max', yesterday.getFullYear() + "-" + String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + String(yesterday.getDate()).padStart(2, "0"));


    // 관리 대상자 목록 세팅
    setUserList(userList, '전체');
}


/** ================================================================
 *  관리 대상자 목록 세팅
 *  @author SY
 *  @since 2023.03.27
 *  @history 2023.03.27 초기 작성
 *  userList : 관리 대상자 목록
 *  select : 건강지수(전체, 좋음, 보통, 나쁨) 선택한 텍스트
 *  ================================================================
 */
function setUserList(userList, select) {

    let safetyCnt = 0, //안심(좋음)
        concernCnt = 0, //관심(보통)
        carefulCnt = 0; //주의(나쁨)


    $('#userlist').text(''); //테이블 초기화

    let health_index_content = '';
    if (userList.rowLength != 0) {
        for (let i = 0; i < userList.rowLength; i++) {
            if (select != '전체' && userList.rows[i].health_index_range != select) {    // 좋음, 보통, 나쁨으로 조회한 경우
                continue;
            }
            /*
                건강지수
                81~100 좋음
                41~80 보통
                0~40 나쁨
            */
            if (userList.rows[i].health_index >= 81) {
                health_index_content = ' (좋음)';
                safetyCnt++;
            } else if (userList.rows[i].health_index >= 41) {
                health_index_content = ' (보통)';
                concernCnt++;
            } else if (userList.rows[i].health_index == '-') {
                health_index_content = ''
            } else {
                health_index_content = ' (나쁨)';
                carefulCnt++;
            }

            let userListHtml = "<tr class='user-list' id='" + userList.rows[i].user_code + "'data-toggle='modal' data-target='#user-detail'>" +
                "<td id='user-name'>" + userList.rows[i].name + "</td>" +
                "<td id='user-code'>" + userList.rows[i].user_code + "</td>" +
                "<td id='user-hr'>" + userList.rows[i].hr + "</td>" +
                "<td id='user-health-index'>" + userList.rows[i].health_index + health_index_content + "</td>" +
                "<td id='user-date'>" + userList.rows[i].created_time + "</td>" +
                "</tr>"
            $('#userlist').append(userListHtml);
        }
    }
    // 건강지수 좋음, 보통, 나쁨 인원수 세팅
    $('#safety-cnt').text(safetyCnt + '명');
    $('#concern-cnt').text(concernCnt + '명');
    $('#careful-cnt').text(carefulCnt + '명');
}


/** ================================================================
 *  조회 버튼 클릭 이벤트
 *  @author SY
 *  @since 2023.03.27
 *  @history 2023.03.27 초기 작성
 *  ================================================================
 */
$('#select_date_button').on('click', function() {
    let trip_start = $('#trip-start').val(); // 선택한 날짜
    let health_index_select = $("#classify-category").children(':selected').val(); // 선택한 건강지수 구분

    if (trip_start == "") {
        alert('날짜를 선택해 주세요.');
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/health/dateSearch',
        cmmReqDataObj = {
            userCode: userCode,
            trip_start: trip_start
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowLength > 0) {
                setUserList(result, health_index_select); // 관리 대상자 목록 세팅
            } else {
                $("#userlist").text('');
                // 건강지수 좋음, 보통, 나쁨 인원수 세팅
                $('#safety-cnt').text(0 + '명');
                $('#concern-cnt').text(0 + '명');
                $('#careful-cnt').text(0 + '명');
                alert("데이터가 존재하지 않습니다.");
            }
        },
        cmmErr = function() {
            alert('실패');
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
})