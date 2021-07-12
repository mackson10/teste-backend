const express = require("express")
const morgan = require("morgan")
const mongoose = require("mongoose")

const { config } = require("./config")

mongoose.connect("mongodb://localhost:27017/myapp", { useNewUrlParser: true })

require("./models")
const { moviesRoutes, usersRoutes, votesRoutes } = require("./routes")
const { errorMiddleware } = require("./middlewares/errorMiddleware")

// rota raiz da api
const rootRouter = express.Router()
rootRouter.use("/movies", moviesRoutes())
rootRouter.use("/users", usersRoutes())
rootRouter.use("/votes", votesRoutes())

const swaggerUi = require("swagger-ui-express")
const openApiDocumentation = require("./doc/apiDoc.json")
rootRouter.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocumentation))

// configurando servidor
const app = express()
app.use(morgan("tiny"))
app.use(express.json())
app.use("/v1", rootRouter)
app.use(errorMiddleware)

// iniciando servidor
app.listen(config.port, () => console.log("Listening on port " + config.port))
