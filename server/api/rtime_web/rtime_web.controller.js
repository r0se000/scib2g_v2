/** ================================================================
 *  실시간 모니터링 controller
 *  @author SY
 *  @since 2023.03.22
 *  @history 2023.03.22 최초 작성
 *           2023.03.23 관리 대상자 상세정보 조회
 *           2023.03.24 관리 대상자 특이사항 A/S 기능 추가
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./rtime_web.service');
const svInstance = new service();

class RtimeController {

    /** ================================================================
     *  실시간 모니터링 페이지 로드
     *  @author SY
     *  @since 2023.03.22
     *  @history 2023.03.22 최초 작성
     *  ================================================================
     */
    async loadRtimePage(req, res, next) {
        let { userCode } = req.params;
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.userList(userCode);
        let emCount = await svInstance.emCount();

        if (result.loginCheck == 'Y') {
            return res.render('web/rtime_web/rtime_web.html', {
                'title': "실시간 모니터링",
                'userCode': userCode,
                'userName': result.userName, // 관리자 이름
                'userList': JSON.stringify(userList), //관리 대상자 목록
                'emCount': emCount // 당일 모니터링 발생 건수
            });
        } else {
            return res.render('web/error/errPage');
        }
    };


    /** ================================================================
     *  웹 실시간 데이터 전송
     *  @author SY
     *  @since 2023.03.22
     *  @history 2023.03.22 최초 작성
     *  ================================================================
     */
    async selectRtime(req, res, next) {
        let { userCode, selectUserList } = req.query;
        let result = await svInstance.selectRtimeData(selectUserList);
        let ajaxData = {
            "adminuserCode": userCode,
            "rtimeData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };


    /** ================================================================
     *  연결 없음 관리 대상자 조회
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async selectUnconnectedData(req, res, next) {
        let { selectUserList } = req.query;
        let result = await svInstance.selectUnconnectedData(selectUserList);
        return res.send(result);
    };


    /** ================================================================
     *  관리 대상자 상세정보 조회
     *  @author SY
     *  @since 2023.03.23
     *  @history 2023.03.23 최초 작성
     *  ================================================================
     */
    async selectUserInfo(req, res, next) {
        let userCode = req.query.userCode;
        let result = await svInstance.selectUserInfo(userCode);
        console.log(result)
        return res.send(result);
    }


    /** ================================================================
     *  관리 대상자 특이사항 업데이트
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async updateUserNote(req, res, next) {
        let { userCode, noteDetail } = req.body;
        let result = await svInstance.updateUserNote(userCode, noteDetail);
        return res.send(result);
    }


    /** ================================================================
     *  관리 대상자 AS 조회
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async selectAS(req, res, next) {
        let { userCode } = req.body;
        let result = await svInstance.selectAS(userCode);
        return res.send(result);
    }


    /** ================================================================
     *  관리 대상자 AS 등록
     *  @author SY
     *  @since 2023.03.24
     *  @history 2023.03.24 최초 작성
     *  ================================================================
     */
    async insertAS(req, res, next) {
        let { userCode, asDetail, asDate } = req.body;
        let result = await svInstance.insertAS(userCode, asDetail, asDate);
        return res.send(result);
    }
}

module.exports = RtimeController;