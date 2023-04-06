/** ================================================================
 *  응급 판별
 *  @author MiYeong Jang
 *  @since 2021.10.12
 *  @history 2021.10.12 최초작성
 *           
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./emergency.service');
const svInstance = new service();
const admin = require('firebase-admin');

class emergencyController {
    async emAlertInit(req, res, next) {
        let { userCode } = req.query;
        let selectEmergency = await svInstance.selectEm(userCode);
        return res.send(selectEmergency)
    }

    async emInsertInit(req, res, next) {
        let { userCode } = req.query;
        let selectCheckList = await svInstance.selectCheckList(userCode);

        return res.send(selectCheckList)
    }

    async selectUser(req, res, next) {
        let { userCode } = req.query;
        let selectUser = await svInstance.selectUserList(userCode);
        return res.send(selectUser);
    };

    async emergency(req, res, next) {
        let { userCode, userList } = req.query;
        let emergencyResult = await svInstance.emergencyCheck(userList, userCode);
        return res.send(emergencyResult);
    }

    async emergencyAlert(req, res, next) {
        let { userCode, userList, staffCode } = req.query;
        let emergencyAlertResult = await svInstance.emergencyAlert(userList);
        await svInstance.selectAppToken(emergencyAlertResult.emergency_user);
        return res.send(emergencyAlertResult);
    }

    async emergencyCheck(req, res, next) {
        let { emCode } = req.query;
        let emergencyMoveResult = await svInstance.emergencyCheckWeb(emCode);
        let result = { "result": emergencyMoveResult, "emCode": emCode };
        return res.send(result);
    }
    async emergencyAppCheck(req, res, next) {
        let { emCode } = req.query;
        let emergencyMoveResult = await svInstance.emergencyAppMove(emCode);
        let result = { "result": emergencyMoveResult, "emCode": emCode };
        return res.send(result);
    }

    async emergencyContentsInput(req, res, next) {
        let { emCode, emCheckContents } = req.body;
        let emContentInput = await svInstance.emContentsInput(emCode, emCheckContents);
        return res.send(emContentInput)
    }

    //앱 알림 테스트    
    async emergencyPushAlertTest(req, res) {
        let { target_token } = req.query;

        let message = {
            "notification": {
                "title": '테스트 발생',
                "body": '데이터가 잘 가나요?'
            },
            "data": {
                "title": '테스트 발생',
                "body": '데이터가 잘 가나요?'
            },
            "token": target_token,
            "android": {
                "priority": "high"
            }
        }
        admin.app('staff').messaging()
            .send(message)
            .then(function(response) {
                console.log('Successfully sent message: : ', response)

                return res.status(200).json({ success: true })
            })
            .catch(function(err) {
                console.log('Error Sending message!!! : ', err)
                return res.status(400).json({ success: false })
            });

    };

}

module.exports = emergencyController