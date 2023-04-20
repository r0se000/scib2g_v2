/** ================================================================
 *  실시간 생체정보
 *  @author MiYeong Jang
 *  @since 2021.06.02.
 *  @history 2021.06.02. 최초작성
 *           
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./rtime.service');
const svInstance = new service();


class RtimeController {

    //앱 실시간 페이지 로드
    async loadRtimePageApp(req, res, next) {
        let { userCode, pUserCode } = req.params
        if (typeof pUserCode == 'undefined') { //관리자 앱일 경우 실시간 페이지 로드
            let userList = await svInstance.userListApp(userCode);
            return res.render('app/rtime/rtime', {
                'userCode': userCode,
                "accessToken": req.query.accessToken,
                'userList': JSON.stringify(userList)
            });
        } else { //보호자 앱일 경우 실시간 페이지 로드
            let userName = await svInstance.getUserName_P(userCode);
            let result = await svInstance.selectRtimeDataApp(userCode);
            return res.render('app/rtime/rtime_p', {
                "rtimePage": req.__('rtimePage'),
                "userCode": userCode,
                "pUserCode": pUserCode,
                "userName": userName,
                "lang": req.query.lang,
                "accessToken": req.query.accessToken,
                "rtimeData": JSON.stringify(result.biodata)
            });
        }
    }
    async selectRtimeDataAjax(req, res, next) {
        let userCode = req.query.userCode // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectRtimeDataApp(userCode);

        let ajaxData = {
            "userCode": userCode,
            "rtimeData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };
    //app실시간 데이터 전송
    async selectRtimeDataApp(req, res, next) {
        let userCode = req.query.userCode // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectRtimeDataApp(userCode);

        let ajaxData = {
            "userCode": userCode,
            "rtimeData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };

    //실시간 그래프 y축 이름설정
    async selectRtimePageAjax(req, res, next) {
        let userCode = req.query.userCode // url에 data 포함하여 전송한 경우 값 가져오기
        let ajaxData = {
            "rtimePage": req.__('rtimePage'),
        };
        return res.send(ajaxData);
    };


    //센서 정보 전송(센서 설치 시 센서 연결여부 확인에 사용) (삭제금지)
    async selectRtimeDataAliveAjax(req, res, next) {
        let nodeId = req.params.nodeId // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectRtimeDataAlive(nodeId);

        let ajaxData = {
            "rtimePage": req.__('rtimePage'),
            "nodeId": nodeId,
            "lang": req.query.lang,
            "rtimeData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };

    async selectRtHistory(req, res, next) {
        let userCode = req.query.userCode,
            pUserCode = req.query.pUserCode,
            selectUserCode = req.query.selectUserCode;

        let selectTime
        if (req.query.selectTime != null) {
            selectTime = req.query.selectTime
        } else {
            selectTime = 1;
        }
        if (typeof pUserCode == 'undefined') {
            let userList = await svInstance.userListApp(userCode);
            return res.render('web/rtime/rtHistory', {
                "rtHisPage": req.__('rtHisPage'),
                "userCode": userCode,
                "selectUserCode": selectUserCode,
                "userList": JSON.stringify(userList),
                // "historyData": JSON.stringify(result)
            });
        } else {
            let result = await svInstance.selectRtimeHistory(userCode, selectTime);
            let userName = await svInstance.getUserName_P(userCode);
            return res.render('web/rtime/rtHistory_p', {
                "rtHisPage": req.__('rtHisPage'),
                "userCode": userCode,
                "pUserCode": pUserCode,
                "userName": userName,
                "historyData": JSON.stringify(result)
            });
        }
    };


    async selectRtHistoryAjax(req, res, next) {
        let userCode = req.query.userCode;
        let setTime = req.query.setTime
        let result = await svInstance.selectRtimeHistory(userCode, setTime);
        let ajaxData = {
            "userCode": userCode,
            "lang": req.query.lang,
            "accessToken": req.query.accessToken,
            "historyData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    }

}

module.exports = RtimeController;