require("dotenv").config();

const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const si = require("systeminformation");
const check = require("check-types");
const exec = require("child_process").exec;

const token = process.env.TOKEN;
const bot = new Telegraf(token);
let _ctx = null;

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));

bot.command("worker", (ctx) => {
  ctx.sendMessage(`Worker name: ${process.env.WORKER_NAME}`);
});

bot.command("hwInfo", (ctx) => {
  handleCommand(ctx, 1);
});

bot.command("hwAlert", (ctx) => {
  handleCommand(ctx, 2);
});

bot.command("mining", (ctx) => {
  handleCommand(ctx, 3);
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
        handleMining(ctx);
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

function execCommand(cmd) {
  return new Promise((resolve, reject) => {
    try {
      exec(cmd, (error, stdout, stderr) => {
        if (stdout !== null) {
          resolve(stdout);
        }
        if (error !== null) {
          reject(error);
        }
      });
    } catch (e) {
      console.error(e);
      reject(null);
    }
  });
}

function getHardwareInfo() {
  return new Promise(async (resolve, reject) => {
    try {
      let hw = "*** Hardware Info *** \n";
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

async function handleMining(ctx, coin) {
  try {
    const payload = ctx.payload;
    const params = payload.split("-");
    console.log(params);


  const user = 'root';
  const password = '12345';
  const c = 'ls /root';
  const cmd = '"sudo", [`-S <<< '${password}'`, '-u', user, 'bash', '-c', `'${c}'`]'

    const resp = await execCommand("./XMRig/linux/bonk.sh");
    console.log("==================================== handleMining");
    console.log(resp);
    console.log("====================================");
  } catch (e) {
    console.error(e);
  }
}




