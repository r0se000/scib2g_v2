/** ================================================================
 *  관리 대상자 조회 controller
 *  @author SY
 *  @since 2023.03.28
 *  @history 2023.03.28 최초 작성
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./userList.service.js');
const svInstance = new service();


class userListController {

    /** ================================================================
     *  관리 대상자 페이지 로드
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async loadUserListPage(req, res, next) {
        let { userCode } = req.params;
        let result = await svInstance.loginCheck(userCode);
        let userList = await svInstance.userList(userCode);
        if (result.row.a_user_login_check == 'Y') {
            return res.render('web/userList/userList', {
                'title': '관리 대상자 조회',
                'userCode': req.params.userCode,
                'userName': result.row.a_user_name,
                'userList': JSON.stringify(userList)
            });
        } else {
            return res.render('web/error/errPage');
        }
    };


    /** ================================================================
     *  관리 대상자 상세 정보 조회
     *  @author SY
     *  @since 2023.03.28
     *  @history 2023.03.28 초기 작성
     *  ================================================================
     */
    async selectUserInfo(req, res, next) {
        let { userCode } = req.query;
        let userList = await svInstance.selectUserInfo(userCode);
        return res.json(userList);
    };


    /** ================================================================
     *  관리 대상자 이름 검색
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async searchName(req, res, next) {
        let { userCode, searchStr, serviceCheck } = req.body;
        let userList = await svInstance.searchName(userCode, searchStr, serviceCheck);
        return res.json(userList);
    };


    /** ================================================================
     *  서비스 종료된 관리 대상자 리스트 조회
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async endService(req, res, next) {
        let { userCode } = req.query;
        let userList = await svInstance.endService(userCode);
        return res.json(userList);
    };


    /** ================================================================
     *  서비스 종료 처리
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async userStatusN(req, res, next) {
        let { userCode } = req.body;
        let result = await svInstance.userStatusN(userCode);
        return res.json(result);
    };


    /** ================================================================
     *  서비스 재시작 처리
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async userStatusY(req, res, next) {
        let { userCode } = req.body;
        let result = await svInstance.userStatusY(userCode);
        return res.json(result);
    };


}

module.exports = userListController;