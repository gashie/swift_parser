
const asynHandler = require("../../middleware/async");
const GlobalModel = require("../../model/Global");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateTransaction = asynHandler(async (req, res, next) => {

    let payload = req.body;
    payload.fund_manager_id = req?.user?.fund_manager_id
    let results = await GlobalModel.Create(payload, 'transaction', '');
    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})