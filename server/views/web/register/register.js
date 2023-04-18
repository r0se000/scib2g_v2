// 날짜 관련 변수
let date = new Date();
let year = date.getFullYear(),
    month = date.getMonth() + 1,
    nowDate = date.getDate(),
    day = date.getDay();

let today = year + '-' + month + '-' + nowDate;

function setDateTime(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let nowhours = getDate.getHours() >= 10 ? getDate.getHours() : '0' + getDate.getHours();
    let nowMinutes = getDate.getMinutes() >= 10 ? getDate.getMinutes() : '0' + getDate.getMinutes();
    let nowSec = getDate.getSeconds() >= 10 ? getDate.getSeconds() : '0' + getDate.getSeconds();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay + " " + nowhours + ':' + nowMinutes + ':' + nowSec;

    return nowtime;
}


let $idInput = $('#id-input[name=id]'),
    regOk = false;

$('#address1-input').on('change', function() {
    if (addressCode == '9999') {
        getAddressId()
    }
});
$('#address2-input').on('change', function() {
    if (addressCode == '9999') {
        getAddressId()
    }
});

function getAddressId() {
    let address_id = $('#address1-input option:selected').val() + $('#address2-input option:selected').val()
    $('input[name=address_id]').val(address_id)
}

//작성된 input값 받아온 후 비어있는 값 있는지 검사.
function getInput() {
    let inputList = {};
    let inputCheck = 0;
    let phoneCheck1 = 0, phoneCheck2 = 0;
    let noticeId;

    $('.form-control').each(function(index, item) {
        noticeId = "#" + $(item).attr('name') + "-notice"
        itemId = $(item).attr('id');

        switch ($(item).attr('id')){
            case 'name-input':
                if(validator($(item).val(), 'isEmpty') || $(item).val().length<2){
                    $(noticeId).removeClass('deactive-notice')
                    $(noticeId).addClass('active-notice')
                }else{
                    $(noticeId).removeClass('active-notice')
                    $(noticeId).addClass('deactive-notice')
                    inputCheck++
                    inputList.name = $(item).val()
                }
                break
            case 'gen-input':
                if($(item).val()=="선택"){
                    $(noticeId).removeClass('deactive-notice')
                    $(noticeId).addClass('active-notice')
                }else{
                    $(noticeId).removeClass('active-notice')
                    $(noticeId).addClass('deactive-notice')
                    inputCheck++
                    inputList.gender = $(item).val()
                }
                break
            case 'address1-input':
                if($(item).val()=="시/도"){
                    $("#address1-notice").removeClass('deactive-notice')
                    $("#address1-notice").addClass('active-notice')
                }else{
                    $("#address1-notice").removeClass('active-notice')
                    $("#address1-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.address1 = $(item).val()
                }
                break
            case 'address2-input':
                if($(item).val()=="시/도"){
                    $("#address2-notice").removeClass('deactive-notice')
                    $("#address2-notice").addClass('active-notice')
                }else{
                    $("#address2-notice").removeClass('active-notice')
                    $("#address2-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.address2 = $(item).val()
                }
                break     
            case 'address3-input':
                if ($(item).val() == "") {
                    $("#address3-notice").removeClass('deactive-notice')
                    $("#address3-notice").addClass('active-notice')
                } else {
                    $("#address3-notice").removeClass('active-notice')
                    $("#address3-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.address3 = $(item).val()
                }
                break
            case 'user-phone2-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#user2-notice").removeClass('deactive-notice')
                    $("#user2-notice").addClass('active-notice')
                    phoneCheck1++;
                } else {
                    $("#user2-notice").removeClass('active-notice')
                    $("#user2-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.user2 = $(item).val()
                }
                break        
            case 'user-phone3-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#user3-notice").removeClass('deactive-notice')
                    $("#user3-notice").addClass('active-notice')
                    phoneCheck1++;
                } else {
                    $("#user3-notice").removeClass('active-notice')
                    $("#user3-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.user3 = $(item).val()
                }
                break       
            case 'protect-phone2-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#protector2-notice").removeClass('deactive-notice')
                    $("#protector2-notice").addClass('active-notice')
                    phoneCheck2++;
                } else {
                    $("#protector2-notice").removeClass('active-notice')
                    $("#protector2-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.protector2 = $(item).val()
                }
                break
            case 'protect-phone3-input':
                if ($(item).val() == "" | $(item).val().length < 4) {
                    $("#protector3-notice").removeClass('deactive-notice')
                    $("#protector3-notice").addClass('active-notice')
                    phoneCheck2++;
                } else {
                    $("#protector3-notice").removeClass('active-notice')
                    $("#protector3-notice").addClass('deactive-notice')
                    inputCheck++
                    inputList.protector3 = $(item).val()
                }
                break              
        }
        if(phoneCheck1>0){
            $("#user1-notice").removeClass('deactive-notice')
            $("#user1-notice").addClass('active-notice')
        }
        if(phoneCheck2>0){
            $("#protector1-notice").removeClass('deactive-notice')
            $("#protector1-notice").addClass('active-notice')
        }
        if(inputCheck==9){
            userCodeSetting($("#id-input1").val())
            inputList.bYear = $("#birth-year-input").val()
            inputList.bMonth = $("#birth-month-input").val()
            inputList.bDay = $("#birth-day-input").val()
            inputList.address_id = $("#id-input1").val()
            inputList.id = $("#id-input").val()
            inputList.user1 = $("#user-phone1-input").val()
            inputList.protector1 = $("#protect-phone1-input").val()
            regOk = true;
        }
    });
    return inputList;
}


/** ================================================================
 *  관리 대상자 코드 세팅(가장 최근 등록된 관리 대상자 코드 조회 후 ID값 세팅)
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *  ================================================================
 */
function userCodeSetting(addressCode) {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/register/userCodeSelect',
        cmmReqDataObj = {"addressCode":addressCode},
        cmmAsync = false,
        cmmSucc = function(result) {
            if (!result.success) { //userCode 조회되지 않은 경우
                $("#id-input").val(1); // 1번으로 세팅
            } else {
                //최근 관리 대상자 코드에 +1 해주기
                let userId = result.rows[0].user_code;
                userId = parseInt(userId.substring(4)) + 1;
                $("#id-input").val(userId);
            }
        },
        cmmErr = function() {
            alert('실패');
        };
    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
}


/** ================================================================
 *  관리 대상자 등록
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *           2023.04.11 regOk 코드 수정
 *  ================================================================
 */
$('#register').on('click', function() {
    let input = getInput();

    if(!regOk){ // input 체크 false인 경우 중단
        return;
    }

    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/register/userRegister',
        cmmReqDataObj = {
            userCode: userCode,
            inputlist: input,
            registerDate: setDateTime(new Date())
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.state == false) {
                alert('관리 대상자 등록 실패하였습니다. 다시 시도해 주세요.');
            } else {
                alert('관리 대상자가 등록되었습니다. 페이지를 새로고침합니다.')
                location.href = baseUrl + '/register/' + userCode;
            }
        },
        cmmErr = function() {
            alert('관리 대상자 등록 실패하였습니다. 다시 시도해 주세요.');
        };

        commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
})


//휴대폰 번호 입력 제한
function maxLengthCheck(object) {
    if (object.value.length > object.maxLength) {
        object.value = object.value.slice(0, object.maxLength);
    }
}