/** ================================================================
 *  건강리포트
 *  @author MinJung Kim
 *  @since 2021.05.12
 *  @history 2021.05.12 database data load
 *  ================================================================
 */

// DB connection
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./sensor.sql');

const logger = require('../../config/loggerSettings');

class SensorService {
    /**
     *  센서 정보 조회 
     *  @param userCode - 사용자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MinJung Kim
     *  @since 2021.05.12.
     *  
     */

    async selectSensorData(userCode) {

        let result = await mysqlDB('selectOne', queryList.getSensor, [userCode]);
        let sensorData = {
            "nodeid": result.row.sensor_node_id,
            "ssid": result.row.own_ssid,
        }

        return sensorData
    };



    async insertSensorData(sensorData) {

        let result = await mysqlDB('insert', queryList.postSensor, [sensorData.userCode, sensorData.nodeid, sensorData.ssid, sensorData.sensorIp]);
        console.log(result)
        return result
    };

}

module.exports = SensorService;