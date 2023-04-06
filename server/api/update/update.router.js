/** ================================================================
 *  B2G 관리대상자 등록 페이지 router 
 *  @author MiYeong Jang
 *  @since 2021.09.17
 *  @history 2021.09.17 페이지 로드
 *           
 *  ================================================================
 */

const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./update.controller');
const ctrInstance = new controller();

// 관리 대상자 정보 수정 페이지 로드
router.get('/:userCode', asyncErrHelper(ctrInstance.loadRegPage));

// 관리 대상자 정보 수정
router.post('/updateInfo', asyncErrHelper(ctrInstance.updateUserInfo));


module.exports = router;