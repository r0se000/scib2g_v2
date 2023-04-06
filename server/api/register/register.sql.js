/** ================================================================
 *  관리대상자 등록 페이지 sql
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *  ================================================================
 */

// 암복호화
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 관리자 로그인 체크
exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2 
     FROM user_admin 
     WHERE a_user_code=?;`

// 로그인한 관리자의 담당 지역 조회
exports.selectAddress = `SELECT a1.address1_name, a2.address2_name FROM address1 a1, address2 a2 WHERE a1.address1_code=a2.address1_code AND a2.address1_code=? AND a2.address2_code=?`

// 관리 대상자 조회
exports.userRegister = `INSERT INTO user_info VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,null,'Y', null, null);`;

// 최근 등록된 관리 대상자 user_code 조회
exports.userCodeSelect = `SELECT user_code FROM user_info ORDER BY user_code DESC LIMIT 1;`;