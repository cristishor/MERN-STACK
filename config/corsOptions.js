//options module for the third-party middleware - cors
const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) { 
        // only the allowed ones are allowed to access the restful api; or no origin to allow postman or other desktop apps to test the api
            callback(null, true)
        } else {
            callback(new Error(`Not allowed by CORS ${origin}`))
        }
    },
    credentials: true, 
    //it allows the browser to include credentials (such as cookies, HTTP authentication, and client-side SSL certificates) in cross-origin requests
    optionsSuccessStatus: 200
}

module.exports = corsOptions