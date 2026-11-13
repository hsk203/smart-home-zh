---
title: "Home Assistant 入门：把大陆买的设备接进 Apple HomeKit 全教程"
description: "人在海外，家里一堆米家、Aqara、涂鸦设备，想用 iPhone 和 Siri 统一控制？这篇从硬件选购、安装到米家、Aqara、涂鸦接入，再到桥接 HomeKit，一步步讲清楚。"
link: home-assistant-guide
date: 2026-11-13
updated: 2026-11-13
cover: "/images/home-assistant-guide/homepage.webp"
tags: ["Home Assistant", "HomeKit", "米家", "Aqara", "跨区"]
categories:
  - 跨区折腾
draft: false
---

![Home Assistant 入门：把大陆买的设备接进 Apple HomeKit 全教程](/images/home-assistant-guide/homepage.webp)

人在海外，家里还留着一堆大陆买的智能设备：米家的传感器、Aqara 的开关、涂鸦的灯。手机里三个 App 轮着开，Siri 一个都叫不动。想把它们收进 Apple HomeKit，用 iPhone 和 Siri 统一控制，这就是 Home Assistant 最擅长的活。

这篇教程的目标很具体：不讲 Home Assistant 的全部玩法，只讲一条线——从零搭一个 Home Assistant，把大陆买的米家、Aqara、涂鸦设备接进来，再桥接到 HomeKit。价格按 2026 年 11 月采集的行情，买之前以页面实时价为准。

## Home Assistant 是什么，能解决什么

Home Assistant（简称 HA）是一个开源的智能家居中枢软件，跑在你自己家里的硬件上。它最大的特点是协议和品牌来者不拒：Zigbee、Wi-Fi、蓝牙、Matter、Thread 都能接，米家、Aqara、涂鸦、美的这些大陆生态的设备也能接进来，再统一暴露给 Apple HomeKit。

对海外华人来说，它解决的是三个具体问题：

- **一个入口**：米家、Aqara Home、涂鸦智能三个 App 合并成一个面板，再进 HomeKit。
- **跨区**：很多大陆设备的云端有地区限制，但 Home Assistant 走本地局域网控制，设备只要在同一个局域网里就能管，不经过大陆服务器。
- **断网可用**：本地自动化不依赖云端，宽带断了，家里的灯和传感器联动照常跑。

代价也很明确：你要自己准备一台 24 小时开机的硬件，装系统、装集成，遇到问题要自己查。接受这个代价，再往下看。

## 需要什么硬件

Home Assistant 必须跑在一台长期开机的设备上。下面四种是 2026 年最常见的方案，按省事程度排序。

| 方案                          | 大概价格（2026 年 11 月）                             | 优点                     | 缺点                              | 适合谁                 |
| ----------------------------- | ----------------------------------------------------- | ------------------------ | --------------------------------- | ---------------------- |
| Home Assistant Green 官方盒子 | 官网 199 美元，国内 DFRobot 约 1299 元                | 插电联网就能用，零安装   | 性能一般，不能扩内存和存储        | 完全不想折腾的人       |
| 树莓派 5                      | 单板 4GB/8GB 约 400–700 元，成套更贵                  | 功耗低、体积小、教程最多 | 性能有限，SD 卡容易坏，建议上 SSD | 新手、设备 30 台以内   |
| N100 迷你主机                 | 全新整机约 600–1000 多元，二手准系统裸机约 450–850 元 | 性能强几倍，能跑更多服务 | 待机功耗比树莓派高                | 设备多、想跑复杂自动化 |
| 已有的绿联 NAS                | 绿联 DX4600 8G 空盘版京东约 1450 元                   | 不用多买一台设备         | 需要虚拟机安装，占用 NAS 资源     | 家里已经有 NAS 的人    |

几点补充说明：

- **Home Assistant Green** 是官方在 2023 年推出的成品盒子，预装了系统，插上电源和网线就能用。官方建议零售价 199 美元，2026 年因为元器件涨价从 99 美元一路涨上来。国内没有官方直营，淘宝和 DFRobot 这类创客商城能买到，价格约 1299 元。
- **树莓派**是最经典的方案。官方要求树莓派 4 或 5，最低 2GB 内存。社区的普遍建议是树莓派 4（4GB）是底线，树莓派 5 是现在的推荐标准。2026 年树莓派价格涨了不少，有值友提到成套价格涨到 1600 元，买单板自己配电源和散热更划算。
- **N100 迷你主机**是 2026 年性价比最高的路线。一台 N100 迷你主机待机功耗 8–12W，一年耗电约 88 度，电费约 53 元。性能比树莓派强好几倍，重启只要几十秒，还能顺手跑其他服务。二手市场有很多拆机准系统，450 元左右能淘到裸机，但要自己加内存和硬盘。
- **绿联 NAS**（比如 DX4600）适合家里已经有 NAS 的人。在 NAS 里开虚拟机装 Home Assistant OS，插件商店完整可用；如果只用 Docker 装，插件商店是没有的，这一点买之前要分清。

不管选哪种，记住一条：**Home Assistant 要 24 小时开机**，别拿每天关机的电脑凑合。

## 安装：首选 Home Assistant OS

Home Assistant 有几种安装方式，新手只记一种：**Home Assistant OS（HAOS）**。这是官方系统，自带插件商店和一键升级，最省心。

以树莓派为例，步骤是：

1. 在电脑上装 Raspberry Pi Imager，选树莓派型号，在系统列表里选 Home Assistant OS，写入 microSD 卡（写入会清空整张卡）。
2. 把卡插进树莓派，接上网线和电源，等几分钟首次启动。
3. 在同一局域网的电脑或手机浏览器打开 `homeassistant.local:8123`，按向导创建本地账号。

N100 迷你主机也一样：把 HAOS 镜像写到内置 SSD 上，开机就能用。绿联 NAS 则是先在 App 中心装"虚拟机"，再在虚拟机里装 HAOS。

Docker 方式也可以跑，但没有插件商店，后面要装的很多集成会麻烦不少。新手别走这条路。

装好之后先做两件事：**设置一个固定 IP**（在路由器里给 HA 绑定地址，免得重启后地址变了找不到），以及**做一次备份**（设置里有备份功能，备份文件存到电脑上）。

## 接入米家设备：走官方集成

米家设备现在有了官方集成，接入比以前简单得多。集成地址是 `github.com/XiaoMi/ha_xiaomi_home`，由小米官方维护。

步骤：

1. 先装 HACS（Home Assistant 社区商店）。在 HACS 界面点右上角三个点，选"自定义软件源"，填入米家集成的地址，类型选"集成"，点添加。
2. 在 HACS 里搜索 Xiaomi Home，下载，重启 Home Assistant。
3. 去"设置 > 设备与服务"，添加 Xiaomi Home 集成，按提示用米家账号登录。
4. 登录后，米家账号下的设备会出现在设备列表里。

注意两个限制：第一，这个集成目前还没有进 HACS 官方收录，必须用自定义软件源的方式添加；第二，米家账号本身有地区概念，设备要先在米家 App 里配好网，集成读的是你账号下的设备，账号地区和设备版本要对得上，混着用会出问题。

## 接入 Aqara 设备：两条路线

Aqara 设备有两条进 Home Assistant 的路线，按设备类型选：

**路线一：网关走 HomeKit 直连。** Aqara 的网关（比如 M1S、M3）本身支持 HomeKit，网关下的 Zigbee 子设备会跟着网关一起进 HomeKit。把网关先加进 Aqara Home App，再用 Home Assistant 的 HomeKit Device 集成配对网关，子设备就都进来了。优点是简单，缺点是网关本身有地区限制，国行网关只能连大陆服务器，人在海外用国行网关要先看锁区问题（见本站《Aqara / 米家海外版锁区怎么办》）。

**路线二：Zigbee 设备直连 Home Assistant。** 不用 Aqara 网关，直接给 Home Assistant 插一个 Zigbee 协调器（比如 SONOFF ZBDongle-P，官网 19.9 美元，亚马逊约 24.9 美元），用 Zigbee2MQTT 或 ZHA 把 Aqara 的 Zigbee 开关、传感器一个个配对进来。这条路线完全绕开 Aqara 的云和服务器，锁区问题不存在，但配对和调试要自己动手。

带 Wi-Fi 的 Aqara 设备（比如人体存在传感器 FP2、门铃 G4、摄像头网关 G3）还有第三种接法：它们本身支持 HomeKit 协议，Home Assistant 可以用内置的 HomeKit Device 集成直接配对。注意配对前要先把设备从 Apple 家庭 App 里移除（一个 HomeKit 设备同一时间只能配对一个控制器），并且设备和 Home Assistant 要在同一个局域网里。

## 接入涂鸦设备：官方集成最省事

涂鸦（Tuya）设备走官方 Tuya 集成，是目前最省事的路线：

1. 手机上先装涂鸦智能或智能生活 App，注册账号并把设备配好网。
2. Home Assistant 要 Core 2024.2.0 或更高版本。去"设置 > 设备与服务"，添加 Tuya 集成。
3. 集成会要求填一个"用户代码"：在涂鸦 App 里点"我的 > 设置 > 账号与安全 > 用户 Code"就能找到。
4. 填完用户代码后，用 App 扫码登录，设备就同步过来了。

涂鸦的 Zigbee 设备也可以不走涂鸦网关，直接用上面说的 Zigbee 协调器 + Zigbee2MQTT 接进来，效果和 Aqara 的 Zigbee 设备一样，脱离涂鸦云端。这两种方式选一种就行，别两边同时接，同一个设备在两个地方会出现状态打架。

## 桥接到 HomeKit：最后一步

设备都进了 Home Assistant，接下来把它们桥接到 Apple HomeKit：

1. 去"设置 > 设备与服务"，添加集成，搜索 HomeKit Bridge。
2. 按向导选要暴露给 HomeKit 的设备类型（灯、开关、传感器、窗帘等），不选的就不会出现在家庭 App 里。
3. 添加完成后，Home Assistant 会生成一个 HomeKit 配对码，打开 iPhone 的家庭 App，点右上角 +，扫码添加。
4. 添加后就能在家庭 App 里看到设备，用 Siri 控制。

两个要点：

- **家庭中枢**：想在外面远程控制、想跑自动化，必须家里有一个 HomePod、HomePod mini 或 Apple TV 做家庭中枢。这是苹果的要求，跟 Home Assistant 无关。
- **不是所有设备都能过桥**：摄像头、门锁这类设备过桥有限制，有些实体类型 HomeKit 不支持，桥接时会直接跳过。灯、开关、插座、传感器、窗帘这些是最稳的。

## 常见坑：先知道，再动手

- **局域网问题**：Home Assistant 发现设备靠 mDNS，设备和 Home Assistant 必须在同一个局域网。如果家里分了 2.4G 和 5G 两个 Wi-Fi，或者 IoT 设备单独一个 VLAN，配对会失败。配网时手机、设备、Home Assistant 都先放到同一个 2.4G 网络里，配好再说。
- **2.4G 还是 5G**：绝大多数智能家居设备只支持 2.4G Wi-Fi。配网时手机必须连 2.4G，5G 下配网会一直转圈。
- **账号地区**：米家和 Aqara 的账号、设备、服务器三者要对应。国行设备配国行账号、大陆服务器，海外版设备配海外账号、海外服务器，混着用轻则部分功能没有，重则设备加不进来。
- **插件失效**：HACS 里的第三方集成是社区维护的，Home Assistant 大版本升级后偶尔会失效。升级前先看一眼更新日志，升级后第一时间检查设备在不在线。重要的自动化先备份。
- **别把 8123 端口直接暴露到公网**：想在外面访问 Home Assistant，用官方的 Home Assistant Cloud，或者自己搭 WireGuard、Tailscale 这类 VPN。直接把端口映射到公网等于把家门钥匙挂在门口。

## 一句话总结

人在海外想把大陆买的设备收进 HomeKit，最稳的路线是：一台 N100 迷你主机或树莓派装 Home Assistant OS，米家走官方集成，Aqara 的 Zigbee 设备用协调器直连，涂鸦走官方 Tuya 集成，最后用 HomeKit Bridge 一次性桥接到家庭 App。硬件花 600–1500 元，一个周末能搭完，搭完之后米家、Aqara、涂鸦三个 App 基本可以删了。

### 参考来源

- 少数派《正是入坑好时节：在米家官方支持之际，再聊新人 Home Assistant 入门》：https://sspai.com/post/95117
- Home Assistant 官方安装文档：https://www.home-assistant.io/installation/
- Home Assistant 官方 HomeKit Bridge 文档：https://www.home-assistant.io/integrations/homekit/
- Selora Homes《Aqara FP2, Doorbell G4, and Camera Hub G3 Setup》：https://selorahomes.com/docs/how-to/integrations/aqara/aqara-homekit-setup/
- 涂鸦开发者文档《安装正式版 Home Assistant Tuya 插件》：https://developer.tuya.com/cn/docs/iot/Home-assistant-tuya-intergration?id=Kb0eqjig0utdd
- 什么值得买《先别急着买树莓派：跑 Home Assistant 的 5 种硬件方案全对比》：https://post.smzdm.com/p/ad72xgvp/
