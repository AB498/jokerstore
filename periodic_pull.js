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

let git_count = 0;
setInterval(async () => {
    git_count++;
    let res = await execjs(["git", "pull"]);
    if (git_count % 100 == 0)
        console.log(git_count, res);
}, 5000);