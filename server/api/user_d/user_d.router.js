/** ================================================================
 *  독거노인 본인 앱 로그인 관련 router
 *  @author MiYeong Jang
 *  @since 2021.11.09
 *  @history 2021.11.09. 최초 작성
 *  ================================================================
 */

const router = require('express').Router();

const asyncErrHelper = require('../../helper/asyncErrHelper'); // async/await error handler

// 호출할 controller 정의
const controller = require('./user_d.controller');
const ctrInstance = new controller();

//로그인페이지 호출
router.get('/', asyncErrHelper(ctrInstance.loadIndexPage));

// 로그인 2021.04.19
router.post('/dlogin', asyncErrHelper(ctrInstance.userLogin));


// 로그아웃 2021.05.26
router.post('/logout', asyncErrHelper(ctrInstance.userLogout));

// 회원정보 조회 2021.05.26
router.get('/show/info', asyncErrHelper(ctrInstance.userInfoShow));

// 회원정보 수정 2021.05.26
router.post('/modify/info', asyncErrHelper(ctrInstance.modifyUserInfo));

// jwt token 검증 2021.04.19
router.post('/token', asyncErrHelper(ctrInstance.validateJwtToken));

// app jwt token 검증 2021.04.19
router.post('/apptoken', asyncErrHelper(ctrInstance.validateAppJwtToken));


router.get('/encrypttest', asyncErrHelper(ctrInstance.encryptTest));

router.post('/alertToken', asyncErrHelper(ctrInstance.updateAlertToken));


// 대상자 id 검사 2021.11.02
router.get('/userCodeCheck', asyncErrHelper(ctrInstance.checkUserCode));







module.exports = router;