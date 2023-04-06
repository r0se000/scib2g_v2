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
const controller = require('./rtime_web.controller');
const ctrInstance = new controller();

//실시간 페이지 로드. userCode: 관리자 유저 코드
router.get('/:userCode', asyncErrHelper(ctrInstance.loadRtimePage));

//실시간 데이터 전송
router.get('/select/rtimeData', asyncErrHelper(ctrInstance.selectRtime));

//연결없음 데이터 전송
router.get('/select/unconnectedData', asyncErrHelper(ctrInstance.selectUnconnectedData));

//사용자 상세정보 데이터 전송
router.get('/select/userInfo', asyncErrHelper(ctrInstance.selectUserInfo));

//사용자 특이사항 업데이트
router.post('/updateNote', asyncErrHelper(ctrInstance.updateUserNote));

//사용자 A/S 조회
router.post('/selectAS', asyncErrHelper(ctrInstance.selectAS));

//사용자 A/S 등록
router.post('/insertAS', asyncErrHelper(ctrInstance.insertAS));


module.exports = router;