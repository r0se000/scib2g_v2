/** ================================================================
 *  MySQL DB Connection Pool & Handler
 * 
 *  @author JG, Jo
 *  @since 2021.03.25
 *  @history 2021.03.29 JG mysql2 모듈 사용, 쿼리 핸들러(mysqlDB) 추가
 *           2021.03.31 JG logger 추가
 *  ================================================================
 */

const logger = require('./../loggerSettings');

const { createPool } = require('mysql2/promise');
const pool = createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: process.env.MYSQL_LIMIT,
    dateStrings: 'date',
});

/**
 *  MySql DB Handler
 * 
 *  @param crud - select, selectOne, insert, update, delete (String)  
 *  @param sql - 실행할 쿼리(String)
 *  @param params - 쿼리에 매핑되는 값(array)
 *  @return result - 쿼리 결과 반환(성공 시 state true, 실패 시 state false, select인 경우 row(rows) 결과 포함)
 *  @author JG, Jo
 *  @since 2021.03.29
 */
const mysqlDB = async(crud, sql, params) => {
    sql = sql.replace(/\n/g, "");
    sql = sql.replace(/\t\t/g, " ");
    logger.info('MySQL Query: ' + sql);
    logger.info('MySQL Query Params: ' + params);

    try {
        var result = {};
        const connection = await pool.getConnection(async conn => conn);

        try {
            const [rows] = await connection.execute(sql, params); // 쿼리 실행
            //const [rows] = await connection.query(sql, params); 
            const rowLength = rows.length;

            switch (crud) {
                case 'select':
                    result.rows = (rowLength > 0) ? rows : [];
                    break;

                case 'selectOne': // select 결과 하나만 가져올 때
                    result.row = (rowLength > 0) ? rows[0] : {};
                    break;

                case 'insert':
                    if (rows.affectedRows > 0) { // 정상 처리(생성된 row 수가 1이상일 때)
                        result.succ = 1; // insert 성공
                        result.insertId = rows.insertId; // insert할 때 생성된 PK
                        await connection.commit();

                    } else { // 에러 처리
                        await connection.rollback();
                        result.succ = 0; // insert 실패
                    }
                    break;

                case 'delete':
                    if (rows.affectedRows > 0) { // 정상 처리
                        result.succ = 1; // delete 성공

                        await connection.commit();

                    } else { // 에러 처리
                        await connection.rollback();
                        result.succ = 0; // delete 실패
                    }
                    break;

                case 'update':
                    if (rows.changedRows > 0) { // 정상 처리
                        result.succ = 1; // update 성공

                        await connection.commit();

                    } else { // 에러 처리
                        await connection.rollback();
                        result.succ = 0; // update 실패
                    }
                    break;
            };

            connection.release();

            result.rowLength = rowLength;
            result.state = true;

            logger.debug(result);

            return result;
        } catch (err) {
            logger.error('[Query Error!]' + err);

            await connection.rollback();
            connection.release();

            result.state = false;
            result.error = err;

            return result;
        }
    } catch (err) {
        logger.error('[DB Connection Error!] ' + err);

        result.state = false;
        result.error = err;

        return result;
    }
}

module.exports = mysqlDB;