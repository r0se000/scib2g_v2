/** ================================================================
 *  Batch
 *  @author GG
 *  @since 2022.04.19
 *  @history 2022.04.19 GG ver1.0 작성
 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `
    SELECT key_string
    FROM encryption_key_info
    WHERE activate_yn = 'Y';
`;

// 생체정보 SELECT
exports.select_data = `
    SELECT hr, bed_state, created_time
    FROM  biometric_real_time 
    WHERE user_code = ? AND created_time Between ? AND ?
    ORDER BY created_time ASC;
`;

exports.select_sleep_data = `
    SELECT hr, hrv, bed_state
    FROM biometric_real_time
    WHERE user_code = ? and bed_state != 0 and created_time Between ? AND ?
    ORDER BY created_time ASC;
`;
// 예측 데이터 SELECT
exports.select_model_data = `
    SELECT hr, rr, hrv
    FROM biometric_real_time
    WHERE user_code = ? AND created_time <= ? AND hr != 'Kw==' AND bed_state = 1
    ORDER BY created_time DESC
    LIMIT 120;
`;

// 환자 출생년도
exports.select_year_gender = `
    SELECT birth_year, gender
    FROM user_account
    WHERE user_code = ?;
`;

// 배치 결과 INSERT
exports.batch_insert = `
    INSERT INTO predict_data(user_code, created_time, hr, stress, sleep_index, predict_glucos, predict_high_pressure, predict_low_pressure, health_index)
    VALUES(?,?,?,?,?,?,?,?,?);
`;

exports.data_backup = `
    INSERT INTO biometric_backup_data (user_code, hr, rr, sv, hrv, ss, bed_state, calibration1, calibration2, calibration3, created_time)
    SELECT user_code, hr, rr, sv, hrv, ss, bed_state, calibration1, calibration2, calibration3, created_time
    FROM biometric_real_time
    WHERE user_code = ? AND created_time <= ?;
`;

exports.data_original_delete = `
    DELETE FROM biometric_real_time
    WHERE user_code = ? AND created_time <= ?;
`;