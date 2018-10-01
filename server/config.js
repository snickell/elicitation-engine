var colors = require('colors');

var CONFIG_KEYS = {
    BASE_URL: { default: '/' },
    STANDALONE: { default: true, json: true },
    STANDALONE_ADMIN_PASSWORD: { default: ""},
    STANDALONE_ADMIN_USERNAME: { default: "admin"},
    SEQUELIZE_CONFIG: { json: true, 
      default: function () {
        console.warn(colors.red("Using SQLite in the local directory (./elicitation.db.sqlite) by default.\nSetup your database with ENV variable " + ENV_PREFIX + "SEQUELIZE_CONFIG."))
        return { userName: null, password: null, database: null, options: { dialect: 'sqlite', storage: './elicitation.db.sqlite' } };  
      }
     },
    AUTH_URL: { default: "/authenticate-access-to-elicitation/" }
}

var mssqlConstringToSequelizeConfig = require('./utils/mssql-constring-to-sequelize-config');

var ENV_PREFIX="ELICITATION_";

function getConfig (key) {
    var value=undefined;
    
    var keyProps = CONFIG_KEYS[key];
    if (keyProps) {
        var envVal = process.env[ENV_PREFIX + key];
        value = (keyProps.json && envVal ? JSON.parse(envVal) : envVal) || keyProps.default;
    } else {
        throw "config.get(): " + key + " is not a valid config key";
    }
        
    if (key === "SEQUELIZE_CONFIG" && process.env['SQLAZURECONNSTR_DefaultConnection']) {
        value = mssqlConstringToSequelizeConfig(process.env['SQLAZURECONNSTR_DefaultConnection']);
    }
    
    if (typeof value === "function")
      value = value();    
    
    return value;
}

function isDefault(key) {
  return getConfig(key) === CONFIG_KEYS[key].default;
}

function haventSetAdminPassword() {
  return isDefault("STANDALONE_ADMIN_PASSWORD");
}

module.exports.get = getConfig;
module.exports.isDefault = isDefault;
module.exports.haventSetAdminPassword = haventSetAdminPassword;