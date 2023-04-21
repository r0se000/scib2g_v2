/** ================================================================
 *  관리자 조회 페이지 router
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 최초 작성
 *  ================================================================
 */

// 인증된 사용자인지 검증하는 미들웨어 JG 2021.04.20
const { checkToken } = require("../../helper/jwtTokenValidation");
const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./adminList.controller');
const ctrInstance = new controller();

// 관리자 조회 페이지 로드
router.get('/:userCode', checkToken, asyncErrHelper(ctrInstance.loadAdminListPage));

// 마스터 계정 체그
router.post("/checkMaster", asyncErrHelper(ctrInstance.checkMaster));

// 관리자 이름 검색
router.post('/searchName', asyncErrHelper(ctrInstance.searchName));

// 마스터 계정 변경
router.post('/setMaster', asyncErrHelper(ctrInstance.setMaster));

module.exports = router;