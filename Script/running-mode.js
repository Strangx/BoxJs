/**
 * The operating mode of Surge & Loon automatically switches the mode according to the current network. This script idea comes from Quantumult X。
 * @author: Peng-YM
 * Update address: https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/RunningMode/running-mode.js
 *
 *************** Surge配置 ***********************
 * Recommended module：
 * https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/RunningMode/running-mode.sgmodule
 * Manual configuration：
 * [Script]
 * event network-changed script-path=https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/RunningMode/running-mode.js
 *
 *************** Loon Configuration ***********************
 * It is recommended to use plug-ins:
 * https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/RunningMode/running-mode.plugin
 * Manual configuration:
 * [Script]
 * network-changed script-path=https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tools/RunningMode/running-mode.js
 *
 *************** Script configuration***********************
 * It is recommended to use BoxJS configuration.
 * BoxJS subscription：https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/box.js.json
 * (Not recommended!) The manual configuration item is config, please see the notes
 */

let config = {
  silence: false, // Whether to run silently, the default is false
  cellular: "RULE", // Mode under cellular data, RULE stands for rule mode, PROXY stands for global proxy, DIRECT stands for global direct connection
  wifi: "RULE", // wifi Default mode
  all_direct: ["WRT32X", "WRT32X Extreme"], // Specify the global direct connection wifi name
  all_proxy: [], // Specify the wifi name of the global proxy
};

// load user prefs from box
const boxConfig = $persistentStore.read("surge_running_mode");
if (boxConfig) {
  config = JSON.parse(boxConfig);
  config.silence = JSON.parse(config.silence);
  config.all_direct = JSON.parse(config.all_direct);
  config.all_proxy = JSON.parse(config.all_proxy);
}

const isLoon = typeof $loon !== "undefined";
const isSurge = typeof $httpClient !== "undefined" && !isLoon;
const MODE_NAMES = {
  RULE: "🚦 Rule mode",
  PROXY: "🚀 Global proxy mode",
  DIRECT: "🎯 Global direct connection mode",
};

manager();
$done();

function manager() {
  let ssid;
  let mode;

  if (isSurge) {
    const v4_ip = $network.v4.primaryAddress;
    // no network connection
    if (!config.silence && !v4_ip) {
      notify("🤖 Surge Operating mode", "❌ No network currently", "");
      return;
    }
    ssid = $network.wifi.ssid;
    mode = ssid ? lookupSSID(ssid) : config.cellular;
    const target = {
      RULE: "rule",
      PROXY: "global-proxy",
      DIRECT: "direct",
    }[mode];
    $surge.setOutboundMode(target);
  } else if (isLoon) {
    const conf = JSON.parse($config.getConfig());
    ssid = conf.ssid;
    mode = ssid ? lookupSSID(ssid) : config.cellular;
    const target = {
      DIRECT: 0,
      RULE: 1,
      PROXY: 2,
    }[mode];
    $config.setRunningModel(target);
  }
  if (!config.silence) {
    notify(
      `🤖 ${isSurge ? "Surge" : "Loon"} Operating mode`,
      `Current network：${ssid ? ssid : "Cellular Data"}`,
      `${isSurge ? "Surge" : "Loon"} Switched to ${MODE_NAMES[mode]}`
    );
  }
}

function lookupSSID(ssid) {
  const map = {};
  config.all_direct.map((id) => (map[id] = "DIRECT"));
  config.all_proxy.map((id) => (map[id] = "PROXY"));

  const matched = map[ssid];
  return matched ? matched : config.wifi;
}

function notify(title, subtitle, content) {
  const SUBTITLE_STORE_KEY = "running_mode_notified_subtitle";
  const lastNotifiedSubtitle = $persistentStore.read(SUBTITLE_STORE_KEY);

  if (!lastNotifiedSubtitle || lastNotifiedSubtitle !== subtitle) {
    $persistentStore.write(subtitle.toString(), SUBTITLE_STORE_KEY);
    $notification.post(title, subtitle, content);
  }
}
