const { Sequelize, DataTypes } = require("sequelize");
const docs = require("../data/documents.json");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "main.db",
  logging: false,
});

let StringArrayType = (fieldName) => ({
  type: DataTypes.TEXT,
  defaultValue: "[]",
  get() {
    const vals = this.getDataValue(fieldName);
    return vals ? JSON.parse(vals) : [];
  },
  set(val) {
    this.setDataValue(fieldName, JSON.stringify(val));
  },
}); // for SQLite

let JSONObjectType = (fieldName) => ({
  type: DataTypes.JSON,
  defaultValue: "{}",
  get() {
    const vals = this.getDataValue(fieldName);
    return vals ? JSON.parse(vals) : {};
  },
  set(val) {
    this.setDataValue(fieldName, JSON.stringify(val));
  },
});

const DocumentState = sequelize.define("DocumentState", {
  user: DataTypes.STRING,
  status: DataTypes.STRING,
  progress: DataTypes.NUMBER,
  paymentid: DataTypes.STRING,
  paymenturl: DataTypes.STRING,
  paymentstatus: DataTypes.STRING,
  result: JSONObjectType("result"),
  error: StringArrayType("error"),
});

const Document = sequelize.define("Document", {
  name: DataTypes.STRING,
  country: DataTypes.STRING,
  slug: DataTypes.STRING,
  price: DataTypes.NUMBER,
  icon: DataTypes.STRING,
  data: JSONObjectType("data"),
});

Document.hasMany(DocumentState, { foreignKey: "documentId" });

async function init() {
  await Promise.all([Document].map(async (model) => await model.sync({ alter: true, force: true })));
  await Promise.all([DocumentState].map(async (model) => await model.sync({ alter: true })));
  await populateTables();
  // await sequelize.sync({ alter: true, force: true });
}

module.exports = models = { init, sequelize, Document, DocumentState };

async function populateTables() {
  await Promise.all(
    docs.map(async (doc) => await models.Document.create({
      ...doc,
    }))
  )
}
