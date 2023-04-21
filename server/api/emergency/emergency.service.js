/** ================================================================
 *  응급 판별
 *  @author MiYeong Jang
 *  @since 2021.10.12
 *  @history 2021.10.12 최초작성 
 *           2023.03.30 b2g_v2 db변경에 따른 코드 수정
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./emergency.sql');
const admin = require('firebase-admin');
// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

function setDateTime(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let nowhours = getDate.getHours() >= 10 ? getDate.getHours() : '0' + getDate.getHours();
    let nowMinutes = getDate.getMinutes() >= 10 ? getDate.getMinutes() : '0' + getDate.getMinutes();
    let nowSec = getDate.getSeconds() >= 10 ? getDate.getSeconds() : '0' + getDate.getSeconds();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay + " " + nowhours + ':' + nowMinutes + ':' + nowSec;

    getDate.setMinutes(nowMinutes - 3)
    let beforeMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let beforeDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();
    let beformeHours = getDate.getHours() >= 10 ? getDate.getHours() : '0' + getDate.getHours();
    let beformMinutes = getDate.getMinutes() >= 10 ? getDate.getMinutes() : '0' + getDate.getMinutes();
    let beforeSec = getDate.getSeconds() >= 10 ? getDate.getSeconds() : '0' + getDate.getSeconds();
    let beforeTime = getDate.getFullYear() + "-" + beforeMonth + "-" + beforeDay + " " + beformeHours + ':' + beformMinutes + ':' + beforeSec;

    let timeArray = [beforeTime, nowtime]
    return timeArray
}
let addressCode
class emergencyService {
    /**
     *  응급 정보 로드
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.20. 최초작성
     *  
     */
    async selectEm(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        let selectAddress = await mysqlDB('selectOne', queryList.select_addressCode, [userCode])
        addressCode = selectAddress.row.a_user_address1 + selectAddress.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        let result = {}
        let staffInfo
        let emergencyid = [],
            emergencyUserCode = [],
            emergencyUserInfo = [],
            emUserBioInfo = []
        let emergencyCheck = await mysqlDB('select', queryList.emergencyCheck, [addressCode])
        if (emergencyCheck.rowLength != 0) {
            for (let i = 0; i < emergencyCheck.rowLength; i++) {
                let userInfo = await mysqlDB('selectOne', queryList.userList, [emergencyCheck.rows[i].user_code])
                let create = setDateTime(new Date(emergencyCheck.rows[i].emergency_time));

                userInfo.row.name = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.name);
                userInfo.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_year);
                userInfo.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_month);
                userInfo.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_date);
                userInfo.row.address_2 = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.address_2);
                userInfo.row.address_3 = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.address_3);
                if (userInfo.row.phone_first != null)
                    userInfo.row.phone_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_first);
                else { userInfo.row.phone_first = '-' }
                if (userInfo.row.phone_middle != null)
                    userInfo.row.phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_middle);
                else { userInfo.row.phone_middle = '-' }
                if (userInfo.row.phone_last != null)
                    userInfo.row.phone_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_last);
                else { userInfo.row.phone_last = '-' }
                if (userInfo.row.protector_phone_first != null)
                    userInfo.row.protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_first);
                else { userInfo.row.protector_phone_first = '-' }
                if (userInfo.row.protector_phone_middle != null)
                    userInfo.row.protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_middle);
                else { userInfo.row.protector_phone_middle = '-' }
                if (userInfo.row.protector_phone_last != null)
                    userInfo.row.protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_last);
                else { userInfo.row.protector_phone_last = '-' }

                staffInfo = await mysqlDB('selectOne', queryList.selectStaffInfo, [userInfo.row.staff_code]);
                staffInfo.row.a_user_name = cryptoUtil.decrypt_aes(cryptoKey, staffInfo.row.a_user_name);
                let emUserBioInfo = await mysqlDB('select', queryList.selectEmBioInfo, [emergencyCheck.rows[i].user_code, create[0], create[1], emergencyCheck.rows[i].user_code, create[0], create[1]])

                for (let i = 0; i < emUserBioInfo.rowLength; i++) {
                    emUserBioInfo.rows[i].hr = cryptoUtil.decrypt_aes(cryptoKey, emUserBioInfo.rows[i].hr);
                    emUserBioInfo.rows[i].rr = cryptoUtil.decrypt_aes(cryptoKey, emUserBioInfo.rows[i].rr);
                }
                userInfo = {
                    "user_name": userInfo.row.name,
                    "user_birth": userInfo.row.birth_year + "-" + userInfo.row.birth_month + "-" + userInfo.row.birth_date,
                    "address_1": userInfo.row.address_1,
                    "address_2": userInfo.row.address_2 + " " + userInfo.row.address_3,
                    "user_phone": userInfo.row.phone_first + "-" + userInfo.row.phone_middle + "-" + userInfo.row.phone_last,
                    "protector_phone": userInfo.row.protector_phone_first + "-" + userInfo.row.protector_phone_middle + "-" + userInfo.row.protector_phone_last,
                    "staff_name": staffInfo.row.a_user_name,
                    "gender": userInfo.row.gender,
                    "emBioInfo": emUserBioInfo
                }
                emergencyid.push(emergencyCheck.rows[i]);
                emergencyUserCode.push(emergencyCheck.rows[i].user_code);
                emergencyUserInfo.push(userInfo);
            }
        }
        result["emergency_id"] = emergencyid
        result["emergency_user"] = emergencyUserCode;
        result["emergency_userInfo"] = emergencyUserInfo;
        return result
    };



    /**
     *  조치사항 미입력 목록 불러오기
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.21. 최초작성
     *  
     */
    async selectCheckList(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let checkList = await mysqlDB('select', queryList.selectCheckList, [userCode]);
        if (checkList.rowLength != 0) {
            for (let i = 0; i < checkList.rowLength; i++) {
                checkList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].name);
                checkList.rows[i].birth_year = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].birth_year);
                checkList.rows[i].birth_month = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].birth_month);
                checkList.rows[i].birth_date = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].birth_date);
                if (checkList.rows[i].phone_first != null)
                    checkList.rows[i].phone_first = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].phone_first);
                else { checkList.rows[i].phone_first = '-' }
                if (checkList.rows[i].phone_middle != null)
                    checkList.rows[i].phone_middle = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].phone_middle);
                else { checkList.rows[i].phone_middle = '-' }
                if (checkList.rows[i].phone_last != null)
                    checkList.rows[i].phone_last = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].phone_last);
                else { checkList.rows[i].phone_last = '-' }
                if (checkList.rows[i].protector_phone_first != null)
                    checkList.rows[i].protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].protector_phone_first);
                else { checkList.rows[i].protector_phone_first = '-' }
                if (checkList.rows[i].protector_phone_middle != null)
                    checkList.rows[i].protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].protector_phone_middle);
                else { checkList.rows[i].protector_phone_middle = '-' }
                if (checkList.rows[i].protector_phone_last != null)
                    checkList.rows[i].protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, checkList.rows[i].protector_phone_last);
                else { checkList.rows[i].protector_phone_last = '-' }
            }
        }
        return checkList.rows
    }



    /**
     *  응급판별 사용자 목록 불러오기
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.12. 최초작성
     *  
     */
    async selectUserList(userCode) {
        let result = [],
            userList;
        // let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        // cryptoKey = cryptoKey.row.key_string;

        userList = await mysqlDB('select', queryList.selectUserList, [addressCode]);

        for (let i = 0; i < userList.rowLength; i++) {
            result.push(userList.rows[i].user_code)
        }
        return result
    };


    /**
     *  응급체크
     *  @param userList - 관리대상자 코드 목록 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.12. 최초작성
     *  
     */
    async emergencyCheck(userList, userCode) {
        let result = {}
        let emergencyUser = [],
            emergencyTime = [],
            selectStaffCode,
            emergencyNull = 0 //처리되지 않은 응급 여부 확인
        let time = setDateTime(new Date());

        console.log(userList)
        if (userList) {
            for (let i = 0; i < userList.length; i++) {
                console.log(userList[i])
                    //사용자 목록 중에 처리되지않은 응급이 있는지 확인
                let emergencyClearCheck = await mysqlDB('select', queryList.emergencyClearCheck, [userList[i]]);
                console.log(emergencyClearCheck)
                    //처리되지 않은 응급 중 응급 확인 시간과 응급 조치내용이 없다면 응급으로 판별 x
                if (emergencyClearCheck.rowLength != 0) {
                    console.log("emergency Not Null");
                    emergencyNull += 1;
                    continue;
                }
                //처리되지않은 응급이 없다면 응급으로 판별 후 응급테이블에 응급상황 저장.
                else {
                    console.log("emergency NULL")
                    let emergencyCount = await mysqlDB('selectOne', queryList.emergencyCount, [userList[i], "Kw==", time[0], time[1]]);
                    let emCount = emergencyCount.row.emergencyCount;
                    console.log(emCount)
                    if (emCount >= 170) {
                        selectStaffCode = await mysqlDB('selectOne', queryList.selectStaffCode, [userList[i]])
                        let emergencyInstert = await mysqlDB('insert', queryList.emergencyInsert, [userList[i], selectStaffCode.row.staff_code, time[1]]);
                        emergencyUser.push(userList[i]);
                        emergencyTime.push(time[1]);
                        emergencyNull += 1;
                    } else {
                        continue;
                    }
                }
            }
        }
        if (emergencyNull == 0)
            result["emergencyNull"] = 'Y';
        else result["emergencyNull"] = 'N';
        result["emergencyUser"] = emergencyUser;
        result["emergencyTime"] = emergencyTime;
        return result
    };

    /**
     *  응급 알림
     *  @param userList - 관리대상자 코드 목록 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.12. 최초작성
     *  
     */
    async emergencyAlert(userList) {
        let result = {}
        let staffInfo
        let emergency = [],
            emergencyUserCode = [],
            emergencyUserInfo = [];
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        for (let i = 0; i < userList.length; i++) {
            //emergency_list테이블에서 응급 발생 건이 있는지 확인 후 emergency_code를 가져온다
            let emergencyClearCheck = await mysqlDB('select', queryList.emergencyClearCheck, [userList[i]])
                //응급 발생 건이 있다면 발생 내용 저장
            if (emergencyClearCheck.rowLength != 0) {
                let create = setDateTime(new Date(emergencyClearCheck.rows[0].emergency_time)); //응급 발생 시간. 응급 발생 당시 생체정보 불러오기 위함
                let userInfo = await mysqlDB('selectOne', queryList.userList, [userList[i]])

                userInfo.row.name = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.name);
                userInfo.row.birth_year = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_year);
                userInfo.row.birth_month = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_month);
                userInfo.row.birth_date = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.birth_date);
                userInfo.row.address_2 = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.address_2);
                userInfo.row.address_3 = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.address_3);
                if (userInfo.row.phone_first != null)
                    userInfo.row.phone_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_first);
                else { userInfo.row.phone_first = '-' }
                if (userInfo.row.phone_middle != null)
                    userInfo.row.phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_middle);
                else { userInfo.row.phone_middle = '-' }
                if (userInfo.row.phone_last != null)
                    userInfo.row.phone_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.phone_last);
                else { userInfo.row.phone_last = '-' }
                if (userInfo.row.protector_phone_first != null)
                    userInfo.row.protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_first);
                else { userInfo.row.protector_phone_first = '-' }
                if (userInfo.row.protector_phone_middle != null)
                    userInfo.row.protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_middle);
                else { userInfo.row.protector_phone_middle = '-' }
                if (userInfo.row.protector_phone_last != null)
                    userInfo.row.protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, userInfo.row.protector_phone_last);
                else { userInfo.row.protector_phone_last = '-' }

                //담당자정보
                staffInfo = await mysqlDB('selectOne', queryList.selectStaffInfo, [userInfo.row.staff_code])
                staffInfo.row.a_user_name = cryptoUtil.decrypt_aes(cryptoKey, staffInfo.row.a_user_name);

                let emUserBioInfo = await mysqlDB('select', queryList.selectEmBioInfo, [emergencyClearCheck.rows[0].user_code, create[0], create[1], emergencyClearCheck.rows[0].user_code, create[0], create[1]])
                for (let i = 0; i < emUserBioInfo.rowLength; i++) {
                    emUserBioInfo.rows[i].hr = cryptoUtil.decrypt_aes(cryptoKey, emUserBioInfo.rows[i].hr);
                    emUserBioInfo.rows[i].rr = cryptoUtil.decrypt_aes(cryptoKey, emUserBioInfo.rows[i].rr);
                }
                userInfo = {
                    "user_name": userInfo.row.name,
                    "user_birth": userInfo.row.birth_year + "-" + userInfo.row.birth_month + "-" + userInfo.row.birth_date,
                    "address_1": userInfo.row.address_1,
                    "address_2": userInfo.row.address_2 + " " + userInfo.row.address_3,
                    "user_phone": userInfo.row.phone_first + "-" + userInfo.row.phone_middle + "-" + userInfo.row.phone_last,
                    "protector_phone": userInfo.row.protector_phone_first + "-" + userInfo.row.protector_phone_middle + "-" + userInfo.row.protector_phone_last,
                    "staff_name": staffInfo.row.a_user_name,
                    "gender": userInfo.row.gender,
                    "emBioInfo": emUserBioInfo
                }
                emergency.push(emergencyClearCheck.rows[0]);
                emergencyUserCode.push(emergencyClearCheck.rows[0].user_code);
                emergencyUserInfo.push(userInfo);
            }
            continue;
        }
        result["emergency_id"] = emergency
        result["emergency_user"] = emergencyUserCode;
        result["emergency_userInfo"] = emergencyUserInfo;
        result["time"] = new Date();


        return result
    };

    /**
     *  알림 토큰 가져온 뒤 알림 보내기
     *  @param userCode - 응급 발생자 코드
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.12. 최초작성
     *  
     */

    async selectAppToken(userList) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userNameList = [];
        //보호자 앱 토큰
        let protector_info
        for (let i = 0; i < userList.length; i++) {
            protector_info = await mysqlDB('select', queryList.selectProtectorInfo, [userList[i]]);
            if (protector_info.rowLength != 0) {
                protector_info.rows.forEach(function(item, index) {
                    item.name = cryptoUtil.decrypt_aes(cryptoKey, item.name);
                    userNameList.push(item.name)
                    if (item.p_app_token != null) {
                        //보호자 알림
                        let target_token = item.p_app_token,
                            message = {
                                "token": target_token,
                                "notification": {
                                    "title": '응급상황 발생',
                                    "body": item.name + '님 응급상황 발생'
                                },
                                "data": {
                                    "title": '응급상황 발생',
                                    "body": item.name + '님 응급상황 발생'
                                },
                                "android": {
                                    "priority": "high"
                                }
                            }

                        admin.app('protector').messaging()
                            .send(message)
                            .then(function(response) {
                                console.log('Successfully sent Protector message: : ', response)
                            })
                            .catch(function(err) {
                                console.log('Error Sending Protector message!!! : ', err)
                            });
                        //보호자 알림
                    }
                })
            }
        }
        //공무원 전체 앱 토큰
        let staffToken = await mysqlDB('select', queryList.staffAppToken, []); //공무원 토큰 전체 불러오기
        for (let j = 0; j < staffToken.rowLength; j++) {
            if (staffToken.rows[j].a_user_app_token != null) {
                for (let k = 0; k < userList.length; k++) {
                    let userName = await mysqlDB('selectOne', queryList.userList, [userList[k]])
                    let userAddress = userName.row.user_code.slice(0, 4)
                    let name = cryptoUtil.decrypt_aes(cryptoKey, userName.row.name);
                    //담당자 알림
                    if ((staffToken.rows[j].a_user_address1 == userAddress.slice(0, 2) & staffToken.rows[j].a_user_address2 == userAddress.slice(2, 4) || staffToken.rows[j].a_user_address1 == "99")) {
                        let staff_token = staffToken.rows[j].a_user_app_token,
                            staffmessage = {
                                "token": staff_token,
                                "notification": {
                                    "title": '응급상황 발생',
                                    "body": name + '님 응급상황 발생'
                                },
                                "data": {
                                    "title": '응급상황 발생',
                                    "body": name + '님 응급상황 발생'
                                },
                                "android": {
                                    "priority": "high"
                                }
                            }
                        admin.app('staff').messaging()
                            .send(staffmessage)
                            .then(function(response) {
                                console.log('Successfully sent Staff message: : ', response)
                            })
                            .catch(function(err) {
                                console.log('Error Sending Staff message!!! : ', err)
                            });
                    }
                }
                //담당자 알림
            }
        }
    }

    /**
     *  응급 확인
     *  @param emCode - 응급코드
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.12. 최초작성
     *  
     */
    async emergencyCheckWeb(emCode) {
        let updateEmList, deleteEmList, result
        let selectEmList = await mysqlDB('selectOne', queryList.selectEmList, [emCode]);
        if (selectEmList.rowLength != 0) {
            let now = setDateTime(new Date());
            updateEmList = await mysqlDB('update', queryList.updateEmList, [now[1], emCode])
                // deleteEmList = await mysqlDB('delete', queryList.deleteEmList, [emCode])
            result = 1
        } else {
            result = 0
        }
        return result
    };

    /**
     *  응급 조치 작성
     *  @param emCode - 응급코드
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.10.21. 최초작성
     *  
     */
    async emContentsInput(emCode, emCheckContents) {
        let now = setDateTime(new Date())
        let emContentsInput = await mysqlDB('update', queryList.insertEmContents, [now[1], emCheckContents, emCode]);

        return emContentsInput
    }
}
module.exports = emergencyService;