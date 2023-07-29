//custom middleware for logs

const { format } = require ('date-fns') //destructuring assignment -> use the { } to extract specific properties/functions from an obj/module 
const { v4: uuid } = require('uuid')    //destructure
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

//asinc function: takes in the 2 arguments and awaits for promises to complete before completeing
const logEvents = async (message, logFileName) => {
    const dateTime = `${format(new Date(), 'yyyy.MM.dd\tHH:mm:ss')}` //`${ }` - template literal
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try{
        if(!fs.existsSync(path.join(__dirname,'..','logs'))){
            await fsPromises.mkdir(path.join(__dirname,'..','logs'))
        }
        await fsPromises.appendFile(path.join(__dirname,'..','logs', logFileName), logItem)
    } catch (err) {
        console.log(err)
    }
}

//middleware:
const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}


module.exports = {logEvents, logger}