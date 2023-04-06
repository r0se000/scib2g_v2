let $clockTarget = $('#clock-target'),
    $detailName = $('#detail-name'),
    $detailBirth = $('#detail-birth'),
    $detailGender = $('#detail-gender'),
    $detailAddress = $('#detail-address'),
    $detailPhone = $('#detail-phone'),
    $detailProtector = $('#detail-protector'),
    $detailStaffName = $('#staff-name');

// 엑셀 다운로드
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


// function emergencyCnt() 변수
let date = new Date();
let year = date.getFullYear(),
    month = date.getMonth() + 1,
    nowDate = date.getDate(),
    day = date.getDay();
let start_day = nowDate - day + (day == 0 ? -6 : 1)
if (start_day < 10) {
    start_day = '0' + start_day
}
let end_Day = (nowDate - day + (day == 0 ? -6 : 1)) + 6
if (end_Day < 10) {
    end_Day = '0' + end_Day
}
if (nowDate < 10) {
    nowDate = '0' + nowDate
}

if (month < 10) {
    month = '0' + month
}

let today = year + '-' + month + '-' + nowDate, // 쿼리문 WHERE절에 사용할 값 정의
    week_start = year + '-' + month + '-' + start_day,
    week_end = year + '-' + month + '-' + end_Day,
    month_start = year + '-' + month + '-01',
    month_end = year + '-' + month + '-' + new Date(year, month, 0).getDate(),
    year_start = year + '-01-01',
    year_end = year + '-12-' + new Date(year, 12, 0).getDate();

// week_start ~ week_end가 다음달에 걸쳐 발생할 경우
if (Number(week_end.slice(-2)) > Number(month_end.slice(-2))) {
    week_end = year + '-' + (month + 1) + '-' + ('0' + (Number(week_end.slice(-2)) - Number(month_end.slice(-2)))).slice(-2)
}
// week_start ~ week_end가 다음해에 걸쳐 발생할 경우
if ((Number(week_end.slice(5, 7))) > 12) {
    week_end = (year + 1) + '-01-' + ('0' + (Number(week_end.slice(-2)) - Number(month_end.slice(-2)))).slice(-2)
}

function init() {
    let add_eng = ["seoul", "busan", "daegu", "incheon", "gwangju", "daejeon", "ulsan", "sejong", "gyeonggi", "gangwon", "chungbuk", "chungnam", "jeonbuk", "jeonnam", "gyeongbuk", "gyeongnam", "jeju"]
    let add_kor = ["서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"]
    $('#user-table > tbody > tr').remove();
    if (userCount != 0) {
        for (let i = 0; i < userCount; i++) {
            userList['user' + i].address_1 = add_kor[add_eng.indexOf(userList['user' + i].address_1)]

            if (userList['user' + i].time_diff == null) {
                userList['user' + i].time_diff = '-'
            } else if (userList['user' + i].time_diff != null) {
                userList['user' + i].time_diff = second_change(userList['user' + i].time_diff)
            }
            let userListHtml = "<tr class='user-list' name='code' user-code='" + userList['user' + i].user_code + "'>" +
                "<td id='user-emergency_id'>" + userList['user' + i].emergency_id + "</td>" +
                "<td id='user-user_name'>" + userList['user' + i].user_name + "</td>" +
                "<td id='user-emergency_time'>" + userList['user' + i].emergency_time + "</td>" +
                "<td id='user-emergency_web_check'>" + userList['user' + i].emergency_web_check + "</td>" +
                "<td id='user-emergency_check_contents'>" + userList['user' + i].emergency_check_contents + "</td>" +
                "<td id='user-emergency_end_time'>" + userList['user' + i].time_diff + "</td>" +
                "</tr>";

            $('#user-table > tbody:last').append(userListHtml);
        }
    }
}

// 관리 대상자 이름 조회 버튼
$('.sta-find-btn').on('click', function(evnt) {
    let FindEmerIndex = [];

    for (let i = 0; i < userCount; i++) {
        if ($('#sta-find-name-input').val() == userList['user' + i].user_name) {
            FindEmerIndex.push(userList['user' + i].emergency_id);
        }
    }

    if (FindEmerIndex.length == 0) {
        alert('존재하지 않는 이름입니다.');
        location.reload();
    }

    $('#user-table > tbody').empty();

    for (let i = 0; i < userCount; i++) {
        for (let j = 0; j < FindEmerIndex.length; j++) {
            if (userList['user' + i].emergency_id == FindEmerIndex[j]) {
                let userListHtml =
                    "<tr class='user-list' name='code' user-code='" + userList['user' + i].user_code + "'>" +
                    "<td id='user-emergency_id'>" + userList['user' + i].emergency_id + "</td>" +
                    "<td id='user-user_name'>" + userList['user' + i].user_name + "</td>" +
                    "<td id='user-emergency_time'>" + userList['user' + i].emergency_time + "</td>" +
                    "<td id='user-emergency_web_check'>" + userList['user' + i].emergency_web_check + "</td>" +
                    "<td id='user-emergency_check_contents'>" + userList['user' + i].emergency_check_contents + "</td>" +
                    "<td id='user-emergency_end_time'>" + userList['user' + i].time_diff + "</td>" +
                    "</tr>";

                $('#user-table > tbody:last').append(userListHtml);
            }
        }
    }

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
        return 'emergency_list.xlsx'; //파일명
    },
    getSheetName: function() {
        return 'Table Test Sheet'; //시트명
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

// 날짜 조회(버튼)
$('#select_date_button').on('click', function() {
    let trip_start = $('#trip-start').val(),
        trip_end = $('#trip-end').val();

    if (trip_start > trip_end || trip_start == "" || trip_end == "") {
        alert('검색 범위가 잘못되었습니다.');
        window.location.reload();
    }

    trip_end = trip_end.split('-')[0] + '-' + trip_end.split('-')[1] + '-' + String(Number(trip_end.split('-')[2]));

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/monitList/dateSearch',
        cmmReqDataObj = {
            userCode: userCode,
            accessToken: accessToken,
            trip_start: trip_start,
            trip_end: trip_end
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            let userList = JSON.parse(result.userList),
                userCount = Object.keys(userList).length;

            $('#user-table > tbody > tr').remove();

            if (userCount != 0) {
                for (let i = 0; i < userCount; i++) {

                    if (userList['user' + i].time_diff == null) {
                        userList['user' + i].time_diff = '-'
                    } else if (userList['user' + i].time_diff != null) {
                        userList['user' + i].time_diff = second_change(userList['user' + i].time_diff)
                    }

                    let userListHtml = "<tr class='user-list' name='code' user-code='" + userList['user' + i].user_code + "'>" +
                        "<td id='user-emergency_id'>" + userList['user' + i].emergency_id + "</td>" +
                        "<td id='user-user_name'>" + userList['user' + i].user_name + "</td>" +
                        "<td id='user-emergency_time'>" + userList['user' + i].emergency_time + "</td>" +
                        "<td id='user-emergency_web_check'>" + userList['user' + i].emergency_web_check + "</td>" +
                        "<td id='user-emergency_check_contents'>" + userList['user' + i].emergency_check_contents + "</td>" +
                        "<td id='user-emergency_end_time'>" + userList['user' + i].time_diff + "</td>" +
                        "</tr>";

                    $('#user-table > tbody:last').append(userListHtml);
                }
            }

        },
        cmmErr = function() {
            alert('실패');
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
})

// 응급 통계 결과 출력
function emergencyCnt() {
    let cmmContentType = 'application/json', // ajax를 이용하여 데이터 가져오기
        cmmType = 'post',
        cmmUrl = '/api/monitList/emergencyStatistics',
        cmmReqDataObj = {
            userCode: userCode,
            accessToken: accessToken,
            today: today,
            week_start: week_start,
            week_end: week_end,
            month_start: month_start,
            month_end: month_end,
            year_start: year_start,
            year_end: year_end
        },
        cmmAsync = false,
        cmmSucc = function(result) { // ajax 통신 성공 시 테이블 리스트 재정의
            let emToday = result['emToday'][0].emDate,
                emToweek = result['emToweek'][0].emDate,
                emToMonth = result['emTomonth'][0].emDate,
                emToyear = result['emToyear'][0].emDate,
                emAllCnt = result['emAllCnt'][0].emDate;

            $('#emergency-today').text(emToday + '건'); // 해당 태크에 Text 수정
            $('#emergency-toweek').text(emToweek + '건');
            $('#emergency-tomonth').text(emToMonth + '건');
            $('#emergency-toyear').text(emToyear + '건');
            $('#emergency-all').text(emAllCnt + '건');
        },
        cmmErr = function() {
            alert('실패');
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

function second_change(seconds) {
    let hour = parseInt(seconds / 3600);
    let min = parseInt((seconds % 3600) / 60);
    let sec = seconds % 60;
    let result

    if (hour == 0) {
        result = min + "분" + sec + "초 소요"

        if (min == 0) {
            result = sec + "초 소요"
        }
    } else {
        result = hour + "시" + min + "분" + sec + "초 소요"
    }

    return result
}

let emergencyCode

function movePage(emergency_code) {
    emergencyCode = emergency_code
    $('#st-em-detail').modal();

    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/monitList/userEmDetail',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            emergency_code: emergency_code,
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            $('#user-detail-table > tbody').empty()
            if (result.rowLength != 0) {
                $('#emDetailDownload').prop("disabled", false);
                for (let i = 0; i < result.rowLength; i++) {
                    if (result.rows[i].a_user_name != null) {
                        result.rows[i].user_class = '공무원';
                        result.rows[i].user_name = result.rows[i].a_user_name;
                    }
                    if (result.rows[i].p_user_name != null) {
                        result.rows[i].user_class = '보호자';
                        result.rows[i].user_name = result.rows[i].p_user_name;
                    }

                    let insertHtml = "<tr class='user-list' name='code' user-code='" + result.rows[i].emergency_code + "'>" +
                        "<td id='emergency-id'>" + result.rows[i].emergency_id + "</td>" +
                        "<td id='user-class'>" + result.rows[i].user_class + "</td>" +
                        "<td id='user-name'>" + result.rows[i].user_name + "</td>" +
                        "<td id='emergency-time'>" + result.rows[i].emergency_time + "</td>" +
                        "<td id='emergency-check-time'>" + result.rows[i].emergency_check_time + "</td>" +
                        "</tr>";
                    $('#user-detail-table > tbody:last').append(insertHtml);
                }
            } else {
                $('#emDetailDownload').prop("disabled", true);
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);


}