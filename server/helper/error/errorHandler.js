/** ================================================================
 *  시스템 에러 처리를 위한 helper function
 * 
 *  @author JG, Jo
 *  @since 2021.03.30
 *  @history
 *  ================================================================
 */

/* function errorHandler(error, req, res, next) {
    let parsedError;

    // Attempt to gracefully parse error object
    try {
        if ( error && typeof error === "object" ) {
          parsedError = JSON.stringify( error );
        } else {
          parsedError = error;
        }
      } catch ( e ) {
        console.log( e );
      }
  
      // Log the original error
      console.log( parsedError );
  
      // If response is already sent, don't attempt to respond to client
      if ( res.headersSent ) {
        return next( error );
      }
  
      res.status( 400 ).json( {
        success: false,
        error
      } );
    
} */

//module.exports = errorHandler;