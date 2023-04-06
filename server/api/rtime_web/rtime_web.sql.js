/** ================================================================
 *  실시간 모니터링 sql
 *  @author SY
 *  @since 2023.03.22
 *  @history 2023.03.22 최초 작성
 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 로그인 한 관리자 정보 select
exports.loginCheck =
    `SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2
    FROM user_admin 
    WHERE a_user_code=?;
    `;

// 관리자 담당 주소 select
exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?;`;

// 관리 대상자 리스트 조회
exports.select_user_name =
    `
    SELECT ui.user_code, ui.name, ui.user_note
    FROM user_info ui
    join user_own_sensor uo
    ON ui.user_code = uo.user_code
    WHERE ui.user_status='Y' and ui.user_code LIKE ? ORDER BY ui.name ASC;
`;


// 관리 대상자 상세정보 조회
exports.select_user_info = `
        SELECT user_code, name, birth_year, birth_month, birth_date, sex, address_1, address_2, address_3, phone_first, phone_middle, phone_last,
        protector_phone_first, protector_phone_middle, protector_phone_last, user_note, note_created_date
        FROM user_info WHERE user_code = ?;
    `;

// 관리 대상자 생체정보 측정 마지막 날짜 로드
exports.select_user_recent_data = `
    SELECT created_time
    FROM biometric_real_time
    WHERE user_code=?
    UNION SELECT created_time FROM biometric_backup_data WHERE user_code=?
    ORDER BY created_time DESC LIMIT 1;
`;

// 관리 대상자 특이사항 Update
exports.update_user_note = `
    UPDATE user_info SET user_note =?, note_created_date = DATE_FORMAT(NOW(), '%Y-%m-%d') WHERE user_code =?;
`;

// 관리 대상자 A/S Select
exports.select_user_as = `
    SELECT as_detail, as_created_date FROM as_list WHERE user_code= ? ORDER BY as_created_date DESC LIMIT 1;
`;

// 관리 대상자 A/S Insert
exports.insert_user_as = `
    INSERT INTO as_list(as_detail, as_created_date, user_code) VALUES(?,?,?);
`;

//금일 응급 건수
exports.Today_emergencyCount = `SELECT COUNT(*) as cnt FROM emergency_list WHERE emergency_time LIKE ? and user_code like ? and emergency_check_contents != "이상없음";`;