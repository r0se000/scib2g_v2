/** ================================================================
 *  A/S 조회 페이지 contoroller
 *  @author SY
 *  @since 2023.03.29
 *  @history 2023.03.29 최초 작성
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./asList.service.js');
const svInstance = new service();

class AsListController {

    /** ================================================================
     *  A/S 조회 페이지 로드
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 최초 작성
     *  ================================================================
     */
    async loadAsListPage(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.loginCheck(userCode);
        let asList = await svInstance.selectASList(userCode);
        if (result.row.a_user_login_check == 'Y') {
            return res.render('web/asList/asList', {
                'title': 'A/S 조회',
                'userCode': req.params.userCode,
                'userName': result.row.a_user_name,
                'asList': JSON.stringify(asList)
            });
        } else {
            return res.render('web/error/errPage');
        }
    };


    /** ================================================================
     *  A/S 조회
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async selectAS(req, res, next) {
        let { asNum } = req.body;
        let result = await svInstance.selectAS(asNum);
        return res.json(result);
    };


    /** ================================================================
     *  관리 대상자 조회
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async selectUser(req, res, next) {
        let { userCode } = req.body;
        let userList = await svInstance.selectUser(userCode);
        return res.json(userList);
    };


    /** ================================================================
     *  관리 대상자 이름 검색
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
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
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async endService(req, res, next) {
        let { userCode } = req.body;
        let asList = await svInstance.endService(userCode);
        return res.json(asList);
    };


    /** ================================================================
     *  A/S 등록
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async uploadAS(req, res, next) {
        let result = await svInstance.uploadAS(req.body);
        return res.json(result);
    };


    /** ================================================================
     *  A/S 등록_사용자 검색
     *  @author SY
     *  @since 2023.04.04
     *  @history 2023.04.04 초기 작성
     *  ================================================================
     */
    async searchUser(req, res, next) {
        let userCode = req.body.userCode,
            searchStr = req.body.searchStr;

        let result = await svInstance.searchUser(userCode, searchStr);
        return res.json(result);
    };


    /** ================================================================
     *  A/S 수정
     *  @author SY
     *  @since 2023.03.29
     *  @history 2023.03.29 초기 작성
     *  ================================================================
     */
    async updateAS(req, res, next) {
        let { asNum, asDetail } = req.body;
        let result = await svInstance.updateAS(asNum, asDetail);
        return res.json(result);
    };


    /** ================================================================
     *  A/S 삭제
     *  @author SY
     *  @since 2023.03.30
     *  @history 2023.03.30 초기 작성
     *  ================================================================
     */
    async deleteAS(req, res, next) {
        let { asNum } = req.body;
        let result = await svInstance.deleteAS(asNum);
        return res.json(result);
    };
}

module.exports = AsListController;