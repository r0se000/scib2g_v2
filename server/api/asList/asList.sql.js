/** ================================================================
 *  A/S 조회 페이지 sql
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 최초 작성
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

exports.loginCheck =
    `   SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2
    FROM user_admin 
    WHERE a_user_code=?;
`;

// A/S 목록 조회
exports.select_asList =
    `
    SELECT al.as_num, ui.name, ui.user_code, al.as_detail, al.as_created_date
    FROM user_info AS ui
    LEFT JOIN as_list AS al
    ON al.user_code = ui.user_code
    WHERE ui.user_code LIKE ? AND ui.user_status='Y' AND as_num is not null
	ORDER BY al.as_num DESC;
`;

// A/S 조회
exports.select_as_info =
    `
    SELECT al.as_num, ui.name, ui.user_code, al.as_detail, al.as_created_date
    FROM user_info AS ui
    LEFT JOIN as_list AS al
    ON al.user_code = ui.user_code
    WHERE al.as_num=?
    ORDER BY al.as_num DESC;
`;

// 관리 대상자 조회
exports.select_user =
    `
    SELECT user_code, name FROM user_info WHERE user_code LIKE ?;
`;

// 관리 대상자 이름 검색
exports.searchName =
    `
    SELECT al.as_num, ui.name, ui.user_code, al.as_detail, al.as_created_date
    FROM user_info AS ui
    LEFT JOIN as_list AS al
    ON al.user_code = ui.user_code
    WHERE ui.user_code LIKE ? AND ui.user_status=? AND ui.name LIKE ?
    ORDER BY al.as_num DESC;
`;


// 서비스 종료 관리 대상자 리스트 조회
exports.select_end_service =
    `
    SELECT al.as_num, ui.name, ui.user_code, al.as_detail, al.as_created_date
    FROM user_info AS ui
    LEFT JOIN as_list AS al
    ON al.user_code = ui.user_code
    WHERE ui.user_code LIKE ? AND ui.user_status='N'
    ORDER BY al.as_num DESC;
`;

// A/S 등록
exports.insert_as =
    `
    INSERT INTO as_list(as_created_date, as_detail, user_code) VALUE(?,?,?);
`;

// A/S 관리 대상자 검색
exports.searchUser =
    `
    SELECT name, user_code, birth_year, birth_month, birth_date, gender
    FROM user_info
    WHERE user_code LIKE ? AND name LIKE ? AND user_status='Y';

`;

// A/S 수정
exports.update_as =
    `
    UPDATE as_list SET as_detail=? WHERE as_num=?;
`;

// A/S 삭제
exports.delete_as =
    `
    DELETE FROM as_list WHERE as_num=?;
`;