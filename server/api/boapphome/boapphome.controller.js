/** ================================================================
 *  건강상태
 *  @author Mi Yeong Jang
 *  @since 2021.04.12
 *  @history 2021.04.12 최초작성
 *           2021.04.16 ajax데이터 로드 적용
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./boapphome.service');
const svInstance = new service();

class boappHomeController {

    async boapphomeload(req, res, next) {
        let userCode = req.params.userCode;
        let pUserCode = req.params.pUserCode;
        let selectEmergency = await svInstance.selectEmergency(userCode);
        let selectCheckList = await svInstance.selectCheckList(userCode);
        let selectEmDetail = await svInstance.selectEmDetail(userCode);

        return res.render('app/boapphome/boapphome', {
            "pUserCode": pUserCode,
            "userCode": userCode,
            "emergencyList": JSON.stringify(selectEmergency),
            "checkList": JSON.stringify(selectCheckList),
            "selectEmDetail": JSON.stringify(selectEmDetail)
        });
    }

    async checkDetail(req, res, next) {
        let { selectemCode, selectUserCode } = req.query;
        let selectDetail = await svInstance.selectCheckDetail(selectemCode, selectUserCode);

        return res.send(selectDetail)
    }

    async emergencyTimeInput(req, res, next) {
        let { emCode, p_user_code, emCheckTime } = req.body;
        let emTimeInput = await svInstance.emTimeInput(emCode, p_user_code, emCheckTime);
        return res.send(emTimeInput)
    }

}

module.exports = boappHomeController;