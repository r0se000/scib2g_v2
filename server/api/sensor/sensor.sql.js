/** ================================================================
 *  건강리포트 sql
 * @author Minjung Kim
 * @since 2021.05.12
 * @history 2021.05.12 MJ getSensor 생성
 *          2021.05.21 MJ postSensor 생성
 *  ================================================================
 */

// sensor 테이블 조회
exports.getSensor = ` SELECT 
                       sensor_node_id
                       , own_ssid
                      FROM 
                       user_own_sensor
                      WHERE 
                       user_code = ?
                     `;


// sensor 정보 저장
exports.postSensor = `REPLACE INTO 
                       user_own_sensor 
                      SET 
                       user_code = ?
                       , sensor_node_id = ?
                       , own_ssid = ? 
                       , own_ip = ?; 
                     `;