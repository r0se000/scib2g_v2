let $clockTarget = $('#clock-target'),
    $emList = $('#em-list'),
    $checkContents = $('#check-contents-list'),
    emListHtml;

function setDateTime(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let nowhours = getDate.getHours() >= 10 ? getDate.getHours() : '0' + getDate.getHours();
    let nowMinutes = getDate.getMinutes() >= 10 ? getDate.getMinutes() : '0' + getDate.getMinutes();
    let nowSec = getDate.getSeconds() >= 10 ? getDate.getSeconds() : '0' + getDate.getSeconds();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay + " " + nowhours + ':' + nowMinutes + ':' + nowSec;

    return nowtime;
}

function init() {
    $clockTarget.html(getTime());
    setInterval(function() {
        $clockTarget.html(getTime());
    }, 1000);

    if (emergencyList.length != 0) {
        emergencyList.forEach(function(item, index) {
            emListHtml = "<tr onclick='event.cancelBubble = true;' class='em-user-list' " + item.user_code + " id='emCode" + item.emergency_id + "' onclick='event.cancelBubble = true;'>" +
                "<td id='user-name'>" + item.name + "</td>" +
                "<td id='em-time'>" + item.emergency_time + "</td>" +
                "<td id='em-detail-btn' user-code='" + item.user_code + "' em-code='" + item.emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-xs btn-rounded btn-success' id='detail'>세부정보</button>" + "</td>" +
                "<td id='em-check-btn' em-code='" + item.emergency_id + "' onclick='td(this)'>" + "<button type='button' class='btn btn-xs btn-rounded btn-danger' id='clear'>알림확인</button>" +
                "</td></tr>";
            $('#em-list-table > tbody:last').append(emListHtml);
        });
    };

    if (checkList.length != 0) {
        checkList.forEach(function(item, index) {
            checkListHtml = "<tr onclick='event.cancelBubble = true;' class='em-user-list' " + item.user_code + " id='emCode" + item.emergency_id + "' onclick='event.cancelBubble = true;'>" +
                "<td id='user-name'>" + item.name + "</td>" +
                "<td id='em-time'>" + item.emergency_time + "</td>" +
                "<td id='check-detail-btn' user-code='" + item.user_code + "' em-code='" + item.emergency_id + "'onclick='check(this)'>" + "<button type='button' class='btn btn-xs btn-rounded btn-success' id='detail'>세부정보</button>" + "</td>" +
                "<td id='check-check-btn' user-code='" + item.user_code + "' em-code='" + item.emergency_id + "'onclick='check(this)'>" + "<button type='button' class='btn btn-xs btn-rounded btn-danger' id='clear2'>알림확인</button>" + "</td>" +
                "</td></tr>";
            $('#check-list-table > tbody:last').append(checkListHtml);
        });
    };
}

function td(click) {
    let clickId = click.id;
    switch (clickId) {
        case 'em-detail-btn':
            let flag,
                hr = [],
                rr = [],
                ss = [],
                created_time = []
            let emDetailCode = $(click).attr('em-code');
            emDetail.emergency_id.forEach(function(item, index) {
                if (item.emergency_id == emDetailCode)
                    flag = index
            })

            let emUserInfo = emDetail.emergency_userInfo[flag],
                emInfo = emDetail.emergency_id[flag]

            $('#em-detail-name').text(emUserInfo.user_name);
            $('#em-detail-birth').text(emUserInfo.user_birth);
            if (emUserInfo.gender == 'M')
                $('#em-detail-gender').text('남');
            else $('#em-detail-gender').text('여');
            $('#em-detail-em-time').text(emInfo.emergency_time);
            $('#em-detail-address').text(emUserInfo.address_2);
            $('#em-detail-user').text(emUserInfo.user_phone);
            $('#em-detail-protector').text(emUserInfo.protector_phone);
            $('#em-detail-staff').text(emUserInfo.staff_name);

            for (let i = 0; i < emUserInfo.emBioInfo.rowLength; i++) {
                let rows = emUserInfo.emBioInfo.rows[i];
                created_time.push(rows.created_time.slice(11));
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
            // $('#bioinfo-chart-canvas').show();
            break;

        case 'em-check-btn':
            let flag2;
            let emCode = $(click).attr('em-code');

            emDetail.emergency_id.forEach(function(item, index) {
                if (item.emergency_id == emCode)
                    flag2 = index
            })

            let cmmContentType = 'application/json', // 콘텐츠 타입 
                cmmType = 'post', // 전송 방식
                cmmUrl = '/api/p_apphome/emCheckTimeInput',
                cmmReqDataObj = { // 서버로 넘겨줄 데이터
                    emCode: emCode,
                    userCode: userCode,
                    a_user_code: emDetail.emergency_id[flag2].a_user_code,
                    emCheckTime: setDateTime(new Date())
                },
                cmmAsync = false, // false: 동기식, true: 비동기
                cmmSucc = function(result) {
                    if (result.succ == 1) {
                        alert('알림을 확인했습니다.')
                        location.reload(true);
                    } else {
                        alert('이미 알림을 확인했습니다.')
                    }
                },
                cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

            commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);


            break;



    }
}

function check(click) {
    let clickId = click.id;
    switch (clickId) {
        case 'check-detail-btn':
            let selectUserCode = $(click).attr('user-code'),
                selectemCode = $('#check-detail-btn').attr('em-code');

            let cmmContentType = 'application/json', // 콘텐츠 타입 
                cmmType = 'get', // 전송 방식
                cmmUrl = '/api/p_apphome/checkDetail',
                cmmReqDataObj = { // 서버로 넘겨줄 데이터
                    selectemCode: selectemCode,
                    selectUserCode: selectUserCode
                },
                cmmAsync = false, // false: 동기식, true: 비동기
                cmmSucc = function(result) {
                    $('#check-detail-name').text(result.user_name);
                    $('#check-detail-birth').text(result.birth);
                    if (result.gender == 'M') $('#check-detail-gender').text('남')
                    else $('#check-detail-gender').text('여');
                    $('#check-detail-user').text(result.user_phone);
                    $('#check-detail-protector').text(result.protector_phone);
                    $('#check-detail-em-time').text(result.emTime);
                    $('#check-detail-em-check-time').text(result.emCheckTime);
                },
                cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

            commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
            $('#check-contents-detail').modal();
            break;


        case 'check-check-btn':
            let selectemCode2 = $('#check-check-btn').attr('em-code');
            let flag3;

            for (let i = 0; i < checkList.length; i++) {
                if (checkList[i].emergency_id == selectemCode2) {
                    flag3 = i;
                }
            }

            let cmmContentType2 = 'application/json', // 콘텐츠 타입 
                cmmType2 = 'post', // 전송 방식
                cmmUrl2 = '/api/p_apphome/emCheckTimeInput',
                cmmReqDataObj2 = { // 서버로 넘겨줄 데이터
                    emCode: selectemCode2,
                    a_user_code: checkList[flag3].a_user_code,
                    emCheckTime: setDateTime(new Date())
                },
                cmmAsync2 = false, // false: 동기식, true: 비동기
                cmmSucc2 = function(result) {
                    if (result.succ == 1) {
                        alert('알림을 확인했습니다.')
                        location.reload(true);
                    } else {
                        alert('이미 알림을 확인했습니다.')
                    }
                },
                cmmErr2 = null; // 에러 시 실행할 콜백 함수(없으면 null) 

            commAjax(cmmContentType2, cmmType2, cmmUrl2, cmmReqDataObj2, cmmAsync2, cmmSucc2, cmmErr2);

            break;

    }
}