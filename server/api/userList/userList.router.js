/** ================================================================
 *  B2G 메인화면 router 
 *  @author MiYeong Jang
 *  @since 2021.09.17
 *  @history 2021.09.17 페이지 로드
 *           
 *  ================================================================
 */
const router = require('express').Router();
const { checkToken } = require("../../helper/jwtTokenValidation"); // 인증된 사용자인지 검증하는 미들웨어
// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./userList.controller');
const ctrInstance = new controller();

// 페이지 로드
router.get('/:userCode', checkToken, asyncErrHelper(ctrInstance.loadUserListPage));

// 관리 대상자 세부정보 조회
router.get('/select/userInfo', asyncErrHelper(ctrInstance.selectUserInfo));

// 관리 대상자 이름 검색
router.post('/select/searchName', asyncErrHelper(ctrInstance.searchName));

// 서비스 종료 관리 대상자 조회
router.get('/select/endService', asyncErrHelper(ctrInstance.endService));

// 서비스 종료 처리
router.post('/userStatusN', asyncErrHelper(ctrInstance.userStatusN));

// 서비스 재시작 처리
router.post('/userStatusY', asyncErrHelper(ctrInstance.userStatusY));


module.exports = router;