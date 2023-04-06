/** ================================================================
 *  관리대상자 등록 페이지 controller
 *  @author SY
 *  @since 2023.03.23
 *  @history 2023.03.23 초기 작성
 *  ================================================================
 */

const _ = require('lodash');

// 호출할 service 정의
const service = require('./register.service.js');
const svInstance = new service();

class RegisterController {

    /** ================================================================
     *  관리대상자 등록 페이지 로드
     *  @author SY
     *  @since 2023.03.23
     *  @history 2023.03.23 초기 작성
     *  ================================================================
     */
    async loadRegPage(req, res, next) {
        let { userCode } = req.params // url에 data 포함하여 전송한 경우 값 가져오기
        let result = await svInstance.loginCheck(userCode);
        if (result.loginCheck == 'Y') {
            return res.render('web/register/register', {
                'title': '관리 대상자 등록',
                'userCode': userCode,
                'userName': result.userName,
                'result': JSON.stringify(result)
            });
        } else {
            return res.render('web/error/errPage');
        }

    };


    /** ================================================================
     *  관리대상자 등록
     *  @author SY
     *  @since 2023.03.23
     *  @history 2023.03.23 초기 작성
     *  ================================================================
     */
    async userRegister(req, res, next) {
        let { userCode, inputlist, registerDate } = req.body;
        let regResult = await svInstance.userRegister(userCode, inputlist, registerDate);
        return res.send(regResult);
    }


    /** ================================================================
     *  최근 등록된 관리 대상자 코드 조회
     *  @author SY
     *  @since 2023.03.23
     *  @history 2023.03.23 초기 작성
     *  ================================================================
     */
    async userCodeSelect(req, res, next) {
        let userCode = await svInstance.userCodeSelect();
        return res.send(userCode);
    }

}
module.exports = RegisterController;