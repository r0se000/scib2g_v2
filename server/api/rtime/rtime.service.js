/** ================================================================
 *  실시간 생체정보
 *  @author MiYeong Jang
 *  @since 2021.06.02.
 *  @history 2021.06.02. 최초작성
 *           
 *  ================================================================
 */

// DB connection
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./rtime.sql');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');

const redis = require("redis");
const client = redis.createClient();
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);

let ssec = 0,
    smin = 0,
    addressCode;

function getToday(getDate) {
    let nowMonth = (getDate.getMonth() + 1) >= 10 ? (getDate.getMonth() + 1) : '0' + (getDate.getMonth() + 1);
    let nowDay = getDate.getDate() >= 10 ? getDate.getDate() : '0' + getDate.getDate();

    let nowtime = getDate.getFullYear() + "-" + nowMonth + "-" + nowDay;
    return nowtime
}

function dateTest(ssec) {
    let syear = 2021,
        smonth = 6,
        sday = 3,
        shour = 17;
    let month = smonth >= 10 ? smonth : '0' + smonth,
        day = (sday >= 10 ? sday : '0' + sday),
        hours = shour < 10 ? "0" + shour : shour, // 시
        minutes = smin < 10 ? "0" + smin : smin; // 분
    if (ssec >= 60) {
        ssec = 0;
        smin += 1;
    }
    let seconds = ssec >= 10 ? ssec : "0" + ssec; // 초

    let exDate = syear + "-" + month + "-" + day + " " + hours + ':' + minutes + ':' + seconds;
    return exDate
}

function getCurTime(today) {
    let todayStr
    let month = (today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : '0' + (today.getMonth() + 1),
        day = (today.getDate() >= 10 ? today.getDate() : '0' + today.getDate()),
        hours = today.getHours() < 10 ? "0" + today.getHours() : today.getHours(), // 시
        sec = (today.getSeconds() - 10);
    let min = today.getMinutes()
    if (sec < 0) {
        min -= 1;
        sec += 60;
    }
    let minutes = min < 10 ? "0" + min : min; // 분
    let seconds = sec >= 10 ? sec : "0" + sec; // 초
    todayStr = today.getFullYear() + "-" + month + "-" + day + " " + hours + ':' + minutes + ':' + seconds;
    return todayStr
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
    /**
     *  보호자 앱용 대상자 이름 불러오기
     *  @param userCode - 관리자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async getUserName_P(userCode) {
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userName = await mysqlDB('selectOne', queryList.select_user_name_p, [userCode]);
        userName = cryptoUtil.decrypt_aes(cryptoKey, userName.row.name);
        return userName;
    };

    /**
     *  실시간 생체정보 불러오기 (앱)
     *  @param userCode - 사용자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async selectRtimeDataApp(userCode) {
        let bioData = new Array();
        let rtFlag = await getAsync(userCode);
        if (rtFlag != 0 && rtFlag != null) {
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "hr", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "rr", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "sv", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "hrv", 0, 4)));
            bioData.push(await stringToNumberInArray(await lrangeAsync(userCode + "ss", 0, 4)));

            bioData = transpose(bioData);
            bioData = bioData.reverse();
        } else {
            bioData = [
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1],
                [0, 0, 0, 0, -1]
            ];
        }
        return bioData;
    };
    /**
     *  센서 연결 정보 불러오기 (삭제금지)
     *  @param userCode - 사용자 코드 (String)
     *  @return 조회 결과 반환(json)
     *  @author MiYeong Jang
     *  @since 2021.06.02. 최초작성
     *  
     */
    async selectRtimeDataAlive(nodeId) {
        let bioData;
        console.log(nodeId);
        let rtFlag = await getAsync(nodeId);
        console.log(rtFlag)
        if (rtFlag != null) {
            bioData = 1;
        } else {
            bioData = 0;
        }
        return bioData;
    };






};

module.exports = RtimeService;