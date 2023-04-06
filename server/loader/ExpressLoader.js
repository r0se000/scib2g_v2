/** ================================================================
 *  Express Loader Class
 *  @author JG, Jo
 *  @since 2021.03.30
 *  @history 2021.04.06 JG 다국어 기능 추가(i18n)
 *           2021.04.07 JG View Engine(Nunjucks) 추가
 *           2021.05.07 JG 시스템 에러 발생 시 에러 처리 페이지 이동 
 *           2021.05.11 JG 정적 리소스 경로 추가(/web)
 *  ================================================================
 */
// logger 2021.05.07 JG
const logger = require('../config/loggerSettings');

/* Config */
const config = require('dotenv').config({ path: './config/env/.env.local' }); // 로컬/개발/운영에 따라 env 파일 경로 수정해서 사용

/* Helper scripts */
const setupRouter = require('../helper/setupRouter');
//const errorHandler = require('../helper/errorHandler');

/* MiddleWare & Module 선언  */
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const i18n = require('../config/global/i18n');
const cookieParser = require('cookie-parser');

// cors 오류 방지
const cors = require('cors');

const nunjucks = require('nunjucks');

class ExpressLoader {
    constructor() {
        const app = express();

        /* View engin */
        app.set('view engine', 'html');
        nunjucks.configure('views', {
            express: app,
            watch: true
        });

        /* Middleware 등록 */
        app.use(compression());
        app.use(morgan('dev'));
        app.use(express.json()); // Express 4.16 버전 이후부터는 body-parser 대신 express.json() 모듈 사용

        app.use(cookieParser());
        app.use(i18n); // express, cookieParser 미들웨어 설정 밑에 위치 해야 에러 발생 X

        app.use(cors());

        app.use(express.urlencoded({ extended: false }));
        app.use(express.static(path.join(__dirname, '../public')));
        app.use('/web', express.static('views/web'));
        app.use('/app', express.static('views/app'));

        /* Router 등록 실행 */
        this.app = setupRouter(app);
        /* 
        this.app.get('*', (req, res, next) => {
            // Error goes via `next()` method
            setImmediate(() => {
              next(new Error('잘못된 접근입니다.'));
            });
        }); */

        /* Error Handler 등록 */ // 다른 미들웨어 제일 아래에 위치해야함
        this.app.use(function(req, res, next) { // 404 error
            /*             res.status(404)
                            .json({
                                alertMsg: '잘못된 접근입니다.',
                                errorCode: 'ROUTERROR'
                            }); */

            logger.error('[Router Error]: ' + req.originalUrl);
            return res.render('web/error/errorPage', { // 에러 처리 페이지 이동 2021.04.30 JG
                'errorCode': 'ROUTERROR',
                'errorTitle': req.__('errorPage').errorTitleRout,
                'errorMsg': req.__('errorPage').errorMsgRout
            });
        });

        this.app.use(function(error, req, res, next) { // other error
            /* res.status(500)
                .json({
                    message: error.message,
                    alertMsg: '시스템 장애가 발생하였습니다. 잠시 후 다시 시도해주세요.',
                    errorCode: 'SYSERROR'
                }); */

            logger.error('[System Error]: ' + error.message);
            logger.error(error);
            return res.render('web/error/errorPage', { // 에러 처리 페이지 이동 2021.05.07 JG
                'errorCode': 'SYSERROR',
                'errorTitle': req.__('errorPage').errorTitleSystem,
                'errorMsg': req.__('errorPage').errorMsgSystem
            });
        });
        //this.app.use(errorHandler);

        this.app = app;

    }

    get expressApp() {
        return this.app;
    }

    get portInfo() {
        return process.env.APP_PORT || 4000;
    }
}

module.exports = ExpressLoader;