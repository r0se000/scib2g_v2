/** ================================================================
 *  건강 현황 - 질병정보 페이지에서 쓰이는 함수 정의
 * 
 *  관련 화면: state.html
 *  의존 스크립트: moment.js 
 *  @author MY, Jang
 *  @since 
 *  @history 
 *  ================================================================
 */
let $stateDatePicker = $('#state-datepicker');

let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat);


// 달력 실행
$stateDatePicker.bootstrapMaterialDatePicker({
    weekStart: 0,
    time: false,
    currentDate: yesterdayStr,
    maxDate: yesterdayStr
});

function init() {
    let drateBtn, hrateBtn, arateBtn
    $('#dlevel').html()
    $('#hlevel').html()
    $('#alevel').html()

    if (stateData.dlevel == 1) {
        drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-success" style="font-weight: bold; font-size: large;">안심</button>';
    } else if (stateData.dlevel == 0) {
        drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-primary" style="font-weight: bold; font-size: large;">관심</button>';
    } else if (stateData.dlevel == 2) {
        drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-danger" style="font-weight: bold; font-size: large;">주의</button>';
    } else {
        drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-secondary" style="font-weight: bold; font-size: large;">정보없음</button>';
    }

    if (stateData.hlevel == 1) {
        hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-success" style="font-weight: bold; font-size: large;">안심</button>';
    } else if (stateData.hlevel == 0) {
        hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-primary" style="font-weight: bold; font-size: large;">관심</button>';
    } else if (stateData.hlevel == 2) {
        hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-danger" style="font-weight: bold; font-size: large;">주의</button>';
    } else {
        hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-secondary" style="font-weight: bold; font-size: large;">정보없음</button>';
    }

    if (stateData.tratio != undefined & stateData.bratio != undefined) {
        if (stateData.tratio != 0 | stateData.bratio != 0) {
            if (stateData.tratio >= 0.1 & stateData.bratio >= 0.1) { //둘다 0.1이상인 경우 주의 출력
                arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-danger" style="font-weight: bold; font-size: large;">주의</button>'
            } else { //그 외의 경우 '관심'출력
                arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-primary" style="font-weight: bold; font-size: large;">관심</button>';
            }
        } else { //둘다 0일경우 '안심'출력
            arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-success" style="font-weight: bold; font-size: large;">안심</button>';
        }
    } else { //둘다 없을경우 '-' 출력
        arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-secondary" style="font-weight: bold; font-size: large;">정보없음</button>';
    }


    $('#dlevel').append(drateBtn)
    $('#hlevel').append(hrateBtn)
    $('#alevel').append(arateBtn)

}

$stateDatePicker.on("change ", function() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/state/stateSelectDateSub',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: usercode,
            selectDate: $stateDatePicker.val()
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            if (result.hasOwnProperty('success')) {
                if (result.success == '0') {
                    location.href = '/error/auth?lang=' + lang + '&userCode=' + userCode;
                }
            } else {
                $('#dlevel').html('')
                $('#hlevel').html('')
                $('#alevel').html('')

                if (result.stateData.dlevel == 1) {
                    drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-success" style="font-weight: bold; font-size: large;">안심</button>';
                } else if (result.stateData.dlevel == 0) {
                    drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-primary" style="font-weight: bold; font-size: large;">관심</button>';
                } else if (result.stateData.dlevel == 2) {
                    drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-danger" style="font-weight: bold; font-size: large;">주의</button>';
                } else {
                    drateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-secondary" style="font-weight: bold; font-size: large;">정보없음</button>';
                }

                if (result.stateData.hlevel == 1) {
                    hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-success" style="font-weight: bold; font-size: large;">안심</button>';
                } else if (result.stateData.hlevel == 0) {
                    hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-primary" style="font-weight: bold; font-size: large;">관심</button>';
                } else if (result.stateData.hlevel == 2) {
                    hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-danger" style="font-weight: bold; font-size: large;">주의</button>';
                } else {
                    hrateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-secondary" style="font-weight: bold; font-size: large;">정보없음</button>';
                }

                if (result.stateData.tratio != undefined & result.stateData.bratio != undefined) {
                    if (result.stateData.tratio != 0 | result.stateData.bratio != 0) {
                        if (result.stateData.tratio >= 0.1 & result.stateData.bratio >= 0.1) { //둘다 0.1이상인 경우 주의 출력
                            arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-danger" style="font-weight: bold; font-size: large;">주의</button>'
                        } else { //그 외의 경우 '관심'출력
                            arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-primary" style="font-weight: bold; font-size: large;">관심</button>';
                        }
                    } else { //둘다 0일경우 '안심'출력
                        arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-success" style="font-weight: bold; font-size: large;">안심</button>';
                    }
                } else { //둘다 없을경우 '-' 출력
                    arateBtn = '<button class="float-right btn waves-effect waves-light btn-lg btn-secondary" style="font-weight: bold; font-size: large;">정보없음</button>';
                }


                $('#dlevel').append(drateBtn)
                $('#hlevel').append(hrateBtn)
                $('#alevel').append(arateBtn)

            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});