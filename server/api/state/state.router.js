/** ================================================================
 *  건강상태 
 *  @author MiYeong Jang
 *  @since 2021.04.12.
 *  @history 2021.04.12. 페이지 로드
 *           2021.04.16. Ajax 통신 적용
 *           2021.04.20 JG 로그인 인증 적용
 *  ================================================================
 */

// 인증된 사용자인지 검증하는 미들웨어 JG 2021.04.20
const { checkToken } = require("../../helper/jwtTokenValidation");

const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./state.controller');
const ctrInstance = new controller();

//다국어+데이터 로드
//router.get('/state/:userCode', asyncErrHelper(ctrInstance.selectStateData)); 
router.get('/state/:userCode', asyncErrHelper(ctrInstance.selectStateData));
router.get('/p_state/:pUserCode/:userCode', asyncErrHelper(ctrInstance.selectStateData_P));
router.get('/d_state/:userCode', asyncErrHelper(ctrInstance.selectStateData_D));
//Ajax 데이터 로드
router.get('/stateSelectDate', asyncErrHelper(ctrInstance.selectStateDataAjax)); // checkToken 추가 JG 2021.04.20
router.get('/stateSelectDateSub', asyncErrHelper(ctrInstance.selectStateDataAjaxSub));
module.exports = router;