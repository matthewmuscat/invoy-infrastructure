import Sequelize from "sequelize"

let sequelize // eslint-disable-line import/no-mutable-exports
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres" })
} else {
  const DATABASE = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE : process.env.DATABASE
  sequelize = new Sequelize( DATABASE, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, { dialect: "postgres" })
}

const models = {
  User: sequelize.import("./user"),
  Invoice: sequelize.import("./invoice"),
  Verification: sequelize.import("./verification"),
}

Object.keys(models).forEach((key) => {
  if ("associate" in models[key]) {
    models[key].associate(models)
  }
})

export { sequelize }

export default models
