/** ================================================================
 *  b2g 알림 앱 관리페이지 
 *  @author MiYeong Jang
 *  @since 2023.03.23.
 *  @history 
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./p_manage.service');
const svInstance = new service();

class p_manageController {

    async p_manageload(req, res, next) {
        let userCode = req.params.userCode;
        let userlist = await svInstance.userList(userCode);
        return res.render('app/p_manage/p_manage', {
            "userCode": userCode,
            'userList': JSON.stringify(userlist)
        });
    }

    // ====================================== 사용자 조회 ==========================================
    // 사용자 조회
    async p_manageUserList(req, res, next) {
        let { userCode, selectUserList } = req.query;
        let result = await svInstance.countEmergency(selectUserList);
        let userList = await svInstance.selectAllInfo();
        return res.json({
            "userList": userList,
            "rtimeData": JSON.stringify(result),
            "countEmergency": result
        })
    }

    // 관리 대상자 상세정보
    async selectInfo(req, res, next) {
        let usercode = req.body.userCode;
        let result = await svInstance.selectInfo(usercode);
        return res.json(result);
    }


    // ====================================== 모니터링 조회 ==========================================

    // 관리 대상자 상세정보
    async selectInfo_M(req, res, next) {
        let usercode = req.body.userCode;
        let result = await svInstance.selectInfo_M(usercode);
        return res.json(result);
    }

    // 날짜 조회
    async searchDate(req, res, next) {
        let result = await svInstance.selectDate(req.body.date1 + ' 00:00:00', req.body.date2 + " 23:59:59", req.body.userCode);
        return res.json(result);
    }

    // 이름 조회
    async searchName(req, res, next) {
        let result = await svInstance.selectName(req.body.name, req.body.userCode);
        return res.json(result);
    }

    // ========================================= AS 조회 ==================================================

    // AS 리스트 전체 조회
    async asList(req, res, next) {
        let userList = await svInstance.asList();
        return res.json({
            "userList": userList,
        })
    }

    // AS 기록 상세정보 조회
    async selectInfo_As(req, res, next) {
        let as_num = req.body.as_num;
        let result = await svInstance.selectInfo_As(as_num);
        return res.json(result);
    }

    // AS 기록 상세정보 조회
    async selectInfo_As_regi(req, res, next) {
        let user_code = req.body.userCode;
        let result = await svInstance.selectInfo_As_regi(user_code);
        return res.json(result);
    }

    // AS 내용 수정하기.
    async asModify(req, res, next) {
        let as_num = req.body.as_num;
        let text = req.body.text;
        let result = await svInstance.asModify(text, as_num);
        return res.json(result);

    }

    async asDelete(req, res, next) {
        let as_num = req.body.as_num;
        let result = await svInstance.asDelete(as_num);
        return res.json(result);

    }

    async asRegist(req, res, next) {
        let usercode = req.body.userCode;
        let text = req.body.text;
        let date = req.body.date;
        let result = await svInstance.asRegist(date, text, usercode);
        return res.json(result);

    }

}

module.exports = p_manageController;