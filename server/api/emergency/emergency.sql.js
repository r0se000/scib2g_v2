exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

//응급 정보 로드
exports.emergencyCheck = `select * from emergency_list WHERE user_code LIKE ? and emergency_web_check is NULL;`

//emergency_list 에서 해당 관리자의 조치완료 사항이 입력되지 않은 응급 확인 완료 리스트를 가져온다.
exports.selectCheckList = `SELECT  ui.name, ui.birth_year, ui.birth_month, ui.birth_date, ui.phone_first, ui.phone_middle, ui.phone_last,
                            ui.protector_phone_first, ui.protector_phone_middle, ui.protector_phone_last,eal.*
                            FROM emergency_list AS eal, user_info AS ui WHERE eal.emergency_web_check is not Null and eal.emergency_check_contents is NULL AND ui.user_code=eal.user_code ORDER BY eal.emergency_time DESC;`;

//관리 대상자 목록 조회(마스터계정)
exports.selectUserList_all = `SELECT user_code FROM user_info WHERE user_status='Y';`

//관리 대상자 목록 조회
exports.selectUserList = `SELECT user_code FROM user_info WHERE user_status='Y' AND user_code LIKE ?;`

exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?;`;

//관리 대상의 가장 최근 응급 기록 조회
exports.emergencyClearCheck = `SELECT * FROM emergency_list WHERE user_code= ? AND emergency_contents_time IS NULL;`

//응급여부 판별
exports.emergencyCount = `SELECT COUNT(*) as emergencyCount FROM biometric_real_time WHERE user_code = ? AND hr=? AND bed_state=1 AND ss>=1000 AND created_time BETWEEN ? AND ?;`

//응급 시 응급 데이터 저장
exports.emergencyInsert = `INSERT INTO emergency_list(user_code, a_user_code, emergency_time) VALUES(?,?,?);`;

exports.userList = `SELECT * from user_info where user_code=?;`;

exports.selectEmList = `SELECT * FROM emergency_list WHERE emergency_id=?`;

exports.updateEmList = `Update emergency_list SET emergency_web_check=? WHERE emergency_id=?;`;

exports.deleteEmList = `DELETE FROM emergency_list WHERE emergency_id=?;`;

exports.selectStaffCode = `SELECT staff_code FROM user_info WHERE user_code=?;`;

//담당공무원 이름 조회
exports.selectStaffInfo = `SELECT a_user_name FROM user_admin WHERE a_user_code=?;`;
//담당자 전체 앱 토큰 조회
exports.staffAppToken = 'SELECT * FROM user_admin';
//보호자 앱 토큰 조회
exports.selectProtectorInfo = 'SELECT up.p_app_token, ui.name FROM user_protector up, user_info ui WHERE up.user_code=? AND up.user_code=ui.user_code'

//응급 조치사항 입력
exports.insertEmContents = `UPDATE emergency_list SET emergency_contents_time=?, emergency_check_contents=?, emergency_check_state='Y' WHERE emergency_id=?`;

//응급발생 당시 생체정보(3분)
exports.selectEmBioInfo = `SELECT * FROM biometric_backup_data WHERE user_code=? AND created_time BETWEEN ? AND ? 
                            UNION 
                            SELECT * FROM biometric_real_time WHERE user_code=? AND created_time BETWEEN ? AND ?;`