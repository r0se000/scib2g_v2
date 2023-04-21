/** ================================================================
 *  관리자 조회 페이지 sql
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 최초 작성
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2
    FROM user_admin 
    WHERE a_user_code=?;`;

// 금일 모니터링 건수
exports.Today_emergencyCount = `SELECT COUNT(*) as cnt FROM emergency_list WHERE emergency_time LIKE ? and user_code like ? and emergency_check_contents != "이상없음";`;

// 관리자 조회
exports.adminList = `
    SELECT * FROM user_admin;
`;

// 마스터 계정 변경 (지역 코드 99로 변경)
exports.update_address = `
    UPDATE user_admin SET a_user_address1='99', a_user_address2= '99' WHERE a_user_code = ?;
`;

// 이름 검색
exports.searchName = `
    SELECT * FROM user_admin WHERE a_user_name LIKE ?;
`;

// 지역 이름 조회(시/도)
exports.select_address1 = `
    SELECT address1_name FROM address1 WHERE address1_code=?;
`;

// 지역 이름 조회(시/군/구)
exports.select_address2 = `
    SELECT address2_name FROM address2 WHERE address1_code=? AND address2_code=?;
`;