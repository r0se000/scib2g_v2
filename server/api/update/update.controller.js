/** ================================================================
 *  관리 대상자 정보 수정 controller
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 최초 작성
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./update.service.js');
const svInstance = new service();

class UpdateController {

    /** ================================================================
     *  관리 대상자 정보 수정 페이지 로드
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 최초 작성
     *  ================================================================
     */
    async loadRegPage(req, res, next) {
        let { userCode } = req.params;
        let userInfo = await svInstance.selectUserInfo(userCode);
        let result = await svInstance.loginCheck(userInfo.rows[0].staff_code);
        if (userInfo.rowLength > 0) {
            return res.render('web/update/update', {
                'title': '관리 대상자 정보 수정',
                'userInfo': JSON.stringify(userInfo),
                'user_code': req.params.userCode,
                'userCode': userInfo.rows[0].staff_code,
                'userName': result.userName
            });
        } else {
            return res.render('web/error/errPage');
        }
    };

    /** ================================================================
     *  관리 대상자 정보 수정
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 최초 작성
     *  ================================================================
     */
    async updateUserInfo(req, res, next) {
        let { userCode, inputList } = req.body;
        let result = await svInstance.updateUserInfo(userCode, inputList);
        return res.send(result);
    };

}
module.exports = UpdateController;