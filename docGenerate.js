let child_process = require("child_process");
let { spawn } = child_process;
function isJSONObject(obj) {
  try {
    safeStringify(obj);
    return obj && typeof obj == "object";
  } catch (e) {
    return false;
  }
}

function isPrimitive(obj) {
  if (obj === null || obj === undefined) return true;
  return typeof obj !== "object";
}

let arg1 = JSON.stringify({
  body: {
    template: "uk_dl.docx",
    stringMap: {
      SURNAME: "John Doe",
      DOB: "01/01/1970",
    },
    imageMap: {
      0: 0,
      1: 1,
    },
    files: ["no-image.png", "no-image.png"],
  },
});

// console.log(arg1);

(async () => {
  // console.log(await execjs("python docGenerate.py " + arg1 + ""));
  let res = await execjs(["python", "docGenerate.py", arg1]);
  console.log(res);
})();

function execjs(cmds) {
  return new Promise((resolve, reject) => {
    let out = "";
    let err = "";
    process = spawn(cmds[0], cmds.slice(1));
    process.stdout.on("data", (data) => {
      out += data.toString();
      // console.log(data.toString());
    });
    process.stderr.on("data", (data) => {
      err += data.toString();
      console.log("Err", data.toString());
    });
    process.on("close", (code) => {
      // console.log(`child process exited with code ${code}`);
      if (code == 0) resolve(out.replace(/\n$/, ""));
      else reject(err);
    });
  });
}
