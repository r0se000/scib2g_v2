/** ================================================================
 *  Express에 Custom Router 등록 작업 수행 
 *  
 *  @author JG, Jo
 *  @since 2021.03.30
 *  @history 2021.04.12 JG user router 등록
 *           2021.04.22 JG error router 등록
 *           2021.04.27 MY note router 등록
 *           2021.04.29 MY report router 등록
 *           2021.05.07 JG status router 등록 
 *           2021.05.13 MJ sensor router 등록
 *  ================================================================
 */

/* Router 선언 */
// const devGuideRouter = require('../api/00DevGuide/devGuide.router'); // 개발 가이드
// TO-DO custom router 선언
const errorRouter = require('../helper/error/error.router'); // 에러 페이지 라우터 
const userRouter = require('../api/users/user.router'); // 사용자 관련 기능 수행 라우터
const stateRouter = require('../api/state/state.router'); // 어젯밤 건강 상태
const statusRouter = require('../api/status/status.router'); // 건강 현황
const boapphomeRouter = require('../api/boapphome/boapphome.router'); //보호자 알림앱 홈

const monitListRouter = require('../api/monitList/monitList.router');
const registerRouter = require('../api/register/register.router');
const userListRouter = require('../api/userList/userList.router'); //독거노인 내역 조회
const asListRouter = require('../api/asList/asList.router');
const monitStatRouter = require('../api/monitStat/monitStat.router');
const updateRouter = require('../api/update/update.router');
const healthRouter = require('../api/health/health.router'); //웹_건강상태
const rtimeRouter = require('../api/rtime/rtime.router'); // 실시간 생체정보
const rTimeWebRouter = require('../api/rtime_web/rtime_web.router') //웹 실시간 페이지
const sensorRouter = require('../api/sensor/sensor.router'); // 센서 관리
const bcgdataRouter = require('../api/bcgdata/bcgdata.router'); // 센서 관리
const emergencyRouter = require('../api/emergency/emergency.router'); //응급 판별
const user_pRouter = require('../api/user_p/user_p.router'); //보호자 계정 관련 기능 수행 라우터
const user_dRouter = require('../api/user_d/user_d.router'); //본인 건강관리 계정 관련 기능 수행 라우터
const monitoringRouter = require('../api/monitoring/monitoring.router'); //이상 모니터링
const batchRouter = require('../api/batch/batch.router') // 배치 라우터

//공무원용 알림앱
const p_apphomeRouter = require('../api/p_apphome/p_apphome.router'); //공무원 알림앱 홈
const p_manageRouter = require('../api/p_manage/p_manage.router'); //공무원 알림앱 관리페이지
const p_rtimeRouter = require('../api/p_rtime/p_rtime.router'); //공무원 알림앱 실시간페이지

const setupRouter = (app) => {
    try {

        /* Router 등록 */
        // app.use('/api/devGuide', devGuideRouter); // 개발 가이드
        // TO-DO custom router 등록
        app.use('/error', errorRouter); // 에러 처리
        app.use('/api/users', userRouter); // 사용자 관련 기능 수행
        app.use('/api/state', stateRouter); // 어젯밤 건강 상태
        app.use('/api/rtime', rtimeRouter); // 실시간 생체정보
        app.use('/api/sensor', sensorRouter); // 센서 정보
        app.use('/data/push', bcgdataRouter); // 센서 정보
        app.use('/api/status', statusRouter); // 건강 현황 


        //웹
        app.use('/api', userRouter);
        app.use('/api/monitList', monitListRouter);
        app.use('/api/register', registerRouter);
        app.use('/api/update', updateRouter);
        app.use('/api/asList', asListRouter);
        app.use('/api/monitStat', monitStatRouter);
        app.use('/api/emergency', emergencyRouter);
        app.use('/api/userList', userListRouter);
        app.use('/api/health', healthRouter);
        app.use('/api/monitoring', monitoringRouter);
        app.use('/api/rtime_web', rTimeWebRouter);
        app.use('/api/batch', batchRouter);


        //공무원용 알림앱
        app.use('/api/p_apphome', p_apphomeRouter);
        app.use('/api/p_manage', p_manageRouter);
        app.use('/api/p_rtime', p_rtimeRouter);

        //보호자용 알림앱
        app.use('/api/user_p', user_pRouter);
        app.use('/api/boapphome', boapphomeRouter);

        //본인 건강정보확인 앱 로그인
        app.use('/api/user_d', user_dRouter);

        return app;
    } catch (err) {
        console.log(err);
        console.log('[setupRouter.js] : custom router를 등록할 수 없습니다. router 경로를 확인하세요.');
        return null;
    }
}

module.exports = setupRouter;