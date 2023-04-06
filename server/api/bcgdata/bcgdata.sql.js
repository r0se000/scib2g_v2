/** ================================================================
 *  건강리포트 sql
 * @author Minjung Kim
 * @since 2021.05.28
 * @history 2021.05.28 MJ postBcgData 생성

 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 생체 정보 저장
module.exports.postBcgData = function(bcgData) {
    let bindVariables = '';
    bcgData.forEach((item, index) => {
        if (bcgData.length === (index + 1)) {
            bindVariables += `(?,?,?,?,?,?,?,?,?,?,?)`;
        } else {
            bindVariables += `(?,?,?,?,?,?,?,?,?,?,?), `;
        }
    });
    const queryString = `INSERT INTO biometric_real_time(user_code, hr, rr, sv, hrv, ss, bed_state, calibration1, calibration2, calibration3, created_time) VALUES  ${bindVariables}`;
    return queryString;
}

// 센서정보조회
exports.getUserSensorgData = `SELECT user_code FROM user_own_sensor WHERE sensor_node_id = ? `;


// 센서 조회
exports.searchSensor = `SELECT user_code, sensor_node_id from user_own_sensor WHERE sensor_node_id = ?;`;

// 센서 수정
exports.updateSensor = 'UPDATE user_own_sensor SET user_code= ? WHERE sensor_node_id = ?;';

// 센서 등록
// exports.insertSensor = `INSERT INTO user_own_sensor(user_code,sensor_node_id) VALUES (?, ?);`;
exports.insertSensor = `REPLACE INTO user_own_sensor SET user_code = ?, sensor_node_id = ?;`;