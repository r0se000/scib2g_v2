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

exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check 
    FROM user_admin 
    WHERE a_user_code=?;`;

// 사용자 이름 조회 
exports.select_user_name_app =
    `SELECT user_code, name FROM user_info WHERE staff_code=? and user_status='Y'`;

exports.select_user_name =
    `SELECT user_code, name, birth_year, birth_month, birth_date,address_1, address_2, address_3, phone_first, phone_middle, phone_last, protector_phone_first, protector_phone_middle, protector_phone_last FROM user_info WHERE user_status='Y'`;

exports.selectLastSensorTime = `
    SELECT * FROM biometric_real_time WHERE user_code = ?  ORDER BY created_time DESC LIMIT 60;
`;

exports.selectEmDetail = `
SELECT ec.emergency_id, ua.a_user_name, up.p_user_name, ea.emergency_time, ec.emergency_check_time
                    FROM emergency_check_list AS ec
                    LEFT JOIN user_admin AS ua
                    ON ec.a_user_code = ua.a_user_code
                    LEFT JOIN user_protector AS up
                    ON ec.p_user_code = up.p_user_code
                    LEFT JOIN emergency_after_list AS ea
                    ON ec.emergency_id = ea.emergency_id
                    WHERE ec.emergency_id = ?;
`;


exports.selectBatchCheck = `
    SELECT count(*) AS cnt FROM batch_list WHERE DATE_FORMAT(DATE,'%y-%m-%d') = DATE_FORMAT(?,'%y-%m-%d') AND user_code IS NULL;
    `;

exports.selectBatchDetail = `
SELECT bl.DATE, bl.user_code, ui.name, bl.batch_check FROM batch_list AS bl
        LEFT JOIN user_info AS ui
        ON bl.user_code = ui.user_code
        WHERE DATE_FORMAT(bl.DATE,'%y-%m-%d') = DATE_FORMAT(?,'%y-%m-%d') AND bl.user_code IS NOT NULL;
    `;

exports.emer_userList = `
    SELECT em.emergency_id, em.user_code, em.a_user_code, em.emergency_time, em.emergency_web_check, em.emergency_check_contents,TIMESTAMPDIFF(second,em.emergency_time,em.emergency_contents_time) AS time_diff, ui.name "user_name", ua.a_user_name
    FROM emergency_list AS em
    LEFT JOIN user_info AS ui
    ON em.user_code = ui.user_code
    LEFT JOIN user_admin AS ua
    ON ui.staff_code = ua.a_user_code 
    WHERE ? <= em.emergency_time
    ORDER BY em.emergency_time DESC;
    `;

exports.emergencyCheck =
    `SELECT user_code, hr, rr, sv, hrv, ss, bed_state, DATE_FORMAT(created_time, '%m-%d %H:%i:%S') as created_time
    FROM biometric_real_time
    WHERE user_code=? and created_time BETWEEN ? AND ?`;