let $allBtn = $('#allBtn');
let $NoConnectBtn = $('#NoConnectBtn');
let userCodeList = [];

async function init() {
    await setInterval(selectRtime, 5000);
}




// lcg
// 유저리스트 조회
$(function() {
    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/p_rtime/userList',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.rowlength == 0) {
                alert("유저리스트가 존재하지 않습니다.");
            } else {
                for (let i = 0; i < result.userList.rows.length; i++) {
                    const temp = document.createElement("div")
                    temp.setAttribute(`id`, `${result.userList.rows[i].user_code}`);
                    temp.innerHTML = `
                <li id ="name_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">${result.userList.rows[i].name}</li>
                <li id ="user_code_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">${result.userList.rows[i].user_code}</li>
                <li id = "state_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">로딩중</li>
                <li id = "hr_${result.userList.rows[i].user_code}" onclick = "showInfo('${result.userList.rows[i].user_code}')">로딩중</li>
                `;
                    document.querySelector("#p_rimelist").append(temp);
                }
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});



// 조회 버튼 클릭(전체, 날짜, 이름)
$allBtn.click(function() {
    $allBtn.css('background-color', 'lightgray');
    $allBtn.css('font-weight', 'bold');
    $NoConnectBtn.css('background-color', 'white');
    $NoConnectBtn.css('font-weight', 'normal');

    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/p_rtime/userList',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            for (let i = 0; i < result.userList.rows.length; i++) {
                document.getElementById(`${result.userList.rows[i].user_code}`).style.display = "";
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);

});
$NoConnectBtn.click(function() {
    $allBtn.css('background-color', 'white');
    $allBtn.css('font-weight', 'normal');
    $NoConnectBtn.css('background-color', 'lightgray');
    $NoConnectBtn.css('font-weight', 'bold');

    let cmmContentType = 'application/json',
        cmmType = 'get',
        cmmUrl = '/api/p_rtime/userList',
        cmmReqDataObj = {},
        cmmAsync = false,
        cmmSucc = function(result) {
            for (let i = 0; i < result.userList.rows.length; i++) {
                if (document.getElementById(`state_${result.userList.rows[i].user_code}`).innerText != ('연결없음')) {
                    document.getElementById(`${result.userList.rows[i].user_code}`).style.display = "none";
                }
            }

        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);



});



// lcg
//상세정보 페이지 조회
function showInfo(user_code) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/p_rtime/user_detail',
        cmmReqDataObj = { // user_code를 userCode라는 변수에 담아서 router로 보냄.
            userCode: user_code
        },
        cmmAsync = false,

        cmmSucc = function showInfo(result) {

            $('#rt-detail').modal();
            $("#userName").text(result.row.name);
            $("#sex").text(result.row.gender);
            $("#userBirth").text(result.row.birth_year + result.row.birth_month + result.row.birth_date);
            $("#userAddress").text(result.row.address_1 + " " + result.row.address_2 + " " + result.row.address_3);
            $("#userPhone").text(result.row.phone_first + "-" + result.row.phone_middle + "-" + result.row.phone_last);
            $("#protectorPhone").text(result.row.protector_phone_first + "-" + result.row.protector_phone_middle + "-" + result.row.protector_phone_last);
            $("#last_data").text(result.row.last_data);



        },
        cmmErr = null;
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
};

//실시간 데이터 로드
function selectRtime() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/p_rtime/select/rtimeData',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode,
            selectUserList: userCodeList
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            let rtimeData = JSON.parse(result.rtimeData),
                rtimeLength = Object.keys(rtimeData).length
            for (let i = 0; i < rtimeLength; i++) {
                let selectUserCode = userCodeList[i]
                let rData = rtimeData[selectUserCode][4]
                $('#hr_' + selectUserCode).text(rData[0])

                $('#name_' + selectUserCode).css("color", "black");
                $('#user_code_' + selectUserCode).css("color", "black");
                $('#state_' + selectUserCode).css("color", "black");
                $('#hr_' + selectUserCode).css("color", "black");

                if (rData[1] == 0) {
                    $('#state_' + selectUserCode).text('빈 침대')

                } else if (rData[1] == 1) {
                    $('#state_' + selectUserCode).text('침대 점유')

                } else if (rData[1] == 2) {
                    $('#state_' + selectUserCode).text('움직임');

                } else {
                    $('#state_' + selectUserCode).text('연결없음')
                        // 센서 연결 끊겼을 시, 실시간 모니터링에서 빨간색으로 표시(웹)
                    $('#name_' + selectUserCode).css("color", "red");
                    $('#user_code_' + selectUserCode).css("color", "red");
                    $('#state_' + selectUserCode).css("color", "red");
                    $('#hr_' + selectUserCode).css("color", "red");
                }

            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}