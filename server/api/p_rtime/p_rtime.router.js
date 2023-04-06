/** ================================================================
 *  b2g 알림 앱 실시간페이지 
 *  @author MiYeong Jang
 *  @since 2023.03.23.
 *  @history 
 *  ================================================================
 */
const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./p_rtime.controller');
const ctrInstance = new controller();



router.get('/p_rtime/:userCode', asyncErrHelper(ctrInstance.p_rtimeload));


// 관리 대상자 클릭시 상세정보 불러오기
router.post('/user_detail', asyncErrHelper(ctrInstance.selectInfo));


// 관리 대상자 리스트 불러오기
router.get('/userList', asyncErrHelper(ctrInstance.allUserList))

router.get('/select/rtimeData', asyncErrHelper(ctrInstance.selectRtime))


module.exports = router;