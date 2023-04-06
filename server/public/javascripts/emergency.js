let manageUserList
let userListHtml
let emList
let emInsertList
let emInsertCode


setInterval(function() {
    emergencyCheck(manageUserList)
}, 60000);

// setInterval(function() {
//     emergencyAlert(manageUserList)
// }, 30000);

//응급 정보 로드. 해결되지 않은 응급 있는지 확인
function init() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/emergency/emAlertInit',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            emList = result;

            if (result.emergency_id.length != 0) {
                userListHtml = ""
                $('.emergencyArea').css('background-color', "#ffcfcf");
                $('.emergencyArea').addClass('active');
                $('.emergencyArea').removeClass('deactive');
                for (let i = 0; i < result.emergency_id.length; i++) {
                    userListHtml += "<tr onclick='event.cancelBubble = true;' class='em-user-list' " + result.emergency_id[i].emergency_id + " id='emCode" + result.emergency_id[i].emergency_id + "' onclick='event.cancelBubble = true;'>" +
                        "<td id='em-code'>" + result.emergency_user[i] + "</td>" +
                        "<td id='user-name'>" + result.emergency_userInfo[i].user_name + "</td>" +
                        "<td id='user-address'>" + result.emergency_userInfo[i].address_2 + "</td>" +
                        "<td id='em-detail-btn' user-code='" + result.emergency_user[i] + "' em-code='" + result.emergency_id[i].emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-rounded btn-success' id='detail'>세부정보</button></td>" +
                        "<td id='em-check-btn' user-code='" + result.emergency_user[i] + "' em-code='" + result.emergency_id[i].emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-rounded btn-danger' id='check'>알림확인</button></td>" +
                        "</tr>"
                }
                $('#emergencyTable > tbody:last').append(userListHtml);
            } else {
                $('.emergencyArea').removeClass('active');
                $('.emergencyArea').addClass('deactive');
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

function selectNotInsert() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/emergency/emInsertInit',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            emInsertList = result;
            if (result.length != 0) {
                userListHtml = ""
                $('.emergencyAfterArea').css('background-color', "#ffcfcf");
                $('.emergencyAfterArea').addClass('active');
                $('.emergencyAfterArea').removeClass('deactive');
                for (let i = 0; i < result.length; i++) {
                    userListHtml += "<tr onclick='event.cancelBubble = true;' class='em-user-list' " + result[i].emergency_id + " id='emCode" + result[i].emergency_id + "' onclick='event.cancelBubble = true;'>" +
                        "<td id='em-code'>" + result[i].user_code + "</td>" +
                        "<td id='user-name'>" + result[i].name + "</td>" +
                        //"<td id='user-birth'>" + result[i].birth_year + '-' + result[i].birth_month + '-' + result[i].birth_date +"</td>" +
                        "<td id='user-emergency-time'>" + result[i].emergency_time + "</td>" +
                        "<td id='emAfter-detail-btn' user-code='" + result[i].user_code + "' em-code='" + result[i].emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-rounded btn-success' id='AfterDetail'>세부정보</button></td>" +
                        "<td id='emAfter-insert-btn' user-code='" + result[i].user_code + "' em-code='" + result[i].emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-rounded btn-info' id='AfterInsert'>조치입력</button></td>" +
                        "</tr>"
                }
                $('#insertEmergency > tbody:last').append(userListHtml);
            } else {
                $('.emergencyAfterArea').removeClass('active');
                $('.emergencyAfterArea').addClass('deactive');
            }

        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

//관리대상 유저 목록 불러와서 응급 알고리즘 돌리기
function selectUserList() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/emergency/selectUser',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            manageUserList = result

            emergencyCheck(manageUserList)
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

//응급상황 확인 후 응급테이블에 저장
function emergencyCheck(userList) {
    console.log(userList)
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/emergency/emergencyYN',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode,
            userList: userList
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            if (result.emergencyUser.length != 0) {
                emergencyAlert(manageUserList)
            }
            if (result.emergencyNull == 'Y') {
                $('#emergencyTable > tbody').empty();
                $('.emergencyArea').removeClass('active');
                $('.emergencyArea').addClass('deactive');
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

//응급테이블 조회 후 웹알림
function emergencyAlert(userList) {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/emergency/emergencyAlert',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode,
            userList: userList
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            emList = result;
            $('#emergencyTable > tbody').empty();
            if (result.emergency_id != '') {
                userListHtml = ""
                loadSong();
                $('#emergencyTable > tbody').empty();
                $('.emergencyArea').css('background-color', "#ffcfcf");
                $('.emergencyArea').addClass('active');
                $('.emergencyArea').removeClass('deactive');

                for (let i = 0; i < result.emergency_id.length; i++) {
                    userListHtml += "<tr onclick='event.cancelBubble = true;' class='em-user-list' " + result.emergency_id[i].emergency_id + " id='emCode" + result.emergency_id[i].emergency_id + "' onclick='event.cancelBubble = true;'>" +
                        "<td id='em-code'>" + result.emergency_user[i] + "</td>" +
                        "<td id='user-name'>" + result.emergency_userInfo[i].user_name + "</td>" +
                        "<td id='user-address'>" + result.emergency_userInfo[i].address_2 + "</td>" +
                        "<td id='em-detail-btn' user-code='" + result.emergency_user[i] + "' em-code='" + result.emergency_id[i].emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-rounded btn-success' id='detail'>세부정보</button></td>" +
                        "<td id='em-check-btn' user-code='" + result.emergency_user[i] + "' em-code='" + result.emergency_id[i].emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-rounded btn-danger' id='check'>알림확인</button></td>" +
                        "</tr>"
                }
                $('#emergencyTable > tbody:last').append(userListHtml);
            } else {
                $('.emergencyArea').removeClass('active');
                $('.emergencyArea').addClass('deactive');
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 
    if (userList.lenght != 0) {
        commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
}

function td(click) {
    let clickId = click.id;
    let emCode
    switch (clickId) {
        // 조치사항 입력 -> 조치입력
        case 'emAfter-insert-btn':
            emCode = $(click).attr('em-code');
            for (let i = 0; i < emInsertList.length; i++) {
                if (emCode == emInsertList[i].emergency_id) {
                    $('#check-name').text(emInsertList[i].name);
                    $('#check-birth').text(emInsertList[i].birth_year + '-' + emInsertList[i].birth_month + '-' + emInsertList[i].birth_date);
                    $('#check-em-time').text(emInsertList[i].emergency_time);
                    $('#check-em-check-time').text(emInsertList[i].emergency_web_check);
                }
            }
            emInsertCode = emCode;
            $('#check-contents-input').modal();
            break;

            // 조치사항 입력 -> 세부정보
        case 'emAfter-detail-btn':
            emCode = $(click).attr('em-code');
            for (let i = 0; i < emInsertList.length; i++) {
                if (emCode == emInsertList[i].emergency_id) {
                    $('#emAfter-detail-name').text(emInsertList[i].name);
                    $('#emAfter-detail-birth').text(emInsertList[i].birth_year + '-' + emInsertList[i].birth_month + '-' + emInsertList[i].birth_date);
                    $('#emAfter-detail-user').text(emInsertList[i].phone_first + "-" + emInsertList[i].phone_middle + "-" + emInsertList[i].phone_last);
                    $('#emAfter-detail-protector').text(emInsertList[i].protector_phone_first + "-" + emInsertList[i].protector_phone_middle + "-" + emInsertList[i].protector_phone_last);
                    $('#emAfter-detail-em-time').text(emInsertList[i].emergency_time);
                    $('#emAfter-detail-check-time').text(emInsertList[i].emergency_web_check);
                }
            }
            $('#emAfter-detail').modal();
            break;


        case 'em-check-btn':
            emCode = $(click).attr('em-code');
            let cmmContentType = 'application/json', // 콘텐츠 타입 
                cmmType = 'get', // 전송 방식
                cmmUrl = '/api/emergency/emergencyCheck',
                cmmReqDataObj = { // 서버로 넘겨줄 데이터
                    emCode: emCode
                },
                cmmAsync = false, // false: 동기식, true: 비동기
                cmmSucc = function(result) {
                    $("[id=emCode" + result.emCode + "]").remove();
                    location.reload(true);
                },
                cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

            commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

            break;

        case 'em-detail-btn':
            let flag,
                hr = [],
                rr = [],
                ss = [],
                created_time = []

            emCode = $(click).attr('em-code')
            emList.emergency_id.forEach(function(item, index) {
                if (item.emergency_id == emCode)
                    flag = index
            })
            let emUserInfo = emList.emergency_userInfo[flag],
                emInfo = emList.emergency_id[flag]
            $('#em-detail-name').text(emUserInfo.user_name);
            $('#em-detail-birth').text(emUserInfo.user_birth);
            if (emUserInfo.gender == 'M')
                $('#em-detail-gender').text('남')
            else $('#em-detail-gender').text('여');
            $('#em-detail-em-time').text(emInfo.emergency_time);
            $('#em-detail-address').text(emUserInfo.address_2);
            $('#em-detail-user').text(emUserInfo.user_phone);
            $('#em-detail-protector').text(emUserInfo.protector_phone);
            $('#em-detail-staff').text(emUserInfo.staff_name);

            for (let i = 0; i < emUserInfo.emBioInfo.rowLength; i++) {
                let rows = emUserInfo.emBioInfo.rows[i];
                created_time.push(rows.created_time.slice());
                hr.push(rows.hr);
                rr.push(rows.rr);
                ss.push(rows.ss);
            }
            new Chart($('#bioinfo-chart-canvas'), {
                "type": "line",
                "data": {
                    "labels": created_time,
                    "datasets": [{
                        "data": hr,
                        "yAxisID": 'hr',
                        "fill": false,
                        "borderColor": "#009EFB",
                        "backgroundColor": "#009EFB",
                        "lineTension": 0.5
                    }, {
                        "data": rr,
                        "yAxisID": 'rr',
                        "fill": false,
                        "borderColor": "#fec107",
                        "backgroundColor": "#fec107",
                        "lineTension": 0.5
                    }]
                },
                "options": {
                    legend: { display: false },
                    scales: {
                        yAxes: [{
                            id: 'hr',
                            ticks: { beginAtZero: true },
                            position: 'left'
                        }, {
                            id: 'rr',
                            ticks: { beginAtZero: true },
                            position: 'right'
                        }]
                    }
                }
            });
            $('#em-detail').modal();
            $('#bioinfo-chart-canvas').show();

            break;

    }
}

$(".contents-input-btn").on('click', function() {
    let emCode = $(this).attr('em-code'),
        emCheckContents = $('#check-contents').val()

    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'post', // 전송 방식
        cmmUrl = '/api/emergency/emCheckContentsInput',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            emCode: emInsertCode,
            emCheckContents: emCheckContents
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            if (result.succ == 1) {
                alert('등록되었습니다.')
                location.reload(true);
            } else {
                alert('등록에 실패했습니다.')
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 
    if (emCheckContents == 0) {
        alert('다시 선택해주세요');
    } else {
        commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
})