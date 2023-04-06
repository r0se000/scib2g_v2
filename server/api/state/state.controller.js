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
const service = require('./state.service');
const svInstance = new service();

class StateController {

    async selectStateData(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기 

        // let row = await svInstance.selectSimpleData(userCode);
        // let chart = await svInstance.selectChartData(userCode);
        let userList = await svInstance.getUserName(userCode);
        return res.render('web/state/state', {
            "statePage": req.__('statePage'),
            // "stateData": row,
            "stateChart": '',
            //     "userCode": userCode, // 유저 코드 정보 추가 2021.04.21 JG,
            "userList": JSON.stringify(userList),
            //     // "family": family,
            //     // "familyUser": familyUser,
            //     "lang": req.query.lang, // 페이지 언어 정보 추가 2021.04.22 JG,
            //     "accessToken": req.query.accessToken // jwt accessToken 정보 추가 2021.04.22 JG
        });
    };

    async selectStateData_P(req, res, next) {
        let { userCode, pUserCode } = req.params
        let row = await svInstance.selectSimpleData(userCode);
        let chart = await svInstance.selectChartData(userCode);
        let userName = await svInstance.getOneUserName(userCode);
        let pUserName = await svInstance.getPUserName(pUserCode);
        return res.render('web/state/p_state', {
            "statePage": req.__('statePage'),
            "stateData": row,
            "stateChart": chart,
            "userName": userName,
            "userCode": userCode, // 유저 코드 정보 추가 2021.04.21 JG,
            "pUserCode": pUserCode,
            "pUserName": pUserName
            // "userList": JSON.stringify(userList),
            //     // "family": family,
            //     // "familyUser": familyUser,
            //     "lang": req.query.lang, // 페이지 언어 정보 추가 2021.04.22 JG,
            //     "accessToken": req.query.accessToken // jwt accessToken 정보 추가 2021.04.22 JG
        });
    }

    async selectStateData_D(req, res, next) {
        let { userCode } = req.params
        let row = await svInstance.selectSimpleData(userCode);
        let chart = await svInstance.selectChartData(userCode);
        let userName = await svInstance.getOneUserName(userCode);
        // let pUserName = await svInstance.getPUserName(pUserCode);
        return res.render('web/state/d_state', {
            "statePage": req.__('statePage'),
            "stateData": JSON.stringify(row),
            "stateChart": chart,
            "userName": userName,
            "userCode": userCode, // 유저 코드 정보 추가 2021.04.21 JG,
            // "userList": JSON.stringify(userList),
            //     // "family": family,
            //     // "familyUser": familyUser,
            //     "lang": req.query.lang, // 페이지 언어 정보 추가 2021.04.22 JG,
            //     "accessToken": req.query.accessToken // jwt accessToken 정보 추가 2021.04.22 JG
        });
    }


    async selectStateDataAjax(req, res, next) {
        let { userCode, selectDate } = req.query // url에 data 포함하여 전송한 경우 값 가져오기
        let row = await svInstance.selectSimpleData(userCode, selectDate);
        let chart = await svInstance.selectChartData(userCode, selectDate);
        let ajaxData = {
            "statePage": req.__('statePage'),
            "stateData": row,
            "stateChart": chart,
            "userCode": userCode,
            "lang": req.query.lang, // 페이지 언어 정보 추가 2021.05.07 my,
            "accessToken": req.query.accessToken // jwt accessToken 정보 추가 2021.05.07 my
        };

        return res.send(ajaxData);
    }

    async selectStateDataAjaxSub(req, res, next) {
        let { userCode, selectDate } = req.query // url에 data 포함하여 전송한 경우 값 가져오기
        let row = await svInstance.selectSimpleDataSub(userCode, selectDate);
        let chart = await svInstance.selectChartData(userCode, selectDate);
        let ajaxData = {
            "statePage": req.__('statePage'),
            "stateData": row,
            "stateChart": chart,
            "userCode": userCode,
            "lang": req.query.lang, // 페이지 언어 정보 추가 2021.05.07 my,
            "accessToken": req.query.accessToken // jwt accessToken 정보 추가 2021.05.07 my
        };

        return res.send(ajaxData);
    }

}

module.exports = StateController;