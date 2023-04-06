/** ================================================================
 *  로그인, 회원가입, 정보 수정 등 보호자 계정 관리 sql
 *  @author MY Jang
 *  @since 2021.11.02
 *  @history 2021.11.02 최초작성
 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 보호자 계정 추가                                         signUpData.name, signUpData.id, signUpData.pwd, signUpData.usercode, signUpData.phone1, signUpData.phone2, signUpData.phone3, signUpData.provideYN
exports.insert_p_user_account = `INSERT INTO 
                                user_protector(p_user_name, p_account_id, p_account_password, registered_date, p_phone_first, p_phone_middle, p_phone_last, p_provide_yn)
                                VALUES(?,?, SHA2(?, 256), CURDATE(), ?, ?, ?, ?);`;
// 사용자 가입 여부 조회(로그인)
exports.select_user_exist =
    `SELECT up.p_user_code, up.p_user_name, up.p_login_check, up.user_code, ui.name
     FROM user_protector up LEFT JOIN user_info ui ON up.user_code = ui.user_code
     WHERE up.p_account_id = ? 
     AND up.p_account_password = SHA2(?, 256)
     AND up.activate_yn = 'Y';`;

// 중복 로그인 방지
exports.update_user_login =
    `UPDATE user_protector
        SET p_login_check = 'Y'
      WHERE p_user_code = ?;`;

// 로그아웃
exports.update_user_logout =
    `UPDATE user_protector
        SET p_login_check = 'N'
      WHERE p_user_code = ?;`

// 중복 ID 검사
exports.select_user_id_duplicate = `SELECT p_account_id FROM user_protector WHERE p_account_id = ?;`;

// 비밀번호 변경
exports.update_new_password =
    `UPDATE user_protector
        SET p_account_password = SHA2(?, 256)
      WHERE p_user_code = ?;`;

// 회원탈퇴 등 회원 상태 변경
exports.update_user_activate =
    `UPDATE user_protector
        SET activate_yn = ?,
            deactivate_date = ?
      WHERE p_user_code = ?;`;

// 회원 정보 조회
exports.select_user_detail_info =
    `SELECT p_user_code,
            p_account_id, 
            p_user_name,
            user_code,
            p_phone_first,
            p_phone_middle,
            p_phone_last
     FROM user_protector
    WHERE p_user_code = ?;`;

// 회원 정보 업데이트
exports.update_user_account =
    `UPDATE user_protector
        SET p_user_name = ?, 
        p_phone_first = ?,
        p_phone_middle=?,
        p_phone_last=?
     WHERE p_user_code = ?;`;

// ID 찾기
exports.select_user_id =
    `SELECT p_account_id
       FROM user_protector
      WHERE p_user_name = ?
        AND p_phone_first = ?
        AND p_phone_middle = ? 
        AND p_phone_last = ?;`;

// user code 찾기
exports.select_user_code =
    `SELECT p_user_code
       FROM user_protector ua
      WHERE p_account_id = ?
        AND p_user_name = ?
        AND p_phone_first = ?
        AND p_phone_middle = ? 
        AND p_phone_last = ?;`;

// 보호자, 독거노인 user_code, name 찾기
exports.select_userMatching = `
                    SELECT user_code, name
                    FROM user_info
                    WHERE name = ? AND birth_year = ? AND birth_month = ? AND birth_date = ?;
`;

// 보호자, 독거노인 ID, 이름 매칭(insert)
exports.userMatching = `
                    UPDATE user_protector
                    SET user_code = ?
                    WHERE p_user_code = ?;
`;

// jwt access token, refresh token 저장 
exports.update_user_jwt_token = `UPDATE user_protector SET access_token = ?, refresh_token = ? WHERE p_user_code = ?;`;

// jwt refresh token 조회
exports.select_user_jwt_token = `SELECT refresh_token FROM user_protector WHERE p_user_code = ? and access_token = ?;`;

// 기존 로그인 여부 조회
exports.select_user_login_check = `SELECT p_login_check FROM user_protector WHERE p_user_code = ?;`;

// 새로 발급 받은 jwt access token 저장
exports.update_user_access_token = `UPDATE user_protector SET access_token =? WHERE p_user_code = ?;`;

//앱 토큰 저장
exports.updateAlertToken = `UPDATE user_protector SET p_app_token=? WHERE p_user_code=?;`;

// 대상 독거노인 코드 조회
exports.select_user_code_duplicate = `SELECT user_code FROM user_info WHERE user_code = ?;`;