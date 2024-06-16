// In autoCreateEnrollment.js
const GlobalModel = require("../model/Global");
const { sendResponse, CatchHistory, sendCookie, } = require("./utilfunc");
const { SimpleDecrypt } = require("../helper/devicefuncs");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");
// const autoGenerateCookie = async (req, res, next, userIp) => {

//     // Function implementation
//     let { device_info, license, mac } = req.headers
//     if (license) {
//         //decrypt license and check if it match the one in the db, if yes,
//         // Search for user in db
//         const tableName = "devices";
//         const columnsToSelect = []; // Use string values for column names
//         const conditions = [{ column: "device_mac", operator: "=", value: mac }];
//         let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions);
//         let DeviceDbInfo = results.rows[0];

//         if (!DeviceDbInfo) {
//             //device mac not in db
//             return sendResponse(res, 0, 401, "Unauthorized access, mac not found");
//         }
//         //----check device activation too

//         //validate lince 
//         let token = SimpleDecrypt(DeviceDbInfo.license_key, mac);
//         if (token !== license) {
//             //licensense does not match
//             return sendResponse(res, 0, 401, "Unauthorized access");
//         }

//         try {
//             //validate license against device info
//             var licenseData = { info: JSON.parse(device_info), prodCode: "LEN100120", appVersion: "1.5", osType: 'IOS8' }
//             var license_key = licenseKey.validateLicense(licenseData, license)
//             if (license_key.message !== 'ok') {
//                 //licensense does not match
//                 return sendResponse(res, 0, 401, "Unauthorized access");
//             }
//         } catch (error) {
//             if (error.errorCode === 1006) {
//                 //licensense does not match
//                 return sendResponse(res, 0, 401, error.message);
//             }
//         }

//         let showdevicetemplate = await ShowMyDeviceTemplates(mac);
//         if (showdevicetemplate.rows.length == 0) {
//             return sendResponse(res, 0, 200, "Sorry, No Template found for this device", [])
//         }
//         let template = showdevicetemplate.rows[0]

//         sendCookie(template, 1, 200, res, req);
//         // Call next middleware
//         req.device_template = template;
//         return next();
//     } else {
//         //for display tv
//         let showdevicetemplate = await ShowMyDeviceTemplates(userIp);
//         if (showdevicetemplate.rows.length == 0) {
//             return sendResponse(res, 0, 200, "Sorry, No Template found for this device", [])
//         }
//         let template = showdevicetemplate.rows[0]

//         sendCookie(template, 1, 200, res, req);
//         // Call next middleware
//         req.device_template = template;
//         return next();
//     }
// };
const autoGenerateCookie = async (req, res,next) => {
    // Function implementation
    const { service_key, service_token, channel } = req.headers

    //search for user in db
    const tableName = 'fund_managers';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
        { column: 'service_key', operator: '=', value: service_key },

    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
    let UserDbInfo = results.rows[0]

    if (!UserDbInfo) {
        CatchHistory({ api_response: "Unauthorized access-service_key not configured", function_name: 'Pingservice_key', date_started: systemDate, sql_action: "SELECT", event: "service_key AUTHENTICATION", actor: service_key }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')

    }


    //is user active ?
    if (!UserDbInfo.status) {
        CatchHistory({ api_response: "Unauthorized access-service_key exist but not active", function_name: 'Pingservice_key', date_started: systemDate, sql_action: "SELECT", event: "service_key AUTHENTICATION", actor: service_key }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')
    }



    //check for password
    let token = SimpleDecrypt(UserDbInfo?.service_token, channel)
    if (token !== service_token) {
        CatchHistory({ api_response: "Unauthorized access-user exist but service_token does not match", function_name: 'Pingservice_key', date_started: systemDate, sql_action: "SELECT", event: "service_key AUTHENTICATION", actor: service_key }, req)
        return sendResponse(res, 0, 401, 'Unauthorized access')
    }


    //    Update({last_login:systemDate}, 'users', 'user_id', UserInfo.user_id)

    // await saveOwner(UserDbInfo,JSON.parse(owner));
    CatchHistory({ api_response: "User logged in", function_name: 'Auth', date_started: systemDate, sql_action: "SELECT", event: "service_key AUTHENTICATION", actor: service_key }, req)
    let tokenPayload = {
        service_key_id: UserDbInfo.service_key,
        // ...JSON.parse(owner)
    }
    req.user = tokenPayload;
    sendCookie(tokenPayload, 1, 200, res, req);
    // Call next middleware
    return next();

};


module.exports = { autoGenerateCookie };
