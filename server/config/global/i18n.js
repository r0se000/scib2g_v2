/** ================================================================
 *  다국어 지원 모듈 설정 
 *  @author JG, Jo
 *  @since 2021.04.06
 *  @history 2021.05.04 JG 중국어, 일본어 추가 
 *  ================================================================
 */

const { setLocale } = require('i18n');
const i18n = require('i18n');

i18n.configure({
    locales: ['ko', 'en', 'zh', 'ja'],
    directory: __dirname + '/locales',
    defaultLocale: 'en',
    retrylnDefaultLocale: false,
    queryParameter: 'lang',
    cookie: 'lang'
});

module.exports = function(req, res, next) {
    i18n.init(req, res);

    if (req.lang == 'undefind') {
        setLocale()
    }
    res.locals.__ = res.__;

    return next();
}