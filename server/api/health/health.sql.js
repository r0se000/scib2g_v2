/** ================================================================
 *  메인화면 로드시 필요한 데이터 조회 쿼리
 *  @author MiYeong Jang
 *  @since 2021.10.06
 *  @history 2021.10.06 MY 중복로그인 체크 조회 쿼리 생성
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2
    FROM user_admin 
    WHERE a_user_code=?;`;

exports.userList = `
    SELECT ui.user_code, ui.name, pd.hr, pd.health_index, pd.created_time
    FROM user_info as ui
    LEFT JOIN predict_data as pd 
    ON ui.user_code=pd.user_code
    WHERE pd.created_time=? AND pd.user_code LIKE ? ORDER BY ui.user_code ASC;
    `;


//금일 응급 건수
exports.Today_emergencyCount = `SELECT COUNT(*) as cnt FROM emergency_list WHERE emergency_time LIKE ? and user_code like ? and emergency_check_contents != "이상없음";`;