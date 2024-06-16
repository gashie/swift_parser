
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../model/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const { autoProcessServiceToken, } = require("../../helper/autoCreateEnrollment");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateChannel = asynHandler(async (req, res, next) => {
    /**
 * Create new role.
 * @param {string} channel - Name or title of the channel.
 */
    let { service_token, channel, results } = await autoProcessServiceToken(req)
    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "New channel added", { channel, service_key:results.rows[0].service_key ,service_token})
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})
exports.ViewFundManager = asynHandler(async (req, res, next) => {
    // let userData = req.user;

    const tableName = 'fund_managers';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})

exports.UpdateFundManager = asynHandler(async (req, res, next) => {
    let payload = req.body;
    payload.updated_at = systemDate

    const runupdate = await GlobalModel.Update(payload, 'fund_managers', 'fund_manager_id', payload.fund_manager_id)
    if (runupdate.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record Updated", runupdate.rows[0])


    } else {
        return sendResponse(res, 0, 200, "Update failed, please try later", [])
    }
})
exports.PingChannel = asynHandler(async (req, res) => {
 console.log('req?.user',req?.user);
 res.send(req.body)
})