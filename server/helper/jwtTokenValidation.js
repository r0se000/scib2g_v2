/** ================================================================
 *  jwt 검증 모듈
 *  @author JG, Jo
 *  @since 2021.04.19
 *  @history 
 *  ================================================================
 */

const jwt = require("jsonwebtoken");

module.exports = {
    checkToken: (req, res, next) => {
        let accessToken = req.headers['authorization'] || req.query.accessToken || req.body.accessToken;

        if (accessToken) {
            accessToken = accessToken.slice(7); // Remove Bearer from string
            jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.json({
                        success: 0,
                        alertMsg: "Please log in again",
                        errorCode: 'INVALJWTTKN'
                    });
                } else { // 정상일 때
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.json({

                success: 0,
                alertMsg: "Access Denied! Unauthorized User ",
                errorCode: 'NOTFOUNDJWTTKN'
            });
        }
    }
};