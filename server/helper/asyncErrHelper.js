/** ================================================================
 *  비동기 오류 처리를 위한 helper function
 *  (UnhandledPromiseRejection 방지)
 *  @author JG, Jo
 *  @since 2021.03.30
 *  @history
 *  ================================================================
 */

function asynErrHelper(fn) {
    return function(req, res, next) {
        // 모든 오류를 catch, next()로 전달
        fn(req, res, next).catch(next);
    };
}

module.exports = asynErrHelper;