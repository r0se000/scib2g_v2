/** ================================================================
 *  B2G_V2 모니터링 발생 조회 페이지
 *  @author MiYeong Jang
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./monitList.service.js');
const svInstance = new service();

class MonitListController {

    async loadMonitListPage(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.userList(userCode);
        if (result.loginCheck == 'Y') {
            return res.render('web/monitList/monitList', {
                'title': '모니터링 발생 조회',
                'userCode': req.params.userCode,
                'userName': result.userName,
                'userList': JSON.stringify(userList)
            });
        } else {
            return res.render('web/error/errPage');
        }
    };

    async userEmDetail(req, res, next) {
        let { emergency_code } = req.body;

        let emDetail = await svInstance.emDetail(emergency_code);

        return res.json(emDetail)
    };

    // 날짜 범위 조회
    async dateSearch(req, res, next) {
        let { userCode, accessToken, trip_start, trip_end } = req.body // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.dateSearch(userCode, trip_start, trip_end);

        if (result.loginCheck == 'Y') {
            return res.send({
                'title': '응급 발생 조회',
                'accessToken': req.body.accessToken,
                'userCode': req.body.userCode,
                'userName': result.userName,
                'userList': JSON.stringify(userList)
            });
        } else {
            return res.render('web/error/errPage');
        }
    };
    // 응급 발생 통계
    async emergencyStatistics(req, res, next) {
        let { userCode, accessToken, today, week_start, week_end, month_start, month_end, year_start, year_end } = req.body // ajax 데이터 받아오기
        let result = await svInstance.loginCheck(userCode);
        let emergencyStatistics = await svInstance.emergencyStatistics(userCode, today, week_start, week_end, month_start, month_end, year_start, year_end);

        if (result.loginCheck == 'Y') {
            return res.send({
                'title': '응급 발생 조회',
                'accessToken': req.body.accessToken,
                'userCode': req.body.userCode,
                'userName': result.userName,
                'emToday': emergencyStatistics['emergencyToday'],
                'emToweek': emergencyStatistics['emergencyToweek'],
                'emTomonth': emergencyStatistics['emergencyTomonth'],
                'emToyear': emergencyStatistics['emergencyToyear'],
                'emAllCnt': emergencyStatistics['emergencyAllCnt']
            });
        } else {
            return res.render('web/error/errPage');
        };
    }


}
module.exports = MonitListController;