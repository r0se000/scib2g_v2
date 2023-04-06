let userCodeList = [];
let $searchDateFrm = $('#searchDateFrm');
let $searchNameFrm = $('#searchNameFrm');
let $allBtn = $('#allBtn');
let $dateBtn = $('#dateBtn');
let $nameBtn = $('#nameBtn');
let $stateDatePicker1 = $('#state-datepicker1');
let $stateDatePicker2 = $('#state-datepicker2');
let $searchName = $('#search_name');

// as 상세정보 버튼들
let $deleteButton = $('#deleteButton');
let $cancelButton = $('#cancelButton');
let $modifyButton = $('#modifyButton');

// as 등록 버튼들
let $asRegisterButton = $('#asRegister');
let $searchDateFrm_regi = $('#searchDateFrm_regi');
let $stateDatePicker3 = $('#state-datepicker3');
let $searchName_regi = $('#searchName_regi'); // as등록 이름입력칸
let $searchNameFrm_regi = $('#searchNameFrm_regi'); // as등록 이름입력 조회버튼
let $close_regi = $('#close_regi');
let $cancelButton_regi = $('#cancelButton_regi');
let $registButton_regi = $('#registButton_regi');

const myTextarea = document.querySelector('#asContents');
const asContents_regi = document.querySelector('#asContents_regi');



let originalText;
var as_num;
let usercode_AS;
let usercode_regi;




$(".nav--item").click(function() {
    var val = $(this).attr('data-tab-target');

    $('.nav--item').removeClass('-is--active');
    $(this).addClass('-is--active');

    $(".tabset--content").attr('data-active-tab', val);

});

async function init() {
    showList_AS();
}


// =============================================   사용자 조회 =================================================================================

// 유저리스트 조회
$(function() {
    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/p_manage/userList',
        cmmReqDataObj = {
            userCode: userCode,
            selectUserList: userCodeList
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            let rtimeLength = Object.keys(result.userList.rowLength).length
            if (result.userList.rowLength == 0) {
                alert("유저리스트가 존재하지 않습니다.");
            } else {
                for (let i = 0; i < result.userList.rowLength; i++) {
                    const temp = document.createElement("div")
                    temp.setAttribute(`id`, `${result.userList.rows[i].user_code}`);
                    temp.innerHTML = `
                <li id ="name_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">${result.userList.rows[i].name}</li>
                <li id ="user_code_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">${result.userList.rows[i].user_code}</li>
                <li id = "registerDate_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">${result.userList.rows[i].user_register_date}</li>
                <li id = "count_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">${result.countEmergency[result.userList.rows[i].user_code].cnt}</li>
                `;
                    document.querySelector("#user_inquiry").append(temp);
                }
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});


// lcg
// 사용자 조회 상세정보 페이지 조회
function showInfo(user_code) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/user_detail',
        cmmReqDataObj = { // user_code를 userCode라는 변수에 담아서 router로 보냄.
            userCode: user_code
        },
        cmmAsync = false,

        cmmSucc = function showInfo(result) {
            $('#manageUser-detail').appendTo("body").modal('show');
            $("#userName").text(result.row.name);
            $("#sex").text(result.row.sex);
            $("#userBirth").text(result.row.birth_year + '년 ' + result.row.birth_month + '월 ' + result.row.birth_date + '일');
            $("#userAddress").text(result.row.address_1 + " " + result.row.address_2 + " " + result.row.address_3);
            $("#userPhone").text(result.row.phone_first + "-" + result.row.phone_middle + "-" + result.row.phone_last);
            $("#protectorPhone").text(result.row.protector_phone_first + "-" + result.row.protector_phone_middle + "-" + result.row.protector_phone_last);




        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};


// =============================================   모니터링 관리 =================================================================================

let today = new Date();
let year = today.getFullYear();
let month = ('0' + (today.getMonth() + 1)).slice(-2);
let day = ('0' + today.getDate()).slice(-2);
let dateString = year + '-' + month + '-' + day;


let dateFormat = 'YYYY-MM-DD',
    todayStr = moment(new Date()).format(dateFormat),
    yesterdayStr = moment(todayStr).subtract('1', 'day').format(dateFormat),
    selectDayStr;

// 달력 실행  datepicker 1,2 는 모니터링 관리의 날짜 조회 3은 as관리의 등록 시 날짜 선택
$stateDatePicker1.bootstrapMaterialDatePicker({
    weekStart: 0,
    time: false,
    maxDate: todayStr
});

$stateDatePicker3.bootstrapMaterialDatePicker({
    weekStart: 0,
    time: false,
    maxDate: todayStr,
    currentDate: todayStr
});

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
    $('#monitoring_inquiry>div>li').remove(".MList_date");
    $('#monitoring_inquiry>div>p').remove(".MList_date");
    $('#monitoring_inquiry>div>li').remove(".MList_name");
    $('#monitoring_inquiry>div>p').remove(".MList_name");
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

    let MList = document.getElementsByClassName("MList");
    for (let i = 0; i < MList.length; i++) {
        MList[i].style.display = "";

    }


});
$dateBtn.click(function() {
    $('#monitoring_inquiry>div>li').remove(".MList_date");
    $('#monitoring_inquiry>div>p').remove(".MList_date");
    $('#monitoring_inquiry>div>li').remove(".MList_name");
    $('#monitoring_inquiry>div>p').remove(".MList_name");
    $allBtn.css('background-color', 'white');
    $allBtn.css('font-weight', 'normal');
    $dateBtn.css('background-color', 'lightgray');
    $dateBtn.css('font-weight', 'bold');
    $nameBtn.css('background-color', 'white');
    $nameBtn.css('font-weight', 'normal');

    $searchDateFrm.css('display', 'block');
    $searchNameFrm.css('display', 'none');
    $("#searchNameFrm>input[type=text]").val(null);

    let MList = document.getElementsByClassName("MList");
    for (let i = 0; i < MList.length; i++) {
        MList[i].style.display = "none";

    }
});
$nameBtn.click(function() {
    $('#monitoring_inquiry>div>li').remove(".MList_date");
    $('#monitoring_inquiry>div>p').remove(".MList_date");
    $('#monitoring_inquiry>div>li').remove(".MList_name");
    $('#monitoring_inquiry>div>p').remove(".MList_name");
    $allBtn.css('background-color', 'white');
    $allBtn.css('font-weight', 'normal');
    $dateBtn.css('background-color', 'white');
    $dateBtn.css('font-weight', 'normal');
    $nameBtn.css('background-color', 'lightgray');
    $nameBtn.css('font-weight', 'bold');

    $searchDateFrm.css('display', 'none');
    $("#searchDateFrm>input[type=text]").val(null);
    $searchNameFrm.css('display', 'block');

    let MList = document.getElementsByClassName("MList");
    for (let i = 0; i < MList.length; i++) {
        MList[i].style.display = "none";

    }

});


$(function() {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/emergencyList/searchDate',
        cmmReqDataObj = {
            userCode: $("#userCode").val(),
            date1: '2022-01-01',
            date2: dateString
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.messageCode == "success") {

                for (var i = 0; i < result.rowLength; i++) {

                    const temp = document.createElement("div")
                    temp.innerHTML = `
                <li class ="MList" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].name}</li>
                <li class ="MList" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].user_code}</li>
                <li class ="MList" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].emergency_time}</li>
                <li class ="MList" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].emergency_check_contents}</li>
                `;
                    document.querySelector("#monitoring_inquiry").append(temp);
                }

            } else {
                alert("모니터링 발생 이력이 존재하지 않습니다.");
            }
        },
        cmmErr = null;

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});



//날짜 조회 폼 submit 발생
$searchDateFrm.submit(function() {
    event.preventDefault();
    $('#monitoring_inquiry>div>li').remove(".MList_date");
    $('#monitoring_inquiry>div>p').remove(".MList_date");
    $('#monitoring_inquiry>div>li').remove(".MList_name");
    $('#monitoring_inquiry>div>p').remove(".MList_name");

    if ($stateDatePicker1.val() == '') {
        alert("시작 날짜를 선택해 주세요.");
        return false;
    }
    if ($stateDatePicker2.val() == '') {
        alert("마지막 날짜를 선택해 주세요.");
        return false;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/emergencyList/searchDate',
        cmmReqDataObj = {
            userCode: $("#userCode").val(),
            date1: $("#state-datepicker1").val(),
            date2: $("#state-datepicker2").val()
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.messageCode == "success") {

                for (var i = 0; i < result.rowLength; i++) {

                    const temp = document.createElement("div")
                    temp.innerHTML = `
                <li class ="MList_date" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].name}</li>
                <li class ="MList_date" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].user_code}</li>
                <li class ="MList_date" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].emergency_time}</li>
                <li class ="MList_date" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].emergency_check_contents}</li>
                `;
                    document.querySelector("#monitoring_inquiry").append(temp);
                }

            } else {
                const temp = document.createElement("div")
                temp.innerHTML = `<p class ="MList_date"><br><br><br>선택한 기간의 <br>모니터링 기록이 존재하지 않습니다.</p>`;
                document.querySelector("#monitoring_inquiry").append(temp);
            }
        },
        cmmErr = null;

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});


// 이름 조회 폼 submit 발생
$searchNameFrm.submit(function() {
    event.preventDefault();
    $('#monitoring_inquiry>div>li').remove(".MList_date");
    $('#monitoring_inquiry>div>p').remove(".MList_date");
    $('#monitoring_inquiry>div>li').remove(".MList_name");
    $('#monitoring_inquiry>div>p').remove(".MList_name");
    if ($searchName.val().length == 0) {
        alert("이름을 입력해 주세요.");
        return false;
    }
    let name = $searchName.val();
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/emergencyList/searchName',
        cmmReqDataObj = {
            name: name,
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.messageCode == "success") {
                for (var i = 0; i < result.rowLength; i++) {

                    const temp = document.createElement("div")
                    temp.innerHTML = `
                <li class ="MList_name" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].name}</li>
                <li class ="MList_name" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].user_code}</li>
                <li class ="MList_name" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].emergency_time}</li>
                <li class ="MList_name" onclick = "showInfo_M('${result.rows[i].user_code}')">${result.rows[i].emergency_check_contents}</li>
                `;
                    document.querySelector("#monitoring_inquiry").append(temp);
                }

            } else {
                const temp = document.createElement("div")
                temp.innerHTML = `<p class ="MList_name"><br><br><br>입력한 이름에 해당되는 <br>모니터링 기록이 존재하지 않습니다.</p>`;
                document.querySelector("#monitoring_inquiry").append(temp);
            }
        },
        cmmErr = null;

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);


});


// 모니터링 관리 상세정보 페이지 조회
function showInfo_M(user_code) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/monitoring_detail',
        cmmReqDataObj = { // user_code를 userCode라는 변수에 담아서 router로 보냄.
            userCode: user_code
        },
        cmmAsync = false,

        cmmSucc = function showInfo_M(result) {
            $("#adminName").text(result.row.a_user_name);
            $("#monitoringOccur").text(result.row.emergency_time);
            $("#monitoringCheck").text(result.row.emergency_web_check);
            $("#contentsTime").text(result.row.emergency_contents_time);
            $('#manageMonitoring-detail').appendTo("body").modal('show');
        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};


// ============================================================== A/S 관리 ======================================================================

function showList_AS() {
    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/p_manage/asList',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function showList_AS(result) {
            $('#as_inquiry>div>li').remove(".asList");

            if (result.userList.rowLength == 0) {
                alert("유저리스트가 존재하지 않습니다.");

            } else {
                for (let i = 0; i < result.userList.rowLength; i++) {
                    const temp = document.createElement("div")

                    temp.innerHTML = `
                <li class = "asList ${result.userList.rows[i].as_num}" onclick = "showInfo_AS('${result.userList.rows[i].as_num}')">${result.userList.rows[i].name}</li>
                <li class = "asList ${result.userList.rows[i].as_num}" onclick = "showInfo_AS('${result.userList.rows[i].as_num}')">${result.userList.rows[i].user_code}</li>
                <li class = "asList ${result.userList.rows[i].as_num}" onclick = "showInfo_AS('${result.userList.rows[i].as_num}')">${result.userList.rows[i].as_created_date}</li>
                `;
                    document.querySelector("#as_inquiry").append(temp);
                }
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

};

// A/S 관리 상세정보 페이지 조회
function showInfo_AS(as_num) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/asDetail',
        cmmReqDataObj = {
            as_num: as_num
        },
        cmmAsync = false,

        cmmSucc = function showInfo_AS(result) {
            alert(result);
            $("#userNameAs").text(result.row.name);
            $("#userBirthAs").text(result.row.birth_year + '년 ' + result.row.birth_month + '월 ' + result.row.birth_date + '일');
            $("#asDate").text(result.row.as_created_date);
            $("#asContents").val(result.row.as_detail);
            $('#manageAS-detail').appendTo("body").modal('show');
            originalText = result.row.as_detail;
            usercode_AS = result.row.user_code;
            // delete 버튼 value 값에 넣기
            $deleteButton.value = result.row.as_num;
            $modifyButton.value = result.row.as_num;

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};

// A/S 내용 수정 함수
function modify_as(as_num) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/asModify',
        cmmReqDataObj = { // user_code를 userCode라는 변수에 담아서 router로 보냄.
            as_num: as_num,
            text: myTextarea.value
        },
        cmmAsync = false,

        cmmSucc = function showInfo_AS(result) {
            if (result.succ == 1) {
                alert("수정되었습니다.")
                showList_AS();
                $('#manageAS-detail').appendTo("body").modal('hide');
            } else {
                alert("실패!")
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};

// A/S 목록 삭제 함수
function delete_as(as_num) {

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/asDelete',
        cmmReqDataObj = {
            as_num: as_num
        },
        cmmAsync = false,

        cmmSucc = function delete_as(result) {

            if (result.succ == 1) {
                alert("삭제하였습니다..")
                showList_AS();
                $('#manageAS-detail').appendTo("body").modal('hide');
            } else {
                alert("삭제 실패!")
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};


$deleteButton.click(function() {

    delete_as($deleteButton.value);

});

$cancelButton.click(function() {
    myTextarea.value = originalText;
});

// A/S 상세정보창 수정 버튼
$modifyButton.click(function() {

    modify_as($modifyButton.value);
});

// A/S 등록 버튼
$asRegisterButton.click(function() {
    document.getElementById('searchName_regi').value = "";
    $("#asTitle_regi").text('A/S 등록');
    document.getElementById('asContents_regi').value = "";



    $('#manageAS-register').appendTo("body").modal('show');

});

// A/S 등록 모달 창 이름 조회 시 x 버튼
$close_regi.click(function() {
    $('#manageAS-register').appendTo("body").modal('show');
})

// A/S 등록 모달 창에 있는 취소 버튼
$cancelButton_regi.click(function() {
    $('#manageAS-register').appendTo("body").modal('hide');

})

// A/S 등록 모달 창 등록 버튼
$registButton_regi.click(function() {

    asRegist(usercode_regi);

})


// A/S 관리에서 A/S 등록 버튼을 누른 후 이름 조회 함수
$searchNameFrm_regi.submit(function() {
    event.preventDefault();
    $('#as_name_select>div>li').remove(".MList_regi");
    if ($searchName_regi.val().length == 0) {
        alert("이름을 입력해 주세요.");
        return false;
    }
    let name = $searchName_regi.val();
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/emergencyList/searchName',
        cmmReqDataObj = {
            name: name,
            userCode: userCode
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            alert("search name: " + result)
            if (result.messageCode == "success") {
                $('#manageAS-name').appendTo("body").modal('show');
                $('#manageAS-register').appendTo("body").modal('hide');
                for (var i = 0; i < result.rowLength; i++) {

                    const temp = document.createElement("div")
                    temp.innerHTML = `
                <li class ="MList_regi" onclick = "showInfo_R('${result.rows[i].user_code}')">${result.rows[i].name}</li>
                <li class ="MList_regi" onclick = "showInfo_R('${result.rows[i].user_code}')">${result.rows[i].user_code}</li>
                <li class ="MList_regi" onclick = "showInfo_R('${result.rows[i].user_code}')">${result.rows[i].birth_year+'년 ' + result.rows[i].birth_month+'월 ' + result.rows[i].birth_date+'일'}</li>
                <li class ="MList_regi" onclick = "showInfo_R('${result.rows[i].user_code}')">${result.rows[i].sex}</li>

                `;
                    document.querySelector("#as_name_select").append(temp);
                }

            } else {
                alert("해당되는 관리대상자가 존재하지 않습니다.");
            }
        },
        cmmErr = null;

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);


});

// A/S 등록 이름 조회하여 목록 클릭 시 함수
function showInfo_R(user_code) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/asDetail_regi',
        cmmReqDataObj = { // user_code를 userCode라는 변수에 담아서 router로 보냄.
            userCode: user_code
        },
        cmmAsync = false,

        cmmSucc = function showInfo_R(result) {
            $('#manageAS-name').appendTo("body").modal('hide');
            $('#manageAS-register').appendTo("body").modal('show');
            $("#asTitle_regi").text(result.row.name + '(' + result.row.user_code + ')님 A/S 등록');
            usercode_regi = result.row.user_code;

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};


// A/S 등록 모달창 등록 버튼 누를 때 함수
function asRegist(user_code) {
    if ($searchName_regi.val().length == 0) {
        alert("이름을 입력해 주세요.");
        return false;
    }
    if ($stateDatePicker3.val().length == 0) {
        alert("날짜를 선택해 주세요.");
        return false;
    }
    if (asContents_regi.value.length == 0) {
        alert("A/S 내용을 입력해주세요.");
        return false;
    }
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_manage/asRegist',
        cmmReqDataObj = { // user_code를 userCode라는 변수에 담아서 router로 보냄.
            userCode: user_code,
            text: asContents_regi.value,
            date: $stateDatePicker3.val()
        },
        cmmAsync = false,

        cmmSucc = function asRegist(result) {
            if (result.succ == 1) {
                $('#manageAS-register').appendTo("body").modal('hide');
                alert("등록되었습니다.")
                showList_AS()
            } else {
                alert("이름을 조회하여 선택해주세요.")
            }


        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};