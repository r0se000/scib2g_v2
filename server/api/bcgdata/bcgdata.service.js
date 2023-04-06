/** ================================================================
 *  생체 정보 저장
 *  @author MinJung Kim
 *  @since 2021.05.28
 *  @history 2021.05.28 database data load
 *  ================================================================
 */

// DB connection
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./bcgdata.sql');

const logger = require('../../config/loggerSettings');

// 날짜 구하기 라이브러리
const moment = require('moment');


const redis = require("redis");
const client = redis.createClient();


class BcgService {
    /**
     *  센서 생체 정보 저장
     *  @param BcgData - 5초동안 생체 정보 및 노드아이디
     *  @return 조회 결과 반환(json)
     *  @author MinJung Kim
     *  @since 2021.05.28.
     *  
     */

    async insertBcgData(BcgData) {



        // 센서 노드 아이디
        let nodeid = BcgData.data.network.node.$.id;
        client.set(nodeid, "alive", 'EX', 7);
        // 센서 생체 정보 
        let BcgDataRaw = BcgData.data.network.node.sensor.measurement.values._.split(" ");
        // 센서 생체 정보 담을 리스트
        let BcgDataArray = new Array();
        // 센서 생체 정보 담을 리스트 실제 쿼리에 사용됨
        let queryArray = [];
        // 센서 생체 정보 담을 리스트 임시 저장소
        let BcgDataArrayTemp = null;

        // 1축 3축 구분(1축만 해당)
        if (BcgData.data.network.$.id != 'user') {
            // 등록된 센서인지
            let SearchSensor = await mysqlDB('select', queryList.searchSensor, [BcgData.data.network.node.$.id]);
            // 등록되어 있는 센서이고, user_code가 다를때,
            if (SearchSensor.rowLength != 0 && SearchSensor.rows[0].user_code != BcgData.data.network.$.id) {
                // user_code 수정
                let result = await mysqlDB('update', queryList.updateSensor, [BcgData.data.network.$.id, BcgData.data.network.node.$.id]);
                return result
            }
        }

        // 센서 소유 유저 코드 조회
        let sensorOwnedUser = await mysqlDB('selectOne', queryList.getUserSensorgData, [nodeid]);

        let usercode = sensorOwnedUser.row.user_code;


        if (typeof usercode != 'undefined' && usercode.length != 0) {

            // 저장 데이터 생성 추가(유저코드, 생성 일시)
            for (let idx in BcgDataRaw) {
                BcgDataArrayTemp = BcgDataRaw[idx].split(",");
                BcgDataArrayTemp[0] = usercode;
                client.lpush(usercode + "hr", BcgDataArrayTemp[1]);
                client.lpush(usercode + "rr", BcgDataArrayTemp[2]);
                client.lpush(usercode + "sv", BcgDataArrayTemp[3]);
                client.lpush(usercode + "hrv", BcgDataArrayTemp[4]);
                client.lpush(usercode + "ss", BcgDataArrayTemp[5]);
                client.lpush(usercode + "state", BcgDataArrayTemp[6]);

                BcgDataArrayTemp.push(moment().subtract(BcgDataRaw.length - idx, 's').format("YYYY-MM-DD HH:mm:ss"));
                BcgDataArray.push(BcgDataArrayTemp);
                queryArray = queryArray.concat(BcgDataArrayTemp);
            }
            // console.log(BcgDataArray)
            let result = await mysqlDB('insert', queryList.postBcgData(BcgDataArray), queryArray);
            client.ltrim(usercode + "hr", 0, 9);
            client.ltrim(usercode + "rr", 0, 9);
            client.ltrim(usercode + "sv", 0, 9);
            client.ltrim(usercode + "hrv", 0, 9);
            client.ltrim(usercode + "ss", 0, 9);
            client.ltrim(usercode + "state", 0, 9);

            client.set(usercode, "alive", 'EX', 7);

            return result
        } else {
            let BcgDataList = []
            console.log("*******************************************")
            console.log("*******************************************")
            console.log('알수 없는 센서 정보 입니다.');
            console.log('Node ID: ', BcgData.data.network.node.$.id);
            console.log(" 생체정보 ")
            for (let idx in BcgDataRaw) {
                BcgDataArrayTemp = BcgDataRaw[idx].split(",");
                BcgDataArrayTemp[0] = usercode;
                console.log("[" + BcgDataArrayTemp[1] + ", " + BcgDataArrayTemp[2] + ", " + BcgDataArrayTemp[3] + ", " + BcgDataArrayTemp[4] + ", " + BcgDataArrayTemp[5] + ", " + BcgDataArrayTemp[6] + "]");
            }
            console.log("*******************************************")
            console.log("*******************************************")
                // 
            let SearchSensor = await mysqlDB('select', queryList.searchSensor, [BcgData.data.network.node.$.id]);
            if (BcgData.data.network.$.id != 'user' && SearchSensor.rowLength == 0) {
                let result = await mysqlDB('insert', queryList.insertSensor, [BcgData.data.network.$.id, BcgData.data.network.node.$.id]);
                return result
            }
        }
    };

}



module.exports = BcgService;