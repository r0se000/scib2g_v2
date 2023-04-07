// 암호화
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;


// 관리 대상자 목록 조회
exports.userlist = `
    SELECT user_code, name, user_register_date
    FROM user_info
    WHERE user_code like ? and user_status='Y'
    ORDER BY name;
`

// 관리 대상자 정보 조회
exports.userinfo = `
    SELECT name, birth_year, birth_month, birth_date, sex, address_1, address_2, address_3, phone_first, phone_middle, phone_last, protector_phone_first, protector_phone_middle, protector_phone_last
    FROM user_info
    WHERE user_code = ? and user_status='Y';
`;

// 누적 횟수
exports.selectCountEmergency = `
    SELECT count(*) AS cnt
    FROM emergency_list
    WHERE user_code = ?;
 `;

// 관리 대상자 리스트 조회
exports.select_addressCode = `
    SELECT a_user_address1, a_user_address2 
    FROM user_admin 
    WHERE a_user_code=?;`;

// 관리 대상자 이름 조회 
exports.select_user_name_app = `
    SELECT user_code, name 
    FROM user_info 
    WHERE user_status='Y' and user_code like ?;`;

// 관리 대상자 모니터링 기록 기간으로 조회
exports.selectDate = `
    SELECT ui.staff_code, ui.name, ui.address_1, ui.address_2, ui.address_3, em.emergency_id, em.user_code, em.emergency_time, em.emergency_web_check, em.emergency_check_contents, em.emergency_id
    FROM user_info ui JOIN emergency_list em
    ON ui.user_code=em.user_code where em.emergency_time>=? and em.emergency_time<=? and ui.user_code like ? and ui.user_status='Y' ORDER BY em.emergency_time DESC;
`;

// 관리 대상자 모니터링 기록 이름으로 조회
exports.selectName = `
                    SELECT ui.staff_code, ui.user_code, ui.name, ui.address_1, ui.address_2, ui.address_3,ui.birth_year, ui.birth_month, ui.birth_date, ui.sex
                    FROM user_info ui where ui.name=? and ui.user_code like ? and ui.user_status='Y';
`;

// 관리 대상자 모니터링 리스트 조회
exports.emList = `
                SELECT ua.a_user_name, el.emergency_time, el.emergency_web_check, el.emergency_contents_time 
                FROM emergency_list el JOIN user_admin ua
                ON el.a_user_code=ua.a_user_code
                WHERE el.emergency_id = ?;

`;

// 관리 대상자 A/S 관리 조회
exports.asList = `
                SELECT ui.user_code, ui.name, al.as_created_date, al.as_detail, al.as_num
                FROM user_info ui JOIN as_list al
                ON ui.user_code=al.user_code
                WHERE ui.user_status='Y' and ui.user_code like ?
                ORDER BY al.as_num;

`;

// 관리 대상자 A/S 상세정보 조회
exports.asDetail = `
                SELECT ui.birth_year, ui.birth_month, ui.birth_date, ui.name, al.as_created_date, al.as_detail, al.user_code, al.as_num
                FROM user_info ui JOIN as_list al
                ON ui.user_code=al.user_code
                WHERE al.as_num =?;
`;
exports.asDetail_regi = `
                SELECT birth_year, birth_month, birth_date, name, user_code, sex
                FROM user_info
                WHERE user_code =?;
`

// 관리 대상자 A/S 내용 수정
exports.asModify = `
                UPDATE as_list
                SET as_detail = ?
                WHERE as_num = ?;

`;

// 관리 대상자 특정 A/S 리스트 삭제
exports.asDelete = `
                DELETE FROM as_list 
                WHERE as_num = ?;
`;

// 관리 대상자 A/S 등록
exports.asRegist = `
                INSERT INTO as_list (as_created_date, as_detail, user_code) 
                VALUES (?, ?, ?);
`;