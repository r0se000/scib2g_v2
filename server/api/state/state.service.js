/** ================================================================
 *  건강상태
 *  @author MiYeong Jang
 *  @since 2021.04.13
 *  @history 2021.04.14 database data load
 *           2021.05.20 사용자 이름 조회 추가
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./state.sql');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
// 어제날짜 가져오기
let today = new Date();
let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1);
let yesterday = (today.getDate() - 1) >= 10 ? (today.getDate() - 1) : '0' + (today.getDate() - 1);
let yday = today.getFullYear() + "-" + month + "-" + yesterday;
// 어제날짜 가져오기
let addressCode
class StateService {
    //보호자 앱 대상자 이름 가져오기
    async getOneUserName(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userName = await mysqlDB('selectOne', queryList.select_user_name, [userCode]);
        userName = cryptoUtil.decrypt_aes(cryptoKey, userName.row.name);
        return userName;
    };
    //보호자 이름 가져오기
    async getPUserName(pUserCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let pUserName = await mysqlDB('selectOne', queryList.select_puser_name, [pUserCode]);
        pUserName = cryptoUtil.decrypt_aes(cryptoKey, pUserName.row.p_user_name);
        return pUserName;
    }

    // 사용자 이름 조회
    async getUserName(userCode) {
        let result = {};
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
    /**
     *  어젯밤 건강상태 조회
     * 
     *  @param userCode - 사용자 코드 (String)
     *  @param selectDate - 선택한 날짜(Date)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.04.14.
     */
    async selectSimpleData(userCode, selectDate) {
        //throw new Error('test error');
        if (selectDate == null) {
            selectDate = yday
        }
        // userCode = 1
        const simpleRow = await mysqlDB('selectOne', queryList.getSimple, [userCode, selectDate]);
        const bioinfoRow = await mysqlDB('selectOne', queryList.getBioinfo, [userCode, selectDate]);
        const getlevel = await mysqlDB('selectOne', queryList.getDiseaseLevel, [userCode, selectDate]);
        let simple = simpleRow.row;
        let bioinfo = bioinfoRow.row;
        let hlrate
        if (simple.hypertension_low_predict_rate != null) {
            hlrate = Math.floor(simple.hypertension_low_predict_rate)
        } else {
            hlrate = simple.hypertension_low_predict_rate
        }
        if (bioinfo.rmssd != null)
            bioinfo.rmssd = Math.round(bioinfo.rmssd * 100) / 100;
        if (bioinfo.sdnn != null)
            bioinfo.sdnn = Math.round(bioinfo.sdnn * 100) / 100;
        if (bioinfo.pnn50 != null)
            bioinfo.pnn50 = Math.round(bioinfo.pnn50 * 100) / 100;

        let saveData = {
            "drate": simple.diabetes_predict_rate,
            "dlevel": getlevel.row.diabetes_level,
            "hrate": simple.hypertension_predict_rate,
            "hlevel": getlevel.row.hypertension_level,
            "hlrate": hlrate,
            "tratio": simple.tachycardia_ratio,
            "bratio": simple.bradycardia_ratio,
            "hravg": simple.hr_avg,
            "hrmax": bioinfo.hr_max,
            "hrmin": bioinfo.hr_min,
            "rravg": simple.rr_avg,
            "rrmax": bioinfo.rr_max,
            "rrmin": bioinfo.rr_min,
            "svavg": simple.sv_avg,
            "svmax": bioinfo.sv_max,
            "svmin": bioinfo.sv_min,
            "hrvavg": simple.hrv_avg,
            "hrvmax": bioinfo.hrv_max,
            "hrvmin": bioinfo.hrv_min,
            "rmssd": bioinfo.rmssd,
            "sdnn": bioinfo.sdnn,
            "pnn50": bioinfo.pnn50,
            "stress": simple.stress_value,
            "slhour": simple.sl_hour,
            "slminute": simple.sl_minute,
            "apcount": simple.apnea_count,
            "aphour": simple.ap_hour,
            "apminute": simple.ap_minute,
            "apsecond": simple.ap_second,
            "apratio": simple.apnea_ratio,
            "sltwist": simple.sleep_twist,
        }
        return saveData;
    };
    async selectSimpleDataSub(userCode, selectDate) {
        //throw new Error('test error');
        if (selectDate == null) {
            selectDate = yday
        }
        // userCode = 1
        const simpleRow = await mysqlDB('selectOne', queryList.getSimple, [userCode, selectDate]);
        const bioinfoRow = await mysqlDB('selectOne', queryList.getBioinfo, [userCode, selectDate]);
        const getlevel = await mysqlDB('selectOne', queryList.getDiseaseLevel, [userCode, selectDate]);
        let simple = simpleRow.row;
        let bioinfo = bioinfoRow.row;
        let hlrate
        if (simple.hypertension_low_predict_rate != null) {
            hlrate = Math.floor(simple.hypertension_low_predict_rate)
        } else {
            hlrate = simple.hypertension_low_predict_rate
        }
        bioinfo.rmssd = Math.round(bioinfo.rmssd * 100) / 100;
        bioinfo.sdnn = Math.round(bioinfo.sdnn * 100) / 100;
        bioinfo.pnn50 = Math.round(bioinfo.pnn50 * 100) / 100;
        let saveData = {
            "drate": simple.diabetes_predict_rate,
            "dlevel": getlevel.row.diabetes_level,
            "hrate": simple.hypertension_predict_rate,
            "hlevel": getlevel.row.hypertension_level,
            "hlrate": hlrate,
            "tratio": simple.tachycardia_ratio,
            "bratio": simple.bradycardia_ratio,
            "hravg": simple.hr_avg,
            "hrmax": bioinfo.hr_max,
            "hrmin": bioinfo.hr_min,
            "rravg": simple.rr_avg,
            "rrmax": bioinfo.rr_max,
            "rrmin": bioinfo.rr_min,
            "svavg": simple.sv_avg,
            "svmax": bioinfo.sv_max,
            "svmin": bioinfo.sv_min,
            "hrvavg": simple.hrv_avg,
            "hrvmax": bioinfo.hrv_max,
            "hrvmin": bioinfo.hrv_min,
            "rmssd": bioinfo.rmssd,
            "sdnn": bioinfo.sdnn,
            "pnn50": bioinfo.pnn50,
            "stress": simple.stress_value,
            "slhour": simple.sl_hour,
            "slminute": simple.sl_minute,
            "apcount": simple.apnea_count,
            "aphour": simple.ap_hour,
            "apminute": simple.ap_minute,
            "apsecond": simple.ap_second,
            "apratio": simple.apnea_ratio,
            "sltwist": simple.sleep_twist,
        }
        return saveData;
    };
    /**
     *  어젯밤 건강상태 차트 데이터조회
     * 
     *  @param userCode - 사용자 코드 (String)
     *  @param selectDate - 선택한 날짜(Date)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.04.14.
     *  @history 2021.04.14 최초작성
                 2021.05.07 예외처리 작성    
                 2021.05.07 차트 그리는 방식 변경(timeline불러오기)
*/
    async selectChartData(userCode, selectDate) {
        if (selectDate == null) {
            selectDate = yday
        }

        let hr = [],
            rr = [],
            sv = [],
            hrv = [],
            bioTime = [],
            stressTime = [],
            stress = []

        const bioChartRow = await mysqlDB('select', queryList.getBioChart, [userCode, selectDate]);
        const stressChartRow = await mysqlDB('select', queryList.getStressData, [userCode, selectDate]);


        for (let i = 0; i < bioChartRow.rowLength; i++) {
            bioTime.push(bioChartRow.rows[i].created_time);
            if (bioChartRow.rows[i].hr_avg != null | bioChartRow.rows[i].hr_avg != 0) {
                hr.push(bioChartRow.rows[i].hr_avg)
            } else {
                hr.push(0)
            };
            if (bioChartRow.rows[i].rr_avg != null | bioChartRow.rows[i].rr_avg != 0) {
                rr.push(bioChartRow.rows[i].rr_avg)
            } else {
                rr.push(0)
            };
            if (bioChartRow.rows[i].sv_avg != null | bioChartRow.rows[i].sv_avg != 0) {
                sv.push(bioChartRow.rows[i].sv_avg)
            } else {
                sv.push(0)
            };
            if (bioChartRow.rows[i].hrv_avg != null | bioChartRow.rows[i].hrv_avg != 0) {
                hrv.push(bioChartRow.rows[i].hrv_avg)
            } else {
                hrv.push(0)
            };
        };
        for (let i = 0; i < stressChartRow.rowLength; i++) {
            stressTime.push(stressChartRow.rows[i].stress_created_time);
            if (stressChartRow.rows[i].stress_value != null | stressChartRow.rows[i].stress_value != 0) {
                stress.push(stressChartRow.rows[i].stress_value)
            } else {
                stress.push('0')
            }
        }

        let chartData = {
            "hr": hr,
            "rr": rr,
            "sv": sv,
            "hrv": hrv,
            "bioTime": bioTime,
            "stress": stress,
            "stressTime": stressTime
        };
        return chartData;

    }
}

module.exports = StateService;