/** ================================================================
 *  건강 현황 sql
 *  @author JaeGyeong Jo
 *  @since 2021.05.12
 *  @history 2021.05.14 JG 질병 정보 관련 쿼리 추가
 *           2021.05.17 JG 생체 정보 관련 쿼리 추가
 *           2021.05.18 JG 스트레스 정보 관련 쿼리 추가
 *           2021.05.19 JG 암호화 키 및 사용자 이름 조회 쿼리 추가
 *           2021.05.21 JG 수면 정보 관련 쿼리 추가
 *  ================================================================
 */

// 암호화 키 조회
exports.select_key_string = `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`;

// 사용자 이름 조회 
exports.select_user_name =
    `SELECT name FROM user_info WHERE user_code=?`;

exports.select_addressCode = `SELECT a_user_address1, a_user_address2 FROM user_admin WHERE a_user_code=?`
    // 사용자 이름 조회 
exports.select_user_name_app =
    `SELECT user_code, name FROM user_info WHERE user_status='Y' and user_code LIKE ?;`;

// 질병 정보 - 당뇨, 고혈압, 심방세동 예측률 조회(일간)
exports.select_disease_predict_daily =
    `SELECT CAST((diabetes_predict_rate) AS signed INTEGER) as diabetes_predict_rate, CAST((hypertension_predict_rate) AS signed INTEGER) as hypertension_predict_rate, 
    CAST((hypertension_low_predict_rate) AS signed INTEGER) as hypertension_low_predict_rate,
    tachycardia_ratio, bradycardia_ratio,
            date_format(create_time, '%Y-%m-%d') create_date, diabetes_level, hypertension_level
     FROM disease_day
     WHERE user_code = ? 
     AND (create_time BETWEEN ? AND ?)
     ORDER BY create_date ASC;`;

// 질병 정보 - 당뇨, 고혈압, 심방세동 예측률 조회(주간)
exports.select_disease_predict_weekly =
    `SELECT diabetes_predict_rate, hypertension_predict_rate, hypertension_low_predict_rate, CAST((tachycardia_ratio) AS signed INTEGER) as tachycardia_ratio, CAST((bradycardia_ratio) AS signed INTEGER) as bradycardia_ratio,
            date_format(create_time, '%Y-%m-%d') create_date
     FROM disease_day
     WHERE user_code = ? 
     AND (create_time BETWEEN ? AND ?)
     ORDER BY create_date ASC;`;

// 질병 정보 - 당뇨, 고혈압, 심방세동 예측률 조회(월간)
exports.select_disease_predict_monthly =
    `SELECT diabetes_predict_rate, hypertension_predict_rate, hypertension_low_predict_rate, CAST((tachycardia_ratio) AS signed INTEGER) as tachycardia_ratio, CAST((bradycardia_ratio) AS signed INTEGER) as bradycardia_ratio,
            date_format(create_time, '%Y-%m-%d') create_date
     FROM disease_day
     WHERE user_code = ? 
     AND (create_time BETWEEN ? AND ?)
     ORDER BY create_date ASC;`;

// 질병 정보 - 당뇨, 고혈압, 심방세동 예측률 조회(연간)
exports.select_disease_predict_yearly =
    `SELECT diabetes_predict_rate, hypertension_predict_rate, hypertension_low_predict_rate, CAST((tachycardia_ratio) AS signed INTEGER) as tachycardia_ratio, CAST((bradycardia_ratio) AS signed INTEGER) as bradycardia_ratio, diabetes_level, hypertension_level,
            date_format(create_time, '%Y-%m-%d') create_date
     FROM disease_year
     WHERE user_code = ? 
     AND (create_time BETWEEN ? AND ?)
     ORDER BY create_date ASC;`;

// 생체 정보 - 심박수, 호흡수, 심박출량, 심박변이도 조회(일간)
exports.select_biometric_avg_daily =
    `SELECT bsh.hr_avg, bsh.rr_avg, bsh.sv_avg, bsh.hrv_avg, 
        CAST(bsd.hr_avg AS signed INTEGER) hr_avg_tot, CAST(bsd.rr_avg AS signed INTEGER) rr_avg_tot, CAST(bsd.sv_avg AS signed INTEGER) sv_avg_tot, CAST(bsd.hrv_avg AS signed INTEGER) hrv_avg_tot,
            date_format(bsh.created_time, '%Y-%m-%d, %H:00') create_date
     FROM biometric_stats_hour bsh 
     JOIN biometric_stats_day bsd 
       ON (bsh.user_code = bsd.user_code) 
       AND (bsh.create_date = bsd.created_date)
     WHERE bsh.user_code = ?
       AND (bsh.create_date BETWEEN ? AND ? )
     ORDER BY bsh.created_time ASC;`;

// 생체 정보 - 심박수, 호흡수, 심박출량, 심박변이도 조회(주간)
exports.select_biometric_avg_weekly =
    `SELECT bsw.hr_avg, bsw.rr_avg, bsw.sv_avg, bsw.hrv_avg,
            hr_avg_tot, rr_avg_tot, sv_avg_tot, hrv_avg_tot,
            date_format(bsw.created_date, '%Y-%m-%d') create_date
      FROM biometric_stats_day bsw
      JOIN ( 
          SELECT ANY_VALUE(bswj.user_code) as userCode, CAST(AVG(bswj.hr_avg) AS DECIMAL) AS hr_avg_tot, CAST(AVG(bswj.rr_avg) AS DECIMAL) AS rr_avg_tot, 
                  CAST(AVG(bswj.sv_avg) AS DECIMAL) AS sv_avg_tot, CAST(AVG(bswj.hrv_avg) AS DECIMAL) AS hrv_avg_tot
          FROM biometric_stats_day bswj WHERE bswj.user_code = ? AND bswj.created_date BETWEEN ? AND ? GROUP BY bswj.user_code) AS bsw_avg
      ON bsw.user_code = bsw_avg.userCode
      WHERE bsw.user_code= ? AND (bsw.created_date BETWEEN ? AND ?)
      ORDER BY bsw.created_date ASC`

// `SELECT bsd.hr_avg, 
//         bsd.rr_avg, 
//         bsd.sv_avg,
//         bsd.hrv_avg,
//         bsw.hr_avg hr_avg_tot,
//         bsw.rr_avg rr_avg_tot,
//         bsw.sv_avg sv_avg_tot,
//         bsw.hrv_avg hrv_avg_tot,
//         date_format(bsd.created_date, '%Y-%m-%d') create_date
//  FROM biometric_stats_day bsd
//  JOIN biometric_stats_week bsw
//    ON (bsd.user_code = bsw.user_code)
//    /*AND (date_format(bsd.created_date, '%Y-%m-%d') = date_format(bsw.created_date, '%Y-%m-%d'))*/
// WHERE bsd.user_code = ?
//   AND (bsd.created_date BETWEEN ? AND ?)
//   AND (bsw.created_date BETWEEN ? AND ?)
// ORDER BY bsd.created_date ASC;`;

// 생체 정보 - 심박수, 호흡수, 심박출량, 심박변이도 조회(월간)
exports.select_biometric_avg_monthly =
    `SELECT bsm.hr_avg, bsm.rr_avg, bsm.sv_avg, bsm.hrv_avg,
          hr_avg_tot, rr_avg_tot, sv_avg_tot, hrv_avg_tot,
          date_format(bsm.created_date, '%Y-%m-%d') create_date
      FROM biometric_stats_day bsm
      JOIN ( 
        SELECT ANY_VALUE(bsmj.user_code) as userCode, CAST(AVG(hr_avg) AS DECIMAL) AS hr_avg_tot, CAST(AVG(rr_avg) AS DECIMAL) AS rr_avg_tot, 
               CAST(AVG(sv_avg) AS DECIMAL) AS sv_avg_tot, CAST(AVG(hrv_avg) AS DECIMAL) AS hrv_avg_tot
        FROM biometric_stats_day bsmj WHERE user_code = ? AND created_date BETWEEN ? AND ? GROUP BY bsmj.user_code) AS bsm_avg
      ON bsm.user_code = bsm_avg.userCode
      WHERE bsm.user_code= ? AND (bsm.created_date BETWEEN ? AND ?)
      ORDER BY bsm.created_date ASC;`
    // `SELECT bsd.hr_avg, 
    //         bsd.rr_avg, 
    //         bsd.sv_avg, 
    //         bsd.hrv_avg,
    //         bsm.hr_avg hr_avg_tot,
    //         bsm.rr_avg rr_avg_tot,
    //         bsm.sv_avg sv_avg_tot,
    //         bsm.hrv_avg hrv_avg_tot,
    //         date_format(bsd.created_date, '%Y-%m-%d') create_date
    //  FROM biometric_stats_day bsd
    //  JOIN biometric_stats_month bsm
    //    ON (bsd.user_code = bsm.user_code)
    //   AND (date_format(bsd.created_date, '%Y-%m') = date_format(bsm.created_date, '%Y-%m'))
    // WHERE bsd.user_code = ?
    //   AND (bsd.created_date  BETWEEN ? AND ?)
    // ORDER BY bsd.created_date ASC;`;

// 생체 정보 - 당뇨, 고혈압, 심방세동 예측률 조회(연간)
exports.select_biometric_avg_yearly =
    `SELECT bsy.hr_avg, bsy.rr_avg, bsy.sv_avg, bsy.hrv_avg,
            CAST(hr_avg AS signed INTEGER) AS hr_avg_tot, CAST(rr_avg AS signed INTEGER) AS rr_avg_tot,
            CAST(sv_avg AS signed INTEGER) AS sv_avg_tot, CAST(hrv_avg AS signed INTEGER) AS hrv_avg_tot,
            date_format(bsy.created_date, '%Y-%m') create_date
      FROM biometric_stats_year bsy
      WHERE bsy.user_code = ? AND (bsy.created_date  BETWEEN ? AND ?)
    ORDER BY bsy.created_date ASC;`;


// 스트레스 정보 - 스트레스 수치 조회(일간)
exports.select_stress_avg_daily =
    `SELECT DATE_FORMAT(sih.stress_created_time, '%Y-%m-%d, %H:00') AS created_date,		 
            sih.stress_value, CAST(sid.stress_value_avg AS signed INTEGER) stress_value_avg,
            (SELECT CAST((MIN(stress_value)) AS signed INTEGER) FROM stress_info_hour WHERE stress_created_date BETWEEN ? AND ?) stress_min,
            (SELECT CAST((MAX(stress_value)) AS signed INTEGER) FROM stress_info_hour WHERE stress_created_date BETWEEN ? AND ?) stress_max/*,
            IF((sid.stress_value_avg > 100), 0, 100 - sid.stress_value_avg) stress_scale*/  
     FROM stress_info_hour sih
     JOIN stress_info_day sid 
       ON (sih.user_code = sid.user_code) AND (sih.stress_created_date = sid.stress_created_date)
    WHERE sih.user_code = ? AND (sih.stress_created_date BETWEEN ? AND ?)
    ORDER BY sih.stress_created_time ASC;`;

// 스트레스 정보 - 스트레스 수치 조회(주간)
exports.select_stress_avg_weekly =
    `SELECT DATE_FORMAT(siw.stress_created_date, '%Y-%m-%d') AS created_date, 
          siw.stress_value_avg stress_value,
          siw_join.stress_value stress_value_avg, 
          stress_min, stress_max
      FROM stress_info_day siw
      JOIN(
          SELECT ANY_VALUE(user_code) AS userCode, CAST((AVG(stress_value_avg)) AS signed INTEGER) as stress_value,
          CAST((MIN(stress_value_avg)) AS signed INTEGER) stress_min,
          CAST((MAX(stress_value_avg)) AS signed INTEGER) stress_max
          FROM stress_info_day siwj WHERE siwj.stress_created_date BETWEEN ? AND ?  GROUP BY siwj.user_code) AS siw_join
      ON siw.user_code=siw_join.userCode
      WHERE siw.user_code = ? AND (siw.stress_created_date BETWEEN ? AND ?)
      ORDER BY siw.stress_created_date ASC;`
    // `SELECT DATE_FORMAT(sid.stress_created_date, '%Y-%m-%d') AS created_date, 
    //     sid.stress_value_avg stress_value,
    //     siw.stress_value_avg,
    //         (SELECT MIN(stress_value) 
    //          FROM stress_info_day 
    //          WHERE stress_created_date BETWEEN ? AND ?) stress_min,
    //         (SELECT MAX(stress_value) 
    //          FROM stress_info_day 
    //          WHERE stress_created_date BETWEEN ? AND ?) stress_max/*,
    //     IF((siw.stress_value_avg > 100), 0, 100 - siw.stress_value_avg) stress_scale*/  
    //  FROM stress_info_day sid
    //  JOIN stress_info_week siw 
    //    ON (sid.user_code = siw.user_code) 
    //   AND (date_format(sid.stress_created_date, '%Y-%m') = date_format(siw.stress_created_date, '%Y-%m'))
    // WHERE sid.user_code = ? 
    //   AND (sid.stress_created_date BETWEEN ? AND ?)
    //   AND (siw.stress_created_date BETWEEN ? AND ?)
    // ORDER BY sid.stress_created_date ASC;`;

// 스트레스 정보 - 스트레스 수치 조회(월간)
exports.select_stress_avg_monthly =
    `SELECT DATE_FORMAT(sim.stress_created_date, '%Y-%m-%d') AS created_date, 
          sim.stress_value_avg stress_value,
          sim_join.stress_value stress_value_avg, 
          stress_min, stress_max
      FROM stress_info_day sim
      JOIN(
          SELECT ANY_VALUE(user_code) AS userCode, CAST((SELECT AVG(stress_value_avg)) AS signed INTEGER) as stress_value,
          CAST((MIN(stress_value_avg)) AS signed INTEGER) stress_min,
          CAST((MAX(stress_value_avg)) AS signed INTEGER) stress_max
          FROM stress_info_day simj WHERE simj.stress_created_date BETWEEN ? AND ?  GROUP BY simj.user_code) AS sim_join
      ON sim.user_code=sim_join.userCode
      WHERE sim.user_code = ? AND (sim.stress_created_date BETWEEN ? AND ?)
      ORDER BY sim.stress_created_date ASC;`
    // `SELECT DATE_FORMAT(sid.stress_created_date, '%Y-%m-%d') AS created_date, 
    //         sid.stress_value_avg stress_value,
    //         sim.stress_value_avg,
    //         (SELECT MIN(stress_value) 
    //          FROM stress_info_day 
    //          WHERE stress_created_date BETWEEN ? AND ?) stress_min,
    //         (SELECT MAX(stress_value) 
    //          FROM stress_info_day 
    //          WHERE stress_created_date BETWEEN ? AND ?) stress_max/*,
    //         IF((sim.stress_value_avg > 100), 0, 100 - sim.stress_value_avg) stress_scale*/  
    // FROM stress_info_day sid
    // JOIN stress_info_month sim 
    //   ON (sid.user_code = sim.user_code) 
    //  AND (date_format(sid.stress_created_date, '%Y-%m') = date_format(sim.stress_created_date, '%Y-%m'))
    // WHERE sid.user_code = ? 
    //  AND (sid.stress_created_date BETWEEN ? AND ?)
    // ORDER BY sid.stress_created_date ASC;`;

// 스트레스 정보 - 스트레스 수치 조회(연간)
exports.select_stress_avg_yearly =
    `SELECT DATE_FORMAT(siy.stress_created_date, '%Y-%m-%d') AS created_date,
    siy.stress_value_avg stress_value,
    CAST(stress_value_avg AS signed INTEGER) AS stress_value_avg,
        (SELECT CAST((MIN(stress_value)) AS signed INTEGER) 
        FROM stress_info_month 
        WHERE stress_created_date BETWEEN ? AND ?) stress_min,
       (SELECT CAST((MAX(stress_value)) AS signed INTEGER) 
        FROM stress_info_month 
        WHERE stress_created_date BETWEEN ? AND ?) stress_max/*,
    IF((siy.stress_value_avg > 100), 0, 100 - siy.stress_value_avg) stress_scale*/  
    FROM stress_info_year siy
     WHERE siy.user_code = ? 
     AND (siy.stress_created_date BETWEEN ? AND ?)
    ORDER BY siy.stress_created_date ASC;`


// 수면품질 정보(일간)
exports.select_sleep_apnea_daily =
    `SELECT si_created_date,
        ROUND((TIME_TO_SEC(sleep_time) / 60), 0) total_sleep_time_minute, 
        apnea_ratio total_apnea_ratio, apnea_count total_apnea_count, 
        apnea_time total_apnea_time_minute
    FROM sleep_info_day sid
    WHERE sid.user_code = ? AND (si_created_date BETWEEN ? AND ?)
    ORDER BY si_created_date ASC;`;

//수면 무호흡 수치 조회(일간)
// exports.select_apnea_daily =
//     `SELECT start_time created_date, (TIMESTAMPDIFF(SECOND, start_time, end_time)) apnea_ratio 
//       FROM (
//             SELECT DATE_FORMAT(sa.apnea_start_time, '%Y-%m-%d, %H:%i:%s') start_time,
//                     DATE_FORMAT(sa.apnea_end_time, '%Y-%m-%d, %H:%i:%s') end_time
//             FROM sleep_apnea sa
//             WHERE sa.user_code = ? AND (sa.apnea_created_date BETWEEN ? AND ?)
//              ORDER BY sa.apnea_start_time ASC) daily;
//        `;
//수면 무호흡 수치 조회(일간)
exports.select_apnea_daily = `
    SELECT apnea_start_time AS created_date, apnea_end_time AS apnea_ratio
    FROM sleep_apnea
    where user_code = ? and apnea_created_date BETWEEN ? AND ?
    ORDER BY apnea_start_time ASC;
    `;
// 수면품질 정보(주간)
exports.select_sleep_apnea_weekly =
    `SELECT
        CAST(avg(ROUND((TIME_TO_SEC(siw.sleep_time) / 60), 0))AS signed INTEGER) AS total_sleep_time_minute, 
        CAST(avg(siw.apnea_count)AS signed INTEGER) AS total_apnea_count,	 
        CAST(avg(siw.apnea_ratio)AS DECIMAL) AS total_apnea_ratio, 
        TIME_FORMAT(SEC_TO_TIME(avg(TIME_TO_SEC(siw.apnea_time))), "%H:%i:%s" ) AS total_apnea_time_minute    	
    FROM sleep_info_day siw
    WHERE siw.user_code = ? AND (siw.si_created_date BETWEEN ? AND ?);`;

// `SELECT DATE_FORMAT(siw.si_created_date, '%Y-%m-%d') created_date,
//       CAST(ROUND((TIME_TO_SEC(siw.sleep_time) / 60), 0) AS signed INTEGER) total_sleep_time_minute, 
//       CAST(siw.apnea_count AS signed INTEGER) AS total_apnea_count,	 
//       CAST(siw.apnea_ratio AS DECIMAL) AS total_apnea_ratio, 
//       CAST(ROUND((TIME_TO_SEC(siw.apnea_time) / 60), 0) AS DECIMAL) AS total_apnea_time_minute, 			  
//       siw.apnea_ratio apnea_ratio	
//   FROM sleep_info_week siw
//   WHERE siw.user_code = ?
//   AND (siw.si_created_date BETWEEN ? AND ?)
//   ORDER BY siw.si_created_date ASC;`;

// 수면 무호흡 수치 조회(주간)
exports.select_apnea_weekly =
    `SELECT DATE_FORMAT(siw.si_created_date, '%Y-%m-%d') created_date, siw.apnea_count apnea_ratio
          FROM sleep_info_day siw
          WHERE siw.user_code = ? AND (siw.si_created_date BETWEEN ? AND ?)
          ORDER BY si_created_date;`;



// 수면품질 정보 (월간)
exports.select_sleep_apnea_monthly =
    `SELECT
        CAST(avg(ROUND((TIME_TO_SEC(sleep_time) / 60), 0))AS signed INTEGER) AS total_sleep_time_minute, 
        CAST(avg(apnea_count)AS signed INTEGER) AS total_apnea_count,	 
        CAST(avg(apnea_ratio)AS DECIMAL) AS total_apnea_ratio, 
        TIME_FORMAT(SEC_TO_TIME(avg(TIME_TO_SEC(sim.apnea_time))), "%H:%i:%s" ) AS total_apnea_time_minute    	
    FROM sleep_info_day sim
    WHERE sim.user_code = ? AND (sim.si_created_date BETWEEN ? AND ?);`;

// `SELECT DATE_FORMAT(sid.si_created_date, '%Y-%m-%d') created_date,
//         ROUND((TIME_TO_SEC(sim.sleep_time) / 60), 0) total_sleep_time_minute, 
//         sim.apnea_count total_apnea_count,	 
//         sim.apnea_ratio total_apnea_ratio, 
//         ROUND((TIME_TO_SEC(sim.apnea_time) / 60), 0) total_apnea_time_minute, 			  
//         sid.apnea_ratio apnea_ratio	
//  FROM sleep_info_day sid
//  JOIN sleep_info_month sim 
//    ON (sid.user_code = sim.user_code) 
//   AND (date_format(sid.si_created_date, '%Y-%m') = date_format(sim.si_created_date, '%Y-%m'))
// WHERE sid.user_code = ?
//   AND (sid.si_created_date BETWEEN ? AND ?)
// ORDER BY sid.si_created_date ASC;`;


// 수면 무호흡 수치 조회(월간)
exports.select_apnea_monthly =
    `SELECT DATE_FORMAT(sim.si_created_date, '%Y-%m-%d') created_date, sim.apnea_count apnea_ratio
      FROM sleep_info_day sim
      WHERE sim.user_code = ? AND (sim.si_created_date BETWEEN ? AND ?)
      ORDER BY si_created_date;`;


// 수면품질 정보 - 수면 무호흡 수치 조회(연간)
exports.select_sleep_apnea_yearly =
    `SELECT 
        CAST(avg(ROUND((TIME_TO_SEC(sleep_time) / 60), 0))AS signed INTEGER) AS total_sleep_time_minute, 
        CAST(avg(apnea_count)AS signed INTEGER) AS total_apnea_count,	 
        CAST(avg(apnea_ratio)AS DECIMAL) AS total_apnea_ratio, 
        TIME_FORMAT(SEC_TO_TIME(avg(TIME_TO_SEC(siy.apnea_time))), "%H:%i:%s" ) AS total_apnea_time_minute   			  	
    FROM sleep_info_year siy 
    WHERE siy.user_code = ?
    AND (siy.si_created_date BETWEEN ? AND ?)
    ORDER BY siy.si_created_date ASC;`
    // 수면 무호흡 수치 조회(연간)
exports.select_apnea_yearly =
    `SELECT DATE_FORMAT(siy.si_created_date, '%Y-%m-%d') created_date, siy.apnea_count apnea_ratio
        FROM sleep_info_year siy
        WHERE siy.user_code = ? AND (siy.si_created_date BETWEEN ? AND ?)
        ORDER BY si_created_date;`

// `SELECT DATE_FORMAT(sim.si_created_date, '%Y-%m-%d') created_date,
//         ROUND((TIME_TO_SEC(siy.sleep_time) / 60), 0) total_sleep_time_minute, 
//         siy.apnea_count total_apnea_count,	 
//         siy.apnea_ratio total_apnea_ratio, 
//         ROUND((TIME_TO_SEC(siy.apnea_time) / 60), 0) total_apnea_time_minute, 			  
//         sim.apnea_ratio apnea_ratio	
//  FROM sleep_info_month sim
//  JOIN sleep_info_year siy 
//    ON (sim.user_code = siy.user_code) 
//   AND (date_format(sim.si_created_date, '%Y') = date_format(siy.si_created_date, '%Y'))
// WHERE sim.user_code = ?
//   AND (sim.si_created_date BETWEEN ? AND ?)
// ORDER BY sim.si_created_date ASC;`;