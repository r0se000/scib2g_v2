/** ================================================================
 *  메인화면 로드시 필요한 데이터 조회 쿼리
 *  @author MiYeong Jang
 *  @since 2021.10.06
 *  @history 2021.10.06 MY 중복로그인 체크 조회 쿼리 생성
 *  ================================================================
 */

exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;
exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?;`;

exports.loginCheck = `SELECT a_user_code, a_user_name, a_user_login_check, a_user_address1, a_user_address2
    FROM user_admin 
    WHERE a_user_code=?;`

exports.userList = `
    SELECT em.emergency_id, em.user_code, em.a_user_code, em.emergency_time, em.emergency_web_check, TIMESTAMPDIFF(second,em.emergency_time,em.emergency_contents_time) AS time_diff, em.emergency_check_contents, ui.name "user_name", ua.a_user_name
    FROM emergency_list AS em
    LEFT JOIN user_info AS ui
    ON em.user_code = ui.user_code
    LEFT JOIN user_admin AS ua
    ON ui.staff_code = ua.a_user_code 
    WHERE em.user_code like ? and em.emergency_web_check is not NULL
    ORDER BY em.emergency_time DESC
    ;
                    `;

// 날짜 범위 검색
exports.dateSearch = `
SELECT em.emergency_id "emergency_id", em.user_code, em.a_user_code, em.emergency_time, em.emergency_web_check, em.emergency_contents_time, TIMESTAMPDIFF(second,em.emergency_time,em.emergency_contents_time) AS time_diff, em.emergency_check_contents, ui.name "user_name", ua.a_user_name
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    LEFT JOIN user_admin AS ua
                    ON ui.staff_code = ua.a_user_code
                    WHERE em.emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59')  AND em.user_code LIKE ? AND em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    ORDER BY em.emergency_time DESC;
                    `;
// 응급 조회 통계(금일)
exports.emergencyToday = `
                    SELECT COUNT(em.user_code) AS "emDate", ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE em.emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? AND em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" GROUP BY ui.birth_year;
                    `;
// 응급 조회 통계(금주, 금월, 금년)
exports.emergencyTodayRange = `
                    SELECT COUNT(em.user_code) AS "emDate", ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE em.emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? AND em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음"  AND ui.user_status='Y' GROUP BY ui.birth_year;
                    `;
// 응급 조회 통계(전체)
exports.emergencyAllCnt = `
                    SELECT COUNT(em.user_code) AS "emDate", ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음"  AND ui.user_status='Y'
                    GROUP BY ui.birth_year;`;

// 응급 조회 통계(요일)
exports.emergencyDayOfWeek = `
                    SELECT COUNT(*) AS "emDate", CASE WEEKDAY(emergency_time)
                        WHEN '0' THEN '월'
                        WHEN '1' THEN '화'
                        WHEN '2' THEN '수'
                        WHEN '3' THEN '목'
                        WHEN '4' THEN '금'
                        WHEN '5' THEN '토'
                        WHEN '6' THEN '일' END AS dweek, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE em.emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY dweek, ui.birth_year
                    ORDER BY WEEKDAY(emergency_time) ASC;
`;


// 응급 발생 통계 그래프(기간별)
exports.graphData_HtoH = `
                    SELECT DATE_FORMAT(emergency_time, '%H') AS date, DATE_FORMAT(emergency_time, '%H') AS dh, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m-%d %H'), ui.birth_year
                    ORDER BY dh ASC;
`;
exports.graphData_DtoD = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m-%d') AS date, DATE_FORMAT(emergency_time, '%d') AS dd, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m-%d'), ui.birth_year
                    ORDER BY dd ASC;
                    `;
exports.graphData_MtoM = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m') AS date, DATE_FORMAT(emergency_time, '%m') AS dm, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m'), ui.birth_year
                    ORDER BY dm ASC;
`;
exports.graphData_YtoY = `
                    SELECT DATE_FORMAT(emergency_time, '%Y') AS date, DATE_FORMAT(emergency_time, '%Y') AS dy, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y'), ui.birth_year
                    ORDER BY dy ASC;
`;
// 응급 발생 통계 그래프(성별)
exports.graphDataGender_HtoH = `
                    SELECT DATE_FORMAT(emergency_time, '%H') AS date, DATE_FORMAT(emergency_time, '%H') AS dh, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m-%d %H'), ui.birth_year
                    ORDER BY dh ASC;
`;
exports.graphDataGender_DtoD = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m-%d') AS date, DATE_FORMAT(emergency_time, '%d') AS dd, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m-%d'), ui.birth_year
                    ORDER BY dd ASC;
                    `;
exports.graphDataGender_MtoM = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m') AS date, DATE_FORMAT(emergency_time, '%m') AS dm, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m'), ui.birth_year
                    ORDER BY dm ASC;
`;
exports.graphDataGender_YtoY = `
                    SELECT DATE_FORMAT(emergency_time, '%Y') AS date, DATE_FORMAT(emergency_time, '%Y') AS dy, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y'), ui.birth_year
                    ORDER BY dy ASC;
`;
// 응급 발생 통계 그래프(나이별)
exports.graphDataAge_HtoH = `
                    SELECT DATE_FORMAT(emergency_time, '%H') AS date, DATE_FORMAT(emergency_time, '%H') AS dh, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m-%d %H'), ui.birth_year
                    ORDER BY dh ASC;
`;
exports.graphDataAge_DtoD = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m-%d') AS date, DATE_FORMAT(emergency_time, '%d') AS dd, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m-%d'), ui.birth_year
                    ORDER BY dd ASC;
                    `;
exports.graphDataAge_MtoM = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m') AS date, DATE_FORMAT(emergency_time, '%m') AS dm, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y-%m'), ui.birth_year
                    ORDER BY dm ASC;
`;
exports.graphDataAge_YtoY = `
                    SELECT DATE_FORMAT(emergency_time, '%Y') AS date, DATE_FORMAT(emergency_time, '%Y') AS dy, count(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY DATE_FORMAT(emergency_time, '%Y'), ui.birth_year
                    ORDER BY dy ASC;
`;
// 응급 발생 통계 그래프(요일별)
exports.graphDataDayOfWeek_HtoH = `
                    SELECT DATE_FORMAT(emergency_time, '%H') AS date,
                        CASE WEEKDAY(emergency_time)
                            WHEN '0' THEN '월'
                            WHEN '1' THEN '화'
                            WHEN '2' THEN '수'
                            WHEN '3' THEN '목'
                            WHEN '4' THEN '금'
                            WHEN '5' THEN '토'
                            WHEN '6' THEN '일' END AS dweek, COUNT(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY dweek, ui.birth_year
                    ORDER BY WEEKDAY(emergency_time) ASC;
`;
exports.graphDataDayOfWeek_DtoD = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m-%d') AS date,
                    CASE WEEKDAY(emergency_time)
                        WHEN '0' THEN '월'
                        WHEN '1' THEN '화'
                        WHEN '2' THEN '수'
                        WHEN '3' THEN '목'
                        WHEN '4' THEN '금'
                        WHEN '5' THEN '토'
                        WHEN '6' THEN '일' END AS dweek, COUNT(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY dweek, ui.birth_year
                    ORDER BY WEEKDAY(emergency_time) ASC;
`;
exports.graphDataDayOfWeek_MtoM = `
                    SELECT DATE_FORMAT(emergency_time, '%Y-%m') AS date,
                    CASE WEEKDAY(emergency_time)
                        WHEN '0' THEN '월'
                        WHEN '1' THEN '화'
                        WHEN '2' THEN '수'
                        WHEN '3' THEN '목'
                        WHEN '4' THEN '금'
                        WHEN '5' THEN '토'
                        WHEN '6' THEN '일' END AS dweek, COUNT(*) AS cnt, ui.birth_year AS user_age
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY dweek, ui.birth_year
                    ORDER BY WEEKDAY(emergency_time) ASC;
`;
exports.graphDataDayOfWeek_YtoY = `
                    SELECT DATE_FORMAT(emergency_time, '%Y') AS date,
                        CASE WEEKDAY(emergency_time)
                            WHEN '0' THEN '월'
                            WHEN '1' THEN '화'
                            WHEN '2' THEN '수'
                            WHEN '3' THEN '목'
                            WHEN '4' THEN '금'
                            WHEN '5' THEN '토'
                            WHEN '6' THEN '일' END AS dweek, COUNT(*) AS cnt, ui.birth_year AS user_age 
                    FROM emergency_list AS em
                    LEFT JOIN user_info AS ui
                    ON em.user_code = ui.user_code
                    WHERE emergency_time BETWEEN ? AND CONCAT(?, ' 23:59:59') AND ui.sex LIKE ? AND ui.user_code LIKE ? and em.emergency_web_check is not NULL AND emergency_check_contents != "이상없음" AND ui.user_status='Y'
                    GROUP BY dweek, ui.birth_year
                    ORDER BY WEEKDAY(emergency_time) ASC;
`;

// 날짜 범위 리스트
exports.dateRange_HtoH = `WITH RECURSIVE numbers AS (
                        SELECT 1 AS Date UNION ALL SELECT Date + 1 FROM numbers WHERE Date < 24 )
                    SELECT Date AS dr FROM numbers;
                    `;
exports.dateRange_DtoD = `
                    SELECT dateRange AS dr
                        FROM 
                            (SELECT ADDDATE('1970-01-01',t4*10000 + t3*1000 + t2*100 + t1*10 + t0) AS "dateRange" FROM
                            (SELECT 0 t0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t0,
                            (SELECT 0 t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t1,
                            (SELECT 0 t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t2,
                            (SELECT 0 t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t3,
                            (SELECT 0 t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t4) AS v
                    WHERE dateRange BETWEEN DATE_FORMAT( ?, '%Y-%m-%d' ) AND CONCAT( DATE_FORMAT( ?, '%Y-%m-%d' ) , ' 23:59:59') 
                    GROUP BY DATE_FORMAT(dateRange, '%Y-%m-%d')
                    ORDER BY dateRange;
                    `;
exports.dateRange_MtoM = `
                    SELECT DATE_FORMAT(dateRange, '%Y-%m') as dr
                        FROM
                            (SELECT ADDDATE('1970-01-01',t4*10000 + t3*1000 + t2*100 + t1*10 + t0) AS "dateRange" FROM
                            (SELECT 0 t0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t0,
                            (SELECT 0 t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t1,
                            (SELECT 0 t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t2,
                            (SELECT 0 t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t3,
                            (SELECT 0 t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t4) AS v
                    WHERE dateRange BETWEEN DATE_FORMAT( ?, '%Y-%m-%d' ) AND CONCAT( DATE_FORMAT( ?, '%Y-%m-%d' ) , ' 23:59:59') 
                    GROUP BY DATE_FORMAT(dateRange, '%Y-%m')
                    ORDER BY dateRange;
`;
exports.dateRange_YtoY = `
                    SELECT DATE_FORMAT(dateRange, '%Y') as dr
                        FROM
                            (SELECT ADDDATE('1970-01-01',t4*10000 + t3*1000 + t2*100 + t1*10 + t0) AS "dateRange" FROM
                            (SELECT 0 t0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t0,
                            (SELECT 0 t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t1,
                            (SELECT 0 t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t2,
                            (SELECT 0 t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t3,
                            (SELECT 0 t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) AS t4) AS v
                    WHERE dateRange BETWEEN DATE_FORMAT( ?, '%Y-%m-%d' ) AND CONCAT( DATE_FORMAT( ?, '%Y-%m-%d' ) , ' 23:59:59') 
                    GROUP BY DATE_FORMAT(dateRange, '%Y')
                    ORDER BY dateRange;
`;