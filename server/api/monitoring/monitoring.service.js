/** ================================================================
 *  실시간 생체정보
 *  @author MiYeong Jang
 *  @since 2021.06.02.
 *  @history 2021.06.02. 최초작성
 *           
 *  ================================================================
 */

// DB connection
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./monitoring.sql');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

const redis = require("redis");
const client = redis.createClient();
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);

function getCumonitoring(today) {
    let todayStr
    let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1),
        day = (today.getDate() >= 10 ? today.getDate() : '0' + today.getDate()),
        hours = today.getHours() < 10 ? "0" + today.getHours() : today.getHours(), // 시
        sec = (today.getSeconds() - 10);
    let min = today.getMinutes()
    if (sec < 0) {
        min -= 1;
        sec += 60;
    }
    let minutes = min < 10 ? "0" + min : min; // 분
    let seconds = sec >= 10 ? sec : "0" + sec; // 초
    todayStr = today.getFullYear() + "-" + month + "-" + day + " " + hours + ':' + minutes + ':' + seconds;
    return todayStr
}


function stringToNumberInArray(dataList) {
    let conversionDataList = new Array();
    for (let data in dataList) {
        conversionDataList.push(Number(dataList[data]));
    }
    return conversionDataList;
}

function transpose(a) {

    // Calculate the width and height of the Array
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) { return []; }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];

    // Loop through every item in the outer array (height)
    for (i = 0; i < h; i++) {

        // Insert a new row (array)
        t[i] = [];

        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {

            // Save transposed data.
            t[i][j] = a[j][i];
        }
    }

    return t;
}


class MonitoringService {
    async loginCheck(userCode) {
        let result = {};
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        result.loginCheck = sqlResult.row.a_user_login_check;
        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.userName = userName

        return result
    };


    /**
     *  관리대상자 불러오기 (웹)
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async userList(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.select_user_name, [userCode]);
        for (let i = 0; i < userList.rowLength; i++) {
            userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            userList.rows[i].birth_year = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_year);
            userList.rows[i].birth_month = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_month);
            userList.rows[i].birth_date = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].birth_date);
            userList.rows[i].address_1 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].address_1);
            userList.rows[i].address_2 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].address_2);
            userList.rows[i].address_3 = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].address_3);
        }
        userList.rows.forEach(function(item, index) {
            result['user' + [index]] = item;
        });
        return result
    };

    async batchCheck(today) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let selectBatchCheck = await mysqlDB('select', queryList.selectBatchCheck, [today]);


        return selectBatchCheck
    }

    async batchDetail(today) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let selectBatchDetail = await mysqlDB('select', queryList.selectBatchDetail, [today]);

        for (let i = 0; i < selectBatchDetail.rowLength; i++) {
            selectBatchDetail.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, selectBatchDetail.rows[i].name);

        }

        return selectBatchDetail
    }

    async emDetail(emergency_code) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let selectEmDetail = await mysqlDB('select', queryList.selectEmDetail, [emergency_code]);

        for (let i = 0; i < selectEmDetail.rowLength; i++) {
            if (selectEmDetail.rows[i].a_user_name != null) {
                selectEmDetail.rows[i].a_user_name = cryptoUtil.decrypt_aes(cryptoKey, selectEmDetail.rows[i].a_user_name);
            }
            if (selectEmDetail.rows[i].p_user_name != null) {
                selectEmDetail.rows[i].p_user_name = cryptoUtil.decrypt_aes(cryptoKey, selectEmDetail.rows[i].p_user_name);
            }
        }

        return selectEmDetail
    }

    async sensorLastTime(user_sensor_code) {
        let selectLastSensorTime = await mysqlDB('select', queryList.selectLastSensorTime, [user_sensor_code]);

        return selectLastSensorTime
    }



    /**
     *  실시간 생체정보 불러오기 (웹)
     *  @param userCode - 사용자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async selectMonitoringData(userCode) {
        let sendData = {};
        for (let i = 0; i < userCode.length; i++) {
            let bioData = new Array();
            let rtFlag = await getAsync(userCode[i]);
            if (rtFlag != 0 && rtFlag != null) {
                //const hr = await lrangeAsync(userCode+"hr",0,5);
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "hr", 0, 4)));
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "rr", 0, 4)));
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "sv", 0, 4)));
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "hrv", 0, 4)));
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "state", 0, 4)));

                // console.log(bioData)
                bioData = transpose(bioData);
                bioData = bioData.reverse();
            } else {
                bioData = [
                    [0, 0, 0, 0, -1],
                    [0, 0, 0, 0, -1],
                    [0, 0, 0, 0, -1],
                    [0, 0, 0, 0, -1],
                    [0, 0, 0, 0, -1]
                ];
            }
            sendData[userCode[i]] = bioData;
        }
        // console.log(sendData)
        return sendData;
    };

    /**
     *  실시간 생체정보 불러오기 (앱)
     *  @param userCode - 사용자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async selectMonitoringDataApp(userCode) {
        let bioData = new Array();
        let rtFlag = await getAsync(userCode);
        if (rtFlag != 0 && rtFlag != null) {
            //const hr = await lrangeAsync(userCode+"hr",0,5);
            // console.log(await stringToNumberInArray(await lrangeAsync(userCode[i] + "hr", 0, 4)))
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "hr", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "rr", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "sv", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "hrv", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "ss", 0, 4)));

            bioData = transpose(bioData);
            bioData = bioData.reverse();
        } else {
            bioData = [
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1]
            ];
        }
        console.log(bioData)
        return bioData;
    };

    async emer_userList(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let today = new Date();
        today.setDate(today.getDate() - 1)
        let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1);
        let yesterday = (today.getDate()) >= 10 ? today.getDate() : '0' + today.getDate();
        let yesterdayStr = today.getFullYear() + "-" + month + "-" + yesterday;


        let emer_userList = await mysqlDB('select', queryList.emer_userList, [yesterdayStr]);

        for (let i = 0; i < emer_userList.rowLength; i++) {
            emer_userList.rows[i].user_name = cryptoUtil.decrypt_aes(cryptoKey, emer_userList.rows[i].user_name);
            emer_userList.rows[i].a_user_name = cryptoUtil.decrypt_aes(cryptoKey, emer_userList.rows[i].a_user_name);
        }

        emer_userList.rows.forEach(function(item, index) {
            if (item.emergency_check_contents == null) {
                item.emergency_check_contents = "--"
            }
            result['user' + [index]] = item;
        });
        return result
    }

    /**
     *  응급 확인하기 
     *  @param userCode - 사용자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async emergencyCount(userCode) {
        let date = new Date();
        let curStr = getCumonitoring(date);
        date.setMinutes(date.getMinutes() - 1);
        let dateStr = getCumonitoring(date);
        let emergency = 0; //응급상황일때 1, 아니면 0

        let selectResult = await mysqlDB('select', queryList.emergencyCheck, [userCode, dateStr, curStr]);
        // console.log(selectResult.rows)
        for (let i = 0; i < selectResult.rowLength; i++) {
            if (selectResult.rows[i].hr == 0 & selectResult.rows[i].hrv == 0 & selectResult.rows[i].ss > 1000 & selectResult.rows[i].bed_state == 1) {
                emergency += 1
            } else {
                emergency = 0
            }
        }
        console.log(emergency)
        return emergency
    }







};

module.exports = MonitoringService;