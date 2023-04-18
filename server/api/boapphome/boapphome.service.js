/** ================================================================
 *  앱 메인화면
 *  @author MiYeong Jang
 *  @since 2021.10.20
 *  @history 2021.10.20 최초작성
 *           
 *  ================================================================
 */

// DB connection
const { ConsoleTransportOptions, Console } = require('winston/lib/winston/transports');
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./boapphome.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

function setDateTime(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let nowhours = getDate.getHours() >= 10 ? getDate.getHours() : '0' + getDate.getHours();
    let nowMinutes = getDate.getMinutes() >= 10 ? getDate.getMinutes() : '0' + getDate.getMinutes();
    let nowSec = getDate.getSeconds() >= 10 ? getDate.getSeconds() : '0' + getDate.getSeconds();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay + " " + nowhours + ':' + nowMinutes + ':' + nowSec;

    getDate.setMinutes(nowMinutes - 1)
    let beforeMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let beforeDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let beformeHours = getDate.getHours() >= 10 ? getDate.getHours() : '0' + getDate.getHours();
    let beformMinutes = getDate.getMinutes() >= 10 ? getDate.getMinutes() : '0' + getDate.getMinutes();
    let beforeSec = getDate.getSeconds() >= 10 ? getDate.getSeconds() : '0' + getDate.getSeconds();
    let beforeTime = getDate.getFullYear() + "-" + beforeMonth + "-" + beforeDay + " " + beformeHours + ':' + beformMinutes + ':' + beforeSec;

    let timeArray = [beforeTime, nowtime]
    return timeArray
}
class boapphomeService {
    /**
     *  응급목록 불러오기
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.20. 최초작성
     *  
     */
    async selectEmergency(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emergencyList = await mysqlDB('select', queryList.selectEmergency, [userCode]);
        if (emergencyList.rowLength != 0) {
            for (let i = 0; i < emergencyList.rowLength; i++) {
                emergencyList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, emergencyList.rows[i].name);
            }
        }
        return emergencyList.rows
    };
    /**
     *  응급상세정보 불러오기
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.20. 최초작성
     *  
     */
    async selectEmDetail(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = {}
        let staffInfo
        let emergencyid = [],
            emergencyUserCode = [],
            emergencyUserInfo = []

        let emergencyCheck = await mysqlDB('select', queryList.emergencyCheck, [userCode])

        if (emergencyCheck.rowLength != 0) {
            for (let i = 0; i < emergencyCheck.rowLength; i++) {
                let userInfo = await mysqlDB('selectOne', queryList.userList, [emergencyCheck.rows[i].user_code])

                let create = setDateTime(new Date(emergencyCheck.rows[i].emergency_time));

                userInfo.row.name = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.name);
                userInfo.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_year);
                userInfo.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_month);
                userInfo.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_date);
                userInfo.row.address_2 = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.address_2);
                userInfo.row.address_3 = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.address_3);
                userInfo.row.phone_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_first);
                userInfo.row.phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_middle);
                userInfo.row.phone_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_last);
                userInfo.row.protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_first);
                userInfo.row.protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_middle);
                userInfo.row.protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_last);

                let emUserBioInfo = await mysqlDB('select', queryList.selectEmBioInfo, [emergencyCheck.rows[i].user_code, create[0], create[1]])
                userInfo = {
                    "user_name": userInfo.row.name,
                    "user_birth": userInfo.row.birth_year + "-" + userInfo.row.birth_month + "-" + userInfo.row.birth_date,
                    "address_1": userInfo.row.address_1,
                    "address_2": userInfo.row.address_2 + " " + userInfo.row.address_3,
                    "user_phone": userInfo.row.phone_first + "-" + userInfo.row.phone_middle + "-" + userInfo.row.phone_last,
                    "protector_phone": userInfo.row.protector_phone_first + "-" + userInfo.row.protector_phone_middle + "-" + userInfo.row.protector_phone_last,
                    "gender": userInfo.row.gender,
                    "emBioInfo": emUserBioInfo
                }
                emergencyid.push(emergencyCheck.rows[i]);
                emergencyUserCode.push(emergencyCheck.rows[i].user_code);
                emergencyUserInfo.push(userInfo);
            }
        }
        result["emergency_id"] = emergencyid
        result["emergency_user"] = emergencyUserCode;
        result["emergency_userInfo"] = emergencyUserInfo;
        return result
    };

    /**
     *  조치사항 미입력 목록 불러오기
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.21. 최초작성
     *  
     */
    async selectCheckList(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let checkList = await mysqlDB('select', queryList.selectCheckList, [userCode]);

        if (checkList.rowLength != 0) {
            for (let i = 0; i < checkList.rowLength; i++) {
                checkList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].name);
                checkList.rows[i].birth_year = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].birth_year);
                checkList.rows[i].birth_month = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].birth_month);
                checkList.rows[i].birth_date = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].birth_date);
            }
        }
        return checkList.rows
    }

    /**
     *  조치사항 미입력 목록 상세정보 불러오기
     *  @param emCode - 응급 코드
     *  @param selectUserCode - 조회 할 사용자 코드
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.21. 최초작성
     *  
     */
    async selectCheckDetail(emCode, selectUserCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emInfo = await mysqlDB('selectOne', queryList.selectEmInfo, [emCode]),
            userInfo = await mysqlDB('selectOne', queryList.selectUserInfo, [selectUserCode]);
        let emTime = emInfo.row.emergency_time,
            emCheckTime = emInfo.row.emergency_check_time,
            user_name = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.name),
            birth_year = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_year),
            birth_month = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_month),
            birth_date = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_date),
            gender = userInfo.row.gender,
            protector_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_first),
            protector_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_middle),
            protector_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_last);

        let detailResult = {
            "user_name": user_name,
            "birth": birth_year + "-" + birth_month + "-" + birth_date,
            "gender": gender,
            "protector": protector_first + "-" + protector_middle + "-" + protector_last,
            "emTime": emTime,
            "emCheckTime": emCheckTime
        };
        return detailResult
    }


    async emTimeInput(emCode, p_user_code, emCheckTime) {

        let emCheckList = await mysqlDB('selectOne', queryList.emergencyCheckList, [emCode, p_user_code]);

        if (emCheckList.rowLength == 0) {
            let emTimeInput = await mysqlDB('insert', queryList.insertEmTime, [emCode, p_user_code, emCheckTime]);

            return emTimeInput
        }

    }



}
module.exports = boapphomeService;