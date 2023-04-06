/** =======================================================
 * login 화면 관련 스크립트
 * 관련 파일: login.html
 * @author JG, Jo
 * @since 2021.04.19
 * @history 2021.04.27 JG 영문 추가
 *          2021.05.04 JG 중국어, 일본어 추가
 *          2021.05.07 JG 뒤로가기 버튼 클릭 시 앱 시작 화면으로 이동 기능 추가
 *          2021.05.10 JG 페이지 번역 기능 개선
 *          2021.05.23 JG 아이디 찾기, 비밀번호 찾기 버튼 이벤트 추가
 *          2021.06.02 MY 세션스토리지->로컬스토리지로 변경
 * ========================================================
 */

/*===============================================*/
/* client urls                                   */
/*===============================================*/
const introPage = '../index.html';
const findAccountPage = 'find-account.html';
const findPasswordPage = 'find-pw.html';
/*===============================================*/
/* node-server views urls                        */
/*===============================================*/
// const loginApiUrl = baseUrl + 'users/login';
// const homePageUrl = baseUrl + 'state/state/';
const loginApiUrl = baseUrl + 'users/applogin';
const homePageUrl = baseUrl + 'p_apphome/p_apphome/';
/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
let $loginBtn = $('#login-btn'), // 로그인 버튼
    $idInput = $('#account-id'), // ID 입력란
    $pwInput = $('#account-pw'), // password 입력란
    $pageTitle = $('#page-title'), // 화면명
    $forgotId = $('#find-id'), // ID 찾기
    $forgotPw = $('#find-pw'), // 비밀번호 찾기
    $loginBack = $('#login-back');


/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/
// login button event
$loginBtn.on('click', function() {
    console.log(loginApiUrl)
    let cmmContentType = 'application/json',
        cmmDataType = 'json',
        cmmType = 'post',
        cmmUrl = loginApiUrl,
        cmmReqDataObj = {
            accountId: $idInput.val(),
            accountPw: $pwInput.val(),
        },
        cmmAsync = false,
        cmmSucc = function(result) {

            let msgCode = result.messageCode;
            let loginCheck = result.logincheck;

            if (msgCode === 'ExistUser') {
                if (loginCheck == 'Y') {
                    alert(i18next.t('noticeAlreadyLogined'))
                }
                setSessionStorage('userCode', '' + result.userCode);
                setLocalStorage('userCode', '' + result.userCode);
                setLocalStorage('familyId', '' + result.familyId);
                setLocalStorage('userName', result.userName);
                setLocalStorage('accessToken', result.accessToken);

                let homePage = homePageUrl + result.userCode,
                    homePageTitle = 'pageTitle_EmStatus';

                setLocalStorage('homepage', homePage);
                setLocalStorage('homepageTitle', homePageTitle);

                location.href = '../main-frame.html';
            } else if (msgCode === 'alreadyLogin') {
                alert(i18next.t('noticeAlreadyLogined'));
            } else {
                alert(i18next.t('noticeNoUser'));
            }
        },
        cmmErr = null;


    let result = commAjax(cmmContentType, cmmDataType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return;
});

// find id event
$forgotId.on('click', function() {
    location.href = findAccountPage;
});

// find password event
$forgotPw.on('click', function() {
    location.href = findPasswordPage;
});

//back button event
$loginBack.on('click', function() {
    location.href = introPage;
});

/*===============================================*/
/* function  area                                */
/*===============================================*/

/**
 * 화면 초기화 작업
 * @author JG, Jo
 * @since 2021.04.20 
 * @history 2021.04.28 JG 세션 스토리지에서 시스템 기본 언어 가져오도록 수정
 *          2021.06.02 MY 세션스토리지->로컬스토리지로 변경
 */
function init() {
    // let defaultLang = getSessionStorage('defaultLang') || 'en';
    let defaultLang = getLocalStorage('defaultLang') || 'en';

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

    // back key 눌렀을 때 앱 시작 페이지로 이동 2021.05.07 JG
    document.addEventListener('deviceready', function() {
        document.addEventListener('backbutton', function() {
            location.href = introPage;
        }, false);
    }, false);
}

/**
 * 메뉴 언어 변환하기(i18next)
 * @param 
 * @author JG, Jo
 * @since 2021.04.09 
 */
function updateContent() {
    // 페이지 언어 변환
    $pageTitle.text(i18next.t('pageTitle'));
    $loginBtn.text(i18next.t('loginBtn'));
    $forgotId.text(i18next.t('forgetId'));
    $forgotPw.text(i18next.t('forgetPw'));

}