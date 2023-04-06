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
const controller = require('./boapphome.controller');
const ctrInstance = new controller();

router.get('/boapphome/:pUserCode/:userCode', asyncErrHelper(ctrInstance.boapphomeload));

router.get('/checkDetail', asyncErrHelper(ctrInstance.checkDetail));

router.post('/emCheckTimeInput', asyncErrHelper(ctrInstance.emergencyTimeInput));

module.exports = router;