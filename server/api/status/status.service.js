/** ================================================================
 *  건강 현황 로직 구현
 *  @author JG, Jo
 *  @since 2021.05.12
 *  @history 2021.05.17 JG 생체 정보 조회 서비스 추가
 *           2021.05.20 JG 스트레스 정보 조회 서비스 추가
 *           2021.05.21 JG 수면품질 정보 조회 서비스 추가
 *  ================================================================
 */
// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./status.sql');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

// logger
const logger = require('../../config/loggerSettings');

// lodash
//const _ = require('lodash');
let addressCode
class statusService {
    // 사용자 이름 리스트 조회(관리자앱)
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

    // 사용자 이름 조회(보호자앱)
    async getUserNameP(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userName = await mysqlDB('selectOne', queryList.select_user_name, [userCode]);
        userName = cryptoUtil.decrypt_aes(cryptoKey, userName.row.name);
        return userName
    }


    /**
     *  질병 정보(당뇨, 고혈압, 심방세동 예측률) 조회 및 결과 반환
     *  관련 테이블: disease_day, disease_week, disease_month, disease_year
     *  @params userCode - 사용자 고유 번호(숫자)
     *  @params mode - 일간('daily')/주간('weekly')/월간('monthly')/연간('yearly) 구분(string)
     *  @params startDate/endDate - 조회 시작일, 종료일(ex: '2021-05-12')
     *  @return 조회 결과 반환(object)
     *  @author JG, Jo
     *  @since 2021.05.12
     *  @history 2021.05.14 JG mode에 따른 sql 선택 로직 추가
     */
    async getDiseasePredictData(userCode, mode, startDate, endDate) {
        let sql = '';
        switch (mode) {
            case 'daily':
                sql = queryList.select_disease_predict_daily;
                break;
            case 'weekly':
                sql = queryList.select_disease_predict_weekly;
                break;
            case 'monthly':
                sql = queryList.select_disease_predict_monthly;
                break;
            case 'yearly':
                sql = queryList.select_disease_predict_yearly;
                break;
        }

        let paramsArray = [userCode, startDate, endDate];

        let dataList = await mysqlDB('select', sql, paramsArray),
            dataArray = dataList.rows,
            result = {};
        let dlev, hlev, alev
        if (dataList.state && dataList.rowLength > 0) {
            dataArray.forEach(function(item, idx) {
                let dpr = item.diabetes_predict_rate,
                    hpr = item.hypertension_predict_rate,
                    hlpr = item.hypertension_low_predict_rate,
                    tpr = item.tachycardia_ratio,
                    bpr = item.bradycardia_ratio,
                    createDate = item.create_date;
                if (item.diabetes_level != null) {
                    dlev = item.diabetes_level
                    hlev = item.hypertension_level;
                } else {
                    dlev = 3
                    hlev = 3
                    alev = 3
                }

                let tempObj = {};
                tempObj.dmPredict = dpr;
                tempObj.htPredict = hpr;
                tempObj.htlPredict = hlpr;
                tempObj.tPredict = tpr;
                tempObj.bPredict = bpr;
                tempObj.dlev = dlev;
                tempObj.hlev = hlev;
                tempObj.alev = alev;
                tempObj.createDate = createDate;

                result['data' + idx] = tempObj;
                result.drawable = 'Y';
            });
        } else {
            let tempObj = {};
            tempObj.dmPredict = '-';
            tempObj.htPredict = '-';
            tempObj.htlPredict = '-';
            tempObj.tPredict = '-';
            tempObj.bPredict = '-';
            tempObj.dlev = '-';
            tempObj.hlev = '-';
            tempObj.alev = '-';

            result['data0'] = tempObj;
            result.drawable = 'N'
        }
        return result;
    }

    async getDiseasePredictDataSub(userCode, mode, startDate, endDate) {
        let sql = '';
        switch (mode) {
            case 'daily':
                sql = queryList.select_disease_predict_daily;
                break;
            case 'weekly':
                sql = queryList.select_disease_predict_weekly;
                break;
            case 'monthly':
                sql = queryList.select_disease_predict_monthly;
                break;
            case 'yearly':
                sql = queryList.select_disease_predict_yearly;
                break;
        }

        let paramsArray = [userCode, startDate, endDate];

        let dataList = await mysqlDB('select', sql, paramsArray),
            dataArray = dataList.rows,
            result = {};
        let dlev, hlev, alev
        if (dataList.state && dataList.rowLength > 0) {
            dataArray.forEach(function(item, idx) {
                let dpr = item.diabetes_predict_rate,
                    hpr = item.hypertension_predict_rate,
                    hlpr = item.hypertension_low_predict_rate,
                    tpr = item.tachycardia_ratio,
                    bpr = item.bradycardia_ratio,
                    createDate = item.create_date;
                if (item.diabetes_level != null) {
                    dlev = item.diabetes_level
                    hlev = item.hypertension_level;
                } else {
                    dlev = 3
                    hlev = 3
                    alev = 3
                }

                let tempObj = {};
                tempObj.dmPredict = dpr;
                tempObj.htPredict = hpr;
                tempObj.htlPredict = hlpr;
                tempObj.tPredict = tpr;
                tempObj.bPredict = bpr;
                tempObj.dlev = dlev;
                tempObj.hlev = hlev;
                tempObj.alev = alev;
                tempObj.createDate = createDate;

                result['data' + idx] = tempObj;
                result.drawable = 'Y';
            });
        } else {
            let tempObj = {};
            tempObj.dmPredict = '-';
            tempObj.htPredict = '-';
            tempObj.htlPredict = '-';
            tempObj.tPredict = '-';
            tempObj.bPredict = '-';
            tempObj.dlev = '-';
            tempObj.hlev = '-';
            tempObj.alev = '-';

            result['data0'] = tempObj;
            result.drawable = 'N'
        }
        return result;
    };
    /**
     *  생체 정보(심박수, 호흡수, 심박출량, 심박변이도) 평균 조회 및 결과 반환
     *  관련 테이블: biometric_stats_hour, biometric_stats_day, biometric_stats_week, 
     *              biometric_stats_month, biometric_stats_year
     *  @params userCode - 사용자 고유 번호(숫자)
     *  @params mode - 일간('daily')/주간('weekly')/월간('monthly')/연간('yearly) 구분(string)
     *  @params startDate/endDate - 조회 시작일, 종료일(ex: '2021-05-12')
     *  @return 조회 결과 반환(object)
     *  @author JG, Jo
     *  @since 2021.05.17
     */
    async getBiometricAvgData(userCode, mode, startDate, endDate) {
        let sql = '';
        let paramsArray = [userCode, startDate, endDate];

        switch (mode) {
            case 'daily':
                sql = queryList.select_biometric_avg_daily;
                break;
            case 'weekly':
                sql = queryList.select_biometric_avg_weekly;
                paramsArray = [userCode, startDate, endDate, userCode, startDate, endDate];
                break;
            case 'monthly':
                sql = queryList.select_biometric_avg_monthly;
                paramsArray = [userCode, startDate, endDate, userCode, startDate, endDate]
                break;
            case 'yearly':
                sql = queryList.select_biometric_avg_yearly;
                break;
        }

        let dataList = await mysqlDB('select', sql, paramsArray),
            dataArray = dataList.rows,
            result = {},
            tempObj = {};

        if (dataList.state && dataList.rowLength > 0) {
            let firstRow = dataArray[0];

            tempObj.hrAvgTot = firstRow.hr_avg_tot;
            tempObj.rrAvgTot = firstRow.rr_avg_tot;
            tempObj.svAvgTot = firstRow.sv_avg_tot;
            tempObj.hrvAvgTot = firstRow.hrv_avg_tot;

            result.avgTot = tempObj;

            dataArray.forEach(function(item, idx) {
                tempObj = {};
                let hrAvg = item.hr_avg,
                    rrAvg = item.rr_avg,
                    svAvg = item.sv_avg,
                    hrvAvg = item.hrv_avg,
                    createDate = item.create_date;

                tempObj.hrAvg = hrAvg;
                tempObj.rrAvg = rrAvg;
                tempObj.svAvg = svAvg;
                tempObj.hrvAvg = hrvAvg;
                tempObj.createDate = createDate;

                result['data' + idx] = tempObj;
                result.drawable = 'Y';
            });

        } else {
            tempObj.hrAvgTot = '-';
            tempObj.rrAvgTot = '-';
            tempObj.svAvgTot = '-';
            tempObj.hrvAvgTot = '-';

            result.avgTot = tempObj;
            result.drawable = 'N'
        }
        return result;
    }

    /**
     *  스트레스 정보(스트레스 평균, 스트레스 수치) 조회 및 결과 반환
     *  관련 테이블: stress_info_hour, stress_info_day, stress_info_week, 
     *              stress_info_month, stress_info_year
     *  @params userCode - 사용자 고유 번호(숫자)
     *  @params mode - 일간('daily')/주간('weekly')/월간('monthly')/연간('yearly) 구분(string)
     *  @params startDate/endDate - 조회 시작일, 종료일(ex: '2021-05-12')
     *  @return 조회 결과 반환(object)
     *  @author JG, Jo
     *  @since 2021.05.20
     */
    async getStressAvgData(userCode, mode, startDate, endDate) {
        let sql = '';
        let paramsArray = [startDate, endDate, startDate, endDate, userCode, startDate, endDate];

        switch (mode) {
            case 'daily':
                sql = queryList.select_stress_avg_daily;
                break;
            case 'weekly':
                sql = queryList.select_stress_avg_weekly;
                paramsArray.shift();
                paramsArray.shift();
                break;
            case 'monthly':
                sql = queryList.select_stress_avg_monthly;
                paramsArray.shift();
                paramsArray.shift();
                break;
            case 'yearly':
                sql = queryList.select_stress_avg_yearly;
                break;
        }

        let dataList = await mysqlDB('select', sql, paramsArray),
            dataArray = dataList.rows,
            result = {},
            tempObj = {};
        if (dataList.state && dataList.rowLength > 0) {
            let firstRow = dataArray[0];
            let stressScale = firstRow.stress_scale,
                stressLevel = 0,
                stressAvg = firstRow.stress_value_avg;

            tempObj.stressAvg = stressAvg;
            tempObj.stressMin = firstRow.stress_min;
            tempObj.stressMax = firstRow.stress_max;

            /* tempObj.stressScale = stressScale;
            if(stressScale >= 20 && stressScale < 40) {
              stressLevel = 1;
            } else if(stressScale >= 40) {
              stressLevel = 2; 
            } */
            if (stressAvg >= 20 && stressAvg < 40) {
                stressLevel = 1;
            } else if (stressAvg >= 40) {
                stressLevel = 2;
            }

            tempObj.stressLevel = stressLevel;

            result.stressInfo = tempObj;

            dataArray.forEach(function(item, idx) {
                tempObj = {};
                let stressValue = item.stress_value,
                    createDate = item.created_date;

                tempObj.stressValue = stressValue;
                tempObj.createDate = createDate;

                result['data' + idx] = tempObj;
                result.drawable = 'Y';
            });

        } else {
            tempObj.stressAvg = '-';
            //tempObj.stressScale = '-';
            tempObj.stressMin = '-';
            tempObj.stressMax = '-';
            tempObj.stressLevel = '-';

            result.stressInfo = tempObj;
            result.drawable = 'N'
        }
        return result;
    }

    /**
     *  수면품질 정보(총 수면시간, 무호흡 횟수, 무호흡 비율, 무호흡 시간) 조회 및 결과 반환
     *  관련 테이블: sleep_apnea, sleep_info_hour, sleep_info_day, 
     *              sleep_info_week, sleep_info_month, sleep_info_year
     *  @params userCode - 사용자 고유 번호(숫자)
     *  @params mode - 일간('daily')/주간('weekly')/월간('monthly')/연간('yearly) 구분(string)
     *  @params startDate/endDate - 조회 시작일, 종료일(ex: '2021-05-12')
     *  @return 조회 결과 반환(object)
     *  @author JG, Jo
     *  @since 2021.05.21
     */
    async getSleepApneaData(userCode, mode, startDate, endDate) {
        let sql = '';
        let apneaSql = '';
        let paramsArray = [userCode, startDate, endDate];

        switch (mode) {
            case 'daily':
                sql = queryList.select_sleep_apnea_daily;
                apneaSql = queryList.select_apnea_daily;
                break;
            case 'weekly':
                sql = queryList.select_sleep_apnea_weekly;
                apneaSql = queryList.select_apnea_weekly;
                // paramsArray.push(startDate);
                // paramsArray.push(endDate);
                break;
            case 'monthly':
                sql = queryList.select_sleep_apnea_monthly;
                apneaSql = queryList.select_apnea_monthly;
                break;
            case 'yearly':
                sql = queryList.select_sleep_apnea_yearly;
                apneaSql = queryList.select_apnea_yearly;
                break;
        }

        let dataList = await mysqlDB('select', sql, paramsArray),
            dataArray = dataList.rows,
            result = {},
            tempObj = {};
        if (dataList.state && dataList.rowLength > 0 && dataArray[0].total_apnea_count != null) {
            let firstRow = dataArray[0];
            let totSleepTimeMinute = firstRow.total_sleep_time_minute,
                totApneaCount = firstRow.total_apnea_count,
                totApneaRatio = firstRow.total_apnea_ratio,
                totApneaTimeMinute = firstRow.total_apnea_time_minute,
                sleepLevel = 0;

            tempObj.totSleepTimeMinute = totSleepTimeMinute;
            tempObj.totApneaCount = totApneaCount;
            tempObj.totApneaRatio = totApneaRatio;
            tempObj.totApneaTimeMinute = totApneaTimeMinute;
            if (totApneaRatio >= 1 && totApneaRatio < 5) {
                sleepLevel = 1;
            } else if (totApneaRatio >= 5) {
                sleepLevel = 2;
            }
            tempObj.sleepLevel = sleepLevel;

            result.sleepInfo = tempObj;
            if (totApneaCount != 0) { //무호흡 정보가 있다면
                let apneaList = await mysqlDB('select', apneaSql, paramsArray),
                    apneaArray = apneaList.rows
                if (mode == 'daily') {
                    for (let i = 0; i < apneaArray.length; i++) {
                        if (apneaArray[i].created_date.length == 10) {
                            apneaArray[i].created_date += ' 00:00:00'
                        }
                    }
                }

                apneaArray.forEach(function(item, idx) {
                    tempObj = {};
                    let apneaRatio = item.apnea_ratio,
                        createDate = item.created_date;

                    tempObj.apneaRatio = apneaRatio;
                    tempObj.createDate = createDate;

                    result['data' + idx] = tempObj;
                    result.drawable = 'Y';
                });
            } else { //무호흡 정보가 없다면
                tempObj = {};
                tempObj.apneaRatio = 0;
                tempObj.createDate = '';

                result['data' + 0] = tempObj
                result.drawable = 'Y';
            }

        } else {
            tempObj.totSleepTimeMinute = '-';
            tempObj.totApneaCount = '-';
            tempObj.totApneaRatio = '-';
            tempObj.totApneaTimeMinute = '-';
            tempObj.stressLevel = '-';

            result.sleepInfo = tempObj;
            result.drawable = 'N'
        }
        return result;
    }
}
module.exports = statusService;