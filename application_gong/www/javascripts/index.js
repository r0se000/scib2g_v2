/** =======================================================
 * index 화면 관련 스크립트
 * 관련 파일: index.html
 * @author JG, Jo
 * @since 2021.04.27
 * @history
 * ========================================================
 */

/*===============================================*/
/* jquery selector caching area                  */
/*===============================================*/
const homePageUrl = baseUrl + 'state/state/';
let $goSignIn = $('#go-signin') // 로그인 페이지 이동
    ,
    $goSignUp = $('#go-signup') // 회원가입 페이지 이동
;

/*===============================================*/
// page initializing
/*===============================================*/
init();

/*===============================================*/
/* event handler area                            */
/*===============================================*/


/*===============================================*/
/* function  area                                */
/*===============================================*/
/**
 * 사용자 디바이스 언어 감지
 * @author JG, Jo
 * @since 2021.04.28 
 */
function checkMobileLanguage() {
    navigator.globalization.getPreferredLanguage(
        function(lang) {
            console.log(lang.value.slice(0, 2))
            init_pageLang(lang.value.slice(0, 2));
        },
        function() {
            init_pageLang('ERROR');
        }
    );
}

/**
 * 화면 초기화 작업
 * @params sysLang - 시스템 언어 
 * @author JG, Jo
 * @since 2021.04.27 
 * @history 2021.04.28 시스템 언어 감지 추가
 *          2021.06.02 MY 세션스토리지->로컬스토리지로 변경
 *          2021.06.02 MY 폰트 사이즈 고정
 */
function init_pageLang(sysLang) {
    let pageLang = sysLang,
        supportedLangs = ['en', 'ko', 'zh', 'ja'],
        isSupported = supportedLangs.includes(pageLang);

    if (pageLang === 'ERROR' || !isSupported) { // 시스템 언어를 가져올 수 없거나 미지원 언어인 경우
        pageLang = 'en';
    }

    setSessionStorage('defaultLang', pageLang);
    setLocalStorage('defaultLang', pageLang);

    //폰트사이즈 고정
    if (window.MobileAccessibility) {
        window.MobileAccessibility.setTextZoom(100)
        window.MobileAccessibility.usePreferredTextZoom(false);
    }

    //자동로그인, 로컬스토리지에 accessToken이 있으면 로그인 상태로 이동 없으면 index페이지로 이동
    if (getLocalStorage('accessToken') != null) {
        if (navigator.onLine != false) {
            location.href = 'main-frame.html';
        } else { //네트워크 연결이 끊겼을 때 알림창 띄우고 메인 페이지로 이동 안함.
            i18next.init({
                    lng: pageLang,
                    debug: true,
                    resources: {
                        ko: {
                            'translation': {
                                'networkerror': '와이파이 또는 네트워크 연결을 확인해주세요.'
                            }
                        },
                        en: {
                            'translation': {
                                'networkerror': 'Please check the Wi-Fi or network connection.'
                            }
                        },
                        zh: {
                            'translation': {
                                'networkerror': '請確認WiFi或網絡連接'
                            }
                        },
                        ja: {
                            'translation': {
                                'networkerror': 'Wi-Fiまたはネットワーク接続をご確認ください。'
                            }
                        },
                    }
                },
                function(err, t) {
                    if (err) {
                        console.error(err);
                    } else {
                        let networkerror = 'Please check the Wi-Fi or network connection.';
                        alert(i18next.t('networkerror'))
                    }
                });
        }
    } else {
        i18next.init({
                lng: pageLang,
                debug: true,
                resources: {
                    ko: {
                        translation: {
                            goSignIn: '로그인',
                            goSignUp: '회원가입'
                        }
                    },
                    en: {
                        translation: {
                            goSignIn: 'Sign In',
                            goSignUp: 'Sign Up'
                        }
                    },
                    zh: {
                        translation: {
                            goSignIn: '登錄',
                            goSignUp: '註冊會員'
                        }
                    },
                    ja: {
                        translation: {
                            goSignIn: 'ログイン',
                            goSignUp: '会員加入'
                        }
                    }
                }
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
                navigator.app.exitApp();
            }, false);
        }, false);
    }

}

/**
 * 메뉴 언어 변환하기(i18next)
 * @author JG, Jo
 * @since 2021.04.27 
 */
function updateContent() {
    // 페이지 언어 변환
    $goSignIn.append(i18next.t('goSignIn'));
    $goSignUp.append(i18next.t('goSignUp'));
}

/**
 * 앱 실행 초기 작업
 * @author JG, Jo
 * @since 2021.04.28
 * @history 2021.06.02 자동로그인 추가(statepage 호출 추가)
 */
function init() {
    const isCordova = window.hasOwnProperty('cordova'); // cordova 환경인지 확인
    console.log(window.localStorage.getItem('accessToken'));

    document.addEventListener('deviceready', function() {
        FirebasePlugin.getToken(function(fcmToken) {
            console.log(fcmToken);
            // if (getLocalStorage('alertToken') == null | typeof getLocalStorage('alertToken') == 'undefine')
            setLocalStorage('alertToken', fcmToken);
        }, function(error) {
            console.error(error);
        });
    });

    if (typeof jQuery != 'undefined' && chkSessionStorage()) {
        if (isCordova) {
            document.addEventListener('deviceready', checkMobileLanguage, false);
        } else {
            let lang = navigator.language || 'ERROR';
            init_pageLang(lang);
        }
    } else {
        let msg = 'Sorry, your device does not meet minimum requirements to run this app.';

        if (isCordova) {
            document.addEventListener('deviceready', function() {
                navigator.notification.alert(msg, function() {
                    if (navigator.app) {
                        navigator.app.exitApp();
                    } else if (navigator.device) {
                        navigator.device.exitApp();
                    }
                }, 'warning', 'close');
            }, false);
        } else {
            alert(msg);
            window.close();
        }
    }
}