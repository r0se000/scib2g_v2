/** ================================================================
 *  Batch
 *  @author GG
 *  @since 2022.04.19
 *  @history 2022.04.19 GG ver1.0 작성
 *  ================================================================
 */

// logger
const logger = require('../../config/loggerSettings');

// 호출할 service 정의
const service = require('./batch.service');
const svInstance = new service();

class BatchController {

    // B2G_Batch
    async B2G_Batch(req, res, next) {
        let params = req.body
        let result = await svInstance.B2G_Batch(params);
        return res.send(result)
    }

    // Batch Insert
    async batch_insert(req, res, next) {
        let params = req.body
        let result = await svInstance.batch_insert(params);
        return res.send(result)
    }


    // 데이터 백업
    async data_backup(req, res, next) {
        let params = req.body
        let result = await svInstance.data_backup(params);
        return res.send(result)
    }
}

module.exports = BatchController;