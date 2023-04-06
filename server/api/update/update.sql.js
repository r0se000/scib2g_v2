/** ================================================================
 *  사용자 등록 sql
 *  @author MiYeong Jang
 *  @since 2021.10.06
 *  @history 2021.10.06 MY 중복로그인 체크 조회 쿼리 생성
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check 
     FROM user_admin 
     WHERE a_user_code=?;`

// 관리 대상자 상세정보 조회
exports.select_user_info = 
     `
     SELECT staff_code, user_code, name, birth_year, birth_month, birth_date, sex, address_1, address_2, address_3, phone_first, phone_middle, phone_last,
     protector_phone_first, protector_phone_middle, protector_phone_last
     FROM user_info WHERE user_code = ?;
    `;

// 관리 대상자 정보 수정
exports.update_user_info = 
`
     UPDATE user_info SET name=?, birth_year=?, birth_month=?, birth_date=?, sex=?, address_3=?, phone_first=?, phone_middle=?, phone_last=?,
     protector_phone_first=?, protector_phone_middle=?, protector_phone_last=?
     WHERE user_code=?;
`;