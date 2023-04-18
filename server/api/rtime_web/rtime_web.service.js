/** ================================================================
 *  실시간 모니터링 service
 *  @author SY
 *  @since 2023.03.22
 *  @history 2023.03.22 최초 작성
 *           2023.04.05 emCount 함수 작성 
 *  ================================================================
 */

// DB connection
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./rtime_web.sql');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

const redis = require("redis");
const client = redis.createClient();
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);

let addressCode; //관리자 지역코드


function getToday(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay;
    return nowtime
}


function stringToNumberInArray(dataList) {
    let conversionDataList = new Array();
    for (let data in dataList) {
        conversionDataList.push(Number(dataList[data]));
    }
    return conversionDataList;
}

function transpose(a) {

    // Calculate the width and height of the Array
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) { return []; }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];

    // Loop through every item in the outer array (height)
    for (i = 0; i < h; i++) {

        // Insert a new row (array)
        t[i] = [];

        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {

            // Save transposed data.
            t[i][j] = a[j][i];
        }
    }

    return t;
}


class RtimeService {

    /** ================================================================
     *  실시간 모니터링 페이지 로드
     *  @author SY
     *  @since 2023.03.22
     *  @history 2023.03.22 최초 작성        
     *  ================================================================
     */
    async loginCheck(userCode) {
        let result = {};
        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        result.userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.loginCheck = sqlResult.row.a_user_login_check;

        addressCode = sqlResult.row.a_user_address1 + sqlResult.row.a_user_address2; // 관리자 지역코드 설정
        if (addressCode == "9999") { //마스터 계정
            addressCode = "%";
        } else {
            addressCode += "%";
        }

        return result
    };


    /** ================================================================
     *  관리 대상자 불러오기
     *  @author SY
     *  @since 2023.03.22
     *  @history 2023.03.22 최초 작성
     *           2023.03.30 특이사항 줄바꿈(\n) 공백으로 치환
     *  ================================================================
     */
    async userList(userCode) {
        let result = {},
            userList
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;
        userList = await mysqlDB('select', queryList.select_user_name, [addressCode])

        for (let i = 0; i < userList.rowLength; i++) {

            userList.rows[i].name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].name);
            if (userList.rows[i].user_note == null) {
                userList.rows[i].user_note = '-';
            } else {
                userList.rows[i].user_note = userList.rows[i].user_note.replace(/\n/g, ' '); // 줄바꿈 공백으로 치환 2023.03.30
            }
        }
        if (userList.rowLength != 0) {
            userList.rows.forEach(function(item, index) {
                result['user' + [index]] = item;
            });
        }

        return result;
    };


    /**
     *  실시간 생체정보 불러오기 (웹)
     *  @return 조회 결과 반환(json)
     *  @author SY
     *  @since 2023.03.22
     *  @history 2023.03.22 최초 작성
     *           2023.04.07 selectUserList undefined 조건문 추가
     *  
     */
    async selectRtimeData(selectUserList) {
        let sendData = {};
        if (selectUserList != undefined) {
            for (let i = 0; i < selectUserList.length; i++) {
                let bioData = new Array();
                let rtFlag = await getAsync(selectUserList[i]); //userCode List
                if (rtFlag != 0 && rtFlag != null) { // Redis DB에 usercode 존재하는 경우
                    bioData.push(await stringToNumberInArray(await lrangeAsync(selectUserList[i] + "hr", 0, 4)));
                    // bioData.push(await stringToNumberInArray(await lrangeAsync(selectUserList[i] + "rr", 0, 4)));
                    // bioData.push(await stringToNumberInArray(await lrangeAsync(selectUserList[i] + "sv", 0, 4)));
                    // bioData.push(await stringToNumberInArray(await lrangeAsync(selectUserList[i] + "hrv", 0, 4)));
                    bioData.push(await stringToNumberInArray(await lrangeAsync(selectUserList[i] + "state", 0, 4)));

                    bioData = transpose(bioData); //행, 열 전치(각 속성끼리 한 배열에 묶어주기)
                    bioData = bioData.reverse(); // 역순 정렬
                } else { //// Redis DB에 selectUserList 존재하지 않는 경우 : 연결 없음
                    bioData = [
                        [0, -1],
                        [0, -1],
                        [0, -1],
                        [0, -1],
                        [0, -1]
                    ];
                }
                sendData[selectUserList[i]] = bioData;
            }
        }

        return sendData;
    };

    // 당일 모니터링 발생 건수
    async emCount() {
        let emCount;
        emCount = await mysqlDB('selectOne', queryList.Today_emergencyCount, [getToday(new Date()) + "%", addressCode]);
        let result = emCount.row.cnt;
        return result
    }


    /** ================================================================
     *  연결 없음 관리 대상자 조회
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *           2023.04.10 userList undefined 조건문 추가
     *  ================================================================
     */
    async selectUnconnectedData(userList) {
        let cnt = 0;
        let sendData = [];
        if (userList != undefined) {
            for (let i = 0; i < userList.length; i++) {
                let bioData = new Array();
                let rtFlag = await getAsync(userList[i]); //userCode List
                if (rtFlag != 0 && rtFlag != null) { // Redis DB에 usercode 존재하는 경우
                    bioData = await stringToNumberInArray(await lrangeAsync(userList[i] + "state", 0, 0));
                } else { //// Redis DB에 usercode 존재하지 않는 경우 : 연결 없음
                    bioData = -1;
                }
                if (bioData == -1) {
                    sendData[cnt++] = userList[i];
                }
            }
        }

        return sendData;
    };

    /** ================================================================
     *  관리 대상자 상세정보 조회
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async selectUserInfo(userCode) {
        let selectResult = await mysqlDB('select', queryList.select_user_info, [userCode]);
        let recentDate = await mysqlDB('select', queryList.select_user_recent_data, [userCode, userCode]); // 최근 들어온 생체정보 데이터

        if (selectResult.rowLength == 1 && recentDate.rowLength == 1) {
            let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
            cryptoKey = cryptoKey.row.key_string;

            selectResult.rows[0].name = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].name);
            selectResult.rows[0].birth_year = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].birth_year);
            selectResult.rows[0].birth_month = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].birth_month);
            selectResult.rows[0].birth_date = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].birth_date);
            selectResult.rows[0].address_1 = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].address_1);
            selectResult.rows[0].address_2 = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].address_2);
            selectResult.rows[0].address_3 = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].address_3);
            selectResult.rows[0].phone_first = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].phone_first);
            selectResult.rows[0].phone_middle = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].phone_middle);
            selectResult.rows[0].phone_last = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].phone_last);
            selectResult.rows[0].protector_phone_first = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].protector_phone_first);
            selectResult.rows[0].protector_phone_middle = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].protector_phone_middle);
            selectResult.rows[0].protector_phone_last = cryptoUtil.decrypt_aes(cryptoKey, selectResult.rows[0].protector_phone_last);

            if (selectResult.rows[0].gender == 'M') {
                selectResult.rows[0].gender = '남성';
            } else {
                selectResult.rows[0].gender = '여성';
            }
            if (selectResult.rows[0].note_created_date == null) { // 관리 대상자 특이사항 작성날짜 null일 때
                selectResult.rows[0].note_created_date = '-'
            }
            if (selectResult.rows[0].user_note == null) { // 관리 대상자 특이사항 작성날짜 null일 때
                selectResult.rows[0].user_note = '-'
            }
            selectResult.rows[0].recentDate = recentDate.rows[0].created_time; // 최근 들어온 생체정보 데이터

            selectResult.success = true;
        } else {
            selectResult.success = false;
        }
        return selectResult;
    }

    /** ================================================================
     *  관리 대상자 특이사항 업데이트
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async updateUserNote(userCode, noteDetail) {
        let selectResult = await mysqlDB('update', queryList.update_user_note, [noteDetail, userCode]);
        return selectResult;
    };


    /** ================================================================
     *  관리 대상자 AS 조회
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async selectAS(userCode) {
        let selectResult = await mysqlDB('select', queryList.select_user_as, [userCode]);
        return selectResult;
    }


    /** ================================================================
     *  관리 대상자 AS 등록
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async insertAS(userCode, asDetail, asDate) {
        let insertResult = await mysqlDB('insert', queryList.insert_user_as, [asDetail, asDate, userCode]);
        return insertResult;
    }
};

module.exports = RtimeService;