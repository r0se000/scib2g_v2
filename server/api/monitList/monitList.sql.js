/** ================================================================
 *  B2G_V2 모니터링 발생 조회 페이지 쿼리
 *  @author MiYeong Jang
 *  @since 2023.03.30
 *  @history 2023.03.30 초기 작성
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?;`;

exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check , a_user_address1, a_user_address2
    FROM user_admin 
    WHERE a_user_code=?;`


exports.userList = `
    SELECT em.emergency_id, em.user_code, em.a_user_code, em.emergency_time, em.emergency_web_check, TIMESTAMPDIFF(second,em.emergency_time,em.emergency_contents_time) AS time_diff, em.emergency_check_contents, ui.name "user_name", ua.a_user_name
    FROM emergency_list AS em
    LEFT JOIN user_info AS ui
    ON em.user_code = ui.user_code
    LEFT JOIN user_admin AS ua
    ON ui.staff_code = ua.a_user_code 
    WHERE em.user_code LIKE ? AND em.emergency_check_contents IS NOT NULL AND ui.user_status='Y'
    ORDER BY em.emergency_time DESC
    ;
                    `;

// 날짜 범위 검색
exports.dateSearch = `
SELECT em.emergency_id "emergency_id", em.user_code, em.a_user_code, em.emergency_time, em.emergency_web_check, em.emergency_contents_time, TIMESTAMPDIFF(second,em.emergency_time,em.emergency_contents_time) AS time_diff, em.emergency_check_contents, ui.name "user_name", ua.a_user_name
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    LEFT JOIN user_admin AS ua
                    ON ui.staff_code = ua.a_user_code
                    WHERE em.emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59')  AND em.user_code LIKE ? AND em.emergency_check_contents IS NOT NULL and emergency_check_contents != "이상없음" AND ui.user_status='Y';
                    ORDER BY em.emergency_time DESC;
                    `;

// 응급 조회 통계(금일)
exports.emergencyToday = `
                    SELECT COUNT(em.user_code) AS "emDate"
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE em.emergency_time like ? AND ui.user_code LIKE ? AND em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y';
                    `;
// 응급 조회 통계(금주, 금월, 금년)
exports.emergencyTodayRange = `
                    SELECT COUNT(em.user_code) AS "emDate"
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE em.emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.user_code LIKE ? AND em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y';
                    `;
// 응급 조회 통계(전체)
exports.emergencyAllCnt = `
                    SELECT COUNT(em.user_code) AS "emDate"
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE ui.user_code LIKE ? AND em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y';
`;

exports.selectEmDetail = `
SELECT ec.emergency_id, ua.a_user_name, up.p_user_name, ea.emergency_time, ec.emergency_check_time
                    FROM emergency_check_list AS ec
                    LEFT JOIN user_admin AS ua
                    ON ec.a_user_code = ua.a_user_code
                    LEFT JOIN user_protector AS up
                    ON ec.p_user_code = up.p_user_code
                    LEFT JOIN emergency_list AS ea
                    ON ec.emergency_id = ea.emergency_id
                    WHERE ec.emergency_id = ?;
`;