require("dotenv").config();

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const si = require("systeminformation");
const check = require("check-types");
const spawn = require("child_process").spawn;
const sleep = require("sleep-promise");

const token = process.env.TOKEN;
const time = process.env.TIME;
const workerName = process.env.WORKER_NAME;
const bot = new Telegraf(token, { polling: true });

let _ctx = null;
let _interval = null;
const _coin = {
  test: "../test/XMRig/linux/test.sh",
  bonk: "../test/XMRig/linux/bonk.sh",
  rtc: "../test/XMRig/linux/rtc.sh",
  zeph: "../test/XMRig/linux/zeph.sh",
};

bot.start((ctx) => ctx.reply("Welcome fee-mining-bot"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.on("message", (ctx) => {
  return handleCommand(ctx);
});
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

(async () => {
  try {
    console.log("====================================");
    console.log("Fee Mining Bot Started !");
    console.log("====================================");
  } catch (e) {
    console.error(e);
  }
})();

async function handleCommand(ctx) {
  _ctx = ctx;
  try {
    const txt = ctx.update.message.text;
    const param = txt.split(" ");
    const avg1 = param[0];
    const avg2 = param[1];
    const avg3 = param[2];
    let flag = false;
    let cmd = null;
    let params = null;
    let msg = ">>>> NONE !";

    console.table({
      avg1,
      avg2,
      avg3,
    });

    if (!check.emptyString(avg1)) {
      switch (avg1) {
        case "/worker":
          ctx.sendMessage(`>>>> Worker name: ${workerName}`);
          flag = true;
          break;
        case "/hw":
          ctx.sendMessage(await getHardwareInfo());
          flag = true;
          break;
        case "/alert":
          if (check.equal(avg2, "off")) {
            clearInterval(_interval);
            ctx.sendMessage(">>>> Turn off alert");
          } else {
            hwInfoAlert(ctx);
            ctx.sendMessage(">>>> Turn on alert");
          }
          flag = true;
          break;
        case "/list":
          ctx.sendMessage(await getPM2List());
          flag = true;
          break;
        case "/mining":
          if (!check.emptyString(avg2)) {
            cmd = "./pm2/start.sh";
            msg = ">>>> Worker starting !";
            if (check.equal(avg2, "rtc")) {
              params = _coin.rtc;
            } else if (check.equal(avg2, "bonk")) {
              params = _coin.bonk;
            } else if (check.equal(avg2, "zeph")) {
              params = _coin.zeph;
            } else {
              cmd = null;
              flag = false;
            }
          } else {
            cmd = null;
            msg = ">>>> Wrong cmd !";
          }
          flag = true;
          break;
        case "/restart":
          cmd = "./pm2/restart.sh";
          params = avg2 ? avg2 : "1";
          msg = ">>>> Worker restart !";
          break;
        case "/stop":
          cmd = "./pm2/stop.sh";
          params = avg2 ? avg2 : "1";
          msg = ">>>> Worker stopped !";
          break;
        case "/reboot":
          cmd = "./pm2/reboot.sh";
          msg = ">>>> Reboot success !";
          break;
        case "/shutdown":
          cmd = "./pm2/shutdown.sh";
          msg = ">>>> Shutdown success !";
          break;

        default:
          flag = false;
          break;
      }

      if (!check.maybe.null(cmd)) {
        const task = await execCommand(cmd, params);
        if (check.equal(task, true)) {
          ctx.sendMessage(msg);
        } else {
          ctx.sendMessage(">>>> FAILED !");
        }
      } else {
        if (check.equal(flag, false)) {
          ctx.sendMessage(">>>> Welcome to fee mining bot !");
        } else {
          ctx.sendMessage(">>>> WRONG command");
        }
      }
    } else {
      ctx.sendMessage(">>>> NOT working");
      return;
    }
  } catch (e) {
    console.log("==================================== handleCommand");
    console.log(e);
    console.log("====================================");
    ctx.sendMessage(">>>> NOT support");
    return;
  }
}

function execCommand(cmd, params) {
  return new Promise((resolve, reject) => {
    try {
      console.table({
        cmd,
        params,
      });

      const ls = spawn(cmd, [`${params}`]);
      ls.stdout.on("data", (data) => {
        console.log(`***** stdout: ${data}`);
        resolve(true);
      });
      ls.stderr.on("data", (data) => {
        console.log(`##### stderr: ${data}`);
        resolve(false);
      });
      ls.on("error", (error) => {
        console.log(`xxxxx error: ${error.message}`);
        resolve(false);
      });
    } catch (e) {
      console.log("==================================== execCommand");
      console.log(e);
      console.log("====================================");
      reject(false);
    }
  });
}

function getHardwareInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      let hw = "*** Worker Info *** \n";
      hw += "--------------------------------- \n";
      hw += `| Worker: ${process.env.WORKER_NAME} \n`;

      const time = await si.time();
      const date = new Date(time.current);
      hw += `| Time: ${date} \n`;

      const board = await si.baseboard();
      hw += `| Mainboard: ${board.model} \n`;

      const cpu = await si.cpu();
      hw += `| CPU model: ${cpu.brand} \n`;

      const percent = await si.currentLoad();
      hw += `| CPU: ${percent.currentLoad.toFixed(1)} %\n`;

      const temp = await si.cpuTemperature();
      let hwTemp = `| Temperature: \n|      - `;
      hwTemp += `main: ${temp.main} °C \n|      - `;
      hwTemp += `chipset: ${temp.chipset} °C \n|      - `;
      hwTemp += `cores: ${JSON.stringify(temp.cores)} °C \n`;
      hw += hwTemp;
      hw += "--------------------------------- \n";

      console.log("==================================== hw info");
      console.log(hw);
      console.log("====================================");

      resolve(hw);
    } catch (e) {
      console.log("==================================== getHardwareInfo");
      console.log(e);
      console.log("====================================");
      reject("NaN");
    }
  });
}

function hwInfoAlert(ctx) {
  try {
    _interval = setInterval(async () => {
      if (ctx) {
        ctx.sendMessage(await getHardwareInfo());
      } else {
        _ctx.sendMessage(await getHardwareInfo());
      }
    }, time); // 15p
  } catch (e) {
    console.log("==================================== hwInfoAlert");
    console.log(e);
    console.log("====================================");
    clearInterval(_interval);
  }
}

function getPM2List() {
  return new Promise((resolve, reject) => {
    try {
      const ls = spawn("./pm2/list.sh");

      ls.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
        resolve(data.toString());
      });
      ls.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
        resolve(">>>> NaN");
      });
      ls.on("error", (error) => {
        console.log(`error: ${error.message}`);
        resolve(">>>> NaN");
      });
    } catch (e) {
      console.log("==================================== execCommand");
      console.log(e);
      console.log("====================================");
      resolve(">>>> NaN");
    }
  });
}
