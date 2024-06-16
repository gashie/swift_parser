const uuidV4 = require('uuid');
const GlobalModel = require("../model/Global");
const { generateApiKey } = require('generate-api-key');
const { SimpleEncrypt } = require("../helper/global");
module.exports = {

    autoProcessServiceToken: async (req) => {

        let payload = req.body
        let name = req.body.name
    
        let generatekey = generateApiKey({
            method: 'string',
            length:20,
            dashes:false,
            prefix: `fm_${name.replace(/ /g, "_")}`
        });

        let token = SimpleEncrypt(generatekey, name)
        payload.service_token = token

        let results = await GlobalModel.Create(payload, 'fund_managers', '');
        return { service_token: generatekey, name, results }

    },
  


}