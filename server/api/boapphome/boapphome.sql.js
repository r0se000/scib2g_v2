exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

//emergency_list 에서 해당 관리자의 응급 목록을 가져온다.
exports.selectEmergency = `SELECT el.emergency_id, el.user_code, ui.name, el.emergency_time FROM emergency_list AS el, user_info AS ui WHERE el.user_code = ? AND ui.user_code=el.user_code;`;

//emergency_after_list 에서 해당 관리자의 조치완료 사항이 입력되지 않은 응급 확인 완료 리스트를 가져온다.
exports.selectCheckList = `SELECT  ui.name, ui.birth_year, ui.birth_month, ui.birth_date, eal.* FROM emergency_after_list AS eal, user_info AS ui WHERE eal.emergency_check_contents is NULL AND ui.user_code=eal.user_code AND eal.user_code = ? ORDER BY eal.emergency_time DESC;`;

exports.selectEmInfo = `SELECT * from emergency_after_list WHERE emergency_id=?;`;

exports.selectUserInfo = `SELECT * from user_info WHERE user_code=?;`;

exports.emergencyCheck = `select * from emergency_list`;

exports.userList = `SELECT * from user_info where user_code=?;`;

exports.selectEmBioInfo = `SELECT * FROM biometric_real_time WHERE user_code=? AND created_time BETWEEN ? AND ?;`;

exports.emergencyCheckList = `SELECT * from emergency_check_list where emergency_id = ? and p_user_code=?;`;

exports.insertEmTime = `INSERT INTO emergency_check_list (emergency_id, a_user_code, p_user_code, emergency_check_time) VALUES (?,NULL,?,?);`;