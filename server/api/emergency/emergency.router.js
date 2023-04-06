/** ================================================================
 *  응급 판별
 *  @author MiYeong Jang
 *  @since 2021.10.12
 *  @history 2021.10.12 최초작성
 *           
 *  ================================================================
 */

const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./emergency.controller');
const ctrInstance = new controller();

//실시간페이지 로드
// router.get('/', asyncErrHelper(ctrInstance.selectRtimeData));

//응급 초기화
router.get('/emAlertInit', asyncErrHelper(ctrInstance.emAlertInit));

router.get('/emInsertInit', asyncErrHelper(ctrInstance.emInsertInit));


//관리대상인 사용자 목록 불러오기
router.get('/selectUser', asyncErrHelper(ctrInstance.selectUser));

//응급 여부 판별
router.get('/emergencyYN', asyncErrHelper(ctrInstance.emergency));

//응급 알림
router.get('/emergencyAlert', asyncErrHelper(ctrInstance.emergencyAlert));

//응급 확인시간 저장(웹)
router.get('/emergencyCheck', asyncErrHelper(ctrInstance.emergencyCheck));
//응급 확인시간 저장(앱)
router.get('/emergencyAppCheck', asyncErrHelper(ctrInstance.emergencyAppCheck));

//응급 조치사항 입력(앱)
router.post('/emCheckContentsInput', asyncErrHelper(ctrInstance.emergencyContentsInput));

//push알림 테스트
router.get('/push_send', asyncErrHelper(ctrInstance.emergencyPushAlertTest));


module.exports = router;