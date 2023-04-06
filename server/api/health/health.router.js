/** ================================================================
 *  B2G 메인화면 router 
 *  @author MiYeong Jang
 *  @since 2021.09.17
 *  @history 2021.09.17 페이지 로드
 *           
 *  ================================================================
 */
// 인증된 사용자인지 검증하는 미들웨어 JG 2021.04.20
const { checkToken } = require("../../helper/jwtTokenValidation");
const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./health.controller');
const ctrInstance = new controller();

// 건강상태 페이지 로드
router.get('/:userCode', checkToken, asyncErrHelper(ctrInstance.loadHealthPage));

// 날짜 조회
router.post('/dateSearch', asyncErrHelper(ctrInstance.dateSearch));

module.exports = router;