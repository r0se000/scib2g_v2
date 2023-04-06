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

// 호출할 controller 정의
const controller = require('./monitoring.controller');
const ctrInstance = new controller();
//센서 작동 여부 확인
router.get('/monitoring/alive/:nodeId', asyncErrHelper(ctrInstance.selectMonitoringDataAliveAjax));

//실시간페이지 로드
// router.get('/rtime/:userCode', asyncErrHelper(ctrInstance.selectRtimeData));
router.get('/monitoring/:userCode', asyncErrHelper(ctrInstance.loadMonitoringPageApp));

router.get('/monitoring/:pUserCode/:userCode', asyncErrHelper(ctrInstance.loadMonitoringPageApp));

router.post('/userEmDetail', asyncErrHelper(ctrInstance.userEmDetail));

router.post('/userBatchDetail', asyncErrHelper(ctrInstance.userBatchDetail));

router.post('/userBatchCheck', asyncErrHelper(ctrInstance.userBatchCheck));

router.post('/lastSensorTime', asyncErrHelper(ctrInstance.lastSensorTime));

//Ajax
router.get('/monitoringChartApp', asyncErrHelper(ctrInstance.selectMonitoringDataApp));

//Ajax
router.get('/monitoringChart', asyncErrHelper(ctrInstance.selectMonitoringDataAjax));

//Ajax
router.get('/monitoringPage', asyncErrHelper(ctrInstance.selectMonitoringPageAjax));

//웹 실시간 페이지 로드. userCode: 관리자 유저 코드
router.get('/:userCode', asyncErrHelper(ctrInstance.loadMonitoringPage));

//웹 실시간 데이터 전송
router.get('/select/monitoringData', asyncErrHelper(ctrInstance.selectMonitoring))

module.exports = router;