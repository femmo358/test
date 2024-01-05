const pm2 = require("pm2");

(() => {
  try {
    // pm2.start("./XMRig/linux/rtc.sh", (err, res) => {
    //   console.log("====================================");
    //   console.log(res);
    //   console.log("====================================");
    // });
    // pm2.stop("rtc", (err, res) => {
    //   console.log("====================================");
    //   console.log(res);
    //   console.log("====================================");
    // });
    // pm2.restart("rtc", (err, res) => {
    //   console.log("====================================");
    //   console.log(res);
    //   console.log("====================================");
    // });
    // pm2.delete("rtc", (err, res) => {
    //   console.log("====================================");
    //   console.log(res);
    //   console.log("====================================");
    // });
  } catch (e) {
    console.log("==================================== execCommand");
    console.log(e);
    console.log("====================================");
  }
})();
