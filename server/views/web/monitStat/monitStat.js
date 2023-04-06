let $clockTarget = $('#clock-target'),
    $detailName = $('#detail-name'),
    $detailBirth = $('#detail-birth'),
    $detailGender = $('#detail-gender'),
    $detailAddress = $('#detail-address'),
    $detailPhone = $('#detail-phone'),
    $detailProtector = $('#detail-protector'),
    $detailStaffName = $('#staff-name');

// function emergencyCnt() 변수
let date = new Date();
let year = date.getFullYear(),
    month = date.getMonth() + 1,
    nowDate = date.getDate(),
    day = date.getDay();
if (nowDate < 10) {
    nowDate = '0' + nowDate
}
if (month < 10) {
    month = '0' + month
}

// 날짜 범위 쿼리문 WHERE절에 사용할 값 정의
let today = year + '-' + month + '-' + nowDate,
    week_start = year + '-' + month + '-' + ('0' + String(nowDate - day + (day == 0 ? -6 : 1))).slice(-2),
    week_end = year + '-' + month + '-' + ('0' + ((nowDate - day + (day == 0 ? -6 : 1)) + 6)).slice(-2),
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

// 응급발생건수 hover css 변경 함수
$('.emCnt').hover(function() {
    $(this).css("background-color", "#f7e3d9"); // hover 배경
    $(this).css("border-radius", "5%"); // div radius
}, function() {
    $(this).css("background-color", "white");
});

// 응급 통계 결과 출력
function emergencyCnt(start, end) {
    trip_start = $('#trip-start').val();
    trip_end = $('#trip-end').val();
    selGen = selectGender($('#gender-category').val());
    selAge = $('#age-category').val();

    if (trip_start == "" | trip_start == "") { // 날짜 범위를 지정하지 않으면 금주 응급 발생 데이터를 그래프로 출력(초기화면을 위한 조건문)
        trip_start = week_start;
        trip_end = week_end;
    } else if (start != null | end != null) {
        trip_start = start;
        trip_end = end;
    } else if (trip_start > trip_end) {
        alert('검색 범위가 잘못되었습니다.');
        location.reload();
    }

    let cmmContentType = 'application/json', // ajax를 이용하여 데이터 가져오기
        cmmType = 'post',
        cmmUrl = '/api/monitStat/graphStatistics',
        cmmReqDataObj = {
            userCode: userCode,
            accessToken: accessToken,
            today: today,
            week_start: week_start,
            week_end: week_end,
            month_start: month_start,
            month_end: month_end,
            year_start: year_start,
            year_end: year_end,
            trip_start: trip_start,
            trip_end: trip_end,
            selGen: selGen,
            selAge: selAge
        },
        cmmAsync = false,
        cmmSucc = function(result) { // ajax 통신 성공 시 테이블 리스트 재정의
            let emToday = result['emToday'][0].emDate,
                emToweek = result['emToweek'][0].emDate,
                emToMonth = result['emTomonth'][0].emDate,
                emToyear = result['emToyear'][0].emDate,
                emAllCnt = result['emAllCnt'][0].emDate;

            let emDayOfWeek_monday = 0,
                emDayOfWeek_tuesday = 0,
                emDayOfWeek_wednesday = 0,
                emDayOfWeek_thursday = 0,
                emDayOfWeek_friday = 0,
                emDayOfWeek_saturday = 0,
                emDayOfWeek_sunday = 0;

            for (let i = 0; i < result['emDayOfWeek'].length; i++) {
                emDayOfWeek_monday = (result['emDayOfWeek'][i].dweek == "월") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_monday;
                emDayOfWeek_tuesday = (result['emDayOfWeek'][i].dweek == "화") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_tuesday;
                emDayOfWeek_wednesday = (result['emDayOfWeek'][i].dweek == "수") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_wednesday;
                emDayOfWeek_thursday = (result['emDayOfWeek'][i].dweek == "목") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_thursday;
                emDayOfWeek_friday = (result['emDayOfWeek'][i].dweek == "금") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_friday;
                emDayOfWeek_saturday = (result['emDayOfWeek'][i].dweek == "토") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_saturday;
                emDayOfWeek_sunday = (result['emDayOfWeek'][i].dweek == "일") ? result['emDayOfWeek'][i].emDate : emDayOfWeek_sunday;
            }

            $('#emergency-today').text(emToday + '건'); // 해당 태크에 Text 수정
            $('#emergency-toweek').text(emToweek + '건');
            $('#emergency-tomonth').text(emToMonth + '건');
            $('#emergency-toyear').text(emToyear + '건');
            $('#emergency-all').text(emAllCnt + '건');
            $('#emergency-monday').text(emDayOfWeek_monday + '건');
            $('#emergency-tuesday').text(emDayOfWeek_tuesday + '건');
            $('#emergency-wednesday').text(emDayOfWeek_wednesday + '건');
            $('#emergency-thursday').text(emDayOfWeek_thursday + '건');
            $('#emergency-friday').text(emDayOfWeek_friday + '건');
            $('#emergency-saturday').text(emDayOfWeek_saturday + '건');
            $('#emergency-sunday').text(emDayOfWeek_sunday + '건');
        },
        cmmErr = function() {
            alert('실패');
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

// 그래프 출력
function showChart(start, end) {
    trip_start = $('#trip-start').val();
    trip_end = $('#trip-end').val();
    selGen = selectGender($('#gender-category').val());
    selAge = $('#age-category').val();

    if (trip_start == "" | trip_start == "") { // 날짜 범위를 지정하지 않으면 금주 응급 발생 데이터를 그래프로 출력(초기화면을 위한 조건문)
        trip_start = week_start;
        trip_end = week_end;
    } else if (start != null | end != null) {
        trip_start = start;
        trip_end = end;
    } else if (trip_start > trip_end) {
        alert('검색 범위가 잘못되었습니다.');
        location.reload();
    }

    let cmmContentType = 'application/json', // ajax를 이용하여 데이터 가져오기
        cmmType = 'post',
        cmmUrl = '/api/monitStat/graphData',
        cmmReqDataObj = {
            userCode: userCode,
            accessToken: accessToken,
            trip_start: trip_start,
            trip_end: trip_end,
            selGen: selGen,
            selAge: selAge
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            $('#trip-start').val(trip_start);
            $('#trip-end').val(trip_end);

            let yearRangeStart = trip_start.split('-')[0], // 날짜 범위 검색, 시작값, 끝값 정의
                monthRangeStart = trip_start.split('-')[1],
                dayRangeStart = trip_start.split('-')[2],
                yearRangeEnd = trip_end.split('-')[0],
                monthRangeEnd = trip_end.split('-')[1],
                dayRangeEnd = trip_end.split('-')[2];

            let date1 = new Date(yearRangeStart, monthRangeStart, dayRangeStart),
                date2 = new Date(yearRangeEnd, monthRangeEnd, dayRangeEnd),
                elapsedMSec = date2.getTime() - date1.getTime(), // 날짜 범위 검색 시 일수, 월수, 연수 차이 계산
                elapsedDay = elapsedMSec / 1000 / 60 / 60 / 24;

            let graphLabel = [],
                graphDataList = [],
                graphDataMList = [],
                graphDataWList = [],
                graphDataUnderList = [],
                graphDataSixtyList = [],
                graphDataSeventyList = [],
                graphDataEightyList = [],
                graphDataNinetyList = [],
                graphDataOverList = [],
                graphDayOfWeekList = [0, 0, 0, 0, 0, 0, 0],
                dateRange_list = [],
                day_list = [],
                dayM_list = [],
                dayW_list = [],
                dayUnder_list = [],
                daySixty_list = [],
                daySeventy_list = [],
                dayEighty_list = [],
                dayNinety_list = [],
                dayOver_list = [],
                dateCnt = 0,
                manCnt = 0,
                womanCnt = 0,
                ageUnderCnt = 0,
                ageSixtyCnt = 0,
                ageSeventyCnt = 0,
                ageEightyCnt = 0,
                ageNinetyCnt = 0,
                ageOverCnt = 0,
                graphDayOfWeekLabel = ['월', '화', '수', '목', '금', '토', '일'];


            // 1. 라벨 범위 설정
            if (elapsedDay <= 1) {
                dateRange_list = result['dateRange']
            } else {
                for (i = 0; i < result['dateRange'].length; i++) {
                    dateRange_list.push(result['dateRange'][i].dr);
                }
            }

            // 2. 라벨과 데이터 날짜 비교 리스트 데이터 생성
            day_list = dayListPush(day_list, result, 'graphData');
            dayM_list = dayListPush(dayM_list, result, 'graphDataGenderM');
            dayW_list = dayListPush(dayW_list, result, 'graphDataGenderW');
            dayUnder_list = dayListPush(dayUnder_list, result, 'grapgDataAgeUnder');
            daySixty_list = dayListPush(daySixty_list, result, 'grapgDataAgeSixty');
            daySeventy_list = dayListPush(daySeventy_list, result, 'grapgDataAgeSeventy');
            dayEighty_list = dayListPush(dayEighty_list, result, 'grapgDataAgeEighty');
            dayNinety_list = dayListPush(dayNinety_list, result, 'grapgDataAgeNinety');
            dayOver_list = dayListPush(dayOver_list, result, 'grapgDataAgeOver');

            // 3. 그래프 데이터, 날짜 리스트와 비교하여 x축 y축 설정
            if (elapsedDay <= 0) { // 날짜 범위 차이가 1일(하루) 이하면
                for (i = 0; i < result['dateRange'].length; i++) {
                    graphLabel.push(dateRange_list[i] + 'H');

                }
                graphDataList = setYlim(graphDataList, dateRange_list, day_list, dateCnt, result, 'graphData');
                graphDataMList = setYlim(graphDataMList, dateRange_list, dayM_list, manCnt, result, 'graphDataGenderM');
                graphDataWList = setYlim(graphDataWList, dateRange_list, dayW_list, womanCnt, result, 'graphDataGenderW');
                graphDataUnderList = setYlim(graphDataUnderList, dateRange_list, dayUnder_list, ageUnderCnt, result, 'grapgDataAgeUnder');
                graphDataSixtyList = setYlim(graphDataSixtyList, dateRange_list, daySixty_list, ageSixtyCnt, result, 'grapgDataAgeSixty');
                graphDataSeventyList = setYlim(graphDataSeventyList, dateRange_list, daySeventy_list, ageSeventyCnt, result, 'grapgDataAgeSeventy');
                graphDataEightyList = setYlim(graphDataEightyList, dateRange_list, dayEighty_list, ageEightyCnt, result, 'grapgDataAgeEighty');
                graphDataNinetyList = setYlim(graphDataNinetyList, dateRange_list, dayNinety_list, ageNinetyCnt, result, 'grapgDataAgeNinety');
                graphDataOverList = setYlim(graphDataOverList, dateRange_list, dayOver_list, ageOverCnt, result, 'grapgDataAgeOver');
                graphDayOfWeekList = setYlimDayOfWeek(result, 'graphDataDayOfWeek', graphDayOfWeekList);

            } else if (elapsedDay <= 7) { // 날짜 범위 차이가 7일(일주일) 이하면
                for (i = 0; i < result['dateRange'].length; i++) {
                    graphLabel.push(dateRange_list[i].slice(5, 7) + '월 ' +
                        dateRange_list[i].slice(8, 10) + '일');

                }
                graphDataList = setYlim(graphDataList, dateRange_list, day_list, dateCnt, result, 'graphData');
                graphDataMList = setYlim(graphDataMList, dateRange_list, dayM_list, manCnt, result, 'graphDataGenderM');
                graphDataWList = setYlim(graphDataWList, dateRange_list, dayW_list, womanCnt, result, 'graphDataGenderW');
                graphDataUnderList = setYlim(graphDataUnderList, dateRange_list, dayUnder_list, ageUnderCnt, result, 'grapgDataAgeUnder');
                graphDataSixtyList = setYlim(graphDataSixtyList, dateRange_list, daySixty_list, ageSixtyCnt, result, 'grapgDataAgeSixty');
                graphDataSeventyList = setYlim(graphDataSeventyList, dateRange_list, daySeventy_list, ageSeventyCnt, result, 'grapgDataAgeSeventy');
                graphDataEightyList = setYlim(graphDataEightyList, dateRange_list, dayEighty_list, ageEightyCnt, result, 'grapgDataAgeEighty');
                graphDataNinetyList = setYlim(graphDataNinetyList, dateRange_list, dayNinety_list, ageNinetyCnt, result, 'grapgDataAgeNinety');
                graphDataOverList = setYlim(graphDataOverList, dateRange_list, dayOver_list, ageOverCnt, result, 'grapgDataAgeOver');
                graphDayOfWeekList = setYlimDayOfWeek(result, 'graphDataDayOfWeek', graphDayOfWeekList);
            } else if (elapsedDay <= 31) { // 날짜 범위 차이가 31일(한달) 이하면
                for (i = 0; i < result['dateRange'].length; i++) {
                    graphLabel.push(dateRange_list[i].slice(0, 4) + '년 ' +
                        dateRange_list[i].slice(5, 7) + '월 ' +
                        dateRange_list[i].slice(8, 10) + '일');

                }
                graphDataList = setYlim(graphDataList, dateRange_list, day_list, dateCnt, result, 'graphData');
                graphDataMList = setYlim(graphDataMList, dateRange_list, dayM_list, manCnt, result, 'graphDataGenderM');
                graphDataWList = setYlim(graphDataWList, dateRange_list, dayW_list, womanCnt, result, 'graphDataGenderW');
                graphDataUnderList = setYlim(graphDataUnderList, dateRange_list, dayUnder_list, ageUnderCnt, result, 'grapgDataAgeUnder');
                graphDataSixtyList = setYlim(graphDataSixtyList, dateRange_list, daySixty_list, ageSixtyCnt, result, 'grapgDataAgeSixty');
                graphDataSeventyList = setYlim(graphDataSeventyList, dateRange_list, daySeventy_list, ageSeventyCnt, result, 'grapgDataAgeSeventy');
                graphDataEightyList = setYlim(graphDataEightyList, dateRange_list, dayEighty_list, ageEightyCnt, result, 'grapgDataAgeEighty');
                graphDataNinetyList = setYlim(graphDataNinetyList, dateRange_list, dayNinety_list, ageNinetyCnt, result, 'grapgDataAgeNinety');
                graphDataOverList = setYlim(graphDataOverList, dateRange_list, dayOver_list, ageOverCnt, result, 'grapgDataAgeOver');
                graphDayOfWeekList = setYlimDayOfWeek(result, 'graphDataDayOfWeek', graphDayOfWeekList);
            } else if (elapsedDay <= 365) { // 날짜 범위 차이가 365일(일년) 이하면
                for (i = 0; i < result['dateRange'].length; i++) {
                    graphLabel.push(dateRange_list[i].slice(0, 4) + '년 ' +
                        dateRange_list[i].slice(5, 7) + '월 ');

                }
                graphDataList = setYlim(graphDataList, dateRange_list, day_list, dateCnt, result, 'graphData');
                graphDataMList = setYlim(graphDataMList, dateRange_list, dayM_list, manCnt, result, 'graphDataGenderM');
                graphDataWList = setYlim(graphDataWList, dateRange_list, dayW_list, womanCnt, result, 'graphDataGenderW');
                graphDataUnderList = setYlim(graphDataUnderList, dateRange_list, dayUnder_list, ageUnderCnt, result, 'grapgDataAgeUnder');
                graphDataSixtyList = setYlim(graphDataSixtyList, dateRange_list, daySixty_list, ageSixtyCnt, result, 'grapgDataAgeSixty');
                graphDataSeventyList = setYlim(graphDataSeventyList, dateRange_list, daySeventy_list, ageSeventyCnt, result, 'grapgDataAgeSeventy');
                graphDataEightyList = setYlim(graphDataEightyList, dateRange_list, dayEighty_list, ageEightyCnt, result, 'grapgDataAgeEighty');
                graphDataNinetyList = setYlim(graphDataNinetyList, dateRange_list, dayNinety_list, ageNinetyCnt, result, 'grapgDataAgeNinety');
                graphDataOverList = setYlim(graphDataOverList, dateRange_list, dayOver_list, ageOverCnt, result, 'grapgDataAgeOver');
                graphDayOfWeekList = setYlimDayOfWeek(result, 'graphDataDayOfWeek', graphDayOfWeekList);
            } else { // 날짜 범위 전체(5년 데이터)
                for (i = 0; i < result['dateRange'].length; i++) {
                    graphLabel.push(dateRange_list[i].slice(0, 4) + '년');

                }
                graphDataList = setYlim(graphDataList, dateRange_list, day_list, dateCnt, result, 'graphData');
                graphDataMList = setYlim(graphDataMList, dateRange_list, dayM_list, manCnt, result, 'graphDataGenderM');
                graphDataWList = setYlim(graphDataWList, dateRange_list, dayW_list, womanCnt, result, 'graphDataGenderW');
                graphDataUnderList = setYlim(graphDataUnderList, dateRange_list, dayUnder_list, ageUnderCnt, result, 'grapgDataAgeUnder');
                graphDataSixtyList = setYlim(graphDataSixtyList, dateRange_list, daySixty_list, ageSixtyCnt, result, 'grapgDataAgeSixty');
                graphDataSeventyList = setYlim(graphDataSeventyList, dateRange_list, daySeventy_list, ageSeventyCnt, result, 'grapgDataAgeSeventy');
                graphDataEightyList = setYlim(graphDataEightyList, dateRange_list, dayEighty_list, ageEightyCnt, result, 'grapgDataAgeEighty');
                graphDataNinetyList = setYlim(graphDataNinetyList, dateRange_list, dayNinety_list, ageNinetyCnt, result, 'grapgDataAgeNinety');
                graphDataOverList = setYlim(graphDataOverList, dateRange_list, dayOver_list, ageOverCnt, result, 'grapgDataAgeOver');
                graphDayOfWeekList = setYlimDayOfWeek(result, 'graphDataDayOfWeek', graphDayOfWeekList);
            }

            let graphGenderList = [graphDataMList, graphDataWList];
            let graphDataAgeList = [graphDataUnderList, graphDataSixtyList, graphDataSeventyList, graphDataEightyList, graphDataNinetyList, graphDataOverList];

            showChartRange(graphLabel, graphDataList, graphGenderList, graphDataAgeList, graphDayOfWeekList, graphDayOfWeekLabel);
        },
        cmmErr = function() {
            alert('false!!');
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}

// 그래프 출력 함수
function showChartRange(graphLabel, graphDataList, graphGenderList, graphDataAgeList, graphDayOfWeekList, graphDayOfWeekLabel) {
    $('#graph-div > *').remove(); // 메모리 과부화 방지를 위해 그래프 삭제 후 재생성
    $('#graph-div').append(`
        <div class="row">
            <canvas id="date-chart-canvas" style="height:300px; width:49%;"></canvas>
            <canvas id="gender-chart-canvas" style="height:300px; width:49%;"></canvas>
        </div>
        <br>
        <div class="row">
            <canvas id="age-chart-canvas" style="height:300px; width:49%;"></canvas>
            <canvas id="dayofweek-chart-canvas" style="height:300px; width:49%;"></canvas>   
        </div>`);

    // 기간별 데이터 그래프
    let $dateChartArea = $('#date-chart-canvas');
    new Chart($dateChartArea, {
        "type": "line",
        "data": {
            "labels": graphLabel,
            "datasets": [{
                "label": "기간별 응급",
                "data": graphDataList,
                "fill": false,
                "borderColor": "#CC3D3D",
                "backgroundColor": "#CC3D3D",
                "lineTension": 0.1
            }]
        },
        "options": {
            responsive: false,
            legend: { display: true },
            scales: { yAxes: [{ ticks: { beginAtZero: true } }] }, // 음수값은 표시 안함
        }
    });
    // 요일별 데이터 그래프
    let $dayOfWeekChartArea = $('#dayofweek-chart-canvas');
    new Chart($dayOfWeekChartArea, {
        "type": "bar",
        "data": {
            "labels": graphDayOfWeekLabel,
            "datasets": [{
                "label": "요일별 응급",
                "data": graphDayOfWeekList,
                "fill": false,
                "borderColor": "rgb(51, 250, 124)",
                "backgroundColor": "rgb(51, 250, 124)",
                "lineTension": 0.1
            }]
        },
        "options": {
            responsive: false,
            legend: { display: true },
            scales: { yAxes: [{ ticks: { beginAtZero: true } }] }, // 음수값은 표시 안함
        }
    });
    // 성별 데이터 그래프
    let $genderChartArea = $('#gender-chart-canvas');
    new Chart($genderChartArea, {
        "type": "bar",
        "data": {
            "labels": graphLabel,
            "datasets": changeGender($('#gender-category').val(), graphGenderList)
        },
        "options": {
            responsive: false,
            legend: { display: true },
            scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
        }
    });
    // 나이별 데이터 그래프
    let $ageChartArea = $('#age-chart-canvas');
    new Chart($ageChartArea, {
        "type": "bar",
        "data": {
            "labels": graphLabel,
            "datasets": changeAge($('#age-category').val(), graphDataAgeList)
        },
        "options": {
            responsive: false,
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: true
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        autoSkip: true
                    },
                    stacked: true
                }]
            }
        }
    });

    $dateChartArea.show();
    $genderChartArea.show();
    $ageChartArea.show();
    $dayOfWeekChartArea.show();
}


// 응급 발생 건수 클릭 시 해당 그래프 출력
$('#emCnt_today').on('click', function() { // 금일
    emCntGraph($(this).attr("id"));
})
$('#emCnt_toweek').on('click', function() { // 금주
    emCntGraph($(this).attr("id"));
})
$('#emCnt_tomonth').on('click', function() { // 금월
    emCntGraph($(this).attr("id"));
})
$('#emCnt_toyear').on('click', function() { // 금년
    emCntGraph($(this).attr("id"));
})
$('#emCnt_all').on('click', function() { // 전체
    emCntGraph($(this).attr("id"));
})
$('#select_date_button').on('click', function() {
    emCntGraph($(this).attr("id"));
})


// 응급 발생 건수 클릭 시 그래프 출력
function emCntGraph(tagID) {
    let start, end;

    switch (tagID) {
        case 'emCnt_today':
            start = today,
                end = year + '-' + month + '-' + nowDate;
            break;
        case 'emCnt_toweek':
            start = week_start,
                end = week_end;
            break;
        case 'emCnt_tomonth':
            start = month_start,
                end = month_end;
            break;
        case 'emCnt_toyear':
            start = year_start,
                end = year_end;
            break;
        case 'emCnt_all':
            start = String(Number(date.getFullYear() - 5)) + '-' + month + '-' + nowDate,
                end = today;
            break;
        default:
            start = trip_start;
            end = trip_end;
            break;
    }
    emergencyCnt(start, end);
    showChart(start, end);
    styleChange(tagID);

}

// 금일, 금주, 금월, 금년도, 전체 응급 발생 건수 클릭시 색상 변환(강조)
function styleChange(tagID) {
    $('.emCnt').css('background-color', "white");
    switch (tagID) {
        case 'emCnt_today':
            $('#emCnt_today').css('border-radius', "5%");
            // $('#emCnt_today').css( 'background-color', "#ede7e7" );
            break;
        case 'emCnt_toweek':
            $('#emCnt_toweek').css('border-radius', "5%");
            // $('#emCnt_toweek').css( 'background-color', "#ede7e7" );
            break;
        case 'emCnt_tomonth':
            $('#emCnt_tomonth').css('border-radius', "5%");
            // $('#emCnt_tomonth').css( 'background-color', "#ede7e7" );
            break;
        case 'emCnt_toyear':
            $('#emCnt_toyear').css('border-radius', "5%");
            // $('#emCnt_toyear').css( 'background-color', "#ede7e7" );
            break;
        case 'emCnt_all':
            $('#emCnt_all').css('border-radius', "5%");
            // $('#emCnt_all').css( 'background-color', "#ede7e7" );
            break;
        case 'emCnt_dayofweek':
            $('#emCnt_dayofweek').css('border-radius', "5%");
            // $('#emCnt_dayofweek').css( 'background-color', "#ede7e7" );
            break;
        default:
            $('.emCnt').css('background-color', "white");
            break;
    }
}

// 나이 카테고리별, 쿼리문에 맞는 그래프 데이터로 변환해주는 함수
function changeAge(select_age, graphDataList) {
    let ageRange = [];
    let age_under = {
        label: "60대 미만",
        lineTension: 0.1,
        borderColor: 'rgba(255, 99, 132, 0.1)',
        backgroundColor: '#084990',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        data: graphDataList[0]
    };
    let age_sixyt = {
        label: "60대",
        lineTension: 0.1,
        borderColor: 'rgba(255, 99, 132, 0.1)',
        backgroundColor: '#08529C',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        data: graphDataList[1]
    };
    let age_seventy = {
        label: "70대",
        lineTension: 0.1,
        borderColor: 'rgba(255, 99, 132, 0.1)',
        backgroundColor: '#3C8CC3',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        data: graphDataList[2]
    };
    let age_eighty = {
        label: "80대",
        lineTension: 0.1,
        borderColor: 'rgba(255, 99, 132, 0.1)',
        backgroundColor: '#509BCB',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        data: graphDataList[3]
    };
    let age_ninety = {
        label: "90대",
        lineTension: 0.1,
        borderColor: 'rgba(255, 99, 132, 0.1)',
        backgroundColor: '#98C7DF',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        data: graphDataList[4]
    };
    let age_over = {
        label: "100대 이상",
        lineTension: 0.1,
        borderColor: 'rgba(255, 99, 132, 0.1)',
        backgroundColor: '#AED1E6',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        data: graphDataList[5]
    };

    switch (select_age) {
        case 'none':
            ageRange.push(age_under);
            ageRange.push(age_sixyt);
            ageRange.push(age_seventy);
            ageRange.push(age_eighty);
            ageRange.push(age_ninety);
            ageRange.push(age_over);
            break;
        case 'age-under':
            ageRange.push(age_under);
            break;
        case 'age-sixty':
            ageRange.push(age_sixyt);
            break;
        case 'age-seventy':
            ageRange.push(age_seventy);
            break;
        case 'age-eighty':
            ageRange.push(age_eighty);
            break;
        case 'age-ninety':
            ageRange.push(age_ninety);
            break;
        case 'age-over':
            ageRange.push(age_over);
            break;
    }

    return ageRange;
}

// 성별 카테고리별, 쿼리문에 맞는 그래프 데이터로 변환해주는 함수
function changeGender(select_gender, graphGenderList) {
    let genderRange = [];
    let genderM = {
        "label": "남자",
        "data": graphGenderList[0],
        "fill": false,
        "borderColor": "#0c89ff",
        "backgroundColor": "#0c89ff",
        "lineTension": 0.1
    };
    let genderW = {
        "label": "여자",
        "data": graphGenderList[1],
        "fill": false,
        "borderColor": "#f77925",
        "backgroundColor": "#f77925",
        "lineTension": 0.1
    };

    switch (select_gender) {
        case 'none':
            genderRange.push(genderM);
            genderRange.push(genderW);
            break;
        case 'M':
            genderRange.push(genderM);
            break;
        case 'W':
            genderRange.push(genderW);
            break;
    };

    return genderRange;
}

// 성별 선택시 구분
function selectGender(select_gender) {
    switch (select_gender) {
        case 'none':
            select_gender = '%';
            break;
        case 'M':
            select_gender = 'M';
            break;
        case 'W':
            select_gender = 'W';
            break;
    };

    return select_gender;
}

// 그래프 x축 설정 함수
function dayListPush(list, Data, Key) {
    list = [];
    for (i = 0; i < Data[Key].length; i++) {
        list.push(Data[Key][i].date);
    }

    return list;
}

// 그래프 y축 설정 함수(나이별)
function setYlim(list, dateRange, day_list, dateCnt, Data, Key) {
    for (i = 0; i < Data['dateRange'].length; i++) {
        if (dateCnt > Data[Key].length | dateRange[i] != day_list[dateCnt]) {
            list.push(0);
        } else if (dateRange[i] == day_list[dateCnt]) {
            list.push(Data[Key][dateCnt].cnt);
            dateCnt++;
        }
    }

    return list;
}

// 그래프 y축 설정 함수(요일별)
function setYlimDayOfWeek(Data, DicName, List) {
    for (let i = 0; i < Data[DicName].length; i++) {
        List[0] = (Data[DicName][i].dweek == "월") ? Data[DicName][i].cnt : List[0];
        List[1] = (Data[DicName][i].dweek == "화") ? Data[DicName][i].cnt : List[1];
        List[2] = (Data[DicName][i].dweek == "수") ? Data[DicName][i].cnt : List[2];
        List[3] = (Data[DicName][i].dweek == "목") ? Data[DicName][i].cnt : List[3];
        List[4] = (Data[DicName][i].dweek == "금") ? Data[DicName][i].cnt : List[4];
        List[5] = (Data[DicName][i].dweek == "토") ? Data[DicName][i].cnt : List[5];
        List[6] = (Data[DicName][i].dweek == "일") ? Data[DicName][i].cnt : List[6];
    }

    return List;
}