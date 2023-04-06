/** ================================================================
 *  건강 현황 - 질병정보 페이지에서 쓰이는 함수 정의
 * 
 *  관련 화면: disease.html
 *  의존 스크립트: moment.js 
 *  @author JG, Jo
 *  @since 2021.05.11
 *  @history 2021.05.12 JG 일간/주간/월간/연간 질병 예측 정보 조회 기능 구현
 *           2021.05.13 JG 일간/주간/월간/연간 데이터 조회 기능 구현
 *           2021.05.14 JG 일간/주간/월간/연간 데이터 그래프 출력 기능 구현
 *  ================================================================
 */

/*===============================================*/
/* global variable area                          */
/*===============================================*/
let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat);

const $datePicker = $('#disease-datepicker') // 날짜 선택 입력란
    ,
    $tab = $('[role="tab"]') // 일간/주간/월간/연간 선택 탭
    ,
    $dailyDmKnobChartTitle = $('#dm-title') // 당뇨 knob chart title
    ,
    $dailyDmTitleNormal = $('#dm-title-normal'),
    $dailyDmTitleGreat = $('#dm-title-great'),
    $dailyDmTitleBad = $('#dm-title-bad'),
    $dailyDmTitleNone = $('#dm-title-none'),
    $dailyHtKnobChartTitle = $('#ht-title') // 고혈압 knob chart title
    ,
    $dailyHtTitleNormal = $('#ht-title-normal'),
    $dailyHtTitleGreat = $('#ht-title-great'),
    $dailyHtTitleBad = $('#ht-title-bad'),
    $dailyHtTitleNone = $('#ht-title-none'),
    $dailyAfibKnobChartTitle = $('#afib-title') // 심방세동 knob chart title
    ,
    $dailyAfibTitleGreat = $('#afib-title-great'),
    $dailyAfibTitleBad = $('#afib-title-bad'),
    $dailyAfibTitleNone = $('#afib-title-none'),
    $dailyKnobEmptyNotice = $('.empty-notice-daily') // knob chart(일간) '데이터 없음' 안내
    ,
    $weeklyDmLineChart = $('#dm-line-weekly') // 당뇨 line chart(주간)
    ,
    $weeklyHtLineChart = $('#ht-line-weekly') // 고혈압 line chart(주간)
    ,
    $weeklyAfibLineChart = $('#afib-line-weekly') // 심방세동 line chart(주간)
    ,
    $weeklyEmptyNotice = $('.empty-notice-weekly') // line chart(주간) '데이터 없음' 안내
    ,
    $monthlyDmLineChart = $('#dm-line-monthly') // 당뇨 line chart(월간)
    ,
    $monthlyHtLineChart = $('#ht-line-monthly') // 고혈압 line chart(월간)
    ,
    $monthlyAfibLineChart = $('#afib-line-monthly') // 심방세동 line chart(월간)
    ,
    $monthlyEmptyNotice = $('.empty-notice-monthly') // line chart(월간) '데이터 없음' 안내
    ,
    $yearlyDmBarChart = $('#dm-bar') // 당뇨 bar chart(연간)
    ,
    $yearlyHtBarChart = $('#ht-bar') // 고혈압 bar chart(연간)
    ,
    $yearlyAfibBarChart = $('#afib-bar') // 심방세동 bar chart(연간)
    ,
    $yearlyEmptyNotice = $('.empty-notice-yearly') // bar chart(연간) '데이터 없음' 안내
;

/*===============================================*/
/* event handler area                            */
/*===============================================*/

// 탭 선택 이벤트
$tab.on('click', function(evnt) {
    let tabId = evnt.currentTarget.id
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
 * @params isKnobDrawable - 페이지 초기 실행 시 knob 실행 가능 여부 판단('Y'/'N')
 * @author JG, Jo
 * @since 2021.05.11 
 * @history 
 */

let selectUser

function init(isKnobDrawable) {
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

}

/**
 * 일간/주간/월간/연간 탭 선택에 따라, 기간별 tab-cotents 출력하기
 * 
 * @params strDate - 기준 날짜(string)
 * @params momentFormat - 날짜 형식(string) ex) 'YYYY-MM-DD'
 * @params tabId - 선택된 탭 ID(string)
 * @params $dateInput - datePicker jquery object 
 * @author JG, Jo
 * @since 2021.05.13 
 * @history 2021.05.14 JG 그래프 출력 추가
 */
function showTabContents(strDate, momentFormat, tabId, $dateInput) {
    let momentObj = moment(strDate);
    let dataSettings = {},
        chartSettings = {};

    switch (tabId) {
        case 'tab-daily':
            {
                let momentStr = momentObj.format(momentFormat),
                    chartType = 'knob';

                dataSettings.startDate = momentStr;
                dataSettings.endDate = momentStr;
                dataSettings.mode = 'daily';
                dataSettings.chartType = chartType;

                // chartSettings.dmChartArea = $dailyDmKnobChart;
                chartSettings.dmTitle = $dailyDmKnobChartTitle;

                chartSettings.dmTitleNormal = $dailyDmTitleNormal;
                chartSettings.dmTitleGreat = $dailyDmTitleGreat;
                chartSettings.dmTitleBad = $dailyDmTitleBad;
                chartSettings.dmTitleNone = $dailyDmTitleNone;

                // chartSettings.htChartArea = $dailyHtKnobChart;
                chartSettings.htTitle = $dailyHtKnobChartTitle;

                chartSettings.htTitleNormal = $dailyHtTitleNormal;
                chartSettings.htTitleGreat = $dailyHtTitleGreat;
                chartSettings.htTitleBad = $dailyHtTitleBad;
                chartSettings.htTitleNone = $dailyHtTitleNone;

                // chartSettings.afibChartArea = $dailyAfibKnobChart;
                chartSettings.afibTitle = $dailyAfibKnobChartTitle;
                chartSettings.afibTitleGreat = $dailyAfibTitleGreat;
                chartSettings.afibTitleBad = $dailyAfibTitleBad;
                chartSettings.afibTitleNone = $dailyAfibTitleNone;

                chartSettings.noDataNotice = $dailyKnobEmptyNotice;
                // chartSettings.knobs = $dailyKnobChart;
                chartSettings.chartType = chartType;
                $dateInput.val(momentStr);
                break;
            }
        case 'tab-weekly':
            {
                let chartType = 'line';
                dataSettings.startDate = momentObj.startOf('isoWeek').format(momentFormat);
                dataSettings.endDate = momentObj.endOf('isoWeek').format(momentFormat);
                dataSettings.mode = 'weekly';
                dataSettings.chartType = chartType;

                chartSettings.dmChartArea = $weeklyDmLineChart;
                chartSettings.htChartArea = $weeklyHtLineChart;
                chartSettings.afibChartArea = $weeklyAfibLineChart;
                chartSettings.noDataNotice = $weeklyEmptyNotice;
                chartSettings.chartType = chartType;
                $dateInput.val(`${dataSettings.startDate} ~ ${dataSettings.endDate}`);
                break;
            }
        case 'tab-monthly':
            {
                let chartType = 'line';

                dataSettings.startDate = momentObj.startOf('month').format(momentFormat);
                dataSettings.endDate = momentObj.endOf('month').format(momentFormat);
                dataSettings.mode = 'monthly';
                dataSettings.chartType = chartType;

                chartSettings.dmChartArea = $monthlyDmLineChart;
                chartSettings.htChartArea = $monthlyHtLineChart;
                chartSettings.afibChartArea = $monthlyAfibLineChart;
                chartSettings.noDataNotice = $monthlyEmptyNotice;
                chartSettings.chartType = chartType;

                let month = momentObj.month() + 1,
                    monthStr = (month < 10) ? ('0' + month) : month;
                $dateInput.val(`${momentObj.year()} - ${monthStr}`);
                break;
            }
        case 'tab-yearly':
            let chartType = 'line';

            dataSettings.startDate = momentObj.startOf('year').format(momentFormat);
            dataSettings.endDate = momentObj.endOf('year').format(momentFormat);
            dataSettings.mode = 'yearly';
            dataSettings.chartType = chartType;

            chartSettings.dmChartArea = $yearlyDmBarChart;
            chartSettings.htChartArea = $yearlyHtBarChart;
            chartSettings.afibChartArea = $yearlyAfibBarChart;
            chartSettings.noDataNotice = $yearlyEmptyNotice;
            chartSettings.chartType = chartType;

            $dateInput.val(`${momentObj.year()}`);
            break;
    }

    getChart(userCode, dataSettings, chartSettings);

    return;
}


/**
 * 해당 날짜의 질병(당뇨, 고혈압, 심방세동) 예측률 가져오기
 * @author JG, Jo
 * @since 2021.05.13 
 * @history 2021.05.17 JG 사용자 인증 실패 시 error 페이지 이동 로직 추가
 */
function getChart(userCode, dataSettings, chartSettings) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/status/disease/data',
        cmmReqDataObj = {
            userCode: selectUser,
            settings: dataSettings
        },
        cmmAsync = true,
        cmmSucc = function(result) {
            if (result.hasOwnProperty('success')) {
                if (result.success == '0') {
                    location.href = '/error/auth?lang=ko&userCode=' + userCode;
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
 * @since 2021.05.16
 * @history 
 */
function drawChart(chartData, settings) {
    let chartType = settings.chartType;

    let $dmChartArea = settings.dmChartArea,
        $htChartArea = settings.htChartArea,
        $afibChartArea = settings.afibChartArea;

    switch (chartType) {
        case 'knob':
            {
                let $noDataNotice = settings.noDataNotice;
                let data = chartData.diseasePredict;

                if (data.drawable.toUpperCase() == 'Y') {
                    let dmPredict = data.data0.dmPredict,
                        htPredict = data.data0.htPredict,
                        htlPredict = data.data0.htlPredict,
                        tPredict = data.data0.tPredict,
                        bPredict = data.data0.bPredict;

                    let dlev = data.data0.dlev,
                        hlev = data.data0.hlev,
                        alev = data.data0.alev

                    if (dlev == 0) {
                        settings.dmTitleNormal.css('display', 'none');
                        settings.dmTitleGreat.css('display', 'block');
                        settings.dmTitleBad.css('display', 'none');
                        settings.dmTitleNone.css('display', 'none');
                    } else if (dlev == 1) {
                        settings.dmTitleNormal.css('display', 'block');
                        settings.dmTitleGreat.css('display', 'none');
                        settings.dmTitleBad.css('display', 'none');
                        settings.dmTitleNone.css('display', 'none');
                    } else {
                        settings.dmTitleNormal.css('display', 'none');
                        settings.dmTitleGreat.css('display', 'none');
                        settings.dmTitleBad.css('display', 'block');
                        settings.dmTitleNone.css('display', 'none');
                    }
                    // settings.dmTitle.text(dmPredict + '%');
                    // $dmChartArea.val(dmPredict);

                    if (hlev == 0) {
                        settings.htTitleNormal.css('display', 'none');
                        settings.htTitleGreat.css('display', 'block');
                        settings.htTitleBad.css('display', 'none');
                        settings.htTitleNone.css('display', 'none');
                    } else if (hlev == 1) {
                        settings.htTitleNormal.css('display', 'block');
                        settings.htTitleGreat.css('display', 'none');
                        settings.htTitleBad.css('display', 'none');
                        settings.htTitleNone.css('display', 'none');
                    } else {
                        settings.htTitleNormal.css('display', 'none');
                        settings.htTitleGreat.css('display', 'none');
                        settings.htTitleBad.css('display', 'block');
                        settings.htTitleNone.css('display', 'none');
                    }
                    // settings.htTitle.text(htPredict + '%');
                    // $htChartArea.val(htPredict);

                    if (dmPredict != null) {
                        $('.drate').text(dmPredict);
                    } else {
                        $('.drate').text('-');
                    }

                    if (htPredict != null) {
                        $('.hrate').text(htPredict);
                    } else {
                        $('.hrate').text('-');
                    }

                    if (htlPredict != null) {
                        $('.hlrate').text(htlPredict);
                    } else {
                        $('.hlrate').text('-');
                    }

                    // if (alev == 0) {
                    //     settings.afibTitleGreat.css('display', 'block');
                    //     settings.afibTitleBad.css('display', 'none');
                    //     settings.afibTitleNone.css('display', 'none');
                    // } else {
                    //     settings.afibTitleGreat.css('display', 'none');
                    //     settings.afibTitleBad.css('display', 'block');
                    //     settings.afibTitleNone.css('display', 'none');
                    // }
                    // settings.afibTitle.text(afibPredict + '%');
                    // $afibChartArea.val(afibPredict);
                    // $('.arate').val(afibPredict);

                    $('.tratio').text(tPredict + " %");
                    $('.bratio').text(bPredict + " %");

                    // $dmChartArea.show();
                    // $htChartArea.show();
                    // $afibChartArea.show();
                    // $('canvas').show();

                    $noDataNotice.hide();
                } else {
                    settings.dmTitle.text('-');
                    settings.htTitle.text('-');
                    settings.afibTitle.text('-');
                    settings.afibTitleGreat.css('display', 'none');
                    settings.afibTitleBad.css('display', 'none');
                    settings.afibTitleNone.css('display', 'block');
                    settings.htTitleNormal.css('display', 'none');
                    settings.htTitleGreat.css('display', 'none');
                    settings.htTitleBad.css('display', 'none');
                    settings.htTitleNone.css('display', 'block');
                    settings.dmTitleNormal.css('display', 'none');
                    settings.dmTitleGreat.css('display', 'none');
                    settings.dmTitleBad.css('display', 'none');
                    settings.dmTitleNone.css('display', 'block');
                    $('.drate').text('-');
                    $('.hrate').text('-');
                    $('.hlrate').text('-');
                    $('.tratio').text('-');
                    $('.bratio').text('-');

                    // $dmChartArea.hide();
                    // $htChartArea.hide();
                    // $afibChartArea.hide();
                    // $('canvas').hide();

                    $noDataNotice.show();
                }
                break;
            }
        case 'line':
            {
                let data = chartData.diseasePredict,
                    dmPredictArr = [],
                    htPredictArr = [],
                    htlPredictArr = [],
                    // afibPredictArr = [],
                    tPredictArr = [],
                    bPredictArr = [],
                    dmClassArr = [],
                    htClassArr = [],
                    // afibClassArr = [],
                    timeLineArr = [];

                if (data.drawable.toUpperCase() == 'Y') {
                    delete data.drawable;
                    for (const item in data) {
                        let dataObj = data[item];

                        dmPredictArr.push(dataObj.dmPredict);
                        htPredictArr.push(dataObj.htPredict);
                        htlPredictArr.push(dataObj.htlPredict);
                        // afibPredictArr.push(dataObj.afibPredict);
                        tPredictArr.push(dataObj.tPredict);
                        bPredictArr.push(dataObj.bPredict);
                        dmClassArr.push(dataObj.dlev);
                        htClassArr.push(dataObj.hlev);
                        // afibClassArr.push(dataObj.alev);
                        timeLineArr.push(dataObj.createDate.slice(-5));
                    }

                    if (dmPredictArr.length > 0 && htPredictArr.length > 0 && htlPredictArr.length > 0 && tPredictArr.length > 0 && bPredictArr.length > 0) {
                        // 당뇨 line chart
                        new Chart($dmChartArea, {
                            "type": chartType,
                            "data": {
                                "labels": timeLineArr,
                                "datasets": [{
                                    "data": dmPredictArr,
                                    "fill": false,
                                    "borderColor": "#01c0c8",
                                    "lineTension": 0
                                }]
                            },
                            "options": {
                                legend: { display: false },
                                scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                            }
                        });
                        $dmChartArea.show();

                        // 고혈압 line chart
                        new Chart($htChartArea, {
                            "type": chartType,
                            "data": {
                                "labels": timeLineArr,
                                "datasets": [{
                                    "label": htp, //최고혈압
                                    "yAxisID": 'htp',
                                    "data": htPredictArr,
                                    "fill": false,
                                    "borderColor": "#fec107",
                                    "backgroundColor": "#fec107",
                                    "lineTension": 0
                                }, {
                                    "label": htlp, //최저혈압
                                    "yAxisID": 'htlp',
                                    "data": htlPredictArr,
                                    "fill": false,
                                    "borderColor": "#00b82b",
                                    "backgroundColor": "#00b82b",
                                    "lineTension": 0
                                }]
                            },
                            "options": {
                                // legend: { display: false },
                                scales: {
                                    yAxes: [{
                                        id: 'htp',
                                        ticks: { beginAtZero: true },
                                        position: 'left'
                                    }, {
                                        id: 'htlp',
                                        ticks: { beginAtZero: true },
                                        position: 'right'
                                    }]
                                }
                            }
                        });
                        $htChartArea.show();

                        // 심방세동 line chart
                        new Chart($afibChartArea, {
                            "type": chartType,
                            "data": {
                                "labels": timeLineArr,
                                "datasets": [{
                                    "label": graphtratio,
                                    "yAxisID": 'Tachycardia',
                                    "data": tPredictArr,
                                    "fill": false,
                                    "borderColor": "#e48ce4",
                                    "backgroundColor": "#e48ce4",
                                    "lineTension": 0
                                }, {
                                    "label": graphbratio,
                                    "yAxisID": 'Bradycardia',
                                    "data": bPredictArr,
                                    "fill": false,
                                    "borderColor": "#8ca9e4",
                                    "backgroundColor": "#8ca9e4",
                                    "lineTension": 0
                                }]
                            },
                            "options": {
                                // legend: { display: false },
                                scales: {
                                    yAxes: [{
                                        id: 'Tachycardia',
                                        ticks: { beginAtZero: true },
                                        position: 'left'
                                    }, {
                                        id: 'Bradycardia',
                                        ticks: { beginAtZero: true },
                                        position: 'right'
                                    }]
                                }
                            }
                        });
                        $afibChartArea.show();
                    }
                    settings.noDataNotice.hide();
                } else {
                    $('canvas').hide();
                    settings.noDataNotice.show();
                }
                break;
            }
        case 'bar':
            {
                let data = chartData.diseasePredict,
                    dmPredictArr = [],
                    htPredictArr = [],
                    afibPredictArr = [],
                    timeLineArr = [];

                if (data.drawable.toUpperCase() == 'Y') {
                    delete data.drawable;
                    for (const item in data) {
                        let dataObj = data[item];

                        dmPredictArr.push(dataObj.dmPredict);
                        htPredictArr.push(dataObj.htPredict);
                        afibPredictArr.push(dataObj.afibPredict);

                        timeLineArr.push(dataObj.createDate.slice(0, 7));
                    }

                    if (dmPredictArr.length > 0 && htPredictArr.length > 0 && afibPredictArr.length > 0) {
                        // 당뇨 line chart
                        new Chart($dmChartArea, {
                            "type": chartType,
                            "data": {
                                "labels": timeLineArr,
                                "datasets": [{
                                    "data": dmPredictArr,
                                    "fill": false,
                                    "borderColor": "#01c0c8",
                                    "backgroundColor": "#01c0c8",
                                    "lineTension": 0
                                }]
                            },
                            "options": {
                                legend: { display: false },
                                scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                            }
                        });
                        $dmChartArea.show();

                        // 고혈압 line chart
                        new Chart($htChartArea, {
                            "type": chartType,
                            "data": {
                                "labels": timeLineArr,
                                "datasets": [{
                                    "data": htPredictArr,
                                    "fill": false,
                                    "borderColor": "#fec107",
                                    "backgroundColor": "#fec107",
                                    "lineTension": 0
                                }]
                            },
                            "options": {
                                legend: { display: false },
                                scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                            }
                        });
                        $htChartArea.show();

                        // 심방세동 line chart
                        new Chart($afibChartArea, {
                            "type": chartType,
                            "data": {
                                "labels": timeLineArr,
                                "datasets": [{
                                    "data": afibPredictArr,
                                    "fill": false,
                                    "borderColor": "#e48ce4",
                                    "backgroundColor": "#e48ce4",
                                    "lineTension": 0
                                }]
                            },
                            "options": {
                                legend: { display: false },
                                scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                            }
                        });
                        $afibChartArea.show();
                    }
                    settings.noDataNotice.hide();
                } else {
                    $('canvas').hide();
                    settings.noDataNotice.show();
                }
                break;
            }
    }


}