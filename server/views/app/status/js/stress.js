/** ================================================================
 *  건강 현황 - 스트레스 정보 페이지에서 쓰이는 함수 정의
 * 
 *  관련 화면: stress.html
 *  의존 스크립트: moment.js 
 *  @author JG, Jo
 *  @since 2021.05.18
 *  @history 
 *  ================================================================
 */

/*===============================================*/
/* global variable area                          */
/*===============================================*/
let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat);

let stressChart = null;

const $datePicker = $('#stress-datepicker') // 날짜 선택 입력란
    ,
    $tab = $('[role="tab"]') // 일간/주간/월간/연간 선택 탭
    ,
    $stressScaleTitle = $('#stress-scale-title') // knob chart 제목(스트레스 지수) 
    ,
    $stressKnobArea = $('[data-plugin="knob"]') // 스트레스 원형 차트 영역
    ,
    $stressLevel0 = $('#btn-level0') // 스트레스 지수 '좋음' 표시 버튼
    ,
    $stressLevel1 = $('#btn-level1') // 스트레스 지수 '보통' 표시 버튼
    ,
    $stressLevel2 = $('#btn-level2') // 스트레스 지수 '나쁨' 표시 버튼
    ,
    $stressMin = $('#stress-scale-min') // 최소 스트레스 지수 
    ,
    $stressMax = $('#stress-scale-max') // 최대 스트레스 지수 
    ,
    $stressChartArea = $('#stress-chart-canvas') // 스트레스 차트 영역
    ,
    $chartNoticeArea = $('#chart-notice-area') // 스트레스 차트 설명 영역 
    ,
    $emptyNotice = $('.empty-notice') // '데이터 없음' 안내
    ,
    $allChartCanvas = $('.canvas') // knob, line chart canvas 
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
 * @since 2021.05.20 
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

    if (chartData.stressValues.drawable.toUpperCase() == 'Y') {
        settings.chartType = 'line';
    } else {
        $emptyNotice.show();
    }
    settings.knobArea = $stressKnobArea;
    settings.knobTitle = $stressScaleTitle;
    settings.level0Btn = $stressLevel0;
    settings.level1Btn = $stressLevel1;
    settings.level2Btn = $stressLevel2;
    settings.minValue = $stressMin;
    settings.maxValue = $stressMax;
    settings.canvasArea = $stressChartArea;
    settings.chartNotice = $chartNoticeArea;
    settings.noDataNotice = $emptyNotice;

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
                let chartType = 'line';

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
                let chartType = 'line';

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
            let chartType = 'line';

            dataSettings.startDate = momentObj.startOf('year').format(momentFormat);
            dataSettings.endDate = momentObj.endOf('year').format(momentFormat);
            dataSettings.mode = 'yearly';
            dataSettings.chartType = chartType;

            chartSettings.chartType = chartType;

            $dateInput.val(`${momentObj.year()}`);
            break;
    }

    chartSettings.knobArea = $stressKnobArea;
    chartSettings.knobTitle = $stressScaleTitle;
    chartSettings.level0Btn = $stressLevel0;
    chartSettings.level1Btn = $stressLevel1;
    chartSettings.level2Btn = $stressLevel2;
    chartSettings.minValue = $stressMin;
    chartSettings.maxValue = $stressMax;
    chartSettings.canvasArea = $stressChartArea;
    chartSettings.chartNotice = $chartNoticeArea;
    chartSettings.noDataNotice = $emptyNotice;

    getChart(userCode, dataSettings, chartSettings);
    return;
}


/**
 * 해당 날짜의 스트레스 정보 가져오기
 * @author JG, Jo
 * @since 2021.05.20 
 * @history 
 */
function getChart(userCode, dataSettings, chartSettings) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/status/stress/data',
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
        cmmErr = function() {};
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

/**
 * 데이터 그래프로 출력
 * @params chartData - 그래프 데이터
 * @params settings - 그래프 출력 시 필요한 설정들(object)
 * @author JG, Jo
 * @since 2021.05.20
 * @history 
 */
function drawChart(chartData, settings) {
    let chartType = settings.chartType;

    let $knobArea = settings.knobArea,
        $knobTitle = settings.knobTitle,
        $level0Btn = settings.level0Btn,
        $level1Btn = settings.level1Btn,
        $level2Btn = settings.level2Btn,
        $minValue = settings.minValue,
        $maxValue = settings.maxValue,
        $canvasArea = settings.canvasArea,
        $chartNotice = settings.chartNotice,
        $noDataNotice = settings.noDataNotice;

    let stressValueArr = [],
        timeLineArr = [];

    chartData = chartData.stressValues;

    let stressInfo = chartData.stressInfo;

    $knobArea.show();
    //$knobArea.val(stressInfo.stressScale);
    $knobArea.val(stressInfo.stressAvg);
    //$knobTitle.text(stressInfo.stressScale);
    $knobTitle.text(stressInfo.stressAvg);
    $minValue.text(stressInfo.stressMin);
    $maxValue.text(stressInfo.stressMax);

    if (stressChart != null) {
        stressChart.destroy();
    }

    delete chartData.stressInfo;
    if (chartData.drawable.toUpperCase() == 'Y') {
        delete chartData.drawable;

        let stressLevel = stressInfo.stressLevel;
        let knobColor = '#038fcd';

        if (stressLevel == '0') {
            $level0Btn.show();
            $level1Btn.hide();
            $level2Btn.hide();
        } else if (stressLevel == '1') {
            $level0Btn.hide();
            $level1Btn.show();
            $level2Btn.hide();
            knobColor = '#01c0c8';
        } else if (stressLevel == '2') {
            $level0Btn.hide();
            $level1Btn.hide();
            $level2Btn.show();
            knobColor = '#de4a58';
        }

        for (const item in chartData) {
            let dataObj = chartData[item];

            stressValueArr.push(dataObj.stressValue);
            timeLineArr.push(dataObj.createDate.slice(-5, ));
        }

        if (stressValueArr.length > 0) {
            // stress chart
            stressChart = new Chart($canvasArea, {
                "type": chartType,
                "data": {
                    "labels": timeLineArr,
                    "datasets": [{
                        "data": stressValueArr,
                        "fill": false,
                        "borderColor": "#009efb",
                        "lineTension": 0.5
                    }]
                },
                "options": {
                    legend: { display: false },
                    scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
                }
            });
            //$canvasArea.show();
            $('canvas').show();
        }
        $knobArea.knob();
        $knobArea.trigger('change')
            .trigger('configure', { 'fgColor': knobColor })
            .trigger('draw');
        $knobArea.css('color', knobColor);

        $chartNotice.show();
        $noDataNotice.hide();
    } else {
        //$canvasArea.hide();
        $('canvas').hide();
        $knobArea.hide();
        $level0Btn.hide();
        $level1Btn.hide();
        $level2Btn.hide();
        $chartNotice.hide();
        $noDataNotice.show();
    }
}