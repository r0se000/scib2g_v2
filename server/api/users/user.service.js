/** ================================================================
 *  로그인, 회원가입, 정보 수정 등 사용자 관리 로직 구현
 *  @author JG, Jo
 *  @since 2021.04.12
 *  @history 2021.04.19 JG 로그인 기능 추가(jwt)
 *           2021.05.25 JG ID 중복 검사 기능 추가
 *  ================================================================
 */
// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./user.sql');

// logger
const logger = require('../../config/loggerSettings');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

//nodemailer
const nodemailer = require('nodemailer');

class userService {

    async encryptTest(inputdata) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        // let result = cryptoUtil.encrypt_aes(cryptoKey, inputdata);
        let result = cryptoUtil.decrypt_aes(cryptoKey, inputdata);
        return result
    }

    /**
     *  관리자 계정 생성
     *  @params signUpData - 사용자 계정 생성에 필요한 정보를 담은 object
     *  @return result - insert 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.04.12
     *  @history 2021.04.13 JG 개인정보 암호화(AES 256, CTR Mode) 추가
     *           2021.05.03 JG parameter 수정
     *           2021.05.25 JG 개인정보 제공 동의여부 추가
     */
    async createAdminUser(signUpData) {

        // 개인 정보 암호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        signUpData.name = cryptoUtil.encrypt_aes(cryptoKey, signUpData.name); // 담당자명
        signUpData.phone1 = cryptoUtil.encrypt_aes(cryptoKey, signUpData.phone1); // 휴대폰번호 앞자리
        signUpData.phone2 = cryptoUtil.encrypt_aes(cryptoKey, signUpData.phone2); // 휴대폰번호 가운데자리
        signUpData.phone3 = cryptoUtil.encrypt_aes(cryptoKey, signUpData.phone3); // 휴대폰번호 끝자리
        signUpData.eId = cryptoUtil.encrypt_aes(cryptoKey, signUpData.eId); // 이메일 ID

        let accountArray = [signUpData.name, signUpData.id, signUpData.pwd, signUpData.provideYN,
            signUpData.phone1, signUpData.phone2, signUpData.phone3,
            signUpData.address1, signUpData.address2, signUpData.eId, signUpData.eDomain
        ];
        logger.info(accountArray);
        // 계정 정보 등록
        let result = await mysqlDB('insert', queryList.insert_adminuser_account, accountArray);
        return result;
    };

    /**
     *  관리자 로그인 수행
     *  관련 테이블: user_admin
     *  @params accountID - 사용자 계정 ID(String)
     *  @params accountPW - 사용자 계정 PW(String, SHA2 HASH)
     *  @return 조회 결과 반환(json)
     *  @author MY Jang
     *  @since 2021.10.05
     *  @history 
     */
    async adminuserLogin(accountId, accountPw) {
        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = {},
            isUser = await mysqlDB('selectOne', queryList.select_adminuser_exist, [accountId, accountPw]);

        if (isUser.state == true && isUser.rowLength === 1) {
            if (isUser.row.login_check == 'Y') {
                result.logincheck = 'Y'
            }
            const payload = { accountId: accountId },
                userCode = isUser.row.a_user_code,
                accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME, algorithm: 'HS256' }),
                refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_TIME, algorithm: 'HS256' });

            await mysqlDB('update', queryList.update_admin_user_login, [userCode]);
            await mysqlDB('update', queryList.update_adminuser_jwt_token, [accessToken, refreshToken, userCode]); // access token, refresh token 저장

            result.messageCode = 'ExistUser'
            result.accessToken = accessToken;
            result.userCode = userCode;

            result.userName = cryptoUtil.decrypt_aes(cryptoKey, isUser.row.a_user_name);

        } else {
            result.messageCode = 'NotFoundUser';
        }
        return result;
    };

    /**
     *  관리자 앱 로그인 수행
     *  관련 테이블: user_admin
     *  @params accountID - 사용자 계정 ID(String)
     *  @params accountPW - 사용자 계정 PW(String, SHA2 HASH)
     *  @return 조회 결과 반환(json)
     *  @author MY Jang
     *  @since 2021.10.05
     *  @history 
     */
    async adminuserAppLogin(accountId, accountPw) {

        // 개인 정보 복호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let result = {},
            isUser = await mysqlDB('selectOne', queryList.select_adminuser_exist, [accountId, accountPw]);

        if (isUser.state == true && isUser.rowLength === 1) {
            if (isUser.row.login_check == 'Y') {
                result.logincheck = 'Y'
            }
            const payload = { accountId: accountId },
                userCode = isUser.row.a_user_code,
                accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME, algorithm: 'HS256' }),
                refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_TIME, algorithm: 'HS256' });

            await mysqlDB('update', queryList.update_admin_user_login, [userCode]);
            await mysqlDB('update', queryList.update_adminuserapp_jwt_token, [accessToken, refreshToken, userCode]); // access token, refresh token 저장

            result.messageCode = 'ExistUser'
            result.accessToken = accessToken;
            result.userCode = userCode;

            result.userName = cryptoUtil.decrypt_aes(cryptoKey, isUser.row.a_user_name);

        } else {
            result.messageCode = 'NotFoundUser';
        }

        return result;
    }

    /**
     *  사용자 인증 토큰 검증
     *  관련 테이블: user_account
     *  @params userCode - 사용자 고유식별 번호
     *  @params accessToken - 사용자 인증 토큰
     *  @return 조회 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.04.19
     *  @history 2021.04.26 JG refresh token 조회 시 access token 조건 추가
     */
    async validateJwtToken(userCode, accessToken) {
        let result = null;
        let accessTokenSlice = accessToken.slice(7) // ※access token: 'Bearer ...'
        let refreshToken = await mysqlDB('selectOne', queryList.select_adminuser_jwt_token, [userCode, accessTokenSlice]);
        // if (refreshToken.state == true && refreshToken.rowLength == 1) { // refresh token이 정상적으로 존재할 때 
        if (refreshToken.rowLength == 1) { // refresh token이 정상적으로 존재할 때 
            jwt.verify(accessTokenSlice, process.env.ACCESS_SECRET_KEY, (err, decoded) => { // access token 검증  
                if (err) {
                    if (err.name !== 'TokenExpiredError') { // access token 만료 에러를 제외한 모든 에러         
                        result = {
                            success: 0,
                            alertMsg: 'Access Denied. Please log in again.',
                            errorCode: 'ACCSSTKNERR'
                        };
                    } else if (err.name === 'TokenExpiredError') { // access token이 만료된 경우
                        refreshToken = refreshToken.row.refresh_token;

                        jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded_refresh) => { // refresh token 검증
                            if (err) {
                                if (err.name === 'TokenExpiredError') { // access token, refresh token 모두 만료된 경우              
                                    result = {
                                        success: 0,
                                        alertMsg: "Invalid Token...Please log in again.",
                                        errorCode: 'REFRSHTKNEXPIRED'
                                    };
                                } else if (err.name !== 'TokenExpiredError') {
                                    result = {
                                        success: 0,
                                        alertMsg: "Access Denied. Please log in again.",
                                        errorCode: 'REFSHTKNERR'
                                    };
                                }
                            } else { // refresh token이 유효한 경우          
                                const accouontId = decoded_refresh.accountId,
                                    newAccessToken = jwt.sign({ accountId: accouontId }, process.env.ACCESS_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME, algorithm: 'HS256' }); // 새로운 access token을 발급한다.

                                result = {
                                    success: 2,
                                    accessToken: newAccessToken
                                };
                            }
                        });
                    }
                } else { // 정상일 때
                    result = {
                        success: 1,
                        decoded: decoded
                    };
                }
            });
        } else { // refresh token 조회가 정상적이지 않을 때
            result = {
                success: 0,
                alertMsg: 'Access Denied. Please log in again.',
                errorCode: 'NOTFOUNDTOKEN'
            };
        }

        if (result.success == 2) { // 새로운 access token DB 갱신 2021.04.26 JG
            logger.debug('user' + userCode + ' new access token is generated');
            let reslt = await mysqlDB('update', queryList.update_user_access_token, [result.accessToken, userCode]);
            logger.debug('user' + userCode + ' new access token is saved:' + reslt.succ);
        }
        return result;
    };

    /**
     *  앱 사용자 인증 토큰 검증
     *  관련 테이블: user_account
     *  @params userCode - 사용자 고유식별 번호
     *  @params accessToken - 사용자 인증 토큰
     *  @return 조회 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.04.19
     *  @history 2021.04.26 JG refresh token 조회 시 access token 조건 추가
     */
    async validateAppJwtToken(userCode, accessToken) {
        let result = null;
        let accessTokenSlice = accessToken.slice(7) // ※access token: 'Bearer ...'
        let refreshToken = await mysqlDB('selectOne', queryList.select_adminuser_app_jwt_token, [userCode, accessTokenSlice]);
        // if (refreshToken.state == true && refreshToken.rowLength == 1) { // refresh token이 정상적으로 존재할 때 
        if (refreshToken.rowLength == 1) { // refresh token이 정상적으로 존재할 때 
            jwt.verify(accessTokenSlice, process.env.ACCESS_SECRET_KEY, (err, decoded) => { // access token 검증  
                if (err) {
                    if (err.name !== 'TokenExpiredError') { // access token 만료 에러를 제외한 모든 에러         
                        result = {
                            success: 0,
                            alertMsg: 'Access Denied. Please log in again.',
                            errorCode: 'ACCSSTKNERR'
                        };
                    } else if (err.name === 'TokenExpiredError') { // access token이 만료된 경우
                        refreshToken = refreshToken.row.refresh_token;

                        jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded_refresh) => { // refresh token 검증
                            if (err) {
                                if (err.name === 'TokenExpiredError') { // access token, refresh token 모두 만료된 경우              
                                    result = {
                                        success: 0,
                                        alertMsg: "Invalid Token...Please log in again.",
                                        errorCode: 'REFRSHTKNEXPIRED'
                                    };
                                } else if (err.name !== 'TokenExpiredError') {
                                    result = {
                                        success: 0,
                                        alertMsg: "Access Denied. Please log in again.",
                                        errorCode: 'REFSHTKNERR'
                                    };
                                }

                            } else { // refresh token이 유효한 경우          
                                const accouontId = decoded_refresh.accountId,
                                    newAccessToken = jwt.sign({ accountId: accouontId }, process.env.ACCESS_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME, algorithm: 'HS256' }); // 새로운 access token을 발급한다.

                                result = {
                                    success: 2,
                                    accessToken: newAccessToken
                                };
                            }
                        });
                    }
                } else { // 정상일 때
                    result = {
                        success: 1,
                        decoded: decoded
                    };
                }
            });
        } else { // refresh token 조회가 정상적이지 않을 때
            result = {
                success: 0,
                alertMsg: 'Access Denied. Please log in again.',
                errorCode: 'NOTFOUNDTOKEN'
            };
        }

        if (result.success == 2) { // 새로운 access token DB 갱신 2021.04.26 JG
            logger.debug('user' + userCode + ' new access token is generated');
            let reslt = await mysqlDB('update', queryList.update_user_access_token, [result.accessToken, userCode]);
            logger.debug('user' + userCode + ' new access token is saved:' + reslt.succ);
        }
        return result;
    }

    /**
     *  ID 중복 조회 및 결과 반환
     *  관련 테이블: user_account
     *  @params idString - 중복 검사할 id (string)
     *  @return 중복 ID인 경우 true, 아닌 경우 false
     *  @author JG, Jo
     *  @since 2021.05.25
     */
    async checkIdDuplicate(idString) {
        let result = await mysqlDB('selectOne', queryList.select_user_id_duplicate, [idString]);
        result = (result.rowLength > 0) ? true : false;
        return result;
    }

    /**
     *  email 중복 조회 및 결과 반환
     *  관련 테이블: user_account
     *  @params eIdString - email id (string)
     *  @params eDomainString - email domain (string)
     *  @return 중복 email인 경우 true, 아닌 경우 false
     *  @author JG, Jo
     *  @since 2021.05.26
     */
    async checkEmailDuplicate(eIdString, eDomainString) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        eIdString = cryptoUtil.encrypt_aes(cryptoKey, eIdString);

        let result = await mysqlDB('selectOne', queryList.select_user_email_duplicate, [eIdString, eDomainString]);
        result = (result.rowLength > 0) ? true : false;
        return result;
    }

    /**
     *  로그아웃
     *  관련 테이블: user_account
     *  @params userCode - 사용자 고유 번호
     *  @return result - update 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     */
    async userLogout(userCode) {
        let result = await mysqlDB('update', queryList.update_user_logout, [userCode]);
        return result;
    }

    /** ================================================================
     *  관리자 웹 로그아웃
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async adminuserLogout(userCode) {
        let result = await mysqlDB('update', queryList.update_adminuser_logout, [userCode]);
        if (result.state) {
            result.success = true;
        } else {
            result.success = false;
        }
        return result;
    }

    /**
     *  사용자 계정 정보 및 사용자 상세 정보 수정
     *  관련 테이블: user_account, user_info
     *  @params modifyData - 사용자 계정 생성에 필요한 정보를 담은 object
     *  @return result - insert 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     *  @history 
     */
    async modifyUserInfo(modifyData) {
        // 개인 정보 암호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        modifyData.name = cryptoUtil.encrypt_aes(cryptoKey, modifyData.name); // 사용자명
        modifyData.eId = cryptoUtil.encrypt_aes(cryptoKey, modifyData.eId); // 이메일 앞부분
        modifyData.bYear = cryptoUtil.encrypt_aes(cryptoKey, modifyData.bYear); // 생년
        modifyData.bMonth = cryptoUtil.encrypt_aes(cryptoKey, modifyData.bMonth); // 생월
        modifyData.bDay = cryptoUtil.encrypt_aes(cryptoKey, modifyData.bDay); // 생일

        let accountArray, userInfoArray;

        accountArray = [modifyData.eId, modifyData.eDomain, modifyData.userCode];
        userInfoArray = [modifyData.name, modifyData.bYear, modifyData.bMonth, modifyData.bDay, modifyData.gender, modifyData.userCode];

        logger.info(accountArray);
        logger.info(userInfoArray);

        // 계정 정보 수정
        let result = await mysqlDB('update', queryList.update_user_account, accountArray);

        // 사용자 상세 정보 수정
        if (result.state == true) {
            result = await mysqlDB('update', queryList.update_user_info, userInfoArray);
        }

        return result;
    }


    /** ================================================================
     *  비밀번호 수정
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async modifyUserPassword(userCode, pwd) {
        let result = await mysqlDB('update', queryList.update_new_password, [pwd, userCode]);
        return result;
    }

    /**
     *  사용자 계정 활성 상태 변경(회원탈퇴)
     *  관련 테이블: user_account
     *  @params userCode - 사용자 고유 번호
     *  @params pwd - 변경할 비밀번호
     *  @return result - insert 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     *  @history 
     */
    async modifyUserActivate(activateYN, deactivateDate, userCode) {
        let result = await mysqlDB('update', queryList.update_user_activate, [activateYN, deactivateDate, userCode]);
        return result;
    }


    /** ================================================================
     *  ID 찾기
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async findUserId(userName, eId, eDomain) {

        console.log(userName, eId, eDomain);
        // 개인 정보 암호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        userName = cryptoUtil.encrypt_aes(cryptoKey, userName);
        eId = cryptoUtil.encrypt_aes(cryptoKey, eId);

        let result = {},
            isUser = await mysqlDB('selectOne', queryList.select_user_id, [userName, eId, eDomain]);
        if (isUser.state == true && isUser.rowLength === 1) {
            let resultRow = isUser.row;
            result.messageCode = 'foundId';
            result.id = resultRow.a_user_account_id;

        } else {
            result.messageCode = 'NotFoundUser';
        }

        return result;
    }


    /*
     *  userCode 찾기
     *  관련 테이블: user_account, user_info
     *  @params accountId
     *  @params userName
     *  @params email
     *  @return 조회 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     *  @history   
     */
    async findUserCode(accountId, userName, phone1, phone2, phone3) {
        // let emailTempArr = email = email.split('@'),
        //     emailId = emailTempArr[0],
        //     emailDomain = emailTempArr[1];

        // 개인 정보 암호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        userName = cryptoUtil.encrypt_aes(cryptoKey, userName);
        phone1 = cryptoUtil.encrypt_aes(cryptoKey, phone1);
        phone2 = cryptoUtil.encrypt_aes(cryptoKey, phone2);
        phone3 = cryptoUtil.encrypt_aes(cryptoKey, phone3);

        let result = {},
            isUser = await mysqlDB('selectOne', queryList.select_user_code, [accountId, userName, phone1, phone2, phone3]);

        if (isUser.state == true && isUser.rowLength === 1) {
            let resultRow = isUser.row;

            result.messageCode = 'foundUserCode';
            result.userCode = resultRow.a_user_code;


        } else {
            result.messageCode = 'NotFoundUser';
        }

        return result;
    }

    /*
     *  생년 복호화
     *  관련 테이블: user_info
     *  @params birth_year
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.07.08
     *  @history   
     */
    async decryptBirth(params) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let birth_year = cryptoUtil.decrypt_aes(cryptoKey, params);
        let result = {
            "birth": birth_year
        }
        return result;
    }


    /** ================================================================
     *  이메일 유무 확인 및 인증번호 전송
     *  @author SY
     *  @since 2023.04.03
     *  @history 2023.04.03 초기 작성
     *  ================================================================
     */
    async authEmail(params, context) {
        let result = {}

        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let username = params.name,
            userEId = params.eId

        params.name = cryptoUtil.encrypt_aes(cryptoKey, params.name);
        params.eId = cryptoUtil.encrypt_aes(cryptoKey, params.eId);
        let checkUser;
        if (Object.keys(params).length == 3) {
            checkUser = await mysqlDB('selectOne', queryList.search_user, [params.name, params.eId, params.eDomain]); // ID 찾기 - 이메일 유무 확인
        } else {
            checkUser = await mysqlDB('selectOne', queryList.select_user_code, [params.id, params.name, params.eId, params.eDomain]); // PWD 찾기 - 이메일 유무 확인
            console.log(checkUser);
        }
        if (checkUser.rowLength == 1) {
            //이메일 인증번호 전송
            let authNumber = ''
            for (let i = 0; i < 6; i++) {
                authNumber += Math.floor(Math.random() * 10);
            }
            let sendResult = await authEmailSend(username, userEId, params.eDomain, authNumber, context);
            if (sendResult.status == 'Success') { // 이메일 전송 성공
                result['userCode'] = checkUser.row.a_user_code;
                result["authNumber"] = authNumber;
                result["success"] = 1;
            } else { // 이메일 전송 실패
                result["success"] = 0;
            }
        } else {
            result["success"] = 2; // 일치하는 사용자 X
        }
        return result;
    }


    /**
     *  앱 알림 토큰 업데이트
     *  관련 테이블: user_admin
     *  @params userCode - 유저코드
     *  @params aleretToken - 앱 알림 토큰
     *  @return 조회 결과 반환(json)
     *  @author MY Jang
     *  @since 2021.10.19
     *  @history 
     */
    async updateAlerToken(userCode, alertToken) {
        let updateAlertToken = await mysqlDB('update', queryList.updateAlertToken, [alertToken, userCode]);
        return updateAlertToken;
    }

}

/** ================================================================
 *  이메일 인증번호 전송
 *  @author SY
 *  @since 2023.04.03
 *  @history 2023.04.03 초기 작성
 *  ================================================================
 */
async function authEmailSend(name, eId, eDomain, authNumber, context) {
    let result = {}
    let receiveAddress = eId + '@' + eDomain
    try {
        let transporter = nodemailer.createTransport({
            // 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
            service: 'gmail',
            // host를 gmail로 설정
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                // Gmail 주소 입력, 'testmail@gmail.com'
                user: process.env.NODEMAILER_USER,
                // Gmail 패스워드 입력
                pass: process.env.NODEMAILER_PASS,
            },
        });

        let info = await transporter.sendMail({
            // 보내는 곳의 이름과, 메일 주소를 입력
            from: `"SCI" <${process.env.NODEMAILER_USER}>`,
            // 받는 곳의 메일 주소를 입력
            to: receiveAddress,
            // 보내는 메일의 제목을 입력
            subject: context.title,
            // 보내는 메일의 내용을 입력
            // text: 일반 text로 작성된 내용
            // html: html로 작성된 내용
            text: authNumber,
            html: `<p>${context.context1}</p>` +
                `<p>${context.context2}</p>` + `<p>${context.context3}</p>` +
                `<br>` +
                `<h3>${context.authNumber}</h3>` +
                `<h3>${authNumber}</h3>` + `<br><br>` +
                `<p>${context.context4}</p>`
        });
        result['status'] = 'Success';
        result['code'] = '200';
        result['message'] = "Success";
    } catch (error) {
        result['status'] = 'Fail';
        result['code'] = '400';
        result['message'] = error;

    }
    return result
}

module.exports = userService;