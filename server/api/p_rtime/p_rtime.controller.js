/** ================================================================
 *  b2g 실시간 앱 관리페이지 
 *  @author MiYeong Jang
 *  @since 2023.03.23.
 *  @history 
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./p_rtime.service');
const svInstance = new service();

class p_rtimeController {

    async p_rtimeload(req, res, next) {
        let userCode = req.params.userCode;
        let userlist = await svInstance.userList(userCode);
        return res.render('app/p_rtime/p_rtime', {
            "userCode": userCode,
            // "emergencyPage": req.__('emergencyPage'),
            'userList': JSON.stringify(userlist)
        });
    }

    //  유저리스트 조회
    async allUserList(req, res, next) {
        let userList = await svInstance.selectAllInfo();
        return res.json({
            "userList": userList
        })
    }




    // 관리 대상자 상세정보
    async selectInfo(req, res, next) {
        let usercode = req.body.userCode;
        let result = await svInstance.selectInfo(usercode);
        return res.json(result);
    }

    // 실시간 침대상태, 심박수 조회
    async selectRtime(req, res, next) {

        let { userCode, selectUserList } = req.query;

        let result = await svInstance.selectRtimeData(selectUserList);
        let ajaxData = {
            "adminuserCode": userCode,
            "rtimeData": JSON.stringify(result)
        };
        return res.send(ajaxData);
    };

}

module.exports = p_rtimeController;