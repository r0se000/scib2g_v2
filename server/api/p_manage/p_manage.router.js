/** ================================================================
 *  b2g 알림 앱 관리페이지 
 *  @author MiYeong Jang
 *  @since 2023.03.23.
 *  @history 
 *  ================================================================
 */
const router = require('express').Router();

const { relativeTimeRounding } = require('moment');
// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./p_manage.controller');
const ctrInstance = new controller();

// 페이지 로드
router.get('/p_manage/:userCode', asyncErrHelper(ctrInstance.p_manageload));

// ===============================  사용자 조회 ==================================

// 관리 대상자 클릭시 상세정보 불러오기
router.post('/user_detail', asyncErrHelper(ctrInstance.selectInfo));

// 사용자 조회
router.get('/userList', asyncErrHelper(ctrInstance.p_manageUserList));

// ===============================  모니터링 조회 임시==================================

// 관리 대상자 클릭시 모니터링 상세정보 불러오기
router.post('/monitoring_detail', asyncErrHelper(ctrInstance.selectInfo_M));

// 모니터링 발생 조회_날짜 검색
router.post('/emergencyList/searchDate', asyncErrHelper(ctrInstance.searchDate));

// 모니터링 발생 조회_이름 검색
router.post('/emergencyList/searchName', asyncErrHelper(ctrInstance.searchName));

// A/S 관리 조회
router.get('/asList', asyncErrHelper(ctrInstance.asList));
// A/S 관리 상새정보 조회
router.post('/asDetail', asyncErrHelper(ctrInstance.selectInfo_As));
// A/S 내용 수정
router.post('/asModify', asyncErrHelper(ctrInstance.asModify));
// A/S 목록 삭제
router.post('/asDelete', asyncErrHelper(ctrInstance.asDelete));
// A/S 등록
router.post('/asRegist', asyncErrHelper(ctrInstance.asRegist));
// A/S 관리 등록버튼 클릭 후 이름조회 조회
router.post('/asDetail_regi', asyncErrHelper(ctrInstance.selectInfo_As_regi));


module.exports = router;