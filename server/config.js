var CONFIG_KEYS = {
    BASE_URL: { default: '/elicitation' },
    STANDALONE: { default: false, json: true },
    SEQUELIZE_CONFIG: { json: true },
    AUTH_URL: { default: "/authenticate-access-to-elicitation/" }
}

var mssqlConstringToSequelizeConfig = require('./utils/mssql-constring-to-sequelize-config');

var ENV_PREFIX="ELICITATION_";

module.exports.get = function (key) {
    var value=undefined;
    
    var keyProps = CONFIG_KEYS[key];
    if (keyProps) {
        var envVal = process.env[ENV_PREFIX + key];
        value = (keyProps.json && envVal ? JSON.parse(envVal) : envVal) || keyProps.default;
    } else {
        throw "config.get(): " + key + " is not a valid config key";
    }
        
    if (key === "SEQUELIZE_CONFIG" && process.env['SQLAZURECONNSTR_DefaultConnection']) {
        value = value || mssqlConstringToSequelizeConfig(process.env['SQLAZURECONNSTR_DefaultConnection']);
    }
    
    return value
}