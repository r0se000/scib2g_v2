/** ================================================================
 *  실시간 생체정보 
 *  @author MiYeong Jang
 *  @since 2021.06.02.
 *  @history 2021.06.02. 최초작성
 *           
 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

//사용자 리스트 조회
exports.select_user_name =
    `SELECT user_code, name, address_3 FROM user_info WHERE user_status='Y' and user_code like ?;`;

exports.select_user_name_p = `SELECT name FROM user_info WHERE user_code=?`;


exports.Today_emergencyCount = `SELECT COUNT(*) as cnt FROM emergency_after_list WHERE emergency_time LIKE ? and user_code like ?;`;
// exports.bioRealTime =
//     `SELECT user_code, hr, rr, sv, hrv, DATE_FORMAT(created_time, '%m-%d %H:%i:%S') as created_time
//     FROM biometric_real_time
//     WHERE user_code=?
//     ORDER BY created_time DESC 
//     LIMIT 1;
//     `;

exports.emergencyCheck =
    `SELECT user_code, hr, rr, sv, hrv, ss, bed_state, DATE_FORMAT(created_time, '%m-%d %H:%i:%S') as created_time
    FROM biometric_real_time
    WHERE user_code=? and created_time BETWEEN ? AND ?`;

exports.bioRtHistorySec =
    `SELECT user_code, hr, rr, sv, hrv, DATE_FORMAT(created_time, '%m-%d %H:%i:%S') as created_time
    FROM biometric_real_time
    WHERE user_code=? and created_time BETWEEN ? AND ? ORDER BY created_time ASC`;

exports.bioRtHistory =
    `SELECT user_code, hr, rr, sv, hrv, DATE_FORMAT(created_time, '%m-%d %H:%i:%S') as created_time
    FROM biometric_real_time
    WHERE user_code=? and created_time BETWEEN ? AND ? and created_time LIKE "%0" ORDER BY created_time ASC;
    `;