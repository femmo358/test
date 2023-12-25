require("dotenv").config();

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const si = require("systeminformation");
const check = require("check-types");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const sleep = require("sleep-promise");

const token = process.env.TOKEN;
const bot = new Telegraf(token);

let _ctx = null;
let _thread = null;
let _pid = null;

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

bot.command("worker", (ctx) => {
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx worker");
  ctx.sendMessage(`Worker name: ${process.env.WORKER_NAME}`);
});

bot.command("hw", (ctx) => {
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx hw");
  handleCommand(ctx, 1);
});

bot.command("alert", (ctx) => {
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx alert");
  handleCommand(ctx, 2);
});

bot.command("kill", (ctx) => {
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx kill");
  handleCommand(ctx, 3);
});

bot.command("mining", (ctx) => {
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx mining");
  handleCommand(ctx, 4);
});

bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

/**
 *
 * @param {*} ctx
 * @param {*} type 1: hwinfo, 2: alert, 3: mining
 */
async function handleCommand(ctx, type) {
  _ctx = ctx;
  try {
    switch (type) {
      case 1:
        ctx.sendMessage(await getHardwareInfo());
        break;
      case 2:
        hwInfoAlert(ctx);
        break;
      case 3:
        handleMining(ctx, 0);
        break;
      case 4:
        handleMining(ctx, 1);
        break;

      default:
        break;
    }
  } catch (e) {
    ctx.sendMessage("xxxxxxxxxxxxxxxxxxxxxxxxxxx");
  }
}

(async () => {
  try {
  } catch (e) {
    console.error(e);
  }
})();

function execCommand(cmd, ctx) {
  return new Promise((resolve, reject) => {
    try {
      const ls = spawn(cmd);
      ls.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });
      ls.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });
      ls.on("error", (error) => {
        console.log(`error: ${error.message}`);
      });
      ls.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        process.exit();
      });
      resolve(ls.pid);
    } catch (e) {
      console.error(e);
      reject(null);
    }
  });
}

function getHardwareInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      let hw = "*** Worker Info *** \n";
      hw += "------------------------------------------------------------------------------------------- \n";
      hw += `| Worker: ${process.env.WORKER_NAME} \n`;

      const time = await si.time();
      const date = new Date(time.current);
      hw += `| Time: ${date} \n`;

      const board = await si.baseboard();
      hw += `| Mainboard: ${board.model} \n`;

      const cpu = await si.cpu();
      hw += `| CPU: ${cpu.brand} \n`;

      const speed = await si.cpuCurrentSpeed();
      const percent = parseInt((speed.avg / cpu.speedMax) * 100);
      hw += `| CPU: ${percent} %\n`;

      const temp = await si.cpuTemperature();
      let hwTemp = `| Temperature: \n| - `;
      hwTemp += `main: ${temp.main} °C \n| - `;
      hwTemp += `chipset: ${temp.chipset} °C \n| - `;
      hwTemp += `cores: ${JSON.stringify(temp.cores)} °C \n`;
      hw += hwTemp;
      hw += "------------------------------------------------------------------------------------------- \n";

      console.log("==================================== hw info");
      console.log(hw);
      console.log("====================================");

      resolve(hw);
    } catch (e) {
      console.error(e);
      reject(null);
    }
  });
}

function hwInfoAlert(ctx) {
  let interval = null;
  try {
    interval = setInterval(async () => {
      if (ctx) {
        ctx.sendMessage(await getHardwareInfo());
      } else {
        _ctx.sendMessage(await getHardwareInfo());
      }
    }, 10000); // 10s
  } catch (e) {
    console.error(e);
    clearInterval(interval);
  }
}

function test(cmd) {
  return spawn(cmd, { detached: true });
}

async function handleMining(ctx, type, coin) {
  try {
    // const payload = ctx.payload;
    // const params = payload.split("-");
    // console.log(params);

    let cmd = "";
    switch (type) {
      case 0:
        const kill = await execCommand("./pm2/stop.sh");
        console.log("==================================== 0");
        console.log(kill);
        console.log("====================================");
        ctx.sendMessage("Kill process success");
        break;
      case 1:
        // const run = await execCommand("./pm2/restart.sh", ctx);
        const run = await execCommand("./XMRig/linux/bonk.sh", ctx);
        console.log("==================================== 1");
        console.log(run);
        console.log("====================================");
        ctx.sendMessage("Worker is mining...");
        break;

      default:
        console.log("xxxxxxxxxxxxxxxxxxxxxxxx 2");
        break;
    }
  } catch (e) {
    console.error(e);
  }
}
