var cron = require('node-cron');

const { PythonShell } = require('python-shell');
const mysqlDB = require('../../config/db/database_mysql');
const admin = require('firebase-admin');
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const logger = require('./../loggerSettings');

/**
 * 배치 알림 class
 * protectorAlert: 보호자앱에 알림 전송 
 * staffAlert: 담당자앱에 알림 전송
 */
// 어제날짜 가져오기
let today = new Date();
let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1);
let yesterday = (today.getDate() - 1) >= 10 ? (today.getDate() - 1) : '0' + (today.getDate() - 1);
let yday = today.getFullYear() + "-" + month + "-" + yesterday;
// 어제날짜 가져오기

class batchScheduler {
    batch() {
        // 배포 전 pm_id수정 필수
        // if (process.env.pm_id == 22) {
        // 7시 배치
        cron.schedule('00 55 14 * * *)', function() {
            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                // 배포 전 경로수정
                scriptPath: 'C:/Users/SCI/Desktop/b2gv2/server/config/batch/predict',
                // scriptPath: '/home/server/B2G_server/config/batch/predict',
                args: []
            };
            PythonShell.run('B2G_Batch.py', options, function(err, results) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("python", results)
                }
            });
            console.log('B2G Batch Start');
        });
        // }
    }
}



// 미사용 코드
// class alert {
//     async protectorAlert() {
//         let cryptoKey = await mysqlDB('selectOne', `SELECT key_string FROM encryption_key_info WHERE activate_yn = 'Y';`, []);
//         cryptoKey = cryptoKey.row.key_string;
//         let protectorToken = [],
//             text = ''

//         let protectorList = await mysqlDB('select', `SELECT up.p_app_token, ui.name, ui.user_code FROM user_protector up, user_info ui WHERE up.user_code=ui.user_code`, []);
//         for (let i = 0; i < protectorList.rowLength; i++) {
//             protectorList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, protectorList.rows[i].name);
//             let dResult = await mysqlDB('selectOne', `SELECT * FROM disease_day WHERE user_code=? AND create_time=?;`, [protectorList.rows[i].user_code, yday]);
//             if (dResult.row.hypertension_level == 2 | dResult.row.hypertension_level == 2 | (dResult.row.tachycardia_ratio > 0.1 & dResult.row.bradycardia_ratio > 0.1)) {
//                 if (dResult.row.diabetes_level == 2) {
//                     text += '당뇨 '
//                 }
//                 if (dResult.row.hypertension_level == 2) {
//                     text += '고혈압 '
//                 }
//                 if (dResult.row.tachycardia_ratio > 0.1 & dResult.row.bradycardia_ratio > 0.1) { //둘다 0.1초과인 경우 주의 출력
//                     text += '부정맥 '
//                 }
//                 text += '주의 발생';
//                 console.log(protectorList.rows[i].p_app_token)
//                 let p_message = {
//                     "notification": {
//                         "title": '건강상태 업데이트',
//                         "body": protectorList.rows[i].name + '님 ' + text
//                     },
//                     "data": {
//                         "title": '건강상태 업데이트',
//                         "body": protectorList.rows[i].name + '님 ' + text
//                     },
//                     "token": protectorList.rows[i].p_app_token,
//                     "android": {
//                         "priority": "high"
//                     }
//                 };

//                 admin.app('protector').messaging()
//                     .send(p_message)
//                     .then(function(response) {
//                         console.log('Successfully sent protector message: : ', response)
//                         logger.info('Successfully sent protector message: : ' + response)
//                     })
//                     .catch(function(err) {
//                         console.log('Error Sending protector message!!! : ', err)
//                         logger.error('Error Sending protector message!!! : ' + err)
//                     });
//             }
//         }
//     }

//     async staffAlert() {
//         let staffToken = [],
//             dcaution_count = 0,
//             hcaution_count = 0,
//             acaution_count = 0;
//         let staffList = await mysqlDB('select', `select a_user_code, a_user_app_token from user_admin`, []);
//         staffList.rows.forEach(function(item, index) {
//             if (item.a_user_app_token != null)
//                 staffToken.push(item.a_user_app_token)
//         });

//         let dResult = await mysqlDB('select', `SELECT * FROM disease_day WHERE create_time=?;`, [yday]);

//         dResult.rows.forEach(function(item, index) {
//             if (item.diabetes_level == 2) {
//                 dcaution_count += 1
//             }
//             if (item.hypertension_level == 2) {
//                 hcaution_count += 1
//             }

//             if (item.tachycardia_ratio > 0.1 & item.bradycardia_ratio > 0.1) { //둘다 0.1초과인 경우 주의 출력
//                 acaution_count += 1
//             }
//         })

//         if (dcaution_count != 0 | hcaution_count != 0 | acaution_count != 0) {
//             for (let i = 0; i < staffToken.length; i++) {
//                 let staff_token = staffToken[i]
//                 console.log(staff_token)
//                 let staffmessage = {
//                     "notification": {
//                         "title": '전날밤 데이터 주의 발생',
//                         "body": '당뇨 ' + dcaution_count + '건, 고혈압 ' + hcaution_count + '건, 부정맥 ' + acaution_count + '건의 주의발생 \n관리 페이지에서 확인해주세요 '
//                     },
//                     "data": {
//                         "title": '전날밤 데이터 주의 발생',
//                         "body": '당뇨 ' + dcaution_count + '건, 고혈압 ' + hcaution_count + '건, 부정맥 ' + acaution_count + '건의 주의발생 \n관리 페이지에서 확인해주세요 '
//                     },
//                     "token": staff_token,
//                     "android": {
//                         "priority": "high"
//                     }
//                 };

//                 admin.app('staff').messaging()
//                     .send(staffmessage)
//                     .then(function(response) {
//                         console.log('Successfully sent Staff message: : ', response)
//                         logger.info('Successfully sent Staff message: : ' + response)
//                     })
//                     .catch(function(err) {
//                         console.log('Error Sending Staff message!!! : ', err)
//                         logger.error('Error Sending Staff message!!! : ' + err)
//                     });
//             }
//         }
//     }


//     async staffAlert_test() {
//         let staffToken = [],
//             dcaution_count = 0,
//             hcaution_count = 0,
//             acaution_count = 0;
//         let staffList = await mysqlDB('select', `select a_user_code, a_user_app_token from user_admin where a_user_code=3 or a_user_code=5`, []);
//         staffList.rows.forEach(function(item, index) {
//             if (item.a_user_app_token != null)
//                 staffToken.push(item.a_user_app_token)
//         });

//         for (let i = 0; i < staffToken.length; i++) {
//             let staff_token = staffToken[i]
//             console.log(staff_token)
//             let staffmessage = {
//                 "notification": {
//                     "title": '알림테스트',
//                     "body": '당뇨 ' + dcaution_count + '건, 고혈압 ' + hcaution_count + '건, 부정맥 ' + acaution_count + '건의 주의발생 \n관리 페이지에서 확인해주세요 '
//                 },
//                 "data": {
//                     "title": '알림테스트',
//                     "body": '당뇨 ' + dcaution_count + '건, 고혈압 ' + hcaution_count + '건, 부정맥 ' + acaution_count + '건의 주의발생 \n관리 페이지에서 확인해주세요 '
//                 },
//                 "token": staff_token,
//                 "android": {
//                     "priority": "high"
//                 }
//             };

//             admin.app('staff').messaging()
//                 .send(staffmessage)
//                 .then(function(response) {
//                     console.log('Successfully sent Staff message: : ', response)
//                     logger.info('Successfully sent Staff message: : ' + response)
//                 })
//                 .catch(function(err) {
//                     console.log('Error Sending Staff message!!! : ', err)
//                     logger.error('Error Sending Staff message!!! : ' + err)
//                 });
//         }
//     }
// }




module.exports = batchScheduler