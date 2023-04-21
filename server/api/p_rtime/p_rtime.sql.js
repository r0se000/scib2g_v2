// 관리 대상자 리스트 조회
exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?;`;

// 관리 대상자 이름 조회 
exports.select_user_name_app =
    `SELECT user_code, name FROM user_info WHERE user_status='Y' and user_code like ?;`;

// 관리 대상자 가장 최근 데이터 조회
exports.last_data = `
    SELECT created_time
    FROM biometric_real_time
    WHERE user_code =?
    ORDER BY created_time DESC limit 1;
`;
// 관리 대상자 정보 조회
exports.userinfo = `
    SELECT name, birth_year, birth_month, birth_date, gender, address_1, address_2, address_3, phone_first, phone_middle, phone_last, protector_phone_first, protector_phone_middle, protector_phone_last
    FROM user_info
    WHERE user_code = ?;
`;
// 관리 대상자 목록 조회
exports.userlist = `
    SELECT ui.user_code, ui.name
    FROM user_info ui
    join user_own_sensor uo
    ON ui.user_code = uo.user_code
    WHERE user_status='Y' and ui.user_code like ?
    ORDER BY name;
`


// 암호화
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;