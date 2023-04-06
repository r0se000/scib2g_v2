/** ================================================================
 *  건강리포트
 *  @author MinJung Kim
 *  @since 2021.05.12
 *  @history 2021.05.12 MJ 최초작성
 *           2021.05.12 MJ Ajax 통신 적용
 *  ================================================================
 */

const _ = require('lodash');

// logger
const logger = require('../../config/loggerSettings');

// 호출할 service 정의
const service = require('./sensor.service');
const svInstance = new service();


class SensorController {

    async selectSensorData(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.selectSensorData(userCode);
        return res.render('app/p_sensor/p_sensor', {
            "sensorPage": req.__('sensorPage'),
            "sensorData": result,
            "userCode": userCode, // 유저 코드 정보 추가 2021.05.13 MJ,
            "lang": req.query.lang, // 페이지 언어 정보 추가 2021.05.13 MJ,
            "accessToken": req.query.accessToken // jwt accessToken 정보 추가 2021.05.13 MJ

        });
    };

    async insertSensorData(req, res, next) {
        let reqDataObj = req.body;
        let result = await svInstance.insertSensorData(reqDataObj);
        return res.json(result);
    };
}

module.exports = SensorController;