/** ================================================================
 *  B2G 메인화면 controller
 *  @author Mi Yeong Jang
 *  @since 2021.09.17
 *  @history 2021.09.17 페이지 로드
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./health.service.js');
const svInstance = new service();

class HealthController {

    // 건강상태 페이지 로드
    async loadHealthPage(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.userList(userCode);
        let emCount = await svInstance.emCount();
        if (result.loginCheck == 'Y') {
            return res.render('web/health/health', {
                'title': '건강상태',
                'accessToken': req.query.accessToken,
                'userCode': userCode,
                'userName': result.userName,
                'userList': JSON.stringify(userList),
                'emCount': emCount
            });
        } else {
            return res.render('web/error/errPage');
        }
    };

    // 날짜 범위 조회
    async dateSearch(req, res, next) {
        let { userCode, trip_start } = req.body // url에 data 포함하여 전송한 경우 값 가져오기
        let userList = await svInstance.dateSearch(userCode, trip_start);
        return res.json(userList);
    };
}

module.exports = HealthController;