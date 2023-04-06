/** ================================================================
 *  건강 현황 -  수면품질 정보 페이지에서 쓰이는 함수 정의
 * 
 *  관련 화면: sleep.html
 *  의존 스크립트: moment.js 
 *  @author JG, Jo
 *  @since 2021.05.21
 *  @history
 *  ================================================================
 */

/*===============================================*/
/* global variable area                          */
/*===============================================*/
let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat);

let sleepChart = null;

const $datePicker = $('#sleep-datepicker') // 날짜 선택 입력란
    ,
    $tab = $('[role="tab"]') // 일간/주간/월간/연간 선택 탭
    ,
    $sleepKnobArea = $('[data-plugin="knob"]') // 총 수면시간 원형 차트 영역
    ,
    $sleepLevel0 = $('#btn-level0') // 수면품질 '좋음' 표시 버튼
    ,
    $sleepLevel1 = $('#btn-level1') // 수면품질 '보통' 표시 버튼
    ,
    $sleepLevel2 = $('#btn-level2') // 수면품질 '나쁨' 표시 버튼
    ,
    $totApneaTimes = $('#total-apnea-times') // 총 무호흡 횟수 
    ,
    $totApneaRate = $('#total-apnea-rate') // 총 무호흡 비율 
    ,
    $totApneaTime = $('#total-apnea-time') // 총 무호흡 시간 
    ,
    $sleepChartArea = $('#sleep-chart-canvas') // 수면품질 차트 영역 
    ,
    $emptyNotice = $('.empty-notice') // '데이터 없음' 안내
;

/*===============================================*/
/* event handler area                            */
/*===============================================*/

// 탭 선택 이벤트
$tab.on('click', function(evnt) {
    let tabId = evnt.currentTarget.id;
    if (pUserCode == '') {
        selectUser = $('#user-select').val();
    } else {
        selectUser = userCode;
    }

    showTabContents(yesterdayStr, dateFormat, tabId, $datePicker);
});

// 날짜 선택 이벤트
$datePicker.on('change', function() {
    let tabId = $tab.filter('.active').attr('id'),
        strDate = $datePicker.val();

    if (pUserCode == '') {
        selectUser = $('#user-select').val();
    } else {
        selectUser = userCode;
    }
    showTabContents(strDate, dateFormat, tabId, $datePicker);
    return;
});
// 사용자 선택 이벤트
$('#user-select').on('change', function() {
    let tabId = $tab.filter('.active').attr('id');
    selectUser = $('#user-select').val();
    showTabContents(yesterdayStr, dateFormat, tabId, $datePicker);
    return;
});

/*===============================================*/
/* function area                                 */
/*===============================================*/
/**
 * 화면 초기화 작업
 * @params chartData - 페이지 초기 실행 시 출력할 chart data
 * @author JG, Jo
 * @since 2021.05.21 
 * @history 
 */
let selectUser

function init(chartData) {
    let selectOption = ''
    if (pUserCode == '') {
        if (userCount != 0) {
            for (let i = 0; i < userCount; i++) {
                selectOption = "<option value='" + selectuserList['user' + i].user_code + "'>" + selectuserList['user' + i].name + "</option>";
                $('select').append(selectOption)
            };
        }
    }

    // MAterial Date picker setting
    $datePicker.bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false,
        format: dateFormat,
        currentDate: yesterdayStr,
        maxDate: yesterdayStr
    });

    let settings = {};
    if (chartData.sleepValues.drawable.toUpperCase() == 'Y') {
        settings.chartType = 'line';
    } else {
        $emptyNotice.show();
    }
    settings.knobArea = $sleepKnobArea;
    settings.level0Btn = $sleepLevel0;
    settings.level1Btn = $sleepLevel1;
    settings.level2Btn = $sleepLevel2;
    settings.totApnTimes = $totApneaTimes;
    settings.totApnRate = $totApneaRate;
    settings.totApnTime = $totApneaTime;
    settings.canvasArea = $sleepChartArea;
    settings.noDataNotice = $emptyNotice;
    settings.mode = 'daily';

    drawChart(chartData, settings);
}

/**
 * 일간/주간/월간/연간 탭 선택에 따라, 기간별 tab-cotents 출력하기
 * 
 * @params strDate - 기준 날짜(string)
 * @params momentFormat - 날짜 형식(string) ex) 'YYYY-MM-DD'
 * @params tabId - 선택된 탭 ID(string)
 * @params $dateInput - datePicker jquery object 
 * @author JG, Jo
 * @since 2021.05.20 
 * @history 
 */
function showTabContents(strDate, momentFormat, tabId, $dateInput) {
    let momentObj = moment(strDate);
    let dataSettings = {},
        chartSettings = {};

    switch (tabId) {
        case 'tab-daily':
            {
                let momentStr = momentObj.format(momentFormat),
                    chartType = 'bar',
                    mode = 'daily';

                dataSettings.startDate = momentStr;
                dataSettings.endDate = momentStr;
                dataSettings.mode = mode;
                dataSettings.chartType = chartType;

                chartSettings.chartType = chartType;
                chartSettings.mode = mode;

                $dateInput.val(momentStr);
                break;
            }
        case 'tab-weekly':
            {
                let chartType = 'bar',
                    mode = 'weekly';

                dataSettings.startDate = momentObj.startOf('isoWeek').format(momentFormat);
                dataSettings.endDate = momentObj.endOf('isoWeek').format(momentFormat);
                dataSettings.mode = mode;
                dataSettings.chartType = chartType;

                chartSettings.chartType = chartType;
                chartSettings.mode = mode;

                $dateInput.val(`${dataSettings.startDate} ~ ${dataSettings.endDate}`);
                break;
            }
        case 'tab-monthly':
            {
                let chartType = 'line',
                    mode = 'monthly';

                dataSettings.startDate = momentObj.startOf('month').format(momentFormat);
                dataSettings.endDate = momentObj.endOf('month').format(momentFormat);
                dataSettings.mode = mode;
                dataSettings.chartType = chartType;

                chartSettings.chartType = chartType;
                chartSettings.mode = mode;

                let month = momentObj.month() + 1,
                    monthStr = (month < 10) ? ('0' + month) : month;
                $dateInput.val(`${momentObj.year()} - ${monthStr}`);
                break;
            }
        case 'tab-yearly':
            let chartType = 'bar',
                mode = 'yearly';

            dataSettings.startDate = momentObj.startOf('year').format(momentFormat);
            dataSettings.endDate = momentObj.endOf('year').format(momentFormat);
            dataSettings.mode = mode;
            dataSettings.chartType = chartType;

            chartSettings.chartType = chartType;
            chartSettings.mode = mode;

            $dateInput.val(`${momentObj.year()}`);
            break;
    }

    chartSettings.knobArea = $sleepKnobArea;
    chartSettings.level0Btn = $sleepLevel0;
    chartSettings.level1Btn = $sleepLevel1;
    chartSettings.level2Btn = $sleepLevel2;
    chartSettings.totApnTimes = $totApneaTimes;
    chartSettings.totApnRate = $totApneaRate;
    chartSettings.totApnTime = $totApneaTime;
    chartSettings.canvasArea = $sleepChartArea;
    chartSettings.noDataNotice = $emptyNotice;

    getChart(userCode, dataSettings, chartSettings);
    return;
}


/**
 * 해당 날짜의 수면품질 정보 가져오기
 * @author JG, Jo
 * @since 2021.05.21 
 * @history 
 */
function getChart(userCode, dataSettings, chartSettings) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/status/sleep/data',
        cmmReqDataObj = {
            userCode: selectUser,
            settings: dataSettings
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.hasOwnProperty('success')) {
                if (result.success == '0') {
                    location.href = '/error/auth?lang=' + lang + '&userCode=' + userCode;
                }
            } else {
                drawChart(result, chartSettings);
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

/**
 * 데이터 그래프로 출력
 * @params chartData - 그래프 데이터
 * @params settings - 그래프 출력 시 필요한 설정들(object)
 * @author JG, Jo
 * @since 2021.05.21
 * @history 
 */
function drawChart(chartData, settings) {
    let chartType = settings.chartType;
    let setmode = settings.mode;

    let $knobArea = settings.knobArea,
        $level0Btn = settings.level0Btn,
        $level1Btn = settings.level1Btn,
        $level2Btn = settings.level2Btn,
        $totApnTimes = settings.totApnTimes,
        $totApnRate = settings.totApnRate,
        $totApnTime = settings.totApnTime,
        $canvasArea = settings.canvasArea,
        $noDataNotice = settings.noDataNotice;
    let apneaRatioArr = [],
        timeLineArr = [];

    chartData = chartData.sleepValues;

    let sleepInfo = chartData.sleepInfo;
    let totSleepTimeMinute = sleepInfo.totSleepTimeMinute;
    totSlTimeHour = Math.floor(totSleepTimeMinute / 60),
        totSlTimeMinute = Math.round(totSleepTimeMinute % 60);
    $knobArea.show();
    $knobArea.val(totSleepTimeMinute);
    $totApnTimes.text(sleepInfo.totApneaCount);
    $totApnRate.text(sleepInfo.totApneaRatio);
    $totApnTime.text(sleepInfo.totApneaTimeMinute);

    if (sleepChart != null) {
        sleepChart.destroy();
    }

    delete chartData.sleepInfo;
    if (chartData.drawable.toUpperCase() == 'Y') {
        delete chartData.drawable;

        let sleepLevel = sleepInfo.sleepLevel;

        if (sleepLevel == '0') {
            $level0Btn.show();
            $level1Btn.hide();
            $level2Btn.hide();
        } else if (sleepLevel == '1') {
            $level0Btn.hide();
            $level1Btn.show();
            $level2Btn.hide();
        } else if (sleepLevel == '2') {
            $level0Btn.hide();
            $level1Btn.hide();
            $level2Btn.show();
        }

        for (const item in chartData) {
            let dataObj = chartData[item];

            apneaRatioArr.push(dataObj.apneaRatio);
            if (settings.mode == "daily") {
                timeLineArr.push(dataObj.createDate.slice(-8, -6));
            } else {
                timeLineArr.push(dataObj.createDate.slice(-8));
            }
        }

        if (apneaRatioArr.length > 0) {
            // sleep chart
            sleepChart = new Chart($canvasArea, {
                "type": chartType,
                "data": {
                    "labels": timeLineArr,
                    "datasets": [{
                        "data": apneaRatioArr,
                        "fill": false,
                        "borderColor": "#8181F7",
                        "backgroundColor": "#8181F7",
                        "lineTension": 0.5
                    }]
                },
                "options": {
                    legend: { display: false },
                    scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                }
            });
            $('canvas').show();
        }

        let mode = settings.mode,
            knobMax = 1440,
            knobColor = '#8181F7';

        switch (mode) {
            case 'weekly':
                knobMax = 1440;
                knobColor = '#8181F7';
                break;
            case 'monthly':
                knobMax = 1440;
                knobColor = '#8181F7';
                break;
            case 'yearly':
                knobMax = 1440;
                knobColor = '#8181F7';
                break;
        }
        $knobArea.knob({ 'max': knobMax });
        $knobArea.trigger('change')
            .trigger('configure', { 'fgColor': knobColor, 'max': knobMax })
            .trigger('draw');
        $knobArea.css('color', knobColor);
        totSlTimeHour = (totSlTimeHour < 10) ? ('0' + totSlTimeHour) : totSlTimeHour;
        totSlTimeMinute = (totSlTimeMinute < 10) ? ('0' + totSlTimeMinute) : totSlTimeMinute;
        $knobArea.val(totSlTimeHour + 'h' + totSlTimeMinute + 'm');
        $knobArea.css('font', 'bold 19px Arial');
        $noDataNotice.hide();
    } else {
        $('canvas').hide();
        $knobArea.hide();
        $level0Btn.hide();
        $level1Btn.hide();
        $level2Btn.hide();
        $noDataNotice.show();
    }
}