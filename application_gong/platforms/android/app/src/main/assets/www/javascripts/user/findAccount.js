/** =======================================================
 * 아이디 찾기 화면 관련 스크립트
 * 관련 파일: find-account.html
 * @author JG, Jo
 * @since 2021.05.26
 * @history 
 * ========================================================
 */

/*===============================================*/
/* client urls and variables                     */
/*===============================================*/
const introPage = '../index.html';
const loginPage = 'login.html';
const findPwPage = 'find-pw.html';

const inputSuccClass = 'form-control-success';
const inputFailClass = 'form-control-danger';
/*===============================================*/
/* node-server views urls                        */
/*===============================================*/
const accountApiUrl = baseUrl + 'users/find/account';

/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
let $submitBtn = $('#submit-btn'),
    $formInput = $('.form-control') // 모든 form 입력란
    ,
    $loginBtn = $('#modal-login-btn') // 로그인 화면 이동  버튼 
    ,
    $forgotPw = $('#modal-pw-btn') // 비밀번호 찾기 버튼
    ,
    $pageTitle = $('#page-title') // 화면명
    ,
    $formNotice = $('.form-notice') // 모든 form notice
    ,
    $modal = $('#result-modal') // modal
    ,
    $modalInsideBtns = $('.modal-btn') // all modal buttons
    ,
    $modalIdResult = $('#id-result') // 사용자 ID 출력 span    
    ,
    $backbtn = $('#findAccount-back');


/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/
// submitBtn button event
$submitBtn.on('click', function() {
    let tempObj = {};
    $formInput.each(function() {
        let $this = $(this),
            elemId = $this.attr('id'),
            elemName = $this.attr('name'),
            elemVal = $this.val(),
            $notice = null,
            bytesMax = '';

        switch (elemId) {
            case 'name-input':
                $notice = $formNotice.filter('#name-notice');

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticeNm'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    $notice.text('');
                    $notice.addClass('deactive-notice');
                    $notice.removeClass('active-notice');

                    $this.addClass(inputSuccClass);
                    $this.removeClass(inputFailClass);

                    tempObj[elemName] = elemVal;
                }
                break;
            case 'phone1':
                $notice = $formNotice.filter('#email-notice');

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticePhone'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    let bytesLen = validator(elemVal, 'bytesLength');
                    bytesMax = 3;

                    if (bytesLen == bytesMax) {
                        $notice.text('');
                        $notice.addClass('deactive-notice');
                        $notice.removeClass('active-notice');

                        $this.addClass(inputSuccClass);
                        $this.removeClass(inputFailClass);

                        tempObj[elemName] = elemVal;
                    } else {
                        alert('값을 정확히 입력해주세요')
                        $notice.text(i18next.t('noticePhone'));
                        $notice.addClass('active-notice');
                        $notice.removeClass('deactive-notice');

                        $this.addClass(inputFailClass);
                        $this.removeClass(inputSuccClass);
                        $this.focus();
                    }
                }
                break;
            case 'phone2':
                $notice = $formNotice.filter('#email-notice');
                bytesMax = 4;

                if (validator(elemVal, 'isEmpty')) {
                    $notice.text(i18next.t('noticePhone'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    let bytesLen = validator(elemVal, 'bytesLength');
                    if (bytesLen == bytesMax) {
                        $notice.text('');
                        $notice.addClass('deactive-notice');
                        $notice.removeClass('active-notice');

                        $this.addClass(inputSuccClass);
                        $this.removeClass(inputFailClass);

                        tempObj[elemName] = elemVal;
                    } else {
                        alert('값을 정확히 입력해주세요')
                        $notice.text(i18next.t('noticePhone'));
                        $notice.addClass('active-notice');
                        $notice.removeClass('deactive-notice');

                        $this.addClass(inputFailClass);
                        $this.removeClass(inputSuccClass);
                        $this.focus();
                    }
                }
                break;
            case 'phone3':
                $notice = $formNotice.filter('#email-notice');
                bytesMax = 4;
                if (validator(elemVal, 'bytesLenth')) {
                    $notice.text(i18next.t('noticePhone'));
                    $notice.addClass('active-notice');
                    $notice.removeClass('deactive-notice');

                    $this.addClass(inputFailClass);
                    $this.removeClass(inputSuccClass);
                    $this.focus();

                } else {
                    let bytesLen = validator(elemVal, 'bytesLength');
                    if (bytesLen == bytesMax) {
                        $notice.text('');
                        $notice.removeClass('active-notice');
                        $notice.addClass('deactive-notice');

                        $this.addClass(inputSuccClass);
                        $this.removeClass(inputFailClass);

                        tempObj[elemName] = elemVal;
                    } else {
                        alert('값을 정확히 입력해주세요')
                        $notice.text(i18next.t('noticePhone'));
                        $notice.addClass('active-notice');
                        $notice.removeClass('deactive-notice');

                        $this.addClass(inputFailClass);
                        $this.removeClass(inputSuccClass);
                        $this.focus();
                    }
                }
                break;
        }
    });

    if ($('.' + inputFailClass).length < 1) {
        let cmmContentType = 'application/json',
            cmmDataType = 'json',
            cmmType = 'get',
            cmmUrl = accountApiUrl,
            cmmReqDataObj = tempObj,
            cmmAsync = false,
            cmmSucc = function(result) {
                console.log(result)
                if (result.messageCode === 'foundId') {
                    $modal.modal();
                    $modalIdResult.text(result.id);
                } else {
                    alert(i18next.t('noticeNoUser'));
                }
            },
            cmmErr = null;

        commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    }
    return;
});

$modalInsideBtns.on('click', function(evnt) {
    let targetId = evnt.target.id;
    switch (targetId) {
        case 'modal-login-btn':
            location.href = loginPage;
            break;
        case 'modal-pw-btn':
            location.href = findPwPage;
            break;
    }
});

//뒤로가기 버튼 2021.06.02 MY
$backbtn.on('click', function() {
    location.href = loginPage;
})

/*===============================================*/
/* function  area                                */
/*===============================================*/

/**
 * 화면 초기화 작업
 * @author JG, Jo
 * @since 2021.05.26 
 * @history 
 */
function init() {
    let defaultLang = getSessionStorage('defaultLang') || 'en';

    i18next.init({
            lng: defaultLang,
            debug: true,
            resources: transResource
        },
        function(err, t) {
            if (err) {
                console.error(err);
            } else {
                updateContent();
            }
        }
    );

    // back key 눌렀을 때 로그인 페이지로 이동 
    document.addEventListener('deviceready', function() {
        document.addEventListener('backbutton', function() {
            location.href = loginPage;
        }, false);
    }, false);
}

/**
 * 메뉴 언어 변환하기(i18next)
 * @param 
 * @author JG, Jo
 * @since 2021.05.26 
 */
function updateContent() {
    // 페이지 언어 변환
    $pageTitle.text(i18next.t('pageTitle'));
    $loginBtn.text(i18next.t('loginBtn'));
    $forgotPw.text(i18next.t('forgetPw'));
    $submitBtn.text(i18next.t('submitBtn'));
    $('#modal-result-title').text(i18next.t('foundId'));
}