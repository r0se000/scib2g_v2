/** ================================================================
 *  로그인, 회원가입, 정보 수정 등 사용자 관리 controller
 *  @author JG, Jo
 *  @since 2021.04.12
 *  @history 2021.04.19 JG 로그인 기능 추가(jwt)
 *           2021.05.26 JG 중복 검사, 회원정보 조회, 회원 탈퇴 관련 기능 추가
 *  ================================================================
 */

// logger
const logger = require('../../config/loggerSettings');

// 호출할 service 정의
const service = require('./user.service');
const svInstance = new service();

class UserController {
    async loadIndexPage(req, res, next) {
        // let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        return res.render('web/index/index');
    };

    async loadSignupPage(req, res, next) { //관리자 회원가입
        return res.render('web/index/signup');
    }
    async loadFindIdPage(req, res, next) {
        return res.render('web/index/findId');
    }
    async loadFindPwPage(req, res, next) {
        return res.render('web/index/findPw');
    }

    // 관리자 계정 생성 2021.10.05
    async createAdminUser(req, res, next) {
        let reqDataObj = req.body;
        let result = await svInstance.createAdminUser(reqDataObj);
        return res.json(result);
    }

    // 앱 로그인 2021.10.08
    async userAppLogin(req, res, next) {
        let accountId = req.body.accountId,
            accountPw = req.body.accountPw;

        let result = await svInstance.adminuserAppLogin(accountId, accountPw);
        return res.json(result);
    };

    // 관리자 로그인 2021.10.05
    async adminuserLogin(req, res, next) {
        let accountId = req.body.accountId,
            accountPw = req.body.accountPw;

        let result = await svInstance.adminuserLogin(accountId, accountPw);
        return res.json(result);
    };

    // 사용자  jwt token 검증 2021.04.19
    async validateJwtToken(req, res, next) {
        let accessToken = req.headers['authorization'],
            userCode = req.body.userCode;

        let result = await svInstance.validateJwtToken(userCode, accessToken);
        return res.json(result);
    };
    // 앱 사용자  jwt token 검증 2021.04.19
    async validateAppJwtToken(req, res, next) {
        let accessToken = req.headers['authorization'],
            userCode = req.body.userCode;

        let result = await svInstance.validateAppJwtToken(userCode, accessToken);
        return res.json(result);
    }

    // 중복 ID 검사 2021.05.26
    async checkIdDuplicate(req, res, next) {
        let idString = req.query.idString;
        let result = await svInstance.checkIdDuplicate(idString);
        return res.json(result);
    }

    // 중복 email 검사 2021.05.26
    async checkEmailDuplicate(req, res, next) {
        let eIdString = req.query.eIdString,
            eDomainString = req.query.eDomainString;
        let result = await svInstance.checkEmailDuplicate(eIdString, eDomainString);
        return res.json(result);
    }

    // 로그아웃 2021.05.26
    async userLogout(req, res, next) {
        let state = await svInstance.userLogout(req.body.userCode);
        return res.json(state);
    }

    // 관리자 로그아웃 2021.10.06
    async adminuserLogout(req, res, next) {
        let state = await svInstance.adminuserLogout(req.body.userCode);
        return res.json(state);
    }

    // 회원정보 조회 2021.05.26
    async userInfoShow(req, res, next) {
        let result = await svInstance.userInfoShow(req.query.userCode);
        return res.json(result);
    }

    // 사용자 정보 수정 2021.05.26 
    async modifyUserInfo(req, res, next) {
        let reqDataObj = req.body;

        let result = await svInstance.modifyUserInfo(reqDataObj);
        return res.json(result);
    }


    /** ================================================================
     *  비밀번호 변경
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async modifyUserPassword(req, res, next) {
        let reqDataObj = req.body,
            userCode = reqDataObj.userCode,
            pwd = reqDataObj.pwd;

        let result = await svInstance.modifyUserPassword(userCode, pwd);
        return res.json(result);
    }

    // 회원탈퇴 2021.05.26 
    async withdrawalUser(req, res, next) {
        let reqDataObj = req.body,
            userCode = reqDataObj.userCode,
            activateYN = reqDataObj.activateYN,
            deactivateDate = reqDataObj.deactivateDate;

        let result = await svInstance.modifyUserActivate(activateYN, deactivateDate, userCode);
        return res.json(result);
    }

    /** ================================================================
     *  ID 찾기
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async findUserId(req, res, next) {
        let reqDataObj = req.query,
            userName = reqDataObj.name,
            eId = reqDataObj.eId,
            eDomain = reqDataObj.eDomain;

        let result = await svInstance.findUserId(userName, eId, eDomain);
        return res.json(result);
    }

    // user code 찾기 2021.05.26 
    async findUserCode(req, res, next) {
        let reqDataObj = req.query,
            accountId = reqDataObj.id,
            userName = reqDataObj.name,
            phone1 = reqDataObj.phone1,
            phone2 = reqDataObj.phone2,
            phone3 = reqDataObj.phone3;

        let result = await svInstance.findUserCode(accountId, userName, phone1, phone2, phone3);
        return res.json(result);
    }

    //생년 복호화
    async userBirthInfo(req, res, next) {
        let params = req.body;
        let result = await svInstance.decryptBirth(params.data);
        return res.send(result.birth);
    }


    /** ================================================================
     *  이메일 인증번호 전송
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async authEmail(req, res, next) {
        let context = req.__('emailAuth');
        let params = req.body;
        let result = await svInstance.authEmail(params, context);
        return res.send(result)
    }

    //앱 알림토큰 업데이트
    async updateAlertToken(req, res, next) {
        let userCode = req.body.userCode,
            alertToken = req.body.alertToken;
        let updateAlertToken = await svInstance.updateAlerToken(userCode, alertToken);
        return res.json(updateAlertToken);
    }

    //복호화 테스트
    async encryptTest(req, res, next) {
        let input = req.query.data
        let result = await svInstance.encryptTest(input)
        return res.json(result);

    };
}

module.exports = UserController;