// npm i -g express jsonwebtoken cookie-parser sequelize cors express multer sqlite3 dotenv fabric canvas
let globalState = {};
let child_process = require("child_process");
let { spawn } = child_process;
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
models = require("./models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { join } = path;
const cors = require("cors");
const express = require("express");

var BASE_URL = "https://jokers.digital";

require('dotenv').config();

// host 0.0.0.0 proc.env.PORT || 3000
let port = ((process.env.HTTPS == 1) ? 443 : 80);

const http = require("http");
const https = require("https");

const app = express();
const multer = require("multer");

const server = process.env.HTTPS ? https.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/jokers.digital/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/jokers.digital/fullchain.pem"),
}, app) : http.createServer(app);



if (process.env.AUTO_PULL) {
  execjs(['node', 'periodic_pull.js'], (log) => console.log(log)).catch(console.error);
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function cons(...args) {
  console.log(...args);
  return args[0];
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, join(__dirname, "uploads"));
    },
    filename: function (req, file, cb) {
      cb(null, uuid() + path.extname(file.originalname));
    },
  }),
});


const directoryPath = join(__dirname, "../frontend/www");

if (!fs.existsSync(__dirname + "/uploads")) fs.mkdirSync(__dirname + "/uploads");
if (!fs.existsSync(__dirname + "/results")) fs.mkdirSync(__dirname + "/results");
if (fs.existsSync(join(__dirname, "../local"))) {
  app.use("/local", express.static(join(__dirname, "../local")));
}
app.use("/docs", express.static(__dirname + "/docs"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/results", express.static(__dirname + "/results"));
app.use("/", express.static(directoryPath));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost",
      "http://127.0.0.1",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8080",
      "http://localhost:5173",
    ], // 5173 is the vite dev server port
    credentials: true,
  })
);

app.use((err, req, res, next) => {
  console.error(err.message);
  console.error(err);
  res.status(500).json({ message: err.message, stack: err.stack });
});
app.get("/version", (req, res) => {
  res.send("v8");
});

app.get("/winstart", (req, res) => {
  fs.writeFileSync("winstart.txt", new Date().toISOString());
  res.send("done");
});
app.get("/getwinstart", (req, res) => {
  res.json({ time: fs.readFileSync("winstart.txt").toString() });
});
app.get("/api/filesInfo", (req, res) => {
  // Function to get last edited time for each file recursively
  const result = {};
  function getLastEditedTimes(dir, baseDir = "/") {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach((file) => {
      const relativePath = path.join(baseDir, file.name); // Relative path calculation
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        getLastEditedTimes(filePath, relativePath);
      } else {
        const stats = fs.statSync(filePath);
        const lastEditedTime = stats.mtime; // Last modified time
        result[relativePath] = lastEditedTime;
      }
    });
    for (const [key, value] of Object.entries(result)) {
      const formattedPath = key.split(path.sep).join(path.posix.sep);
      delete result[key];
      result[formattedPath] = value;
    }

    return result;
  }

  const lastEditedTimes = getLastEditedTimes(directoryPath);
  res.json(lastEditedTimes);
});

crudSubjects = ["DocumentState", "Document"];

for (let subject of crudSubjects) {
  const model = models[subject];
  const router = express.Router();
  router.get("/", async (req, res) => res.json(await model.findAll({})));
  // router.get("/my", auth, async (req, res) => res.json(await model.findAll({ where: { user_id: req.user.id } })));
  router.get("/:id", async (req, res) => res.json(await model.findOne({ where: { id: req.params.id } })));
  router.post("/", upload.array("files", 10), parseFormDataBody, async (req, res) => {
    // console.log('files', req.files.map(i => i.filename));
    console.log("body", req.body);
    let processedFiles = req.files?.map(processFileForFileName) || [];
    const newItem = new model({
      ...req.body,
      avatar: processedFiles?.[0],
      images: processedFiles,
    });
    let added = (await newItem.save()).get({ plain: true });
    // console.log('added', added);
    res.json(added);
  });

  router.patch("/:id", async (req, res) => {
    const updated = await model.update(req.body, { where: { id: req.params.id } });
    res.json(updated);
  });

  router.get("/reset", async (req, res) => {
    const deleted = await model.destroy({ where: {} });
    res.json(deleted);
  });
  router.delete("/", async (req, res) => {
    const deleted = await model.destroy({ where: {} });
    res.json(deleted);
  });
  router.delete("/:id", async (req, res) => {
    const deleted = await model.destroy({ where: { id: req.params.id } });
    res.json(deleted);
  });

  router.get("/search", async (req, res) => {
    let { q, page, limit, offset, order, sort } = req.query;
    console.log({ q, page, limit, offset, order, sort });
    let where = {};
    if (q) {
      where = {
        [Op.or]: [
          ...Object.keys(model.rawAttributes).map((i) => ({
            [i]: {
              [Op.like]: `%${q}%`,
            },
          })),
        ],
      };
    }
    let items = await model.findAndCountAll({
      where,
      limit: parseInt(limit) || 10,
      offset: parseInt(offset) || 0,
      order: model.rawAttributes[sort] ? [[sort || "id", order || "asc"]] : null,
    });
    res.json(items);
  });

  app.use(`/api/models/${subject.toLowerCase()}`, router);
}

processQueue = [];
app.get("/api/special/generate-doc-result/:id", async (req, res) => {
  let { id } = req.params;
  let existingProcess = await models.DocumentState.findOne({
    where: {
      id,
    },
  });

  if (!existingProcess) return res.json({ error: "Process Doesnt Exist" });
  if (existingProcess.status != "completed") return res.json(existingProcess.get({ plain: true }));

  let { fileName, error } = (await existingProcess.get({ plain: true })).result;

  if (error) {
    return res.json({ error });
  }
  const image = fs.readFileSync(join(__dirname, "results", fileName));
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": image.length,
  });
  res.end(image);
});
app.get("/api/special/generate-doc-status/:id", async (req, res) => {
  let { id } = req.params;
  let existingProcess = await models.DocumentState.findOne({
    where: {
      id,
    },
  });


  if (existingProcess.error) {
    return res.json(existingProcess.get({ plain: true }));
  }
  if (!existingProcess) return res.json({ error: "Process Doesnt Exist" });

  res.json(await existingProcess.get({ plain: true }));
});

app.get("/api/special/get-payment-url/:id", async (req, res) => {
  let docResult = await models.DocumentState.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!docResult) return res.json({ error: "Process Doesnt Exist" });

  if (docResult.paymentstatus == "completed") {
    return res.json(docResult.get({ plain: true }));
  }
  if (docResult.paymenturl) return res.json(docResult.get({ plain: true }));

  let result = await fetch("https://api.hoodpay.io/v1/businesses/15732/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE2OTg0IiwiZXhwIjoyMDMwMzQ4NDcwfQ.7KT7nrdqTwOxsLOw7G54QPW62y8nZWsZpjCCratCmcc"}`,
    },
    body: JSON.stringify({
      name: "TEST 1 Document Photo",
      description: JSON.stringify({ user: docResult.user, id: docResult.id }),
      currency: "USD",
      amount: 10,
      redirectUrl: BASE_URL + "/results/" + docResult.id,
      notifyUrl: BASE_URL + "/api/special/notify-payment",
    }),
  });

  let fetchedPaymentInfo = (await result.json());
  // fetchedPaymentInfo = {
  //   data: {
  //     url: "https://checkout.hoodpay.io/e36c6773-20e0-4041-9bbb-174cd0df1418",
  //     id: "e36c6773-20e0-4041-9bbb-174cd0df1418",
  //   },
  //   message: "Payment successfully created",
  // };
  docResult.paymenturl = fetchedPaymentInfo.data.url;
  docResult.paymentid = fetchedPaymentInfo.data.id;
  docResult.save();

  res.json(docResult.get({ plain: true }));
});

app.post("/api/special/notify-payment", async (req, res) => {
  // log everything
  console.log("body", req.body);
  console.log("headers", req.headers);
  console.log("query", req.query);
  console.log("params", req.params);
  console.log("files", req.files);
  console.log("method", req.method);
  console.log("url", req.url);
  console.log("host", req.host);
  console.log("hostname", req.hostname);
  console.log("protocol", req.protocol);

  res.json({ success: true });
});
app.get("/api/special/get-payment-status/:id", async (req, res) => {
  let docResult = await models.DocumentState.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!docResult) return res.json({ error: "Process Doesnt Exist" });
  if (!docResult.paymentid) return res.json(docResult.get({ plain: true }));

  if (docResult.paymentstatus == "completed") {
    return res.json(docResult.get({ plain: true }));
  }

  let result = await fetch("https://api.hoodpay.io/v1/public/payments/hosted-page/" + docResult.paymentid);
  let fetchedPaymentInfo = await result.json();
  cons(fetchedPaymentInfo?.data.id, fetchedPaymentInfo?.data?.status);

  if (fetchedPaymentInfo.errors?.length) return res.json({ error: fetchedPaymentInfo.errors[0] });
  if (!fetchedPaymentInfo?.data) return res.json({ error: "Error from API" });

  docResult.paymentstatus = fetchedPaymentInfo.data.status == "COMPLETED" ? 'completed' : docResult.paymentstatus;
  docResult.save();

  res.json(docResult.get({ plain: true }));
});
function processFileForFileName(file) {
  // rename file to date.now
  let name = `${uuid()}-${file.originalname}`;
  fs.renameSync(file.path, join(__dirname, 'uploads', name));
  return name;
}

app.post("/api/special/generate-doc", upload.array("files", 10), async (req, res) => {
  console.log("doc generetion", req.body);
  req.body = !req.body.bodyString ? req.body : JSON.parse(req.body.bodyString || "{}");
  let processedFiles = req.files?.map(processFileForFileName) || [];
  console.log('file', processedFiles)

  // base name
  let imageFiles = processedFiles.map((f) => {
    return f.replace(/^.*[\\\/]/, "");
  });


  let { guestUser, id, slug, stringMap, imageMap } = req.body;
  let doc = id ? await models.Document.findOne({ where: { id } }) : await models.Document.findOne({ where: { slug } });
  let defaultStringMap = JSON.parse(fs.readFileSync(join(__dirname, 'docs', doc.slug + '.json'), 'utf8'));
  console.log('input', stringMap, imageMap)
  defaultStringMap = Object.fromEntries(defaultStringMap.data.fields.map(items => {
    return [items.input_name, items.input_placeholder]
  }));
  stringMap = { ...defaultStringMap, ...stringMap };


  console.log(' processedFiles', processedFiles)
  for (let key in imageMap) {
    // key=uploaded file index
    // val=placeholder name
    val = imageMap[key];
    let filename = processedFiles[key] ? join('uploads', processedFiles[key]) : 'no-image.png';
    stringMap[val] = { type: 'image', value: join(__dirname, filename) }
    console.log(' processedFiles[key]', val, filename)
  }
  //imagemap to stringmap


  console.log('defaultStringMap', stringMap)
  let newProcess = new models.DocumentState({
    user: guestUser,
    documentId: id,
    status: "queued",
  });

  await newProcess.save();


  processQueue.push(startProcess({ processId: newProcess.id, guestUser, doc, stringMap, imageMap, imageFiles }));

  res.json(newProcess.get({ plain: true }));
});
app.get("/api/special/get-random-doc", async (req, res) => {
  // random file from results/
  let dirContent = fs.readdirSync(join(__dirname, "results"));
  // if no files in results/
  if (dirContent.length == 0) {
    let image = fs.readFileSync(join(__dirname, "no-image.png"));
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": image.length,
    });
    res.end(image);
    return;
  }
  let fileName = dirContent.filter((f) => f.slice(-4) == ".png")[Math.floor(Math.random() * dirContent.filter((f) => f.slice(-4) == ".png").length)];
  const image = fs.readFileSync(join(__dirname, "results", fileName));
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": image.length,
  });
  res.end(image);
});

// function startProcess({ processId, guestUser, doc, stringMap, imageMap, imageFiles }) {
//   return {
//     id: uuid(),
//     status: "queued",
//     data: { processId, guestUser, doc, stringMap, imageMap, imageFiles },
//     run: async () => {
//       // let res = "results/" + uuid() + ".png";

//       let arg1 = JSON.stringify({
//         body: {
//           template: doc.slug + ".docx",
//           stringMap,
//           imageMap,
//           files: imageFiles,
//         },
//       });
//       let { result: fname, error: error } = await execjs(["python3", "docGenerate.py", arg1]);

//       let res = { fileName: fname, error };
//       // await new Promise((r) => setTimeout(() => r(), 1000));
//       return res;
//     },
//   };
// }

let { replaceImg, ImageDataToBlob } = require('./replaceImg.js');
function startProcess({ processId, guestUser, doc, stringMap, imageMap, imageFiles }) {
  return {
    id: uuid(),
    status: "queued",
    data: { processId, guestUser, doc, stringMap, imageMap, imageFiles },
    run: async () => {
      // let res = "results/" + uuid() + ".png";

      let arg1 = JSON.stringify({
        body: {
          template: doc.slug + ".docx",
          stringMap,
          imageMap,
          files: imageFiles,
        },
      });

      doc = JSON.parse(fs.readFileSync(join(__dirname, 'docs/', doc.slug + '.json')));
      let imageData = await replaceImg(doc, stringMap);

      let fname = uuid() + '.png';
      fs.writeFileSync(join(__dirname, 'results/', fname), await ImageDataToBlob(imageData));
      console.log('run complete', fname);

      let res = { fileName: fname, error: null };
      // await new Promise((r) => setTimeout(() => r(), 1000));
      return res;
    },
  };
}


function parseFormDataBody(req, res, next) {
  req.body = !req.body.bodyString ? req.body : JSON.parse(req.body.bodyString || "{}");
  next();
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.message });
});

app.get("*", (req, res, next) => {
  //spa
  if (["/", "/index.html"].includes(req.path)) {
    return res.sendFile(join(__dirname, "../frontend/www/index.html"));
  }
  next();
});

(async () => {
  await models.init();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });

  processExecutor();
})();

async function processExecutor() {
  await poll(async () => {
    processQueue.length && console.log("Processes in queue", processQueue.length);
    if (!processQueue.length) return;
    let proc = processQueue.pop();
    let res = await proc.run();
    models.DocumentState.update({ status: "completed", result: res, error: res.error }, { where: { id: proc.data.processId } });
    console.log("Process completed", proc.data.processId, res);
    return false;
  }, 1000);
}

async function auth(req, res, next) {
  try {
    const jwt = req.headers?.authorization?.split(" ")[1] || req.cookies.jwt;
    if (!jwt) {
      return res.status(401).send("Unauthorized [No JWT]");
    }
    const decodedUser = jsonwebtoken.verify(jwt, "secret");

    if (!decodedUser || !decodedUser.email || !decodedUser.id) {
      console.log("Invalid JWT", req.headers?.authorization, decodedUser);
      return res.status(401).send("Unauthorized");
    }

    const user = await models.User.findOne({ where: { id: decodedUser.id } });

    if (!user || !user.jwts || !user.jwts.includes(jwt)) {
      console.log("No user");
      return res.status(401).send("Unauthorized");
    }

    req.user = user;
    req.jwt = jwt;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function poll(fn, t, breakTimeout) {
  let canceller;
  let ended = false;
  if (breakTimeout) {
    canceller = setTimeout(() => {
      console.log("Timeout");
      ended = true;
      return;
    }, breakTimeout);
  }
  while (!ended) {
    let res = await fn();
    if (res) {
      canceller && clearTimeout(canceller);
      return res;
    }
    await new Promise((r) => setTimeout(r, t || 200));
  }
}

function execjs(cmds, logcallback) {
  return new Promise((resolve, reject) => {
    let out = "";
    let err = "";
    proc = spawn(cmds[0], cmds.slice(1));
    proc.stdout.on("data", (data) => {
      out += data.toString();
      logcallback && logcallback(data.toString());
      // console.log(data.toString());
    });
    proc.stderr.on("data", (data) => {
      err += data.toString();
      logcallback && logcallback(data.toString());
      console.log("Err", data.toString());
    });
    proc.on("close", (code) => {
      // console.log(`child proc exited with code ${code}`);
      if (code == 0) resolve({ result: out.replace(/[\n\r]*$/, ""), error: null });
      else resolve({ result: out.replace(/[\n\r]*$/, ""), error: err });
    });
  });
}
