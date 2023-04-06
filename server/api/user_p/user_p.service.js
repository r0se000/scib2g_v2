/** ================================================================
 *  로그인, 회원가입, 정보 수정 등 보호자 관리 로직 구현
 *  @author MY Jang
 *  @since 2021.11.02
 *  @history 2021.11.02 최초작성
 *  ================================================================
 */
// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./user_p.sql');

// logger
const logger = require('../../config/loggerSettings');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

class userService {

    async encryptTest(inputdata) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        // let result = cryptoUtil.encrypt_aes(cryptoKey, inputdata);
        let result = cryptoUtil.decrypt_aes(cryptoKey, inputdata);
        return result
    }

    /**
     *  사용자 계정 생성 및 사용자 상세 정보 등록
     *  관련 테이블: user_account, user_info
     *  @params signUpData - 사용자 계정 생성에 필요한 정보를 담은 object
     *  @return result - insert 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.04.12
     *  @history 2021.04.13 JG 개인정보 암호화(AES 256, CTR Mode) 추가
     *           2021.05.03 JG parameter 수정
     *           2021.05.25 JG 개인정보 제공 동의여부 추가
     */
    async createUser(signUpData) {
        // 개인 정보 암호화
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        signUpData.name = cryptoUtil.encrypt_aes(cryptoKey, signUpData.name); // 사용자명

        signUpData.phone1 = cryptoUtil.encrypt_aes(cryptoKey, signUpData.phone1); //휴대폰번호 앞자리
        signUpData.phone2 = cryptoUtil.encrypt_aes(cryptoKey, signUpData.phone2); //휴대폰번호 가운데자리
        signUpData.phone3 = cryptoUtil.encrypt_aes(cryptoKey, signUpData.phone3); //휴대폰번호 끝자리

        let accountArray;

        accountArray = [signUpData.name, signUpData.id, signUpData.pwd, signUpData.phone1, signUpData.phone2, signUpData.phone3, signUpData.provideYN];

        logger.info(accountArray);

        // 계정 정보 등록
        let result = await mysqlDB('insert', queryList.insert_p_user_account, accountArray);

        return result;
    };


    /**
     *  사용자 로그인 수행
     *  관련 테이블: user_account, user_info
     *  @params accountID - 사용자 계정 ID(String)
     *  @params accountPW - 사용자 계정 PW(String, SHA2 HASH)
     *  @return 조회 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.04.19
     *  @history 2021.04.26 JG access token DB에 저장하도록 수정
     *           2021.05.11 JG DB name(복호화), family_id 조회 추가
     *           2021.05.26 JG 중복 로그인 방지  
     */
    async userLogin(accountId, accountPw) {
        let result = {},
            isUser = await mysqlDB('selectOne', queryList.select_user_exist, [accountId, accountPw]);

        if (isUser.state == true && isUser.rowLength === 1) {
            if (isUser.row.p_login_check == 'Y') {
                result.logincheck = 'Y'
            }
            const payload = { accountId: accountId },
                pUserCode = isUser.row.p_user_code,
                accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_TIME, algorithm: 'HS256' }),
                refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_TIME, algorithm: 'HS256' });

            await mysqlDB('update', queryList.update_user_login, [pUserCode]);
            await mysqlDB('update', queryList.update_user_jwt_token, [accessToken, refreshToken, pUserCode]); // access token, refresh token 저장

            result.messageCode = 'ExistUser'
            result.accessToken = accessToken;
            result.pUserCode = pUserCode;
            result.userCode = isUser.row.user_code;

            // 개인 정보 복호화
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;
            try { // 보호자ID에 독거노인이 매칭되어있지 않으면 null 처리
                result.userName = cryptoUtil.decrypt_aes(cryptoKey, isUser.row.name);
                result.pUserName = cryptoUtil.decrypt_aes(cryptoKey, isUser.row.p_user_name)
            } catch (error) {
                result.userName = null;
                result.pUserName = null;
            }

            // 중복 로그인 방지
            /* if(isUser.row.login_check == 'Y') {
              result.messageCode = 'alreadyLogin';
            } else {
              await mysqlDB('update', queryList.update_user_login, [userCode]);
            } */ // 정상적으로 로그아웃 하지않으면 중복 로그인 체크가 적용되지 않아 임시로 주석처리함 다른 로직이 필요할듯

        } else {
            result.messageCode = 'NotFoundUser';
        }

        return result;
    }

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
            // 개인 정보 복호화
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;
            result.userName = cryptoUtil.decrypt_aes(cryptoKey, isUser.row.a_user_name);

        } else {
            result.messageCode = 'NotFoundUser';
        }

        return result;
    }

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
            // 개인 정보 복호화
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;
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
        let refreshToken = await mysqlDB('selectOne', queryList.select_user_jwt_token, [userCode, accessTokenSlice]);
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

        let result = await mysqlDB('selectOne', queryList.select_user_account_email, [eIdString, eDomainString]);
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

    /**
     *  로그아웃
     *  @params userCode - 사용자 고유 번호
     *  @return result - update 결과 반환(json)
     *  @author MY Jang
     *  @since 2021.10.06
     */
    async adminuserLogout(userCode) {
        let result = await mysqlDB('update', queryList.update_adminuser_logout, [userCode]);
        return result;
    }

    /**
     *  회원정보 조회
     *  관련 테이블: user_account, user_info
     *  @params userCode
     *  @return 조회 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     *  @history   
     */
    async userInfoShow(userCode) {
        let result = {},
            isUser = await mysqlDB('selectOne', queryList.select_user_detail_info, [userCode]);

        if (isUser.state == true && isUser.rowLength === 1) {
            let resultRow = isUser.row;

            result.messageCode = 'ExistUser'
            result.usercode = resultRow.user_code;
            result.id = resultRow.p_account_id;

            // 개인 정보 복호화
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;
            result.name = cryptoUtil.decrypt_aes(cryptoKey, resultRow.p_user_name);
            result.phone1 = cryptoUtil.decrypt_aes(cryptoKey, resultRow.p_phone_first);
            result.phone2 = cryptoUtil.decrypt_aes(cryptoKey, resultRow.p_phone_middle);
            result.phone3 = cryptoUtil.decrypt_aes(cryptoKey, resultRow.p_phone_last);

        } else {
            result.messageCode = 'NotFoundUser';
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
        modifyData.phone1 = cryptoUtil.encrypt_aes(cryptoKey, modifyData.phone1); // 사용자명
        modifyData.phone2 = cryptoUtil.encrypt_aes(cryptoKey, modifyData.phone2); // 사용자명
        modifyData.phone3 = cryptoUtil.encrypt_aes(cryptoKey, modifyData.phone3); // 사용자명

        let userInfoArray;

        userInfoArray = [modifyData.name, modifyData.phone1, modifyData.phone2, modifyData.phone3, modifyData.userCode];

        logger.info(userInfoArray);

        // 계정 정보 수정
        let result = await mysqlDB('update', queryList.update_user_account, userInfoArray);

        return result;
    }

    /**
     *  비밀번호 수정
     *  관련 테이블: user_account
     *  @params userCode - 사용자 고유 번호
     *  @params pwd - 변경할 비밀번호
     *  @return result - insert 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     *  @history 
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

    /**
     *  ID 찾기
     *  관련 테이블: user_account, user_info
     *  @params userName
     *  @params email
     *  @return 조회 결과 반환(json)
     *  @author JG, Jo
     *  @since 2021.05.26
     *  @history   
     */
    async findUserId(userName, phone1, phone2, phone3) {
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
            isUser = await mysqlDB('selectOne', queryList.select_user_id, [userName, phone1, phone2, phone3]);

        if (isUser.state == true && isUser.rowLength === 1) {
            let resultRow = isUser.row;

            result.messageCode = 'foundId';
            result.id = resultRow.p_account_id;

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
            result.userCode = resultRow.p_user_code;


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

    /**
     *  대상자 코드조회 및 결과 반환
     *  관련 테이블: user_account
     *  @params idString - 중복 검사할 id (string)
     *  @return 대상자 코드가 있을 경우 true, 아닌 경우 false
     *  @author JG, Jo
     *  @since 2021.05.25
     */
    async checkUserCode(codeString) {
        let result = await mysqlDB('selectOne', queryList.select_user_code_duplicate, [codeString]);
        result = (result.rowLength > 0) ? true : false;
        return result;
    }

    /**
     *  보호자, 독거노인 ID 매칭
     *  관련 테이블: user_info, user_protector
     *  @params userName : 독거노인 이름, bYear : 독거노인 생년, bMonth : 독거노인 생월, bDay : 독거노인 생일
     *  @return 모든 변수가 매칭되는 독거노인이 존재할 경우 보호자와 독거노인 매칭(insert)
     *  @author KG
     *  @since 2021.11.10
     */
    async userMatching(userName, bYear, bMonth, bDay, p_user_code) {
        let paramList = [userName, bYear, bMonth, bDay]

        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        for (let i = 0; i < paramList.length; i++) {
            paramList[i] = cryptoUtil.encrypt_aes(cryptoKey, paramList[i]);
        }

        let selectUser = await mysqlDB('selectOne', queryList.select_userMatching, paramList);

        if (selectUser.state == false) {
            return selectUser
        } else {
            let result = await mysqlDB('update', queryList.userMatching, [selectUser.row.user_code, p_user_code]);
            return result
        }

    }

}


module.exports = userService;