/** ================================================================
 *  건강리포트
 *  @author MinJung Kim
 *  @since 2021.05.12
 *  @history 2021.05.12 MJ 최초작성
 *           2021.05.12 MJ Ajax 통신 적용
 *  ================================================================
 */

const _ = require('lodash');

// logger
const logger = require('../../config/loggerSettings');

// 호출할 service 정의
const service = require('./bcgdata.service');
const svInstance = new service();


class BcgdataController {

    async insertBcgData(req, res, next) {
        //let nodeid = req.body.data.network.node.$.id;
        //let reqDataObj = req.body.data.network.node.sensor.measurement.values._;  
        let reqDataObj = req.body;
        let result = await svInstance.insertBcgData(reqDataObj);

        return res.json(result);
    };
}

module.exports = BcgdataController;