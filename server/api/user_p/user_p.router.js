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
const controller = require('./user_p.controller');
const ctrInstance = new controller();

//로그인페이지 호출
router.get('/', asyncErrHelper(ctrInstance.loadIndexPage));

//회원가입 페이지 호출
router.get('/signUp', asyncErrHelper(ctrInstance.loadSignupPage));

//ID찾기 페이지 호출
router.get('/findUserId', asyncErrHelper(ctrInstance.loadFindIdPage));

//비밀번호 찾기 페이지 호출
router.get('/findUserPw', asyncErrHelper(ctrInstance.loadFindPwPage));

// 회원가입 2021.04.12 
router.post('/signup', asyncErrHelper(ctrInstance.createUser));

// ID 중복 검사 2021.05.26
router.get('/duplicate/id', asyncErrHelper(ctrInstance.checkIdDuplicate));

// 로그인 2021.04.19
router.post('/login', asyncErrHelper(ctrInstance.userLogin));

// 로그아웃 2021.05.26
router.post('/logout', asyncErrHelper(ctrInstance.userLogout));

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

// user code 찾기 2021.05.26
router.get('/find/account/code', asyncErrHelper(ctrInstance.findUserCode));

// jwt token 검증 2021.04.19
router.post('/token', asyncErrHelper(ctrInstance.validateJwtToken));

// app jwt token 검증 2021.04.19
router.post('/apptoken', asyncErrHelper(ctrInstance.validateAppJwtToken));


router.get('/encrypttest', asyncErrHelper(ctrInstance.encryptTest));

router.post('/alertToken', asyncErrHelper(ctrInstance.updateAlertToken));


// 대상자 id 검사 2021.11.02
router.get('/userCodeCheck', asyncErrHelper(ctrInstance.checkUserCode));

// 보호자, 독거노인 ID 매칭
router.post('/userMatching', asyncErrHelper(ctrInstance.userMatching));



module.exports = router;