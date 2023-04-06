/** ================================================================
 *  A/S 조회 페이지 router
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 최초 작성
 *  ================================================================
 */
// 인증된 사용자인지 검증하는 미들웨어 JG 2021.04.20
const { checkToken } = require("../../helper/jwtTokenValidation");
const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./asList.controller');
const ctrInstance = new controller();

// A/S 조회 페이지 로드
router.get('/:userCode', checkToken, asyncErrHelper(ctrInstance.loadAsListPage));

// 관리 대상자 조회
router.post('/selectUser', asyncErrHelper(ctrInstance.selectUser));

// 관리 대상자 이름 검색
router.post('/searchName', asyncErrHelper(ctrInstance.searchName));

// 서비스 종료 관리 대상자 조회
router.post('/endService', asyncErrHelper(ctrInstance.endService));

// A/S 등록
router.post('/uploadAS', asyncErrHelper(ctrInstance.uploadAS));

// 관리 대상자 이름 검색(A/S 등록 모달창)
router.post('/searchUser', asyncErrHelper(ctrInstance.searchUser));

// A/S 조회
router.post('/selectAS', asyncErrHelper(ctrInstance.selectAS));

// A/S 수정
router.post('/editAS', asyncErrHelper(ctrInstance.updateAS));

// A/S 삭제
router.post('/deleteAS', asyncErrHelper(ctrInstance.deleteAS));

module.exports = router;