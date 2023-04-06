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

$stateDatePicker.on("change ", function() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/state/stateSelectDateSub',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: usercode,
            selectDate: $stateDatePicker.val(),
            accessToken: accessToken,
            lang: lang
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            if (result.hasOwnProperty('success')) {
                if (result.success == '0') {
                    location.href = '/error/auth?lang=' + lang + '&userCode=' + userCode;
                }
            } else {
                let stateMessage = result.statePage,
                    stateData = result.stateData;
                let stateChart = result.stateChart;
                if (stateChart.hr.length == 0) {
                    $('#hrempty').show();
                    $('#hrchart').hide();
                } else {
                    $('#hrchart').show();
                    statehrChart(stateChart.hr, stateChart.bioTime);
                    $('#hrempty').hide();
                };
                if (stateChart.rr.length == 0) {
                    $('#rrempty').show();
                    $('#rrchart').hide();
                } else {
                    $('#rrchart').show();
                    staterrChart(stateChart.rr, stateChart.bioTime);
                    $('#rrempty').hide();
                };
                if (stateChart.sv.length == 0) {
                    $('#svempty').show();
                    $('#svchart').hide();
                } else {
                    $('#svchart').show();
                    statesvChart(stateChart.sv, stateChart.bioTime);
                    $('#svempty').hide();
                };
                if (stateChart.hrv.length == 0) {
                    $('#hrvempty').show();
                    $('#hrvchart').hide();
                } else {
                    $('#hrvchart').show();
                    statehrvChart(stateChart.hrv, stateChart.bioTime);
                    $('#hrvempty').hide();
                };
                if (stateChart.stress.length == 0) {
                    $('#stempty').show();
                    $('#dstress').hide();
                } else {
                    $('#dstress').show();
                    stateStressChart(stateChart.stress, stateChart.stressTime);
                    $('#stempty').hide();
                };
                let $drate = $('.drate'),
                    $hrate = $('.hrate'),
                    $hlrate = $('.hlrate'),
                    $tratio = $('.tratio'),
                    $bratio = $('.bratio'),
                    $hravg = $('.hravg'),
                    $rravg = $('.rravg'),
                    $svavg = $('.svavg'),
                    $hrvavg = $('.hrvavg'),
                    $hrmax = $('.hrmax'),
                    $rrmax = $('.rrmax'),
                    $svmax = $('.svmax'),
                    $hrvmax = $('.hrvmax'),
                    $hrmin = $('.hrmin'),
                    $rrmin = $('.rrmin'),
                    $svmin = $('.svmin'),
                    $hrvmin = $('.hrvmin'),
                    $sdnn = $('.sdnn'),
                    $rmssd = $('.rmssd'),
                    $pnn50 = $('.pnn50'),
                    $stressdata = $('.stressdata'),
                    $apcount = $('.apcount'),
                    $apratio = $('.apratio'),
                    $aphour = $('.aphour'),
                    $apminute = $('.apminute'),
                    $apsecond = $('.apsecond'),
                    $slhour = $('.slhour'),
                    $slminute = $('.slminute')
                    // $sltwist = $('.sltwist')
                if (stateData.hravg != null & typeof stateData.hravg != undefined) {
                    $hravg.text(stateData.hravg);
                } else {
                    $hravg.text("- ")
                }

                if (stateData.rravg != null) {
                    $rravg.text(stateData.rravg);
                } else {
                    $rravg.text("- ")
                }
                if (stateData.svavg != null) {
                    $svavg.text(stateData.svavg);
                } else {
                    $svavg.text("- ")
                }
                if (stateData.hrvavg != null) {
                    $hrvavg.text(stateData.hrvavg);
                } else {
                    $hrvavg.text("- ")
                }
                if (stateData.hrmax != null) {
                    $hrmax.text(stateData.hrmax);
                } else {
                    $hrmax.text("- ")
                }
                if (stateData.rrmax != null) {
                    $rrmax.text(stateData.rrmax);
                } else {
                    $rrmax.text("- ")
                }
                if (stateData.svmax != null) {
                    $svmax.text(stateData.svmax);
                } else {
                    $svmax.text("- ")
                }
                if (stateData.hrvmax != null) {
                    $hrvmax.text(stateData.hrvmax);
                } else {
                    $hrvmax.text("- ")
                }
                if (stateData.hrmin != null) {
                    $hrmin.text(stateData.hrmin);
                } else {
                    $hrmin.text("- ")
                }
                if (stateData.rrmin != null) {
                    $rrmin.text(stateData.rrmin);
                } else {
                    $rrmin.text("- ")
                }
                if (stateData.svmin != null) {
                    $svmin.text(stateData.svmin);
                } else {
                    $svmin.text("- ")
                }
                if (stateData.hrvmin != null) {
                    $hrvmin.text(stateData.hrvmin);
                } else {
                    $hrvmin.text("- ")
                }
                if (stateData.sdnn != null) {
                    $sdnn.text(stateData.sdnn);
                } else {
                    $sdnn.text("- ")
                }
                if (stateData.rmssd != null) {
                    $rmssd.text(stateData.rmssd);
                } else {
                    $rmssd.text("- ")
                }
                if (stateData.pnn50 != null) {
                    $pnn50.text(stateData.pnn50 + '%');
                } else {
                    $pnn50.text("- ")
                }
                if (stateData.stress != null) {
                    $stressdata.text(stateData.stress + "% ");
                } else {
                    $stressdata.text("-% ")
                }
                if (stateData.apcount != null) {
                    $apcount.text(stateData.apcount);
                } else {
                    $apcount.text("- ")
                }
                if (stateData.apratio != null) {
                    $apratio.text(stateData.apratio + "% ");
                } else {
                    $apratio.text("-% ")
                }
                if (stateData.slhour != null) {
                    $slhour.text(stateData.slhour);
                } else {
                    $slhour.text("- ")
                }
                if (stateData.slminute != null) {
                    $slminute.text(stateData.slminute);
                } else {
                    $slminute.text("- ")
                }
                if (stateData.aphour != null) {
                    $aphour.text(stateData.aphour);
                } else {
                    $aphour.text("- ")
                }
                if (stateData.apminute != null) {
                    $apminute.text(stateData.apminute);
                } else {
                    $apminute.text("- ")
                }
                if (stateData.apsecond != null) {
                    $apsecond.text(stateData.apsecond);
                } else {
                    $apsecond.text("- ")
                }

                if (stateData.drate != null) {
                    $drate.text(stateData.drate);
                } else {
                    $drate.text("- ");
                }
                if (stateData.hrate != null) {
                    $hrate.text(stateData.hrate);
                } else {
                    $hrate.text("- ");
                }
                if (stateData.hlrate != null) {
                    $hlrate.text(stateData.hlrate);
                } else {
                    $hlrate.text("- ");
                }
                if (stateData.tratio != null) {
                    $tratio.text(stateData.tratio + " %");
                } else {
                    $tratio.text("- ");
                }
                if (stateData.bratio != null) {
                    $bratio.text(stateData.bratio + " %");
                } else {
                    $bratio.text("- ");
                }

                if (stateData.drate != null) {
                    if (stateData.dlevel == 0) {
                        document.getElementById("diabetesgreat").style.display = 'block'
                        document.getElementById("diabetesnormal").style.display = 'none'
                        document.getElementById("diabetesbad").style.display = 'none'
                        document.getElementById("diabetesnone").style.display = 'none'
                    } else if (stateData.dlevel == 1) {
                        document.getElementById("diabetesgreat").style.display = 'none'
                        document.getElementById("diabetesnormal").style.display = 'block'
                        document.getElementById("diabetesbad").style.display = 'none'
                        document.getElementById("diabetesnone").style.display = 'none'
                    } else {
                        document.getElementById("diabetesgreat").style.display = 'none'
                        document.getElementById("diabetesnormal").style.display = 'none'
                        document.getElementById("diabetesbad").style.display = 'block'
                        document.getElementById("diabetesnone").style.display = 'none'
                    }
                } else {
                    document.getElementById("drate-graph").innerHTML = dstr;
                    document.getElementById("diabetesgreat").style.display = 'none'
                    document.getElementById("diabetesnormal").style.display = 'none'
                    document.getElementById("diabetesbad").style.display = 'none'
                    document.getElementById("diabetesnone").style.display = 'block'
                }
                if (stateData.hrate != null) {
                    if (stateData.hlevel == 0) {
                        document.getElementById("hgreat").style.display = 'block'
                        document.getElementById("hnormal").style.display = 'none'
                        document.getElementById("hbad").style.display = 'none'
                        document.getElementById("hnone").style.display = 'none'
                    } else if (stateData.hlevel == 1) {
                        document.getElementById("hgreat").style.display = 'none'
                        document.getElementById("hnormal").style.display = 'block'
                        document.getElementById("hbad").style.display = 'none'
                        document.getElementById("hnone").style.display = 'none'
                    } else {
                        document.getElementById("hgreat").style.display = 'none'
                        document.getElementById("hnormal").style.display = 'none'
                        document.getElementById("hbad").style.display = 'block'
                        document.getElementById("hnone").style.display = 'none'
                    }
                } else {
                    document.getElementById("hrate-graph").innerHTML = hstr;
                    document.getElementById("hgreat").style.display = 'none'
                    document.getElementById("hnormal").style.display = 'none'
                    document.getElementById("hbad").style.display = 'none'
                    document.getElementById("hnone").style.display = 'block'
                }
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
});