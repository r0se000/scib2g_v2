let setTime, hrChart = null,
    rrChart = null,
    svChart = null,
    hrvChart = null;

let selectUser




let cmmContentType = 'application/json', // 콘텐츠 타입 
    cmmType = 'get', // 전송 방식
    cmmUrl = '/api/rtime/rtHistoryChart',
    cmmReqDataObj = { // 서버로 넘겨줄 데이터
        userCode: selectUser,
        setTime: setTime
    },
    cmmAsync = false, // false: 동기식, true: 비동기
    cmmSucc = function(result) {
        console.log(result)
        let historyData = JSON.parse(result.historyData);
        let timeLine = historyData.timeline,
            hrData = historyData.hr,
            rrData = historyData.rr,
            svData = historyData.sv,
            hrvData = historyData.hrv
        if (hrChart != null & rrChart != null & svChart != null & hrvChart != null) {
            hrChart.destroy();
            rrChart.destroy();
            svChart.destroy();
            hrvChart.destroy();
        }
        hrChart = historyChartDraw("#hr-chart-canvas", timeLine, hrData, "#009efb");
        rrChart = historyChartDraw("#rr-chart-canvas", timeLine, rrData, "#26c6da");
        svChart = historyChartDraw("#sv-chart-canvas", timeLine, svData, "#ffbc34");
        hrvChart = historyChartDraw("#hrv-chart-canvas", timeLine, hrvData, "#7460ee");

    },
    cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

function init() {
    let selectOption = ''
    if (pUserCode == '') {

        if (userCount != 0) {
            if (selectUserCode == '') {
                for (let i = 0; i < userCount; i++) {
                    selectOption = "<option value='" + selectuserList['user' + i].user_code + "'>" + selectuserList['user' + i].name + "</option>";
                    $('#user-select').append(selectOption)
                };
            } else {
                for (let i = 0; i < userCount; i++) {
                    selectOption = "<option value='" + selectuserList['user' + i].user_code + "'>" + selectuserList['user' + i].name + "</option>";
                    $('#user-select').append(selectOption)
                };
                $('#user-select').val(selectUserCode)
                selectUser = selectUserCode;
                commAjax(cmmContentType, cmmType, cmmUrl, {
                    userCode: selectUser,
                    setTime: $('#historySelect').val()
                }, cmmAsync, cmmSucc, cmmErr);
            }
        }

    } else {
        selectUser = userCode;
    }
}

$('#user-select').on('change', function() {
    selectUser = $(this).val()
    commAjax(cmmContentType, cmmType, cmmUrl, {
        userCode: selectUser,
        setTime: $('#historySelect').val()
    }, cmmAsync, cmmSucc, cmmErr);
})

$('#historySelect').on('change', function(evnt) {

    switch (evnt.currentTarget.value) {
        case "1":
            setTime = 1;
            commAjax(cmmContentType, cmmType, cmmUrl, {
                userCode: selectUser,
                setTime: setTime
            }, cmmAsync, cmmSucc, cmmErr);
            break;
        case "5":
            setTime = 5;
            commAjax(cmmContentType, cmmType, cmmUrl, {
                userCode: selectUser,
                setTime: setTime
            }, cmmAsync, cmmSucc, cmmErr);
            break;
        case "30":
            setTime = 30;
            commAjax(cmmContentType, cmmType, cmmUrl, {
                userCode: selectUser,
                setTime: setTime
            }, cmmAsync, cmmSucc, cmmErr);
            break;
        case "60":
            setTime = 60;
            commAjax(cmmContentType, cmmType, cmmUrl, {
                userCode: selectUser,
                setTime: setTime
            }, cmmAsync, cmmSucc, cmmErr);
            break;
        case "120":
            setTime = 120;
            commAjax(cmmContentType, cmmType, cmmUrl, {
                userCode: selectUser,
                setTime: setTime
            }, cmmAsync, cmmSucc, cmmErr);
            break;
        case "360":
            setTime = 360;
            commAjax(cmmContentType, cmmType, cmmUrl, {
                userCode: selectUser,
                setTime: setTime
            }, cmmAsync, cmmSucc, cmmErr);
            break;
    };
});


function historyChartDraw(id, timeLine, data, color) {
    let historyChart = new Chart($(id), {
        "type": "line",
        "data": {
            "labels": timeLine,
            "datasets": [{
                "data": data,
                "fill": false,
                "borderColor": color,
                "borderWidth": 0.8,
                "pointRadius": 0,
                "backgroundColor": color,
                "lineTension": 0.8
            }]
        },
        "options": {
            animation: false,
            onClick: null,
            scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
            legend: { display: false }
        }
    });
    return historyChart
}

function historyChartClear(id) {
    new Chart($(id)).clear
}