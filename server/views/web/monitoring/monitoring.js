let $clockTarget = $('#clock-target'),
    $detailName = $('#detail-name'),
    $detailBirth = $('#detail-birth'),
    $detailGender = $('#detail-gender'),
    $detailAddress = $('#detail-address'),
    $detailPhone = $('#detail-phone'),
    $detailProtector = $('#detail-protector'),
    $detailStaffName = $('#staff-name');

// 날짜 관련 변수
let date = new Date();
let year = date.getFullYear(),
    month = date.getMonth() + 1,
    nowDate = date.getDate(),
    day = date.getDay();

let today = year + '-' + month + '-' + nowDate;

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

let excelHandler = {
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

function s2ab(s) {
    let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    let view = new Uint8Array(buf); //create uint8array as viewer
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
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

async function init() {
    $clockTarget.html(getTime());
    setInterval(function() {
        $clockTarget.html(getTime());
    }, 1000);

    batchCheck();

    if (userCount != 0) {
        for (let i = 0; i < userCount; i++) {
            let userListHtml = "<tr class='user-list' name='code' id='user" + userList['user' + i].user_code + "'>" +
                "<td id='user-code'>" + userList['user' + i].user_code + "</td>" +
                "<td id='user-name'>" + userList['user' + i].name + "</td>" +
                "<td id='user-birth'>" + userList['user' + i].birth_year + '년 ' + userList['user' + i].birth_month + '월 ' + userList['user' + i].birth_date + '일' + "</td>" +
                "<td id='user-address'>" + userList['user' + i].address_1 + ' ' + userList['user' + i].address_2 + ' ' + userList['user' + i].address_3 + "</td>" +
                "<td id='state'>센서 연결 확인중</td>" +
                "</tr>";
            $('#user-monitoring > tbody:last').append(userListHtml);
        }
    }

    await setInterval(selectMonitoring, 5000);

    if (emer_userCount != 0) {
        for (let i = 0; i < emer_userCount; i++) {
            if (emer_userList['user' + i].time_diff == null) {
                emer_userList['user' + i].time_diff = '-'
            } else if (emer_userList['user' + i].time_diff != null) {
                emer_userList['user' + i].time_diff = second_change(emer_userList['user' + i].time_diff)
            }

            let emer_userListHtml = "<tr> class='emer-user-list' name='code' user-code='" + emer_userList['user' + i].user_code + "' data-toggle='modal' data-target='#user-detail'>" +
                "<td id='user-emergency_id'>" + emer_userList['user' + i].emergency_id + "</td>" +
                "<td id='user-user_name'>" + emer_userList['user' + i].user_name + "</td>" +
                "<td id='user-emergency_time'>" + emer_userList['user' + i].emergency_time + "</td>" +
                "<td id='user-emergency_check_time'>" + emer_userList['user' + i].emergency_check_time + "</td>" +
                "<td id='user-emergency_check_contents'>" + emer_userList['user' + i].emergency_check_contents + "</td>" +
                "<td id='user-emergency_end_time'>" + emer_userList['user' + i].time_diff + "</td>" +
                "</tr>";

            $('#user-table > tbody:last').append(emer_userListHtml);
        }
    }

}

//실시간 데이터 로드
function selectMonitoring() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/monitoring/select/monitoringData',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode,
            selectUserList: userCodeList
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            let monitoringData = JSON.parse(result.monitoringData),
                monitoringLength = Object.keys(monitoringData).length
            for (let i = 0; i < monitoringLength; i++) {
                let selectUserCode = userCodeList[i]
                let rData = monitoringData[selectUserCode][4]

                $('#user' + selectUserCode + '>#state').css("color", "black");
                if (rData[4] == 0) {
                    $('#user' + selectUserCode + '>#state').text('빈 침대')
                } else if (rData[4] == 1) {
                    $('#user' + selectUserCode + '>#state').text('침대 점유')
                } else if (rData[4] == 2) {
                    $('#user' + selectUserCode + '>#state').text('움직임')
                } else if (rData[4] == -1) {
                    $('#user' + selectUserCode + '>#state').text('연결없음')
                    $('#user' + selectUserCode + '>#state').css("color", "red");
                }

            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

function batchCheck() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/monitoring/userBatchCheck',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            today: today
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            if (result.rows[0].cnt != 0) {
                $('#today-batch-check').text('수행완료');
            }
            if (result.rows[0].cnt == 0) {
                $('#today-batch-check').text('수행실패');
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

function batchListPage() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/monitoring/userBatchDetail',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            today: today
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            $('#user-batch-table > tbody').empty()
                // result.rows.i.
            for (let i = 0; i < result.rowLength; i++) {

                if (result.rows[i].batch_check == 'X') {
                    result.rows[i].etc = '데이터 부족'
                } else {
                    result.rows[i].etc = '-'
                }
                let insertHtml = "<tr class='user-list' name='code' user-code='" + result.rows[i].user_code + "'>" +
                    "<td id='batch-user-id'>" + result.rows[i].user_code + "</td>" +
                    "<td id='batch-user-name'>" + result.rows[i].name + "</td>" +
                    "<td id='batch-user-result'>" + result.rows[i].batch_check + "</td>" +
                    "<td id='batch-user-time'>" + result.rows[i].DATE + "</td>" +
                    "<td id='batch-user-etc'>" + result.rows[i].etc + "</td>" +
                    "</tr>";
                $('#user-batch-table > tbody:last').append(insertHtml);
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    $('#batch-detail').modal()
}

// 날짜 조회(버튼)
$('#select_date_button').on('click', function() {
    let trip_start = $('#trip-start').val()
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/monitoring/userBatchDetail',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            today: trip_start
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            $('#user-batch-table > tbody').empty()
                // result.rows.i.
            for (let i = 0; i < result.rowLength; i++) {

                if (result.rows[i].batch_check == 'X') {
                    result.rows[i].etc = '데이터 부족'
                } else {
                    result.rows[i].etc = '-'
                }
                let insertHtml = "<tr class='user-list' name='code' user-code='" + result.rows[i].user_code + "'>" +
                    "<td id='batch-user-id'>" + result.rows[i].user_code + "</td>" +
                    "<td id='batch-user-name'>" + result.rows[i].name + "</td>" +
                    "<td id='batch-user-result'>" + result.rows[i].batch_check + "</td>" +
                    "<td id='batch-user-time'>" + result.rows[i].DATE + "</td>" +
                    "<td id='batch-user-etc'>" + result.rows[i].etc + "</td>" +
                    "</tr>";
                $('#user-batch-table > tbody:last').append(insertHtml);
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    $('#batch-detail').modal()
})

function movePage(emergency_code) {

    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/monitoring/userEmDetail',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            emergency_code: emergency_code,
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            $('#user-detail-table > tbody').empty()
                // result.rows.i.
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
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    $('#user-em-detail').modal()
}

function movePage2(user_sensor_code) {

    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/monitoring/lastSensorTime',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            user_sensor_code: user_sensor_code,
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            $('#user-detail-sensor > tbody').empty()
                // result.rows.i.
            for (let i = 0; i < result.rowLength; i++) {

                if (result.rows[i].bed_state == 0) {
                    result.rows[i].bed_state = '빈 침대'
                } else if (result.rows[i].bed_state == 1) {
                    result.rows[i].bed_state = '침대 점유'
                } else if (result.rows[i].bed_state == 2) {
                    result.rows[i].bed_state = '움직임'
                }

                let insertHtml = "<tr class='user-list' name='code' user-code='" + result.rows[i].emergency_code + "'>" +
                    "<td id='code'>" + result.rows[i].user_code + "</td>" +
                    "<td id='hr'>" + result.rows[i].hr + "</td>" +
                    "<td id='rr'>" + result.rows[i].rr + "</td>" +
                    "<td id='sv'>" + result.rows[i].sv + "</td>" +
                    "<td id='hrv'>" + result.rows[i].hrv + "</td>" +
                    "<td id='ss'>" + result.rows[i].ss + "</td>" +
                    "<td id='state'>" + result.rows[i].bed_state + "</td>" +
                    "<td id='created-time'>" + result.rows[i].created_time + "</td>" +
                    "</tr>";
                $('#user-detail-sensor > tbody:last').append(insertHtml);
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    $('#user-em-sensor').modal()
}



$('#batch-list').on('click', function() {
    batchListPage();
})