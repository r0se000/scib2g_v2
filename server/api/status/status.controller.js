/** ================================================================
 *  건강 현황 controller
 *  @author JG, Jo
 *  @since 2021.05.07
 *  @history 2021.05.12 JG goDiseasePage initData 추가  
 *           2021.05.14 JG getDiseaseData 추가
 *           2021.05.17 JG 생체정보 관련 기능 추가
 *           2021.05.18 JG 스트레스 정보 관련 기능 추가
 *           2021.05.19 JG 사용자 이름 정보 추가
 *           2021.05.20 JG 수면품질 정보 관련 기능 추가 
 *  ================================================================
 */

// logger
const logger = require('../../config/loggerSettings');

// 호출할 service 정의
const service = require('./status.service');
const svInstance = new service();

class StatusController {

    // status index(current.html) 호출
    async goIndexPage(req, res, next) {
        return res.render('web/status/current', {
            "statusPage": req.__('statusPage'),
            "userCode": req.params.userCode, // 유저 코드 정보
            "lang": req.query.lang, // 페이지 언어 정보 
            "accessToken": req.query.accessToken // jwt accessToken 정보 
        });
    };

    //보호자앱
    async goIndexPage_P(req, res, next) {
        return res.render('web/status/current_p', {
            "statusPage": req.__('statusPage'),
            "pUserCode": req.params.pUserCode,
            "userCode": req.params.userCode, // 유저 코드 정보
            "lang": req.query.lang, // 페이지 언어 정보 
            "accessToken": req.query.accessToken // jwt accessToken 정보 
        });
    };



    //보호자앱
    async goDiseasePage_P(req, res, next) {
        let today = new Date();
        today.setDate(today.getDate() - 1)
        let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1);
        let yesterday = (today.getDate()) >= 10 ? today.getDate() : '0' + today.getDate();
        let yesterdayStr = today.getFullYear() + "-" + month + "-" + yesterday;

        let userCode = req.query.userCode,
            pUserCode = req.query.pUserCode;
        let initData = await svInstance.getDiseasePredictData(userCode, 'daily', yesterdayStr, yesterdayStr);
        let userName = await svInstance.getUserNameP(userCode);
        return res.render('web/status/disease_p', {
            "tabTitle": req.__('statusPage').tabTitle,
            "diseasePage": req.__('statusPage').diseasePage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userName": userName, // 유저 이름 정보
            "pUserCode": pUserCode,
            "lang": req.query.lang, // 페이지 언어 정보 
            "initData": initData
        });
    }

    // status/disease.html 호출
    async goDiseasePage(req, res, next) {
        let date = new Date(),
            yesterdayStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1);
        let userCode = req.query.userCode;
        // let initData = await svInstance.getDiseasePredictData(userCode, 'daily', yesterdayStr, yesterdayStr);

        let userList = await svInstance.getUserName(userCode);

        return res.render('web/status/disease', {
            "tabTitle": req.__('statusPage').tabTitle,
            "diseasePage": req.__('statusPage').diseasePage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userList": JSON.stringify(userList), // 관리대상자 이름 정보
            "accessToken": req.query.accessToken, // jwt accessToken 정보
        });
    }

    //보호자 앱
    async goBiometricPage_P(req, res, next) {
        let date = new Date(),
            yesterdayStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1);
        let userCode = req.query.userCode,
            pUserCode = req.query.pUserCode;

        let initData = await svInstance.getBiometricAvgData(userCode, 'daily', yesterdayStr, yesterdayStr);

        let userName = await svInstance.getUserNameP(userCode);
        return res.render('web/status/biometric_p', {
            "tabTitle": req.__('statusPage').tabTitle,
            "biometricPage": req.__('statusPage').biometricPage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userName": userName, // 유저 이름 정보
            "pUserCode": pUserCode,
            "lang": req.query.lang, // 페이지 언어 정보 
            "initAvgTot": initData.avgTot,
            "biometricAvg": JSON.stringify(initData)
        });
    }

    // status/biometric.html 호출
    async goBiometricPage(req, res, next) {
        let today = new Date();
        today.setDate(today.getDate() - 1)
        let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1);
        let yesterday = (today.getDate()) >= 10 ? today.getDate() : '0' + today.getDate();
        let yesterdayStr = today.getFullYear() + "-" + month + "-" + yesterday;

        let userCode = req.query.userCode;
        let userList = await svInstance.getUserName(userCode);

        let initData = await svInstance.getBiometricAvgData(userCode, 'daily', yesterdayStr, yesterdayStr);

        return res.render('web/status/biometric', {
            "tabTitle": req.__('statusPage').tabTitle,
            "biometricPage": req.__('statusPage').biometricPage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userList": JSON.stringify(userList), // 유저 이름 정보
            "lang": req.query.lang, // 페이지 언어 정보 
            "accessToken": req.query.accessToken, // jwt accessToken 정보
            "initAvgTot": initData.avgTot,
            "biometricAvg": JSON.stringify(initData)
        });
    }

    // status/stress.html 호출
    async goStressPage_P(req, res, next) {
        let date = new Date(),
            yesterdayStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1);
        let userCode = req.query.userCode,
            pUserCode = req.query.pUserCode;
        let userName = await svInstance.getUserNameP(userCode);

        let initData = await svInstance.getStressAvgData(userCode, 'daily', yesterdayStr, yesterdayStr);

        return res.render('web/status/stress_p', {
            "tabTitle": req.__('statusPage').tabTitle,
            "stressPage": req.__('statusPage').stressPage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userName": userName, // 유저 이름 정보
            "pUserCode": pUserCode,
            "initStressInfo": initData.StressInfo,
            "stressValues": JSON.stringify(initData)
        });
    }

    // status/stress.html 호출
    async goStressPage(req, res, next) {
        let date = new Date(),
            yesterdayStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1);
        let userCode = req.query.userCode;
        let userList = await svInstance.getUserName(userCode);

        let initData = await svInstance.getStressAvgData('0', 'daily', yesterdayStr, yesterdayStr);

        return res.render('web/status/stress', {
            "tabTitle": req.__('statusPage').tabTitle,
            "stressPage": req.__('statusPage').stressPage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userList": JSON.stringify(userList), // 관리대상자 이름 정보
            "initStressInfo": initData.StressInfo,
            "stressValues": JSON.stringify(initData)
        });
    }

    async goSleepPage_P(req, res, next) {
        let date = new Date(),
            yesterdayStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1);
        let userCode = req.query.userCode,
            pUserCode = req.query.pUserCode;
        let userName = await svInstance.getUserNameP(userCode);;
        let initData = await svInstance.getSleepApneaData(userCode, 'daily', yesterdayStr, yesterdayStr);

        return res.render('web/status/sleep_p', {
            "tabTitle": req.__('statusPage').tabTitle,
            "sleepPage": req.__('statusPage').sleepPage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userName": userName, // 유저 이름 정보
            "pUserCode": pUserCode,
            "initSleepInfo": initData.sleepInfo,
            "sleepValues": JSON.stringify(initData)
        });
    }


    // status/sleep.html 호출
    async goSleepPage(req, res, next) {
        let date = new Date(),
            yesterdayStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1);
        let userCode = req.query.userCode;
        let initData = await svInstance.getSleepApneaData('0', 'daily', yesterdayStr, yesterdayStr);

        let userList = await svInstance.getUserName(userCode);;

        return res.render('web/status/sleep', {
            "tabTitle": req.__('statusPage').tabTitle,
            "sleepPage": req.__('statusPage').sleepPage,
            "emptyData": req.__('statusPage').emptyData,
            "userCode": userCode, // 유저 코드 정보
            "userList": JSON.stringify(userList), // 유저 이름 정보
            "initSleepInfo": initData.sleepInfo,
            "sleepValues": JSON.stringify(initData)
        });
    }

    // status disease data 가져오기
    async getDiseaseData(req, res, next) {
        let reqParams = req.body,
            userCode = reqParams.userCode;
        reqParams = reqParams.settings;
        let mode = reqParams.mode,
            startDate = reqParams.startDate,
            endDate = reqParams.endDate;

        let diseasePredictRate = await svInstance.getDiseasePredictData(userCode, mode, startDate, endDate);
        return res.send({
            "diseasePredict": diseasePredictRate
        });
    };
    // status biometric data 가져오기
    async getBiometricData(req, res, next) {

        let reqParams = req.body,
            userCode = reqParams.userCode;

        reqParams = reqParams.settings;
        let mode = reqParams.mode,
            startDate = reqParams.startDate,
            endDate = reqParams.endDate;

        let biometricAvg = await svInstance.getBiometricAvgData(userCode, mode, startDate, endDate);

        return res.json({
            "biometricAvg": biometricAvg
        });
    }

    // status stress data 가져오기
    async getStressData(req, res, next) {

        let reqParams = req.body,
            userCode = reqParams.userCode;

        reqParams = reqParams.settings;
        let mode = reqParams.mode,
            startDate = reqParams.startDate,
            endDate = reqParams.endDate;

        let stressValues = await svInstance.getStressAvgData(userCode, mode, startDate, endDate);

        return res.json({
            "stressValues": stressValues
        });
    }

    // status sleep data 가져오기
    async getSleepData(req, res, next) {

        let reqParams = req.body,
            userCode = reqParams.userCode;

        reqParams = reqParams.settings;
        let mode = reqParams.mode,
            startDate = reqParams.startDate,
            endDate = reqParams.endDate;

        let sleepValues = await svInstance.getSleepApneaData(userCode, mode, startDate, endDate);
        return res.json({
            "sleepValues": sleepValues
        });
    }

}

module.exports = StatusController;