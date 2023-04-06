let $searchDateFrm = $('#searchDateFrm');
let $searchNameFrm = $('#searchNameFrm');
let $allBtn = $('#allBtn');
let $dateBtn = $('#dateBtn');
let $nameBtn = $('#nameBtn');
let $stateDatePicker1 = $('#state-datepicker1');
let $stateDatePicker2 = $('#state-datepicker2');
let $searchName = $('#search_name');

let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat),
    selectDayStr;

// 달력 실행
$stateDatePicker1.bootstrapMaterialDatePicker({
    weekStart: 0,
    time: false,
    maxDate: todayStr
});

//emergencyView
$(document).ready(function() {
    emergencySetting();
});

function emergencySetting() {
    let userCode = $('#userCode').val();

    $.ajax({
        url: "emergencyView",
        type: 'post',
        data: 'userCode=' + userCode,
        success: function(result) {
            if (result.messageCode == "success") {
                let tag = '';

                for (var i = 0; i < result.rowLength; i++) {
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].user_code + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].name + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].emergency_time + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].emergency_check_contents + '</li>';
                }
                $('#emergencylist>li').remove(".eList");
                $('#emergencylist').append(tag);
            } else {
                alert("응급 발생 이력이 존재하지 않습니다.");
            }
        },
        error: function(e) {
            console.log(e.responseText);
        }
    });
}

$stateDatePicker1.change(function() {
    selectDayStr = moment($(this).val(), dateFormat);

    $stateDatePicker2.attr("readonly", false);
    // 시작 날짜 세팅 후 마지막 날짜 세팅
    $stateDatePicker2.bootstrapMaterialDatePicker({
        weekStart: 0,
        time: false,
        minDate: selectDayStr,
        maxDate: todayStr
    });
});



// 조회 버튼 클릭(전체, 날짜, 이름)
$allBtn.click(function() {
    $allBtn.css('background-color', 'lightgray');
    $allBtn.css('font-weight', 'bold');
    $dateBtn.css('background-color', 'white');
    $dateBtn.css('font-weight', 'normal');
    $nameBtn.css('background-color', 'white');
    $nameBtn.css('font-weight', 'normal');

    $searchDateFrm.css('display', 'none');
    $("#searchDateFrm>input[type=text]").val(null);
    $searchNameFrm.css('display', 'none');
    $("#searchNameFrm>input[type=text]").val(null);
    emergencySetting();
});
$dateBtn.click(function() {
    $allBtn.css('background-color', 'white');
    $allBtn.css('font-weight', 'normal');
    $dateBtn.css('background-color', 'lightgray');
    $dateBtn.css('font-weight', 'bold');
    $nameBtn.css('background-color', 'white');
    $nameBtn.css('font-weight', 'normal');

    $searchDateFrm.css('display', 'block');
    $searchNameFrm.css('display', 'none');
    $("#searchNameFrm>input[type=text]").val(null);
});
$nameBtn.click(function() {
    $allBtn.css('background-color', 'white');
    $allBtn.css('font-weight', 'normal');
    $dateBtn.css('background-color', 'white');
    $dateBtn.css('font-weight', 'normal');
    $nameBtn.css('background-color', 'lightgray');
    $nameBtn.css('font-weight', 'bold');

    $searchDateFrm.css('display', 'none');
    $("#searchDateFrm>input[type=text]").val(null);
    $searchNameFrm.css('display', 'block');
});

//날짜 조회 폼 submit 발생
$searchDateFrm.submit(function() {
    event.preventDefault();

    if ($stateDatePicker1.val() == '') {
        alert("시작 날짜를 선택해 주세요.");
        return false;
    }
    if ($stateDatePicker2.val() == '') {
        alert("마지막 날짜를 선택해 주세요.");
        return false;
    }

    // let params = $searchDateFrm.serialize();
    // $.ajax({
    //     url: "searchDate",
    //     type: 'post',
    //     data: params,
    //     success: function(result){
    //         if(result.messageCode == "success"){
    //             let tag = '';

    //             for(var i=0; i<result.rowLength; i++){
    //                 tag += '<li class="eList" onclick="showInfo(\''+result.rows[i].emergency_id+'\');">'+result.rows[i].user_code+'</li>';
    //                 tag += '<li class="eList" onclick="showInfo(\''+result.rows[i].emergency_id+'\');">'+result.rows[i].name+'</li>';
    //                 tag += '<li class="eList" onclick="showInfo(\''+result.rows[i].emergency_id+'\');">'+result.rows[i].emergency_time+'</li>';
    //                 tag += '<li class="eList" onclick="showInfo(\''+result.rows[i].emergency_id+'\');">'+result.rows[i].emergency_check_contents+'</li>';
    //             }
    //             $('#emergencylist>li').remove(".eList");
    //             $('#emergencylist').append(tag);
    //         }else{
    //             alert("응급 발생 이력이 존재하지 않습니다.");
    //         }
    //     },
    //     error: function(e){
    //         console.log(e.responseText);
    //     }
    // });

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/statistics/emergencyList/searchDate',
        cmmReqDataObj = {
            userCode: $("#userCode").val(),
            date1: $("#state-datepicker1").val(),
            date2: $("#state-datepicker2").val()
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.messageCode == "success") {
                let tag = '';

                for (var i = 0; i < result.rowLength; i++) {
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].user_code + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].name + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].emergency_time + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].emergency_check_contents + '</li>';
                }
                $('#emergencylist>li').remove(".eList");
                $('#emergencylist').append(tag);
            } else {
                alert("응급 발생 이력이 존재하지 않습니다.");
            }
        },
        cmmErr = null;

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});

// 이름 조회 폼 submit 발생
$searchNameFrm.submit(function() {
    event.preventDefault();

    if ($searchName.val().length == 0) {
        alert("이름을 입력해 주세요.");
        return false;
    }

    let param = $searchNameFrm.serialize();
    $.ajax({
        url: "searchName",
        type: 'post',
        data: param,
        success: function(result) {
            if (result.messageCode == "success") {
                let tag = '';

                for (var i = 0; i < result.rowLength; i++) {
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].user_code + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].name + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].emergency_time + '</li>';
                    tag += '<li class="eList" onclick="showInfo(\'' + result.rows[i].emergency_id + '\');">' + result.rows[i].emergency_check_contents + '</li>';
                }
                $('#emergencylist>li').remove(".eList");
                $('#emergencylist').append(tag);
            } else {
                alert("응급 발생 이력이 존재하지 않습니다.");
            }
        },
        error: function(e) {
            console.log(e.responseText);
        }
    });
});

// 환자 리스트 클릭 이벤트
function showInfo(emergency_id) {

    $('#em-detail').modal();

    var tag = "";

    $.ajax({
        url: "emergencyInfo",
        type: 'post',
        data: "emergency_id=" + emergency_id,
        success: function(result) {
            if (result.messageCode == "success") {
                $("#user_code").text(result.rows[0].user_code);
                $("#userName").text(result.rows[0].name);
                $("#userBirth").text(result.rows[0].birth_year + result.rows[0].birth_month + result.rows[0].birth_date);
                $("#userAddress").text(result.rows[0].address_1 + " " + result.rows[0].address_2 + " " + result.rows[0].address_3);
                $("#userPhone").text(result.rows[0].phone_first + "-" + result.rows[0].phone_middle + "-" + result.rows[0].phone_last);
                $("#protectorPhone").text(result.rows[0].protector_phone_first + "-" + result.rows[0].protector_phone_middle + "-" + result.rows[0].protector_phone_last);
                $("#eTime1").text(result.rows[0].emergency_time);
                $("#eTime2").text(result.rows[0].emergency_check_time);
                $("#eContent").text(result.rows[0].emergency_check_contents);
            }
        },
        error: function(e) {
            console.log(e.responseText);
        }
    });
}