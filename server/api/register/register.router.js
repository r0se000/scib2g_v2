/** ================================================================
 *  관리대상자 등록 페이지 router
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *  ================================================================
 */

const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./register.controller');
const ctrInstance = new controller();

// 페이지 로드
router.get('/:userCode', asyncErrHelper(ctrInstance.loadRegPage));

// 관리 대상자 등록
router.post('/userRegister', asyncErrHelper(ctrInstance.userRegister));

// 최근 등록된 관리 대상자 조회
router.post('/userCodeSelect', asyncErrHelper(ctrInstance.userCodeSelect));

module.exports = router;