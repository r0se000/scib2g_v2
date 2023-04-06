/** ================================================================
 *  장치 관리
 *  @author Minjung Kim
 *  @since 2021.05.28
 *  @history 2021.05.28 페이지 로드
 *           2021.05.28 Ajax 통신 적용
 *  ================================================================
 */

// 인증된 사용자인지 검증하는 미들웨어 JG 2021.05.12
const { checkToken } = require("../../helper/jwtTokenValidation");

const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./bcgdata.controller');
const ctrInstance = new controller();

// request body xml 파싱
const xmlparser = require('express-xml-bodyparser');

//생체 데이터 저장
router.post('/', xmlparser({ trim: false, explicitArray: false }), asyncErrHelper(ctrInstance.insertBcgData));

module.exports = router;