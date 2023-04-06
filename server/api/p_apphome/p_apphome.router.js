/** ================================================================
 *  b2g 알림 앱 메인페이지 
 *  @author MiYeong Jang
 *  @since 2021.10.08.
 *  @history 
 *  ================================================================
 */
const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./p_apphome.controller');
const ctrInstance = new controller();

router.get('/p_apphome/:userCode', asyncErrHelper(ctrInstance.p_apphomeload));

router.get('/checkDetail', asyncErrHelper(ctrInstance.checkDetail));

router.post('/emCheckTimeInput', asyncErrHelper(ctrInstance.emergencyTimeInput));

module.exports = router;