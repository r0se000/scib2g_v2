/** ================================================================
 *  B2G_V2 모니터링 발생 조회 페이지
 *  @author MiYeong Jang
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./monitList.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

function getToday(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay;
    return nowtime
}
let addressCode

class MonitListService {

    async loginCheck(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        result.loginCheck = sqlResult.row.a_user_login_check;
        addressCode = sqlResult.row.a_user_address1 + sqlResult.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.userName = userName

        return result
    };

    async userList(userCode) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.userList, [addressCode]);
        for (let i = 0; i < userList.rowLength; i++) {
            if (userList.rows[i].user_name != null)
                userList.rows[i].user_name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].user_name);
            else {
                userList.rows[i].user_name = '-'
            }
            if (userList.rows[i].a_user_name != null)
                userList.rows[i].a_user_name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].a_user_name);
            else {
                userList.rows[i].a_user_name = '-'
            }
        }
        userList.rows.forEach(function(item, index) {
            if (item.emergency_web_check == null) {
                item.emergency_web_check = "--"
            }
            if (item.emergency_check_contents == null) {
                item.emergency_check_contents = "--"
            }
            result['user' + [index]] = item;
        });
        return result
    }

    // 응급 발생 조회(이름 검색)
    async dateSearch(userCode, trip_start, trip_end) {
        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.dateSearch, [trip_start, trip_end, addressCode]);

        for (let i = 0; i < userList.rowLength; i++) {
            userList.rows[i].user_name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].user_name);
            userList.rows[i].a_user_name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].a_user_name);
        }

        userList.rows.forEach(function(item, index) {
            if (item.emergency_check_time == null) {
                item.emergency_check_time = "--"
            }
            if (item.emergency_check_contents == null) {
                item.emergency_check_contents = "--"
            }
            result['user' + [index]] = item;
        });

        return result
    }

    // 응급 발생 통계
    async emergencyStatistics(userCode, today, week_start, week_end, month_start, month_end, year_start, year_end) {
        today = today + '%'; // LIKE 쿼리문에 사용하기 위해 변경

        let result = {}
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emergencyToday = await mysqlDB('select', queryList.emergencyToday, [today, addressCode]);
        let emergencyToweek = await mysqlDB('select', queryList.emergencyTodayRange, [week_start, week_end, addressCode]);
        let emergencyTomonth = await mysqlDB('select', queryList.emergencyTodayRange, [month_start, month_end, addressCode]);
        let emergencyToyear = await mysqlDB('select', queryList.emergencyTodayRange, [year_start, year_end, addressCode]);
        let emergencyAllCnt = await mysqlDB('select', queryList.emergencyAllCnt, [addressCode]);

        result['emergencyToday'] = emergencyToday.rows;
        result['emergencyToweek'] = emergencyToweek.rows;
        result['emergencyTomonth'] = emergencyTomonth.rows;
        result['emergencyToyear'] = emergencyToyear.rows;
        result['emergencyAllCnt'] = emergencyAllCnt.rows;
        return result
    };


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

}
module.exports = MonitListService;