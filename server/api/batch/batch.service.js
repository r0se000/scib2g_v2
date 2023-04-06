/** ================================================================
 *  Batch
 *  @author GG
 *  @since 2022.04.19
 *  @history 2022.04.19 GG ver1.0 작성
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./batch.sql');

// logger
const logger = require('../../config/loggerSettings');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

// 평균
const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

// 리스트 평균
function Avg(list) {
    let Avg = average(list)
    return Avg
}
// SDNN
function SDNN(list) {
    let AVG = Avg(list)
    let SDNN_TEMP = []
    for (let i = 0; i < list.length; i++) {
        SDNN_TEMP.push(Math.abs(AVG - list[i]))
    }
    let SDNN = Avg(SDNN_TEMP)
    return SDNN
}
// RMSSD
function RMSSD(list) {
    let RMSSD_TEMP = 0,
        RMSSD_COUNT = 0
    for (let i = 0; i < list.length - 1; i++) {
        RMSSD_TEMP += Math.pow(list[i] - list[i + 1], 2)
        RMSSD_COUNT += 1
    }
    let BEFORE_RMSSD = RMSSD_TEMP / RMSSD_COUNT
    let RMSSD = Math.sqrt(BEFORE_RMSSD)
    return RMSSD
}
// PNN50
function PNN50(list) {
    let PNN50_COUNT = 0
    for (let i = 0; i < list.length - 1; i++) {
        if (Math.abs(list[i] - list[i + 1]) >= 50) {
            PNN50_COUNT += 1
        }
    }
    let PNN50 = PNN50_COUNT / (list.length - 1)
    return PNN50
}


function SleepBatchDateTime() {
    let getDate = new Date();
    let endYear = getDate.getFullYear()
    let endMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let endDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let endTime = endYear + "-" + endMonth + "-" + endDay + " " + '07:00:00';

    getDate.setDate(endDay - 1);

    let startYear = getDate.getFullYear()
    let startMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let startDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let startTime = startYear + "-" + startMonth + "-" + startDay + " " + '22:00:00';

    return [startTime, endTime]
}


class batchService {
    // B2G Batch
    // 1. 수면
    // 2. 예측
    async B2G_Batch(params) {
        let result = {};
        let user_code = params.userCode;

        // 배치 여부
        let check_Batch = 'N'

        // 건강지수
        let health_index = null

        // 1. 수면
        // SleepBatchDateTime();
        // return[0] : 전날 22:00
        // return[1] : 금일 07:00
        let datetime = SleepBatchDateTime();

        // DataBase 생체정보 SELECT
        let select_data = await mysqlDB('select', queryList.select_data, [user_code, datetime[0], datetime[1]]);

        // 생체정보 개수
        let data_count = select_data.rowLength;

        // 전날 22:00 ~ 금일 07:00
        // 조건 1. 해당 시간내 센서 연결  30분 이상
        // 조건 2. 수면 시작 시간 - 수면 종료 시간 > 4시간

        let sleep_start_time = null;
        let sleep_start_check_index = 0;
        let sleep_end_time = null;
        let sleep_end_check_index = 0;

        if (data_count >= 1800) {
            // 암호화 키
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;

            let hr_list = [],
                bed_list = [],
                time_list = [];

            for (let i = 0; i < select_data.rowLength; i++) {
                // 심박수 복호화
                select_data.rows[i].hr = cryptoUtil.decrypt_aes(cryptoKey, select_data.rows[i].hr);

                hr_list.push(parseInt(select_data.rows[i].hr));
                bed_list.push(select_data.rows[i].bed_state);
                time_list.push(select_data.rows[i].created_time);
            }

            // 수면 시작 시간
            // 조건 1. 침대점유 5분 이상시, 수면 시작            
            for (let j = 0; j < bed_list.length; j++) {
                if (bed_list[j] == 1 && hr_list[j] != 0) {
                    sleep_start_check_index += 1;
                } else {
                    sleep_start_check_index = 0;
                }

                if (sleep_start_check_index > 300) {
                    sleep_start_time = time_list[j];
                    break;
                }
            }

            // 수면 종료 시간
            // 조건 1. 수면 시작 시간 NOT NULL
            if (sleep_start_time != null) {
                // 심박수, 침대 시간 리스트 reverse()
                let hr_reverse = hr_list.reverse();
                let bed_reverse = bed_list.reverse();
                let time_reverse = time_list.reverse();

                for (let k = 0; k < bed_reverse.length; k++) {
                    if (k == 0 && bed_reverse[k] == 1 && hr_reverse != 0) {
                        sleep_end_time = time_reverse[k];
                        break;
                    }

                    if (bed_reverse[k] == 0 && hr_reverse[k] == 0) {
                        sleep_end_check_index += 1;
                    } else {
                        sleep_end_check_index = 0;
                    }

                    if (sleep_end_check_index > 300) {
                        sleep_end_time = time_reverse[k];
                        break;
                    }
                }

                if (sleep_end_time != null) {
                    // 심박수, 스트레스, 수면품질
                    // 수면 시작 시간 ~ 수면 종료 시간
                    let select_sleep_data = await mysqlDB('select', queryList.select_sleep_data, [user_code, sleep_start_time, sleep_end_time]);

                    // 수면 심박수
                    let sleep_hr_list = []
                        // 수면 심박변이도
                    let sleep_hrv_list = []
                        // 총 수면 시간
                    let total_sleep_count = select_sleep_data.rowLength;
                    // 침대 점유
                    let sleep_bed1_count = 0
                        // 움직임
                    let sleep_bed2_count = 0
                        // 수면 품질
                    let sleep_index = 0


                    for (let i = 0; i < select_sleep_data.rowLength; i++) {
                        if (select_sleep_data.rows[i].bed_state == 1) {
                            sleep_bed1_count += 1;
                            sleep_hr_list.push(parseInt(cryptoUtil.decrypt_aes(cryptoKey, select_sleep_data.rows[i].hr)))
                            sleep_hrv_list.push(parseInt(cryptoUtil.decrypt_aes(cryptoKey, select_sleep_data.rows[i].hrv)))
                        } else if (select_sleep_data.rows[i].bed_state == 2) {
                            sleep_bed2_count += 1;
                        }
                    }

                    // 수면 품질

                    // 8시간
                    if (total_sleep_count > 28800) {
                        sleep_index = 100
                    }
                    // 7시간
                    else if (total_sleep_count > 25200) {
                        sleep_index = 85
                    }
                    // 6시간
                    else if (total_sleep_count > 21600) {
                        sleep_index = 70
                    }
                    // 5시간
                    else if (total_sleep_count > 18000) {
                        sleep_index = 55
                    }
                    // 4시간
                    else if (total_sleep_count > 14400) {
                        sleep_index = 40
                    }
                    // 3시간
                    else if (total_sleep_count > 10800) {
                        sleep_index = 25
                    }
                    // 3시간 미만
                    else {
                        sleep_index = 10
                    }

                    if (sleep_bed2_count != 0) {
                        let bed2_ratio = parseInt(sleep_bed2_count / total_sleep_count * 100)
                        sleep_index = sleep_index - bed2_ratio
                    }

                    let sleep_hr_avg = parseInt(Avg(sleep_hr_list));
                    let sleep_stress = parseInt(SDNN(sleep_hrv_list).toFixed(2));

                    health_index = 0
                    if (sleep_index > 80) {
                        health_index += 5
                    } else if (sleep_index > 40) {
                        health_index += 3
                    } else {
                        health_index += 1
                    }
                    if (sleep_stress < 20) {
                        health_index += 5
                    } else if (sleep_stress < 40) {
                        health_index += 3
                    } else {
                        health_index += 1
                    }

                    check_Batch = 'Y'
                    result['sleep_hr'] = sleep_hr_avg;
                    result['sleep_index'] = sleep_index;
                    result['sleep_stress'] = sleep_stress;
                    result['health_index'] = health_index;

                } else {
                    check_Batch = 'N'
                }
            }
        } else {
            check_Batch = 'N'
        }

        // 2. 예측
        // 조건 1. 수면 시작, 종료가 null이 아닐 경우 종료시간으로부터 유효한 데이터 120개 추출
        // 조건 2. 수면 시작, 종료가 null일 경우 예측 실행 안함

        if (check_Batch != 'N') {
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;

            let select_model_data = await mysqlDB('select', queryList.select_model_data, [user_code, sleep_end_time]);
            let model_input_hr = [],
                model_input_rr = [],
                model_input_hrv = [],
                model_input_sdnn = [],
                model_input_rmssd = [],
                model_input_pnn50 = [],
                model_input_age = [],
                model_input_gender = []

            for (let i = 0; i < select_model_data.rowLength; i++) {
                select_model_data.rows[i].hr = cryptoUtil.decrypt_aes(cryptoKey, select_model_data.rows[i].hr);
                select_model_data.rows[i].rr = cryptoUtil.decrypt_aes(cryptoKey, select_model_data.rows[i].rr);
                select_model_data.rows[i].hrv = cryptoUtil.decrypt_aes(cryptoKey, select_model_data.rows[i].hrv);

                model_input_hr.push(parseInt(select_model_data.rows[i].hr));
                model_input_rr.push(parseInt(select_model_data.rows[i].rr));
                model_input_hrv.push(parseInt(select_model_data.rows[i].hrv));
            }

            let model_input_hr_reverse = model_input_hr.reverse();
            let model_input_rr_reverse = model_input_rr.reverse();
            let model_input_hrv_reverse = model_input_hrv.reverse();

            let rmssd = RMSSD(model_input_hrv_reverse).toFixed(2),
                sdnn = SDNN(model_input_hrv_reverse).toFixed(2),
                pnn50 = PNN50(model_input_hrv_reverse).toFixed(3)

            let age = 0,
                gender = 0
            let select_year_gender = await mysqlDB('selectOne', queryList.select_year_gender, [user_code])

            age = cryptoUtil.decrypt_aes(cryptoKey, select_year_gender.row.birth_year);

            let getDate = new Date();
            let nowYear = getDate.getFullYear()

            age = nowYear - age
            if (select_year_gender.row.gender == 'M') {
                gender = 0
            } else if (select_year_gender.row.gender == 'W') {
                gender = 1
            }

            for (let i = 0; i < select_model_data.rowLength; i++) {
                model_input_sdnn.push(rmssd)
                model_input_rmssd.push(sdnn)
                model_input_pnn50.push(pnn50)
                model_input_age.push(age)
                model_input_gender.push(gender)
            }

            result['model_hr'] = model_input_hr_reverse;
            result['model_rr'] = model_input_rr_reverse;
            result['model_hrv'] = model_input_hrv_reverse;
            result['model_sdnn'] = model_input_sdnn;
            result['model_rmssd'] = model_input_rmssd;
            result['model_pnn50'] = model_input_pnn50;
            result['model_age'] = model_input_age;
            result['model_gen'] = model_input_gender;
        }

        result['check_Batch'] = check_Batch;


        return result
    }



    async batch_insert(params) {
        let user_code = params.userCode;
        let sleep_hr = params.sleep_hr;
        let sleep_stress = params.sleep_stress;
        let sleep_index = params.sleep_index;
        let glucos = params.glucos;
        let pressure_high = params.pressure_high;
        let pressure_low = params.pressure_low;
        let health_index = params.health_index;

        let getDate = new Date();
        let Year = getDate.getFullYear()
        let Month = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
        let Day = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
        getDate.setDate(Day - 1);
        Year = getDate.getFullYear()
        Month = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
        Day = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
        let DateString = Year + "-" + Month + "-" + Day;

        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        sleep_hr = cryptoUtil.encrypt_aes(cryptoKey, sleep_hr)
        sleep_stress = cryptoUtil.encrypt_aes(cryptoKey, sleep_stress)
        sleep_index = cryptoUtil.encrypt_aes(cryptoKey, sleep_index)
        glucos = cryptoUtil.encrypt_aes(cryptoKey, glucos)
        pressure_high = cryptoUtil.encrypt_aes(cryptoKey, pressure_high)
        pressure_low = cryptoUtil.encrypt_aes(cryptoKey, pressure_low)
        health_index = cryptoUtil.encrypt_aes(cryptoKey, health_index)

        let batch_insert = await mysqlDB('insert', queryList.batch_insert, [user_code, DateString, sleep_hr, sleep_stress, sleep_index, glucos, pressure_high, pressure_low, health_index]);

        return batch_insert
    }

    async data_backup(params) {
        let user_code = params.userCode;
        let datetime = SleepBatchDateTime();
        let data_backup = await mysqlDB('insert', queryList.data_backup, [user_code, datetime[1]]);
        let data_original_delete
        if (data_backup.succ == 1) {
            data_original_delete = await mysqlDB('delete', queryList.data_original_delete, [user_code, datetime[1]]);
        }

        return data_original_delete

    }
}


module.exports = batchService;