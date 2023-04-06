/** ================================================================
 *  실시간 생체정보
 *  @author MiYeong Jang
 *  @since 2021.06.02.
 *  @history 2021.06.02. 최초작성
 *           
 *  ================================================================
 */

const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

const { checkToken } = require("../../helper/jwtTokenValidation"); // 인증된 사용자인지 검증하는 미들웨어

// 호출할 controller 정의
const controller = require('./rtime.controller');
const ctrInstance = new controller();
//센서 작동 여부 확인 (삭제금지)
router.get('/rtime/alive/:nodeId', asyncErrHelper(ctrInstance.selectRtimeDataAliveAjax));

//공무원 앱 실시간 페이지 로드
router.get('/rtime/:userCode', checkToken, asyncErrHelper(ctrInstance.loadRtimePageApp));

//보호자 앱 실시간 페이지 로드
router.get('/rtime/:pUserCode/:userCode', checkToken, asyncErrHelper(ctrInstance.loadRtimePageApp));

//앱 실시간 데이터Ajax
router.get('/rtimeChartApp', asyncErrHelper(ctrInstance.selectRtimeDataApp));

//Ajax
router.get('/rtimeChart', asyncErrHelper(ctrInstance.selectRtimeDataAjax));

//용어 불러오기 Ajax
router.get('/rtimePage', asyncErrHelper(ctrInstance.selectRtimePageAjax));

//이력조회
router.get('/rtimeHistory', checkToken, asyncErrHelper(ctrInstance.selectRtHistory));

//이력조회 시간 변경
router.get('/rtHistoryChart', asyncErrHelper(ctrInstance.selectRtHistoryAjax));


module.exports = router;