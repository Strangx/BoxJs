 var confStr = $config.getConfig()
 console.log(confStr)

 var conf = JSON.parse(confStr)
 if (conf.ssid == "Yin Yin") {
     /*
     Set global operating mode
     0: Global Direct
     1:By Rule
     2: Global Proxy
     */
     $config.setRunningModel(1)
     //Set the strategy corresponding to the select strategy group, if the sub-strategy does not exist, the original strategy will remain unchanged
     $config.setSelectPolicy("𝐏𝐫𝐨𝐱𝐲","𝗪𝗶𝗙𝗶")
     $notification.post("Network changed","Proxy","𝗪𝗶𝗙𝗶")
 } else {
     $config.setRunningModel(1)
     $config.setSelectPolicy("𝐏𝐫𝐨𝐱𝐲","𝗦𝗶𝗻𝗴𝗮𝗽𝗼𝗿𝗲")
     $notification.post("Network changed","Proxy","𝗦𝗶𝗻𝗴𝗮𝗽𝗼𝗿𝗲")
 }
