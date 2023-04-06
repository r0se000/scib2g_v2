exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?;`;
//emergency_list 에서 해당 관리자의 응급 목록을 가져온다.
exports.selectEmergency = `SELECT el.emergency_id, el.user_code, ui.name, el.emergency_time FROM emergency_list AS el, user_info AS ui WHERE el.emergency_web_check is NULL AND ui.user_code=el.user_code and el.user_code LIKE ?;`;

//emergency_after_list 에서 해당 관리자의 조치완료 사항이 입력되지 않은 응급 확인 완료 리스트를 가져온다.
exports.selectCheckList = `SELECT  ui.name, ui.birth_year, ui.birth_month, ui.birth_date, el.* FROM emergency_list AS el, user_info AS ui WHERE el.user_code LIKE ? and el.emergency_check_contents is NULL AND el.emergency_web_check is not NULL AND ui.user_code=el.user_code ORDER BY el.emergency_time DESC;`;

exports.selectEmInfo = `SELECT * from emergency_list WHERE emergency_id=?;`;

exports.selectUserInfo = `SELECT * from user_info WHERE user_code=?;`;

exports.emergencyCheck = `select * from emergency_list`;

exports.userList = `SELECT * from user_info where user_code=?;`;

exports.selectEmBioInfo = `SELECT * FROM biometric_backup_data WHERE user_code=? AND created_time BETWEEN ? AND ? 
                            UNION 
                            SELECT * FROM biometric_real_time WHERE user_code=? AND created_time BETWEEN ? AND ?;`;

exports.emergencyCheckList = `SELECT * from emergency_check_list where emergency_id = ? and a_user_code=?;`;

exports.insertEmTime = `INSERT INTO emergency_check_list (emergency_id, a_user_code, p_user_code, emergency_check_time) VALUES (?,?, NULL,?);`;