/** ================================================================
 *  메인화면 로드 시 필요한 로직 구현
 *  @author MiYeong Jang
 *  @since 2021.10.06
 *  @history 
 *  ================================================================
 */

// DB connection
const mysqlDB = require('../../config/db/database_mysql');
const queryList = require('./monitStat.sql');

// logger
const logger = require('../../config/loggerSettings');

// crypto
const cryptoUtil = require('../../public/javascripts/cryptoUtil');
const jwt = require("jsonwebtoken");

// lodash
const _ = require('lodash');

let date = new Date();
let year = date.getFullYear();
let addressCode
class graphService {

    async loginCheck(userCode) {
        let result = {};

        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let sqlResult = await mysqlDB('selectOne', queryList.loginCheck, [userCode]);
        result.loginCheck = sqlResult.row.a_user_login_check;
        addressCode = sqlResult.row.a_user_address1 + sqlResult.row.a_user_address2;
        if (addressCode == "9999") {
            addressCode = "%";
        } else {
            addressCode += "%";
        }
        let userName = cryptoUtil.decrypt_aes(cryptoKey, sqlResult.row.a_user_name);
        result.userName = userName;

        return result
    }

    async userList(userCode) {
        let result = {}

        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let userList = await mysqlDB('select', queryList.userList, [addressCode]);
        if (userList.rowLength != 0) {
            for (let i = 0; i < userList.rowLength; i++) {
                userList.rows[i].user_name = cryptoUtil.decrypt_aes(cryptoKey, userList.rows[i].user_name);
            }
            userList.rows.forEach(function(item, index) {
                result['user' + [index]] = item;
            });
        }
        return result
    }


    // 응급 발생 통계 Page
    async graphStatistics(userCode, today, week_start, week_end, month_start, month_end, year_start, year_end, trip_start, trip_end, selGen, selAge) {
        let result = {};
        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        let emergencyToday = await mysqlDB('select', queryList.emergencyToday, [today, today, selGen, addressCode]);
        let emergencyToweek = await mysqlDB('select', queryList.emergencyTodayRange, [week_start, week_end, selGen, addressCode]);
        let emergencyTomonth = await mysqlDB('select', queryList.emergencyTodayRange, [month_start, month_end, selGen, addressCode]);
        let emergencyToyear = await mysqlDB('select', queryList.emergencyTodayRange, [year_start, year_end, selGen, addressCode]);
        let emergencyAllCnt = await mysqlDB('select', queryList.emergencyAllCnt, [selGen, addressCode]);
        let emergencyDayOfWeek = await mysqlDB('select', queryList.emergencyDayOfWeek, [trip_start, trip_end, selGen, addressCode]);

        emergencyToday = emCntAgeClassify(emergencyToday, cryptoKey, selAge);
        emergencyToweek = emCntAgeClassify(emergencyToweek, cryptoKey, selAge);
        emergencyTomonth = emCntAgeClassify(emergencyTomonth, cryptoKey, selAge);
        emergencyToyear = emCntAgeClassify(emergencyToyear, cryptoKey, selAge);
        emergencyAllCnt = emCntAgeClassify(emergencyAllCnt, cryptoKey, selAge);
        emergencyDayOfWeek = emCntAgeClassify_DayOfWeek(emergencyDayOfWeek, cryptoKey, selAge);

        result['emergencyToday'] = emergencyToday.rows;
        result['emergencyToweek'] = emergencyToweek.rows;
        result['emergencyTomonth'] = emergencyTomonth.rows;
        result['emergencyToyear'] = emergencyToyear.rows;
        result['emergencyAllCnt'] = emergencyAllCnt.rows;
        result['emergencyDayOfWeek'] = emergencyDayOfWeek.rows;

        return result
    }

    // 응급 발생 통계 Page 그래프
    async graphData(userCode, trip_start, trip_end, selGen, selAge) {
        let result = {},
            ageGap, col_day;
        let sqlWhereDate = [trip_start, trip_end],
            sqlWhereGender = [selGen],
            sqlWhereAge = [selAge];

        let dateRange,
            graphData,
            graphDataGenderM, graphDataGenderW, graphDataAge, graphDataDayOfWeek;

        let graphDataClassify = { 'rows': [] },
            graphDataGenderMClassify = { 'rows': [] },
            graphDataGenderWClassify = { 'rows': [] },
            graphDataDayOfWeekClassify = { 'rows': [] },

            grapgDataAgeUnder = { 'rows': [] },
            grapgDataAgeSixty = { 'rows': [] },
            grapgDataAgeSeventy = { 'rows': [] },
            grapgDataAgeEighty = { 'rows': [] },
            grapgDataAgeNinety = { 'rows': [] },
            grapgDataAgeOver = { 'rows': [] };

        let date1 = new Date(trip_start.split('-')[0], trip_start.split('-')[1], trip_start.split('-')[2]);
        let date2 = new Date(trip_end.split('-')[0], trip_end.split('-')[1], trip_end.split('-')[2]);
        let elapsedMSec = date2.getTime() - date1.getTime();
        let elapsedDay = elapsedMSec / 1000 / 60 / 60 / 24;

        let cryptoKey = await mysqlDB('selectOne', queryList.select_key_string, []);
        cryptoKey = cryptoKey.row.key_string;

        if (elapsedDay <= 1) {
            graphData = await mysqlDB('select', queryList.graphData_HtoH, sqlWhereDate.concat([addressCode]));
            graphDataGenderM = await mysqlDB('select', queryList.graphDataGender_HtoH, sqlWhereDate.concat(['M', addressCode]));
            graphDataGenderW = await mysqlDB('select', queryList.graphDataGender_HtoH, sqlWhereDate.concat(['W', addressCode]));
            graphDataAge = await mysqlDB('select', queryList.graphDataAge_HtoH, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataDayOfWeek = await mysqlDB('select', queryList.graphDataDayOfWeek_HtoH, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
        } else if (elapsedDay <= 31) {
            dateRange = await mysqlDB('select', queryList.dateRange_DtoD, sqlWhereDate);
            graphData = await mysqlDB('select', queryList.graphData_DtoD, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataGenderM = await mysqlDB('select', queryList.graphDataGender_DtoD, sqlWhereDate.concat(['M', addressCode]));
            graphDataGenderW = await mysqlDB('select', queryList.graphDataGender_DtoD, sqlWhereDate.concat(['W', addressCode]));
            graphDataAge = await mysqlDB('select', queryList.graphDataAge_DtoD, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataDayOfWeek = await mysqlDB('select', queryList.graphDataDayOfWeek_DtoD, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
        } else if (elapsedDay <= 365) {
            dateRange = await mysqlDB('select', queryList.dateRange_MtoM, sqlWhereDate);
            graphData = await mysqlDB('select', queryList.graphData_MtoM, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataGenderM = await mysqlDB('select', queryList.graphDataGender_MtoM, sqlWhereDate.concat(['M', addressCode]));
            graphDataGenderW = await mysqlDB('select', queryList.graphDataGender_MtoM, sqlWhereDate.concat(['W', addressCode]));
            graphDataAge = await mysqlDB('select', queryList.graphDataAge_MtoM, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataDayOfWeek = await mysqlDB('select', queryList.graphDataDayOfWeek_MtoM, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
        } else {
            dateRange = await mysqlDB('select', queryList.dateRange_YtoY, sqlWhereDate);
            graphData = await mysqlDB('select', queryList.graphData_YtoY, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataGenderM = await mysqlDB('select', queryList.graphDataGender_YtoY, sqlWhereDate.concat(['M', addressCode]));
            graphDataGenderW = await mysqlDB('select', queryList.graphDataGender_YtoY, sqlWhereDate.concat(['W', addressCode]));
            graphDataAge = await mysqlDB('select', queryList.graphDataAge_YtoY, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
            graphDataDayOfWeek = await mysqlDB('select', queryList.graphDataDayOfWeek_YtoY, sqlWhereDate.concat(sqlWhereGender, [addressCode]));
        }
        try {
            col_day = String(Object.keys(graphData.rows[0])[1]);
        } catch (error) {
            col_day = 'dd';
        }

        for (let i = 0; i < graphDataAge.rowLength; i++) {
            let ageDecrypt = cryptoUtil.decrypt_aes(cryptoKey, graphDataAge.rows[i].user_age);

            ageGap = Number(year - ageDecrypt) + 1;
            graphDataAge.rows[i].user_age = ageGap;

            if (ageGap < 60) { // 60대 미만
                grapgDataAgeUnder.rows.push(graphDataAge.rows[i]);
            } else if (ageGap < 70) { // 60대
                grapgDataAgeSixty.rows.push(graphDataAge.rows[i]);
            } else if (ageGap < 80) { // 70대
                grapgDataAgeSeventy.rows.push(graphDataAge.rows[i]);
            } else if (ageGap < 90) { // 80대
                grapgDataAgeEighty.rows.push(graphDataAge.rows[i]);
            } else if (ageGap < 100) { // 90대
                grapgDataAgeNinety.rows.push(graphDataAge.rows[i]);
            } else if (ageGap >= 100) { // 100대 이상
                grapgDataAgeOver.rows.push(graphDataAge.rows[i]);
            }
        }

        // 날짜별, 나이대별로 Cnt 재조정
        graphData = classifyAge(graphData, graphDataClassify, selAge, col_day, cryptoKey);
        graphDataGenderM = classifyAge(graphDataGenderM, graphDataGenderMClassify, selAge, col_day, cryptoKey);
        graphDataGenderW = classifyAge(graphDataGenderW, graphDataGenderWClassify, selAge, col_day, cryptoKey);
        graphDataDayOfWeek = classifyAge_DayOfWeek(graphDataDayOfWeek, graphDataDayOfWeekClassify, selAge, 'dweek', cryptoKey);

        grapgDataAgeUnder = pushAgeData(grapgDataAgeUnder, col_day);
        grapgDataAgeSixty = pushAgeData(grapgDataAgeSixty, col_day);
        grapgDataAgeSeventy = pushAgeData(grapgDataAgeSeventy, col_day);
        grapgDataAgeEighty = pushAgeData(grapgDataAgeEighty, col_day);
        grapgDataAgeNinety = pushAgeData(grapgDataAgeNinety, col_day);
        grapgDataAgeOver = pushAgeData(grapgDataAgeOver, col_day);

        if (elapsedDay <= 1) {
            result['dateRange'] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        } else {
            result['dateRange'] = dateRange.rows;
        }
        result['graphData'] = graphData.rows;
        result['graphDataGenderM'] = graphDataGenderM.rows;
        result['graphDataGenderW'] = graphDataGenderW.rows;
        result['grapgDataAgeUnder'] = grapgDataAgeUnder.rows;
        result['grapgDataAgeSixty'] = grapgDataAgeSixty.rows;
        result['grapgDataAgeSeventy'] = grapgDataAgeSeventy.rows;
        result['grapgDataAgeEighty'] = grapgDataAgeEighty.rows;
        result['grapgDataAgeNinety'] = grapgDataAgeNinety.rows;
        result['grapgDataAgeOver'] = grapgDataAgeOver.rows;
        result['graphDataDayOfWeek'] = graphDataDayOfWeek.rows;

        return result
    }

}

//날짜 리스트 중복 제거 함수
function filterArr(Data, col_date) {
    let dateArr = [];
    for (let i = 0; i < Data.rows.length; i++) {
        dateArr.push(Data.rows[i][col_date]);
    }

    let filterdateArr = dateArr.filter((element, index) => {
        return dateArr.indexOf(element) === index;
    });
    return filterdateArr;
}

// 나이대별로 Cnt 합산 함수
function pushAgeData(Data, col_day) {
    let res = { 'rows': [] };

    if (Data == []) { return Data; } // Data값이 비어있으면

    let dateArr = filterArr(Data, 'date');
    let timeArr = filterArr(Data, col_day);

    for (let i = 0; i < dateArr.length; i++) {
        switch (col_day) {
            case 'dh':
                res.rows.push({ 'date': dateArr[i], 'dh': timeArr[i], 'cnt': 0 });
                break;
            case 'dd':
                res.rows.push({ 'date': dateArr[i], 'dd': timeArr[i], 'cnt': 0 });
                break;
            case 'dm':
                res.rows.push({ 'date': dateArr[i], 'dm': timeArr[i], 'cnt': 0 });
                break;
            case 'dy':
                res.rows.push({ 'date': dateArr[i], 'dy': timeArr[i], 'cnt': 0 });
                break;
            case 'dweek':
                res.rows.push({ 'date': dateArr[i], 'dweek': timeArr[i], 'cnt': 0 });
                break;
        }
    }

    for (let i = 0; i < Data.rows.length; i++) {
        for (let j = 0; j < dateArr.length; j++) {
            if (res.rows[j].date == Data.rows[i].date) {
                res.rows[j].cnt += Data.rows[i].cnt;
            }
        }
    }

    return res;
}

// OO별 응급발생 COUNT 데이터, 나이대별로 데이터 분류시키는 함수
function classifyAge(Data, List, ageTagId, cryptoKey) {
    let res = { 'rows': [{ 'emDate': 0 }] };

    for (let i = 0; i < Data.rowLength; i++) {
        let ageDecrypt = cryptoUtil.decrypt_aes(cryptoKey, Data.rows[i].user_age);

        ageGap = Number(year - ageDecrypt) + 1;
        Data.rows[i].user_age = ageGap;

        switch (ageTagId) {
            case 'none':
                res.rows[0].emDate += List.rows[i].emDate;
                break;
            case 'age-under':
                if (ageGap < 60) { // 60대 미만
                    res.rows[0].emDate += List.rows[i].emDate;
                }
                break;
            case 'age-sixty':
                if (ageGap >= 60 & ageGap < 70) { // 60대
                    res.rows[0].emDate += List.rows[i].emDate;
                }
                break;
            case 'age-seventy':
                if (ageGap >= 70 & ageGap < 80) { // 70대
                    res.rows[0].emDate += List.rows[i].emDate;
                }
                break;
            case 'age-eighty':
                if (ageGap >= 80 & ageGap < 90) { // 80대
                    res.rows[0].emDate += List.rows[i].emDate;
                }
                break;
            case 'age-ninety':
                if (ageGap >= 90 & ageGap < 100) { // 90대
                    res.rows[0].emDate += List.rows[i].emDate;
                }
                break;
            case 'age-over':
                if (ageGap >= 100) { // 100대 이상
                    res.rows[0].emDate += List.rows[i].emDate;
                }
                break;
        }
    }

    return res;
}

// 응급발생 건수 COUNT, 나이대별로 다시 Count하는 함수(기간별)
function emCntAgeClassify(Data, cryptoKey, selAge) {
    let res = { 'rows': [{ 'emDate': 0 }], 'rowLength': 0, 'state': true };
    if (Data.rows.length != 0) {
        for (let i = 0; i < Data.rows.length; i++) {

            let ageDecrypt = cryptoUtil.decrypt_aes(cryptoKey, Data.rows[i].user_age);

            let ageGap = Number(year - ageDecrypt) + 1;
            Data.rows[i].user_age = ageGap;

            switch (selAge) {
                case 'none':
                    res.rows[0].emDate += Data.rows[i].emDate;
                    break;
                case 'age-under':
                    if (ageGap < 60) { // 60대 미만
                        res.rows[0].emDate += Data.rows[i].emDate;
                    }
                    break;
                case 'age-sixty':
                    if (ageGap >= 60 & ageGap < 70) { // 60대
                        res.rows[0].emDate += Data.rows[i].emDate;
                    }
                    break;
                case 'age-seventy':
                    if (ageGap >= 70 & ageGap < 80) { // 70대
                        res.rows[0].emDate += Data.rows[i].emDate;
                    }
                    break;
                case 'age-eighty':
                    if (ageGap >= 80 & ageGap < 90) { // 80대
                        res.rows[0].emDate += Data.rows[i].emDate;
                    }
                    break;
                case 'age-ninety':
                    if (ageGap >= 90 & ageGap < 100) { // 90대
                        res.rows[0].emDate += Data.rows[i].emDate;
                    }
                    break;
                case 'age-over':
                    if (ageGap >= 100) { // 100대 이상
                        res.rows[0].emDate += Data.rows[i].emDate;
                    }
                    break;
            }
        }
    }

    res.rowLength = res.rows.length;

    return res;
}

// 응급발생 건수 COUNT, 나이대별로 다시 Count하는 함수(요일별)
function emCntAgeClassify_DayOfWeek(emergencyDayOfWeek, cryptoKey, selAge) {
    let res = {
        'rows': [{ 'emDate': 0, 'dweek': '월' },
            { 'emDate': 0, 'dweek': '화' },
            { 'emDate': 0, 'dweek': '수' },
            { 'emDate': 0, 'dweek': '목' },
            { 'emDate': 0, 'dweek': '금' },
            { 'emDate': 0, 'dweek': '토' },
            { 'emDate': 0, 'dweek': '일' }
        ]
    };

    for (let i = 0; i < emergencyDayOfWeek.rowLength; i++) {
        let ageDecrypt = cryptoUtil.decrypt_aes(cryptoKey, emergencyDayOfWeek.rows[i].user_age);

        let ageGap = Number(year - ageDecrypt) + 1;
        emergencyDayOfWeek.rows[i].user_age = ageGap;

        switch (selAge) {
            case 'none':
                res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                break;
            case 'age-under':
                if (ageGap < 60) { // 60대 미만
                    res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                    res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                    res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                    res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                    res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                    res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                    res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                }
                break;
            case 'age-sixty':
                if (ageGap >= 60 & ageGap < 70) { // 60대
                    res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                    res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                    res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                    res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                    res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                    res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                    res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                }
                break;
            case 'age-seventy':
                if (ageGap >= 70 & ageGap < 80) { // 70대
                    res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                    res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                    res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                    res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                    res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                    res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                    res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                }
                break;
            case 'age-eighty':
                if (ageGap >= 80 & ageGap < 90) { // 80대
                    res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                    res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                    res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                    res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                    res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                    res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                    res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                }
                break;
            case 'age-ninety':
                if (ageGap >= 90 & ageGap < 100) { // 90대
                    res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                    res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                    res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                    res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                    res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                    res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                    res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                }
                break;
            case 'age-over':
                if (ageGap >= 100) { // 100대 이상
                    res.rows[0].emDate = (emergencyDayOfWeek.rows[i].dweek == "월") ? res.rows[0].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[0].emDate;
                    res.rows[1].emDate = (emergencyDayOfWeek.rows[i].dweek == "화") ? res.rows[1].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[1].emDate;
                    res.rows[2].emDate = (emergencyDayOfWeek.rows[i].dweek == "수") ? res.rows[2].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[2].emDate;
                    res.rows[3].emDate = (emergencyDayOfWeek.rows[i].dweek == "목") ? res.rows[3].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[3].emDate;
                    res.rows[4].emDate = (emergencyDayOfWeek.rows[i].dweek == "금") ? res.rows[4].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[4].emDate;
                    res.rows[5].emDate = (emergencyDayOfWeek.rows[i].dweek == "토") ? res.rows[5].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[5].emDate;
                    res.rows[6].emDate = (emergencyDayOfWeek.rows[i].dweek == "일") ? res.rows[6].emDate + emergencyDayOfWeek.rows[i].emDate : res.rows[6].emDate;
                }
                break;
        }
    }

    return emergencyDayOfWeek = res;
}

// OO별 그래프 데이터, 나이대별로 데이터 분류시키는 함수(기간별)
function classifyAge(Data, List, ageTagId, col_day, cryptoKey) {
    let res;

    for (let i = 0; i < Data.rowLength; i++) {
        let ageDecrypt = cryptoUtil.decrypt_aes(cryptoKey, Data.rows[i].user_age);

        let ageGap = Number(year - ageDecrypt) + 1;
        Data.rows[i].user_age = ageGap;

        switch (ageTagId) {
            case 'none':
                List.rows.push(Data.rows[i]);
                break;
            case 'age-under':
                if (ageGap < 60) { // 60대 미만
                    List.rows.push(Data.rows[i]);
                }
                break;
            case 'age-sixty':
                if (ageGap >= 60 & ageGap < 70) { // 60대
                    List.rows.push(Data.rows[i]);
                }
                break;
            case 'age-seventy':
                if (ageGap >= 70 & ageGap < 80) { // 70대
                    List.rows.push(Data.rows[i]);
                }
                break;
            case 'age-eighty':
                if (ageGap >= 80 & ageGap < 90) { // 80대
                    List.rows.push(Data.rows[i]);
                }
                break;
            case 'age-ninety':
                if (ageGap >= 90 & ageGap < 100) { // 90대
                    List.rows.push(Data.rows[i]);
                }
                break;
            case 'age-over':
                if (ageGap >= 100) { // 100대 이상
                    List.rows.push(Data.rows[i]);
                }
                break;
        }
    }

    res = pushAgeData(List, col_day);


    return res;
}

// OO별 그래프 데이터, 나이대별로 데이터 분류시키는 함수(요일별)
function classifyAge_DayOfWeek(Data, List, ageTagId, col_day, cryptoKey) {
    let res = {
        'rows': [{ 'dweek': '월', 'cnt': 0 },
            { 'dweek': '화', 'cnt': 0 },
            { 'dweek': '수', 'cnt': 0 },
            { 'dweek': '목', 'cnt': 0 },
            { 'dweek': '금', 'cnt': 0 },
            { 'dweek': '토', 'cnt': 0 },
            { 'dweek': '일', 'cnt': 0 }
        ]
    };

    for (let i = 0; i < Data.rowLength; i++) {
        let ageDecrypt = cryptoUtil.decrypt_aes(cryptoKey, Data.rows[i].user_age);

        let ageGap = Number(year - ageDecrypt) + 1;
        Data.rows[i].user_age = ageGap;

        switch (ageTagId) {
            case 'none':
                res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                break;
            case 'age-under':
                if (ageGap < 60) { // 60대 미만
                    res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                    res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                    res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                    res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                    res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                    res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                    res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                }
                break;
            case 'age-sixty':
                if (ageGap >= 60 & ageGap < 70) { // 60대
                    res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                    res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                    res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                    res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                    res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                    res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                    res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                }
                break;
            case 'age-seventy':
                if (ageGap >= 70 & ageGap < 80) { // 70대
                    res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                    res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                    res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                    res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                    res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                    res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                    res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                }
                break;
            case 'age-eighty':
                if (ageGap >= 80 & ageGap < 90) { // 80대
                    res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                    res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                    res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                    res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                    res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                    res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                    res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                }
                break;
            case 'age-ninety':
                if (ageGap >= 90 & ageGap < 100) { // 90대
                    res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                    res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                    res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                    res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                    res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                    res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                    res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                }
                break;
            case 'age-over':
                if (ageGap >= 100) { // 100대 이상
                    res.rows[0].cnt = (Data.rows[i].dweek == "월") ? res.rows[0].cnt + Data.rows[i].cnt : res.rows[0].cnt;
                    res.rows[1].cnt = (Data.rows[i].dweek == "화") ? res.rows[1].cnt + Data.rows[i].cnt : res.rows[1].cnt;
                    res.rows[2].cnt = (Data.rows[i].dweek == "수") ? res.rows[2].cnt + Data.rows[i].cnt : res.rows[2].cnt;
                    res.rows[3].cnt = (Data.rows[i].dweek == "목") ? res.rows[3].cnt + Data.rows[i].cnt : res.rows[3].cnt;
                    res.rows[4].cnt = (Data.rows[i].dweek == "금") ? res.rows[4].cnt + Data.rows[i].cnt : res.rows[4].cnt;
                    res.rows[5].cnt = (Data.rows[i].dweek == "토") ? res.rows[5].cnt + Data.rows[i].cnt : res.rows[5].cnt;
                    res.rows[6].cnt = (Data.rows[i].dweek == "일") ? res.rows[6].cnt + Data.rows[i].cnt : res.rows[6].cnt;
                }
                break;
        }
    }
    return res;
}



module.exports = graphService;