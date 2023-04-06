/** ================================================================
 *  로그인, 회원가입, 정보 수정 등 사용자 관리 router
 *  @author JG, Jo
 *  @since 2021.04.12
 *  @history 2021.04.19 JG 로그인 기능 추가(jwt)
 *           2021.05.26 JG 중복 검사, 회원정보 조회, 회원 탈퇴 관련 기능 추가
 *  ================================================================
 */

const router = require('express').Router();

const asyncErrHelper = require('../../helper/asyncErrHelper'); // async/await error handler

// 호출할 controller 정의
const controller = require('./user.controller');
const ctrInstance = new controller();

//로그인페이지 호출
router.get('/', asyncErrHelper(ctrInstance.loadIndexPage));

//회원가입 페이지 호출(웹)
router.get('/signUp', asyncErrHelper(ctrInstance.loadSignupPage));

//ID찾기 페이지 호출
router.get('/findUserId', asyncErrHelper(ctrInstance.loadFindIdPage));

//비밀번호 찾기 페이지 호출
router.get('/findUserPw', asyncErrHelper(ctrInstance.loadFindPwPage));

// 회원가입 2021.04.12 
router.post('/signup', asyncErrHelper(ctrInstance.createAdminUser));

// ID 중복 검사 2021.05.26
router.get('/duplicate/id', asyncErrHelper(ctrInstance.checkIdDuplicate));

// email 중복 검사 2021.05.26
router.get('/duplicate/email', asyncErrHelper(ctrInstance.checkEmailDuplicate));

// 앱로그인 2021.10.08
router.post('/applogin', asyncErrHelper(ctrInstance.userAppLogin));

// 관리자 로그인 2021.10.05
router.post('/adminlogin', asyncErrHelper(ctrInstance.adminuserLogin));

// 로그아웃 2021.05.26
router.post('/logout', asyncErrHelper(ctrInstance.userLogout));

// 관리자 로그아웃
router.post('/adminlogout', asyncErrHelper(ctrInstance.adminuserLogout));

// 회원정보 조회 2021.05.26
router.get('/show/info', asyncErrHelper(ctrInstance.userInfoShow));

// 회원정보 수정 2021.05.26
router.post('/modify/info', asyncErrHelper(ctrInstance.modifyUserInfo));

// 비밀번호 수정 2021.05.26
router.post('/modify/password', asyncErrHelper(ctrInstance.modifyUserPassword));

// 회원탈퇴 2021.05.26
router.post('/withdrawal', asyncErrHelper(ctrInstance.withdrawalUser));

// ID 찾기 2021.05.26
router.get('/find/account', asyncErrHelper(ctrInstance.findUserId));

// 이메일 인증번호 전송 2023.04.03
router.post('/authEmail', asyncErrHelper(ctrInstance.authEmail));

// user code 찾기 2021.05.26
router.get('/find/account/code', asyncErrHelper(ctrInstance.findUserCode));

// jwt token 검증 2021.04.19
router.post('/token', asyncErrHelper(ctrInstance.validateJwtToken));

// app jwt token 검증 2021.04.19
router.post('/apptoken', asyncErrHelper(ctrInstance.validateAppJwtToken));

//생년 조회
router.post('/birth', asyncErrHelper(ctrInstance.userBirthInfo));


router.get('/encrypttest', asyncErrHelper(ctrInstance.encryptTest));

router.post('/alertToken', asyncErrHelper(ctrInstance.updateAlertToken));








module.exports = router;