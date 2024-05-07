let child_process = require("child_process");
let { spawn } = child_process;


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
            if (code == 0) resolve(out.replace(/[\n\r]*$/, ""));
            else reject(err);
        });
    });
}


setInterval(() => {
    execjs(["git", "pull"]).catch((err) => console.log(err));
}, 5000);