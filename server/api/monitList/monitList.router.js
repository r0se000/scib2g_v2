/** ================================================================
 *  B2G_V2 모니터링 발생 조회 페이지
 *  @author MiYeong Jang
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */


// 인증된 사용자인지 검증하는 미들웨어 JG 2021.04.20
const { checkToken } = require("../../helper/jwtTokenValidation");
const router = require('express').Router();

// async/await error handler
const asyncErrHelper = require('../../helper/asyncErrHelper');

// 호출할 controller 정의
const controller = require('./monitList.controller');
const ctrInstance = new controller();


//사용자매뉴얼 다운로드
router.get('/download', function(req, res, next) {
    // let filepath = "/srv/sci_b2g/server/public/manual.pdf"
    let filepath = "public/manual.pdf"
    res.download(filepath);
});

router.get('/:userCode', checkToken, asyncErrHelper(ctrInstance.loadMonitListPage));
router.post('/userEmDetail', asyncErrHelper(ctrInstance.userEmDetail));
// 날짜 범위 검색
router.post('/dateSearch', asyncErrHelper(ctrInstance.dateSearch));

// 응급 발생 통계
router.post('/emergencyStatistics', asyncErrHelper(ctrInstance.emergencyStatistics));




module.exports = router;