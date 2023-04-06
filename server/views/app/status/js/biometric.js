/** ================================================================
 *  건강 현황 - 생체정보 페이지에서 쓰이는 함수 정의
 * 
 *  관련 화면: biometric.html
 *  의존 스크립트: moment.js 
 *  @author JG, Jo
 *  @since 2021.05.17
 *  @history 
 *  ================================================================
 */

/*===============================================*/
/* global variable area                          */
/*===============================================*/
let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat);

let hrChart = null,
    rrChart = null,
    svChart = null,
    hrvChart = null;

const $datePicker = $('#biometric-datepicker') // 날짜 선택 입력란
    ,
    $tab = $('[role="tab"]') // 일간/주간/월간/연간 선택 탭
    ,
    $allChart = $('canvas') // 모든 차트 영역
    ,
    $hrChartArea = $('#hr-chart-canvas') // 심박수 차트 영역
    ,
    $hrAvgTitle = $('#hr-avg') // 심박수 평균 
    ,
    $rrChartArea = $('#rr-chart-canvas') // 호흡수 차트 영역
    ,
    $rrAvgTitle = $('#rr-avg') // 호흡수 평균  
    ,
    $svChartArea = $('#sv-chart-canvas') // 심박출량 차트 영역
    ,
    $svAvgTitle = $('#sv-avg') // 심박출량 평균 
    ,
    $hrvChartArea = $('#hrv-chart-canvas') // 심박변이도 차트 영역
    ,
    $hrvAvgTitle = $('#hrv-avg') // 심박변이도 평균 
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
 * @since 2021.05.17 
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
    settings.hrChartTitle = $hrAvgTitle;
    settings.rrChartTitle = $rrAvgTitle;
    settings.svChartTitle = $svAvgTitle;
    settings.hrvChartTitle = $hrvAvgTitle
    settings.allChart = $allChart;
    settings.noDataNotice = $emptyNotice;

    if (chartData.biometricAvg.drawable.toUpperCase() == 'Y') {
        settings.chartType = 'line';
        settings.hrChartArea = $hrChartArea;
        settings.rrChartArea = $rrChartArea;
        settings.svChartArea = $svChartArea;
        settings.hrvChartArea = $hrvChartArea;

    } else {
        $emptyNotice.show();
        settings.allChart.hide();
        settings.noDataNotice.show();
    }


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
 * @since 2021.05.17 
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
                    chartType = 'line';

                dataSettings.startDate = momentStr;
                dataSettings.endDate = momentStr;
                dataSettings.mode = 'daily';
                dataSettings.chartType = chartType;

                chartSettings.chartType = chartType;

                $dateInput.val(momentStr);
                break;
            }
        case 'tab-weekly':
            {
                let chartType = 'bar';

                dataSettings.startDate = momentObj.startOf('isoWeek').format(momentFormat);
                dataSettings.endDate = momentObj.endOf('isoWeek').format(momentFormat);
                dataSettings.mode = 'weekly';
                dataSettings.chartType = chartType;

                chartSettings.chartType = chartType;

                $dateInput.val(`${dataSettings.startDate} ~ ${dataSettings.endDate}`);
                break;
            }
        case 'tab-monthly':
            {
                let chartType = 'bar';

                dataSettings.startDate = momentObj.startOf('month').format(momentFormat);
                dataSettings.endDate = momentObj.endOf('month').format(momentFormat);
                dataSettings.mode = 'monthly';
                dataSettings.chartType = chartType;

                chartSettings.chartType = chartType;

                let month = momentObj.month() + 1,
                    monthStr = (month < 10) ? ('0' + month) : month;
                $dateInput.val(`${momentObj.year()} - ${monthStr}`);
                break;
            }
        case 'tab-yearly':
            let chartType = 'bar';

            dataSettings.startDate = momentObj.startOf('year').format(momentFormat);
            dataSettings.endDate = momentObj.endOf('year').format(momentFormat);
            dataSettings.mode = 'yearly';
            dataSettings.chartType = chartType;

            chartSettings.chartType = chartType;

            $dateInput.val(`${momentObj.year()}`);
            break;
    }

    chartSettings.hrChartArea = $hrChartArea;
    chartSettings.rrChartArea = $rrChartArea;
    chartSettings.svChartArea = $svChartArea;
    chartSettings.hrvChartArea = $hrvChartArea;
    chartSettings.hrChartTitle = $hrAvgTitle;
    chartSettings.rrChartTitle = $rrAvgTitle;
    chartSettings.svChartTitle = $svAvgTitle;
    chartSettings.hrvChartTitle = $hrvAvgTitle
    chartSettings.allChart = $allChart;
    chartSettings.noDataNotice = $emptyNotice;

    getChart(userCode, dataSettings, chartSettings);

    return;
}


/**
 * 해당 날짜의 생체정보(심박수, 호흡수, 심박출량, 심박변이도) 가져오기
 * @author JG, Jo
 * @since 2021.05.17 
 * @history 
 */
function getChart(userCode, dataSettings, chartSettings) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/status/biometric/data',
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
 * @since 2021.05.17
 * @history 2021.05.18 JG chart object 이전 데이터로 인한 버그 수정
 */
function drawChart(chartData, settings) {
    if (chartData.biometricAvg.drawable.toUpperCase() == 'Y') {
        let chartType = settings.chartType;
        let $hrChartArea = settings.hrChartArea,
            $hrAvgTitle = settings.hrChartTitle,
            $rrChartArea = settings.rrChartArea,
            $rrAvgTitle = settings.rrChartTitle,
            $svChartArea = settings.svChartArea,
            $svAvgTitle = settings.svChartTitle,
            $hrvChartArea = settings.hrvChartArea,
            $hrvAvgTitle = settings.hrvChartTitle;

        let hrAvgArr = [],
            rrAvgArr = [],
            svAvgArr = [],
            hrvAvgArr = [],
            timeLineArr = [];

        chartData = chartData.biometricAvg

        let avgTot = chartData.avgTot;
        $hrAvgTitle.text(avgTot.hrAvgTot);
        $rrAvgTitle.text(avgTot.rrAvgTot);
        $svAvgTitle.text(avgTot.svAvgTot);
        $hrvAvgTitle.text(avgTot.hrvAvgTot);

        if (hrChart != null && rrChart != null &&
            svChart != null && hrvChart != null) {
            hrChart.destroy();
            rrChart.destroy();
            svChart.destroy();
            hrvChart.destroy();
        }

        delete chartData.avgTot;
        if (chartData.drawable.toUpperCase() == 'Y') {
            delete chartData.drawable;
            for (const item in chartData) {
                let dataObj = chartData[item];

                hrAvgArr.push(dataObj.hrAvg);
                rrAvgArr.push(dataObj.rrAvg);
                svAvgArr.push(dataObj.svAvg);
                hrvAvgArr.push(dataObj.hrvAvg);

                timeLineArr.push(dataObj.createDate.slice(-5));
            }

            if (hrAvgArr.length > 0 && rrAvgArr.length > 0 &&
                svAvgArr.length > 0 && hrvAvgArr.length > 0) {
                // hr chart
                hrChart = new Chart($hrChartArea, {
                    "type": chartType,
                    "data": {
                        "labels": timeLineArr,
                        "datasets": [{
                            "data": hrAvgArr,
                            "fill": false,
                            "borderColor": "#009efb",
                            "backgroundColor": "#009efb",
                            "lineTension": 0.5
                        }]
                    },
                    "options": {
                        legend: { display: false },
                        scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                    }
                });
                $hrChartArea.show();

                // rr chart
                rrChart = new Chart($rrChartArea, {
                    "type": chartType,
                    "data": {
                        "labels": timeLineArr,
                        "datasets": [{
                            "data": rrAvgArr,
                            "fill": false,
                            "borderColor": "#26c6da",
                            "backgroundColor": "#26c6da",
                            "lineTension": 0.5
                        }]
                    },
                    "options": {
                        legend: { display: false },
                        scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                    }
                });
                $rrChartArea.show();

                // sv chart
                svChart = new Chart($svChartArea, {
                    "type": chartType,
                    "data": {
                        "labels": timeLineArr,
                        "datasets": [{
                            "data": svAvgArr,
                            "fill": false,
                            "borderColor": "#ffbc34",
                            "backgroundColor": "#ffbc34",
                            "lineTension": 0.5
                        }]
                    },
                    "options": {
                        legend: { display: false },
                        scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                    }
                });
                $svChartArea.show();

                // hrv chart
                hrvChart = new Chart($hrvChartArea, {
                    "type": chartType,
                    "data": {
                        "labels": timeLineArr,
                        "datasets": [{
                            "data": hrvAvgArr,
                            "fill": false,
                            "borderColor": "#7460ee",
                            "backgroundColor": "#7460ee",
                            "lineTension": 0.5
                        }]
                    },
                    "options": {
                        legend: { display: false },
                        scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                    }
                });
                $hrvChartArea.show();
            }

            settings.noDataNotice.hide();
        }
    } else {
        $hrAvgTitle.text('-');
        $rrAvgTitle.text('-');
        $svAvgTitle.text('-');
        $hrvAvgTitle.text('-');
        settings.allChart.hide();
        settings.noDataNotice.show();
    }
}