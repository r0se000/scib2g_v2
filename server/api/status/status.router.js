/** ================================================================
 *  건강 현황 router
 *  @author JG, Jo
 *  @since 2021.05.07
 *  @history 2021.05.14 JG index 페이지 호출 url 수정
 *           2021.05.17 JG biometric 페이지 호출 및 데이터 조회 추가
 *           2021.05.18 JG stress 페이지 호출 및 데이터 조회 추가
 *           2021.05.20 JG sleep 페이지 호출 및 데이터 조회 추가
 *  ================================================================
 */

const router = require('express').Router();

const asyncErrHelper = require('../../helper/asyncErrHelper'); // async/await error handler

const { checkToken } = require("../../helper/jwtTokenValidation"); // 인증된 사용자인지 검증하는 미들웨어

// 호출할 controller 정의
const controller = require('./status.controller');
const ctrInstance = new controller();

// 건강 현황 - 질병 정보 페이지 호출
router.get('/index/disease', checkToken, asyncErrHelper(ctrInstance.goDiseasePage));
router.get('/p_index/disease', checkToken, asyncErrHelper(ctrInstance.goDiseasePage_P));

// 건강 현황 - 생체 정보 페이지 호출
router.get('/index/biometric', checkToken, asyncErrHelper(ctrInstance.goBiometricPage));
router.get('/p_index/biometric', checkToken, asyncErrHelper(ctrInstance.goBiometricPage_P));

// 건강 현황 - 스트레스 정보 페이지 호출
router.get('/index/stress', checkToken, asyncErrHelper(ctrInstance.goStressPage));
router.get('/p_index/stress', checkToken, asyncErrHelper(ctrInstance.goStressPage_P));

// 건강 현황 - 수면품질 정보 페이지 호출
router.get('/index/sleep', checkToken, asyncErrHelper(ctrInstance.goSleepPage));
router.get('/p_index/sleep', checkToken, asyncErrHelper(ctrInstance.goSleepPage_P));

// 건강 현황 - 기간별 질병 정보 조회
router.post('/disease/data', asyncErrHelper(ctrInstance.getDiseaseData));

// 건강 현황 - 기간별 생체 정보 조회
router.post('/biometric/data', asyncErrHelper(ctrInstance.getBiometricData));

// 건강 현황 - 기간별 스트레스 정보 조회
router.post('/stress/data', asyncErrHelper(ctrInstance.getStressData));

// 건강 현황 - 기간별 수면품질 정보 조회
router.post('/sleep/data', asyncErrHelper(ctrInstance.getSleepData));

// 건강 현황 index 페이지 호출
router.get('/index/:userCode', checkToken, asyncErrHelper(ctrInstance.goIndexPage));
router.get('/p_index/:pUserCode/:userCode', checkToken, asyncErrHelper(ctrInstance.goIndexPage_P));


module.exports = router;