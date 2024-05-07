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
  // [Document, DocumentState].forEach((model) => model.sync({ alter: true, force: true }));
  await sequelize.sync({ alter: true, force: true });
  await populateTables();
}

module.exports = models = { init, sequelize, Document, DocumentState };

function populateTables() {
  for (let doc of docs) {
    models.Document.create({
      ...doc,
    });
  }
}
