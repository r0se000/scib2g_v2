/** ================================================================
 *  시스템 에러 처리를 위한 router
 * 
 *  @author JG, Jo
 *  @since 2021.04.22
 *  @history
 *  ================================================================
 */

const router = require('express').Router();

// 사용자 인증 에러 처리
router.get('/auth', function(req, res, next) {
    return res.render('web/error/authErrorPage', {
        'goPage': req.query.goPage,
        'errorTitle': req.__('errorPage').errorTitleAuth,
        'errorMsg': req.__('errorPage').errorMsgAuth,
        'userCode': req.query.userCode
    });
});

// 사용자 인증 에러 처리
router.get('/d_auth', function(req, res, next) {
    return res.render('web/error/p_authErrorPage', {
        'goPage': req.query.goPage,
        'errorTitle': req.__('errorPage').errorTitleAuth,
        'errorMsg': req.__('errorPage').errorMsgAuth,
        'userCode': req.query.userCode
    });
});

module.exports = router;