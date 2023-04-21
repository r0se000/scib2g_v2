/** ================================================================
 *  관리자 조회 페이지 Controller
 *  @author SY
 *  @since 2023.04.21
 *  @history 2023.04.21 최초 작성
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./adminList.service.js');
const svInstance = new service();

class AdminController {

    /** ================================================================
     *  관리자 조회 페이지 로드
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async loadAdminListPage(req, res, next) {
        let { userCode } = req.params;
        let result = await svInstance.loginCheck(userCode);
        let adminList = await svInstance.adminList();
        let emCount = await svInstance.emCount();
        console.log('아',result);
        if (result.loginCheck == 'Y' & result.addressCode=='9999') {
            return res.render('web/adminList/adminList', {
                'title': '관리자 조회',
                'accessToken': req.query.accessToken,
                'userCode': userCode,
                'userName': result.userName,
                'adminList': JSON.stringify(adminList),
                'emCount': emCount
            });
        } else {
            return res.render('web/error/errPage');
        }
    }

    /** ================================================================
     *  마스터 계정 체크
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async checkMaster(req, res, next) {
        let { adminCode } = req.body
        let result = await svInstance.checkMaster(adminCode);
        return res.json(result);
    };


    /** ================================================================
     *  관리 대상자 이름 검색
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async searchName(req, res, next) {
        let { searchStr } = req.body;
        let adminList = await svInstance.searchName(searchStr);
        return res.json(adminList);
    };


    /** ================================================================
     *  마스터 계정 변경
     *  @author SY
     *  @since 2023.04.21
     *  @history 2023.04.21 최초 작성
     *  ================================================================
     */
    async setMaster(req, res, next) {
        let { adminCode } = req.body
        let result = await svInstance.setMaster(adminCode);
        return res.json(result);
    };
}

module.exports = AdminController;