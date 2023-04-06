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
    regOk;

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
    let inputlist = {},
        noticeId;

    $('.form-control').each(function(index, item) {
        noticeId = "#" + $(item).attr('name') + "-notice"
        if ($(item).val() == "" | $(item).val() == "선택" | $(item).val() == "시/도" | $(item).val() == "시/군/구") {
            if ($(item).attr('name') == "protector2" | $(item).attr('name') == "protector3") {
                $(item).val('')
                regOk = true
            } else if ($(item).attr('name') == "user2" | $(item).attr('name') == "user3") {
                $(item).val('')
                regOk = true
            } else {
                $(noticeId).removeClass('deactive-notice')
                $(noticeId).addClass('active-notice')
                regOk = false
                $(item).focus()
                return false
            }
        } else {
            if ($(item).attr("name") == "address1" | $(item).attr("name") == "address2") {
                let id = $(item).attr('id')
                inputlist[$(item).attr('name')] = $("#" + id + " option:selected").text()
            } else {
                inputlist[$(item).attr('name')] = $(item).val()
            }
            $(noticeId).addClass('deactive-notice')
            $(noticeId).removeClass('active-notice')
            regOk = true
        }
    });
    return inputlist
}


/** ================================================================
 *  관리 대상자 코드 세팅(가장 최근 등록된 관리 대상자 코드 조회 후 ID값 세팅)
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *  ================================================================
 */

userCodeSetting();

function userCodeSetting() {
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/register/userCodeSelect',
        cmmReqDataObj = {},
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
 *  ================================================================
 */
$('#register').on('click', function() {
    let list = getInput();
    let cmmContentType = 'application/json',
        cmmType = 'post',
        cmmUrl = '/api/register/userRegister',
        cmmReqDataObj = {
            userCode: userCode,
            inputlist: list,
            registerDate: setDateTime(new Date())
        },
        cmmAsync = false,
        cmmSucc = function(result) {
            if (result.state == false) {
                if (result.error.errno == 1062) {
                    regok = false
                }
            } else {
                alert('관리 대상자가 등록되었습니다. 페이지를 새로고침합니다.')
                location.href = baseUrl + '/register/' + userCode;
            }
        },
        cmmErr = function() {
            alert('실패');
        };

    if (regOk == false) {
        $('#notice').addClass('activate-notice')
        $('#notice').removeClass('deactivate-notice')
    } else {
        $('#notice').addClass('deactivate-notice')
        $('#notice').removeClass('activate-notice')
        commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
})


//휴대폰 번호 입력 제한
function maxLengthCheck(object) {
    if (object.value.length > object.maxLength) {
        object.value = object.value.slice(0, object.maxLength);
    }
}