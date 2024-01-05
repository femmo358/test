require("dotenv").config();

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const si = require("systeminformation");
const check = require("check-types");
const spawn = require("child_process").spawn;
const sleep = require("sleep-promise");

const _time = process.env.TIME;
const _workerName = process.env.WORKER_NAME;
let _ctx = null;
let _interval = null;
const _coin = {
  test: "../test/XMRig/linux/test.sh",
  bonk: "../test/XMRig/linux/bonk.sh",
  rtc: "../test/XMRig/linux/rtc.sh",
  zeph: "../test/XMRig/linux/zeph.sh",
};
let _help = `******* Command List ******* \n`;
_help += `| woker: [/worker] Get worker name \n`;
_help += `| hw: [/hw] Get hardware info \n`;
_help += `| list: [/list] Get pm2 list \n`;
_help += `| mining: [/mining] [worker name] [coin] \n`;
_help += `| stop: [/stop] [worker name] [coin] \n`;
_help += `| restart: [/restart] [worker name] [coin] \n`;
_help += `| reboot: [/reboot] [worker name] \n`;
_help += `| shutdown: [/shutdown] [worker name] \n`;
_help += "*****************************";

const token = process.env.TOKEN;
const bot = new Telegraf(token, { polling: true });

bot.start((ctx) => ctx.reply("Welcome fee-mining-bot"));
bot.help((ctx) => {
  ctx.reply(_help);
});
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
    let isResponse = false;
    let isProcessed = false;
    let cmd = null;
    let params = null;
    let msg = ">>>> Wrong command !";

    console.table({
      avg1,
      avg2,
      avg3,
    });

    if (!check.undefined(avg1)) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 1");
      switch (avg1) {
        case "/worker":
          ctx.sendMessage(`>>>> Worker name: ${_workerName}`);
          isResponse = true;
          break;
        case "/hw":
          ctx.sendMessage(await getHardwareInfo());
          isResponse = true;
          break;
        case "/list":
          ctx.sendMessage(await getPM2List());
          isResponse = true;
          break;

        default:
          isResponse = false;
          break;
      }
      return;
    }

    if (!check.equal(avg2, _workerName)) {
      ctx.sendMessage(`${_workerName} >>>> No event handling !`);
      return;
    }

    if (!check.undefined(avg1) && !check.undefined(avg2) && !check.undefined(avg3)) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 2");

      switch (avg1) {
        case "/alert":
          if (check.equal(avg3, "off")) {
            clearInterval(_interval);
            msg = `${_workerName} >>>> Turn off alert`;
          } else {
            hwInfoAlert(ctx);
            msg = `${_workerName} >>>> Turn on alert time: ${_time / 60000} minutes`;
          }
          isResponse = true;
          break;
        case "/mining":
          cmd = "./pm2/start.sh";
          msg = `${_workerName}>>>> Worker starting !`;
          if (check.equal(avg3, "rtc")) {
            params = _coin.rtc;
          } else if (check.equal(avg3, "bonk")) {
            params = _coin.bonk;
          } else if (check.equal(avg3, "zeph")) {
            params = _coin.zeph;
          } else {
            cmd = null;
            isResponse = false;
            msg = `${_workerName}>>>> Arguments wrong !`;
          }
          break;
        case "/restart":
          cmd = "./pm2/restart.sh";
          params = avg3 ? avg3 : "1";
          msg = `${_workerName}>>>> Worker restart !`;
          break;
        case "/stop":
          cmd = "./pm2/stop.sh";
          params = avg3 ? avg3 : "1";
          msg = `${_workerName}>>>> Worker stopped !`;
          break;

        default:
          cmd = null;
          isResponse = false;
          msg = `${_workerName}>>>> Arguments wrong !`;
          break;
      }
      isProcessed = true;
    }

    if (check.equal(isProcessed, false) && !check.undefined(avg1) && !check.undefined(avg2)) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 3");
      switch (avg1) {
        case "/reboot":
          cmd = "./pm2/reboot.sh";
          msg = `${_workerName} >>>> Reboot after 1 minutes !`;
          break;
        case "/shutdown":
          cmd = "./pm2/shutdown.sh";
          msg = `${_workerName} >>>> Shutdown after 1 minutes !`;
          break;

        default:
          cmd = null;
          isResponse = false;
          break;
      }
      isProcessed = true;
    }

    if (check.maybe.null(cmd)) {
      if (check.equal(isResponse, false)) {
        ctx.sendMessage(msg);
      }
    } else {
      const task = await execCommand(cmd, params);
      if (check.equal(task, true)) {
        ctx.sendMessage(msg);
      } else {
        ctx.sendMessage(`${_workerName} >>>> FAILED !`);
      }
    }
  } catch (e) {
    console.log("==================================== handleCommand");
    console.log(e);
    console.log("====================================");
    ctx.sendMessage(`${_workerName} >>>> ERROR`);
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
        resolve(true);
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
    }, _time); // 15p
  } catch (e) {
    if (ctx) {
      ctx.sendMessage(`${_workerName} turn on alert FAILED !`);
    } else {
      _ctx.sendMessage(`${_workerName} turn on alert FAILED !`);
    }
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
