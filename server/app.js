/** ================================================================
 *  Application Entry Point
 *  @author JG, Jo
 *  @since 2021.03.25
 *  @history 2021.03.30 JG app.js 간소화 
 *  ================================================================
 */

async function startServer() {
    try {
        const ExpressLoader = await require('./loader/ExpressLoader');
        const batchScheduler = await require('./config/batch/batch');
        const batch = new batchScheduler();
        const xmlparser = require('express-xml-bodyparser');
        var bodyParser = require('body-parser');
        const loaderObj = new ExpressLoader();
        const app = loaderObj.expressApp;

        const admin = require('firebase-admin');
        //앱 알림
        let adminAccount = require('./config/alertToken/sci-b2g-staff-firebase-adminsdk-v2ql6-310c64321d.json')
        let protector = require('./config/alertToken/sci-b2g-protector-firebase-adminsdk-oih73-e244e6b8cb.json');
        //공무원 앱 알림
        admin.initializeApp({
            credential: admin.credential.cert(adminAccount),
        }, 'staff');
        //보호자 앱 알림
        admin.initializeApp({
            credential: admin.credential.cert(protector),
        }, 'protector');
        //앱 알림

        // app.use(bodyParser.urlencoded());
        app.use(xmlparser());
        app.set("etag", false);

        if (app != null) {
            const appPort = loaderObj.portInfo;

            /* Server Start */
            app.listen(appPort, () => {
                console.log('Server up and running on PORT :', appPort);
            });
        } else {
            console.log('Server not starting');
        }
        const batchjob = batch.batch()



    } catch (err) {
        console.log('Express Load Error!!');
        console.log(err);
    }
}

startServer();