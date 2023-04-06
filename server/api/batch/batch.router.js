/** ================================================================
 *  Batch
 *  @author GG
 *  @since 2022.04.19
 *  @history 2022.04.19 GG ver1.0 작성
 *  ================================================================
 */

const router = require('express').Router();

const asyncErrHelper = require('../../helper/asyncErrHelper'); // async/await error handler

// 호출할 controller 정의
const controller = require('./batch.controller');
const ctrInstance = new controller();

// 0시 배치
router.post('/B2G_Batch', asyncErrHelper(ctrInstance.B2G_Batch));

// 배치 결과 INSERT
router.post('/batch_insert', asyncErrHelper(ctrInstance.batch_insert));

// 데이터 백업
router.post('/data_backup', asyncErrHelper(ctrInstance.data_backup));


module.exports = router;