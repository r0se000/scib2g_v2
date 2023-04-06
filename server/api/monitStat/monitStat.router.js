/** ================================================================
 *  B2G 메인화면 router 
 *  @author MiYeong Jang
 *  @since 2021.09.17
 *  @history 2021.09.17 페이지 로드
 *           
 *  ================================================================
 */
// 인증된 사용자인지 검증하는 미들웨어 JG 2021.04.20
const router = require('express').Router();
const { checkToken } = require("../../helper/jwtTokenValidation");

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./monitStat.controller');
const ctrInstance = new controller();


router.get('/:userCode', checkToken, asyncErrHelper(ctrInstance.loadMonitStatPage));

// 응급 발생 통계
router.post('/graphStatistics', asyncErrHelper(ctrInstance.graphStatistics));

// 응급 발생 통계 그래프
router.post('/graphData', asyncErrHelper(ctrInstance.graphData));



module.exports = router;