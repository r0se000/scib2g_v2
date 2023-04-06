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
const service = require('./monitoring.service');
const svInstance = new service();


class MonitoringController {
    //웹 실시간페이지 로드
    async loadMonitoringPage(req, res, next) {
        //usercode: admin userCode
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let { today } = req.body;
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.userList(userCode);
        let emer_userList = await svInstance.emer_userList(userCode);

        if (result.loginCheck == 'Y') {
            return res.render('web/monitoring/monitoring', {
                'title': "이상관리 모니터링",
                'userCode': userCode,
                'userName': result.userName, //admin user name
                'userList': JSON.stringify(userList),
                'emer_userList': JSON.stringify(emer_userList)

            });
        } else {
            return res.render('web/error/errPage');
        }
    };

    //웹 실시간 데이터 전송
    async selectMonitoring(req, res, next) {
        let { userCode, selectUserList } = req.query;
        // console.log(selectUserList)
        // let selectData = await svInstance.selectData(sendData)
        let result = await svInstance.selectMonitoringData(selectUserList);
        let ajaxData = {
            "adminuserCode": userCode,
            "monitoringData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };

    //실시간 데이터 전송
    async selectMonitoringData(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
            // let result = await svInstance.selectReportData(userCode);
        let userName = await svInstance.userList(userCode);
        let result = await svInstance.selectMonitoringData(userCode);
        return res.render('web/monitoring/monitoring', {
            "monitoringPage": req.__('monitoringPage'),
            "userCode": userCode,
            "userName": userName,
            "lang": req.query.lang,
            "accessToken": req.query.accessToken,
            "monitoringData": JSON.stringify(result.biodata)
        });
    };

    async selectMonitoringDataAjax(req, res, next) {
        let userCode = req.query.userCode // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectMonitoringData(userCode);

        let ajaxData = {
            "userCode": userCode,
            "monitoringData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };

    async selectMonitoringDataApp(req, res, next) {
        let userCode = req.query.userCode // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectMonitoringDataApp(userCode);

        let ajaxData = {
            "userCode": userCode,
            "monitoringData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };

    async selectMonitoringPageAjax(req, res, next) {
        let userCode = req.query.userCode // url에 data 포함하여 전송한 경우 값 가져오기
        let ajaxData = {
            "monitoringPage": req.__('monitoringPage'),
        };
        return res.send(ajaxData);
    };


    async selectMonitoringDataAliveAjax(req, res, next) {
        let nodeId = req.params.nodeId // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectMonitoringDataAlive(nodeId);

        let ajaxData = {
            "monitoringPage": req.__('monitoringPage'),
            "nodeId": nodeId,
            "lang": req.query.lang,
            "monitoringData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };


    async userBatchCheck(req, res, next) {
        let { today } = req.body;

        let batchCheck = await svInstance.batchCheck(today);

        return res.send(batchCheck)
    };

    async userBatchDetail(req, res, next) {
        let { today } = req.body;

        let batchDetail = await svInstance.batchDetail(today);

        return res.send(batchDetail)
    };

    async userEmDetail(req, res, next) {
        let { emergency_code } = req.body;

        let emDetail = await svInstance.emDetail(emergency_code);

        return res.send(emDetail)
    };

    async lastSensorTime(req, res, next) {
        let { user_sensor_code } = req.body;

        let sensorTime = await svInstance.sensorLastTime(user_sensor_code);

        return res.send(sensorTime)
    };

}

module.exports = MonitoringController;