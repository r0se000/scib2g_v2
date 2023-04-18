/** ================================================================
 *  로그인, 회원가입, 정보 수정 등 사용자 관리 sql
 *  @author JG, Jo
 *  @since 2021.04.12
 *  @history 2021.04.13 JG 암호화 키 조회 쿼리 추가
 *           2021.04.19 JG 사용자 가입 여부 조회, jwt 관련 쿼리 추가
 *           2021.04.26 JG access token 저장, 조회 쿼리(기존 쿼리 수정)
 *           2021.05.03 JG 사용자 상세 정보 등록/수정 쿼리에서 전화번호 삭제
 *           2021.05.11 JG 로그인 시 패밀리id, 사용자 이름 가져오도록 수정
 *           2021.05.25 JG 사용자 상세 정보 등록/수정 쿼리에 개인정보 제공 동의여부 추가,
 *                         회원탈퇴, 비밀번호 변경, 중복 검사, 로그아웃 쿼리 추가
 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 관리자 계정 추가(21.10.05)
exports.insert_adminuser_account = `INSERT INTO user_admin(a_user_name, a_user_account_id, a_user_account_pw, a_user_provide_yn, a_user_phone_first,a_user_phone_middle, a_user_phone_last, a_user_registered_date , a_user_address1, a_user_address2, a_user_email_id, a_user_email_domain)
                                VALUES(?,?, SHA2(?, 256), ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?);`;

// 사용자 계정 추가
exports.insert_user_account = `INSERT INTO user_info(account_id, account_password, email_id, email_domain, registered_date)
                                VALUES(?, SHA2(?, 256), ?, ?, CURDATE());`;
// 사용자 상세 정보 등록/수정
exports.replace_user_info = `REPLACE INTO user_info(user_code, name, birth_year, birth_month, birth_date, gender, provide_private_info_yn, phone_first, phone_middle, phone_last, address_1, address_2, address_3) 
                              VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

// 사용자 가입 여부 조회(로그인)
exports.select_user_exist =
    `SELECT ua.user_code, name, IFNULL(family_id, 'no_family') family_id, login_check
     FROM user_info ua LEFT JOIN user_info ui ON ua.user_code = ui.user_code
     WHERE account_id = ? 
     AND account_password = SHA2(?, 256)
     AND ua.activate_yn = 'Y';`;

//관리자 로그인(21.10.05)
exports.select_adminuser_exist =
    `SELECT a_user_name, a_user_code, a_user_account_id, a_user_account_pw 
    FROM user_admin WHERE a_user_account_id = ? AND a_user_account_pw=SHA2(?,256)`

// 중복 로그인 방지
exports.update_user_login =
    `UPDATE user_info
        SET login_check = 'Y'
      WHERE user_code = ?;`;

// 중복 로그인 방지(관리자)
exports.update_admin_user_login =
    `UPDATE user_admin
    SET a_user_login_check = 'Y'
    WHERE a_user_code = ?;`;

// 로그아웃: 강제 로그아웃 될 때 accesstoken 강제 삭제되어 다른 기기에서도 로그아웃되어 access_token=NULL 주석
exports.update_user_logout =
    `UPDATE user_admin
        SET a_user_login_check = 'N'
      WHERE a_user_code = ?;`

// 관리자 로그아웃
exports.update_adminuser_logout =
    `UPDATE user_admin SET a_user_login_check ='N' WHERE a_user_code=?;`;

// 중복 ID 검사
exports.select_user_id_duplicate = `SELECT a_user_account_id FROM user_admin WHERE a_user_account_id = ?;`;

// 중복 email 검사
exports.select_user_email_duplicate = `SELECT a_user_email_id, a_user_email_domain FROM user_admin WHERE email_id = ?
                                        AND a_user_email_id = ? AND a_user_domain = ?;`;

// 메일 중복 검사 및 사용자 계정 조회
// exports.select_user_account_email =
//     `SELECT user_code, account_id
//        FROM user_account
//       WHERE email_id = ?
//         AND email_domain = ?;`;

// 비밀번호 변경
exports.update_new_password =
    `UPDATE user_admin
        SET a_user_account_pw = SHA2(?, 256)
      WHERE a_user_code = ?;`;

// 회원탈퇴 등 회원 상태 변경
exports.update_user_activate =
    `UPDATE user_info
        SET activate_yn = ?,
            deactivate_date = ?
      WHERE user_code = ?;`;

// 회원 정보 조회
exports.select_user_detail_info =
    `SELECT ua.user_code,
            account_id, 
            ui.name,
            email_id, 
            email_domain, 
            birth_year, 
            birth_month, 
            birth_date, 
            gender
     FROM user_info ua
     JOIN user_info ui
       ON ua.user_code = ui.user_code
    WHERE ua.user_code = ?;`;

// 회원 정보 업데이트(계정 정보)
exports.update_user_account =
    `UPDATE user_info
        SET email_id = ?, 
            email_domain = ? 
     WHERE  user_code = ?;`

// 회원 정보 업데이트(상세 정보)
exports.update_user_info =
    `UPDATE user_info
        SET name = ?,
            birth_year = ?, 
            birth_month = ?, 
            birth_date = ?, 
            gender = ?
    WHERE   user_code = ?;`;

// ID 찾기 2023.04.03
exports.select_user_id =
    `SELECT a_user_account_id
       FROM user_admin
      WHERE a_user_name = ?
        AND a_user_email_id = ?
        AND a_user_email_domain = ?;
    `;

// user code 찾기
exports.select_user_code =
    `SELECT a_user_code
       FROM user_admin
      WHERE a_user_account_id = ?
        AND a_user_name = ?
        AND a_user_email_id = ?
        AND a_user_email_domain = ? ;
    `;

// jwt access token, refresh token 저장 
exports.update_user_jwt_token = `UPDATE user_info SET access_token = ?, refresh_token = ? WHERE user_code = ?;`;
// jwt access token, refresh token 저장 
exports.update_adminuser_jwt_token = `UPDATE user_admin SET a_user_access_token = ?, a_user_refresh_token = ? WHERE a_user_code = ?;`;
// jwt access token, refresh token 저장 
exports.update_adminuserapp_jwt_token = `UPDATE user_admin SET a_user_access_token_app= ?, a_user_refresh_token_app = ? WHERE a_user_code = ?;`;

// jwt refresh token 조회
exports.select_user_jwt_token = `SELECT refresh_token FROM user_info WHERE user_code = ? and access_token = ?;`;
// jwt refresh token 조회
exports.select_adminuser_jwt_token = `SELECT a_user_refresh_token FROM user_admin WHERE a_user_code = ? and a_user_access_token = ?;`;

// 앱 jwt refresh token 조회
exports.select_adminuser_app_jwt_token = `SELECT a_user_refresh_token_app FROM user_admin WHERE a_user_code = ? and a_user_access_token_app = ?;`;

// 기존 로그인 여부 조회
exports.select_user_login_check = `SELECT login_check FROM user_info WHERE user_code = ?;`;

// 새로 발급 받은 jwt access token 저장
exports.update_user_access_token = `UPDATE user_info SET access_token =? WHERE user_code = ?;`;

//앱 토큰 저장
exports.updateAlertToken = `UPDATE user_admin SET a_user_app_token=? WHERE a_user_code=?;`;

// 이메일 유무 확인 2023.04.03
exports.search_user = `SELECT a_user_name, a_user_email_id, a_user_email_domain FROM user_admin WHERE a_user_name=? and a_user_email_id=? and a_user_email_domain=?;`;