require("dotenv").config()

const defaultConfig = {
  port: 3000
}

exports.config = {
  port: process.env.PORT || defaultConfig.port
}
