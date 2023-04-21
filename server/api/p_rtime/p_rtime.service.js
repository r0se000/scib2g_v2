/** ================================================================
 *  b2g 알림 앱 관리페이지 
 *  @author MiYeong Jang
 *  @since 2023.03.23.
 *  @history 
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./p_rtime.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

const redis = require("redis");
const client = redis.createClient();
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);
let addressCode

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

class p_rtimeService {



    async userList(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let select_addressCode = await mysqlDB('selectOne', queryList.select_addressCode, [userCode])
        addressCode = select_addressCode.row.a_user_address1 + select_addressCode.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }

        let userList = await mysqlDB('select', queryList.select_user_name_app, [addressCode]);
        for (let i = 0; i < userList.rowLength; i++) {
            userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
        }
        userList.rows.forEach(function(item, index) {
            result['user' + [index]] = item;
        });

        return result
    };


    async selectInfo(user_code) {
        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let result = await mysqlDB('selectOne', queryList.userinfo, [user_code]);
        let last_data = await mysqlDB('selectOne', queryList.last_data, [user_code]);
        if (result.rowLength == 0) {
            result.messageCode = "error";
        } else {
            result.messageCode = "success";
            try {
                if (result.row.gender == 'W') {
                    result.row.gender = '여성'
                } else if (result.row.gender == 'M') {
                    result.row.gender = '남성'
                }
                result.row.name = cryptoUtil.decrypt_aes(cryptoKey, result.row.name);
                result.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_year);
                result.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_month);
                result.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, result.row.birth_date);
                result.row.address_1 = cryptoUtil.decrypt_aes(cryptoKey, result.row.address_1);
                result.row.address_2 = cryptoUtil.decrypt_aes(cryptoKey, result.row.address_2);
                result.row.address_3 = cryptoUtil.decrypt_aes(cryptoKey, result.row.address_3);
                result.row.phone_first = cryptoUtil.decrypt_aes(cryptoKey, result.row.phone_first);
                result.row.phone_middle = cryptoUtil.decrypt_aes(cryptoKey, result.row.phone_middle);
                result.row.phone_last = cryptoUtil.decrypt_aes(cryptoKey, result.row.phone_last);
                result.row.protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, result.row.protector_phone_first);
                result.row.protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, result.row.protector_phone_middle);
                result.row.protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, result.row.protector_phone_last);
                if (last_data.rowLength == 0) {
                    result.row.last_data = '-';
                } else {
                    result.row.last_data = last_data.row.created_time;
                }

            } catch (error) {
                result.row.name = null;
                result.row.address_1 = null;
                result.row.address_2 = null;
                result.row.address_3 = null;
                result.row.phone_first = null;
                result.row.phone_middle = null;
                result.row.phone_last = null;
                result.row.protector_phone_first = null;
                result.row.protector_phone_middle = null;
                result.row.protector_phone_last = null;
                result.row.last_data = last_data.row.created_time;
            }
        }

        return result;
    }

    async selectAllInfo() {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let result = await mysqlDB('select', queryList.userlist, [addressCode])

        for (var i = 0; i < result.rowLength; i++) {
            try {
                result.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, result.rows[i].name);
            } catch (error) {
                result.rows[i].name = null;
            }
        }
        return result;
    }




    async selectRtimeData(userCode) {
        let sendData = {};
        for (let i = 0; i < userCode.length; i++) {
            let bioData = new Array();
            let rtFlag = await getAsync(userCode[i]);
            if (rtFlag != 0 && rtFlag != null) {
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "hr", 0, 4)));
                // bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "rr", 0, 4)));
                // bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "sv", 0, 4)));
                // bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "hrv", 0, 4)));
                bioData.push(await stringToNumberInArray(await lrangeAsync(userCode[i] + "state", 0, 4)));
                bioData = transpose(bioData);
                bioData = bioData.reverse();
            } else {
                bioData = [
                    [0, -1],
                    [0, -1],
                    [0, -1],
                    [0, -1],
                    [0, -1]
                ];
            }
            sendData[userCode[i]] = bioData;
        }
        return sendData;
    };

}
module.exports = p_rtimeService;