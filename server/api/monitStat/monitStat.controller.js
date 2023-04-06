/** ================================================================
 *  B2G 메인화면 controller
 *  @author Mi Yeong Jang
 *  @since 2021.09.17
 *  @history 2021.09.17 페이지 로드
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./monitStat.service.js');
const svInstance = new service();

class MonitStatController {

    async loadMonitStatPage(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.userList(userCode);
        if (result.loginCheck == 'Y') {
            return res.render('web/monitStat/monitStat', {
                'title': '모니터링 발생 통계',
                'accessToken': req.query.accessToken,
                'userCode': req.params.userCode,
                'userName': result.userName,
                'userList': JSON.stringify(userList)
            });
        } else {
            return res.render('web/error/errPage');
        }
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
    }; // 응급 발생 통계
    async graphStatistics(req, res, next) {
        let { userCode, accessToken, today, week_start, week_end, month_start, month_end, year_start, year_end, trip_start, trip_end, selGen, selAge } = req.body // ajax 데이터 받아오기
        let result = await svInstance.loginCheck(userCode);
        let graphStatistics = await svInstance.graphStatistics(userCode, today, week_start, week_end, month_start, month_end, year_start, year_end, trip_start, trip_end, selGen, selAge);
        if (result.loginCheck == 'Y') {
            return res.send({
                'title': '응급 발생 통계',
                'accessToken': req.body.accessToken,
                'userCode': req.body.userCode,
                'userName': result.userName,
                'emToday': graphStatistics['emergencyToday'],
                'emToweek': graphStatistics['emergencyToweek'],
                'emTomonth': graphStatistics['emergencyTomonth'],
                'emToyear': graphStatistics['emergencyToyear'],
                'emAllCnt': graphStatistics['emergencyAllCnt'],
                'emDayOfWeek': graphStatistics['emergencyDayOfWeek']
            });
        } else {
            return res.render('web/error/errPage');
        };

    };

    // 통계 그래프
    async graphData(req, res, next) {
        let { userCode, accessToken, trip_start, trip_end, selGen, selAge } = req.body // ajax 데이터 받아오기

        let result = await svInstance.loginCheck(userCode);
        let graphData = await svInstance.graphData(userCode, trip_start, trip_end, selGen, selAge);
        if (result.loginCheck == 'Y') {
            return res.send({
                'title': '응급 발생 통계',
                'accessToken': req.body.accessToken,
                'userCode': req.body.userCode,
                'userName': result.userName,
                'graphData': graphData['graphData'],
                'dateRange': graphData['dateRange'],
                'graphDataGenderM': graphData['graphDataGenderM'],
                'graphDataGenderW': graphData['graphDataGenderW'],
                'grapgDataAgeUnder': graphData['grapgDataAgeUnder'],
                'grapgDataAgeSixty': graphData['grapgDataAgeSixty'],
                'grapgDataAgeSeventy': graphData['grapgDataAgeSeventy'],
                'grapgDataAgeEighty': graphData['grapgDataAgeEighty'],
                'grapgDataAgeNinety': graphData['grapgDataAgeNinety'],
                'grapgDataAgeOver': graphData['grapgDataAgeOver'],
                'graphDataDayOfWeek': graphData['graphDataDayOfWeek']
            });
        } else {
            return res.render('web/error/errPage');
        };

    }

}

module.exports = MonitStatController;