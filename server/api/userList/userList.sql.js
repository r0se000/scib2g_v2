/** ================================================================
 *  관리 대상자 조회 sql
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 최초 작성
 *           2023.03.29 관리 대상자 이름 검색 추가
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;


exports.loginCheck =
    `SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2
     FROM user_admin 
     WHERE a_user_code=?;
     `;

// 관리 대상자 리스트 조회
exports.select_user_list = `
     SELECT user_code, name, user_register_date
     FROM user_info
     WHERE staff_code=? AND user_status='Y'
     ORDER BY user_code ASC;
     `;

// 관리 대상자 모니터링 발생 건수 조회
exports.select_emergency_count = `
     SELECT COUNT(user_code) AS emCount
     FROM emergency_list
     WHERE emergency_check_contents!='이상없음' AND user_code=?;
     `;

// 관리 대상자 상세정보 조회
exports.select_user_info =
    `
     SELECT * FROM user_info WHERE user_code = ?;
    `;

// 관리 대상자 이름 검색
exports.searchName =
    `
     SELECT user_code, name, user_register_date
     FROM user_info
     WHERE staff_code=? AND user_status=? AND name LIKE ?
     ORDER BY user_code ASC;
    `;

// 서비스 종료 관리 대상자 리스트 조회
exports.select_end_service =
    `
     SELECT user_code, name, user_delete_date
     FROM user_info
     WHERE staff_code=? AND user_status='N'
     ORDER BY user_code ASC;
    `;


// 서비스 종료
exports.update_user_status_N =
    `
     UPDATE user_info SET user_status='N', user_delete_date=now() WHERE user_code=?;
`;

// 서비스 재시작
exports.update_user_status_Y =
    `
     UPDATE user_info SET user_status='Y', user_register_date=now(), user_delete_date=null WHERE user_code=?;
`;