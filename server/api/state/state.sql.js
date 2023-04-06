/** ================================================================
 *  건강상태 sql
 * @author MiYeong Jang
 * @since 2021.04.12
 *        2021.05.07 getBioChart, getStressData 쿼리 수정(시간 불러오기)
 *        2021.05.20 사용자 이름 조회, 암호화 키 조회 추가
 *  ================================================================
 */
// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 대상자 이름 조회 
exports.select_user_name =
    `SELECT name FROM user_info WHERE user_code=?`;

// 보호자 이름 조회 
exports.select_puser_name =
    `SELECT p_user_code, p_user_name FROM user_protector WHERE p_user_code=?`;

// 대상자 이름 조회 
exports.select_user_name_app =
    `SELECT user_code, name FROM user_info WHERE user_status='Y' and user_code LIKE ?;`;

exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?`

// health_state 테이블 조회
exports.getSimple = ` SELECT user_code, DATE_FORMAT(state_created_date, '%Y-%m-%d') as state_created_date, 
CAST(diabetes_predict_rate AS signed INTEGER) as diabetes_predict_rate, CAST((hypertension_predict_rate) AS signed INTEGER) as hypertension_predict_rate, 
tachycardia_ratio, bradycardia_ratio,  
CAST((hypertension_low_predict_rate) AS signed INTEGER) as hypertension_low_predict_rate,
                       hr_avg, rr_avg, sv_avg, hrv_avg, stress_value, 
                       TIME_FORMAT(sleep_time, '%H') as sl_hour, TIME_FORMAT(sleep_time, '%i') as sl_minute, 
                       apnea_count,TIME_FORMAT(apnea_time, '%H') as ap_hour, TIME_FORMAT(apnea_time, '%i') as ap_minute, TIME_FORMAT(apnea_time, '%s') as ap_second, apnea_ratio, sleep_twist
                       FROM health_state
                       WHERE user_code = ? and state_created_date=?
                     `;
exports.getDiseaseLevel = `SELECT diabetes_level, hypertension_level, tachycardia_ratio, bradycardia_ratio from disease_day WHERE user_code = ? AND create_time = ?`;
//일간 생체정보 테이블에서  생체정보 평균, 최대, 최소 값 가져오기
exports.getBioinfo = `
                      SELECT user_code, hr_max, hr_min, rr_max, rr_min, sv_max, sv_min, hrv_max, hrv_min, rmssd, sdnn, pnn50
                      FROM biometric_stats_day
                      WHERE user_code = ? and created_date=?
                    `;
//시간별 생체정보 테이블에서 시간대별 생체정보 평균값 가져오기
exports.getBioChart = `
                      SELECT DATE_FORMAT(create_date, '%Y-%m-%d') as create_date, hr_avg, rr_avg, sv_avg, hrv_avg, DATE_FORMAT(created_time, '%H') as created_time
                      FROM biometric_stats_hour
                      WHERE user_code=? and create_date=?
                    `;
//스트레스 시간별로 값 가져오기
exports.getStressData = `
                        SELECT DATE_FORMAT(stress_created_date, '%Y-%m-%d') as stress_created_date, stress_value, DATE_FORMAT(stress_created_time, '%H') as stress_created_time
                        FROM stress_info_hour
                        WHERE user_code=? and stress_created_date=?
                      `;