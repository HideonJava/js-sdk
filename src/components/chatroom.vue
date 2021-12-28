<script setup>
import { getChatToken, getApiToken, getChannelInfo } from "../api/live";
import qs from "qs";
import { Announcement, AnswerCard } from "@polyv/interactions-receive-sdk";
import { getSign } from "../assets/utils/util";
import { updateConfig } from "@polyv/interactions-receive-sdk";
// import AnswerCard from "./apps/answerCard.vue";
</script>

<template>
  <el-container>
    <el-container>
      <el-container>
        <el-main>
          <div>
            <div id="ppt" v-if="scene === 'ppt'" ref="ppt">
              <div></div>
            </div>
            <div class="live-player" v-else></div>
          </div>
        </el-main>
        <el-footer>
          <el-switch
            v-model="value1"
            active-text="Pay by month"
            inactive-text="Pay by year"
          >
          </el-switch>
          <!-- <Lottery v-if="chatInit"/> -->
          <!-- <AnswerCard v-if="chatInit"/> -->
        </el-footer>
      </el-container>
      <el-aside width="300px">
        <div class="ppt-player" v-if="scene === 'ppt'"></div>
        <div class="ppt-chatroom" v-if="scene === 'ppt'"></div>
        <div class="live-chatroom" v-else></div>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script>
const appSecret = "c994caaba1d64c1794f16eded4cd2f9d";
const appId = "fy5hlyatci";
const timestamp = +new Date().getTime();

export default {
  data() {
    return {
      value1: true,
      token: "",
      scene: null,
      chatInit: false,
      lotterySdk: null,
      platform: "pc",
      setting: {
        role: "viewer",
        userId: "12345",
        pic: "http://livestatic.videocc.net/assets/wimages/missing_face.png",
        nickName: "test",
        channelId: "2278864",
      },
    };
  },
  mounted() {
    this.init();
  },

  methods: {
    async getInfo() {
      const data = {
        appId: appId,
        channelId: this.setting.channelId,
        timestamp: timestamp,
      };
      data.sign = getSign(appSecret, data);

      await getChannelInfo(data).then((res) => {
        this.scene = res.data.scene;
      });
    },
    async init() {
      await this.getInfo();
      await this.getToken();
    },
    // todo 互动SDK接入
    async getViewerApiToken(cb) {
      const data = {
        appId: appId,
        channelId: this.setting.channelId,
        viewerId: this.setting.userId,
        timestamp: timestamp,
      };
      data.sign = getSign(appSecret, data);
      const viewerApiToken = await getApiToken(qs.stringify(data));
      console.log(viewerApiToken);
      // 回调函数更新SDK内token
      cb({ viewerApiToken: token });
      // return { viewerApiToken };
    },
    async getToken() {
      const data = {
        appId: appId,
        channelId: this.setting.channelId,
        userId: this.setting.userId,
        role: this.setting.role,
        timestamp: timestamp,
      };
      data.sign = getSign(appSecret, data);

      getChatToken(data).then((res) => {
        this.setting = { ...this.setting, ...res.data };
        this.initChatroom();
        this.initLiveSdk();
      });
    },
    /**
     * @desc 初始化聊天室
     */
    initChatroom() {
      const tabData = [
        {
          name: "聊天",
          type: "chat",
        },
        {
          name: "提问",
          type: "ask",
        },
      ];
      let container = ".live-chatroom";
      // 聊天室tab下面区域里会生成一个 class 为 tab-ppt的 div
      if (this.scene === "ppt") {
        if (this.platform === "mobile") {
          tabData.unshift({
            name: "文档",
            type: "ppt",
          });
        }
        container = ".ppt-chatroom";
      }

      this.chatroom = new window.PolyvChatRoom({
        accountId: "fd2a1ad40a",
        roomId: this.setting.channelId,
        userId: this.setting.userId,
        pic: this.setting.pic,
        nick: this.setting.nickName,
        container: container,
        width: "100%",
        height: "100%",
        userType: "slice",
        token: this.setting.token,
        mediaChannelKey: this.setting.mediaChannelKey,
        version: "2.0",
        tabData,
        roomMessage: function (data) {
          // data为聊天室socket消息，当有聊天室消息时会触发此方法
          // console.log(data);
        },
      });
    },
    /**
     * @desc 初始化直播SDK
     */
    initLiveSdk() {
      var liveSign = getSign(appSecret, {
        appId: appId,
        channelId: this.setting.channelId,
        timestamp: timestamp,
      });

      const sdkSetting = {
        channelId: this.setting.channelId,
        sign: liveSign, // 频道验证签名
        timestamp: timestamp, // 毫秒级时间戳
        appId: appId, // polyv 后台的appId
        socket: this.chatroom.chat.socket, // 设置socket 如果不设置为chatroom的socket，聊天室会出现在线人数不符合的情况
        user: {
          userId: this.setting.userId, // userId 和 chatroom设置的一致
          userName: this.setting.nickName, // userName 和 chatroom设置的一致
          pic: this.setting.pic, // 头像 和 chatroom设置的一致
        },
      };

      this.liveSdk = new window.PolyvLiveSdk(sdkSetting);
      // this.liveSdk.setApiToken()
      this.addSdkEvent();
    },
    /**
     * @desc 直播SDK示例绑定事件
     */
    addSdkEvent() {
      this.liveSdk.once(
        window.PolyvLiveSdk.EVENTS.CHANNEL_DATA_INIT,
        (event, data) => {
          // 配置互动功能SDK

          // this.chatInit = true;
          this.setupPlayer();
          this.addPlayerEvent();
        }
      );
      this.liveSdk.on(
        window.PolyvLiveSdk.EVENTS.STREAM_UPDATE,
        this.handleStreamUpload
      );
    },
    addPlayerEvent() {
      this.liveSdk.player.once("loadedmetadata", this.handleLoadedmetadata);
      this.liveSdk.player.on("playing", this.handlePlaying);
      this.liveSdk.player.on("pause", this.handlePause);
      // 连麦实例初始化完成，可以进行连麦相关代码调用，无延迟，普通直播并支持连麦的情况下会回调
      this.liveSdk.player.on("rtcInitialized", this.initRtc);
    },
    handleStreamUpload() {
      this.liveSdk.reloadPlayer();
    },
    /**
     * @desc 移动端触发loadedmetadata, 一般需要在点击播放后。
     */
    handleLoadedmetadata() {
      console.log("loadedmetadata");
    },
    handlePlaying() {
      console.log("playing");
    },
    handlePause() {
      console.log("pause");
    },
    initRtc(rtc){
        // 也可以这样获取实例 liveSdk.player.rtcInstance
        console.log("连麦sdk实例", rtc);
        // 连麦sdk加载后调用相关代码
        rtc.on("OPEN_MICROPHONE", (evt) => {

          console.log("讲师开启连麦, 可发起申请加入连麦");

        });

        rtc.on("CLOSE_MICROPHONE", (evt) => {
          console.log("讲师关闭连麦，可禁止发起连麦申请");
        });

        rtc.on("ALLOW_MICROPHONE", (evt) => {
          console.log("连麦申请通过， 开始连麦");
        });

        rtc.on("INIT_LOCAL_STREAM_READY", (evt) => {
          console.log("准备开始推流，设置推流参数");
          evt.init({
            element: document.getElementById("local"), // 选择需要显示本地流的节点
          });
        });
    },
    setupPlayer() {
      const playerSetting = {
        el: ".live-player",
        type: "auto",
        pptNavBottom: "60px",
        controller: false,
        lowLatency: true,
        // 暂无直播ppt占位图
        pptPlaceholder: true,
        lowLatencyConfig: {
          // 是否显示频道中每个人(讲师、嘉宾、其他连麦者)的控制栏, 默认显示，如果没有视频流或者关闭摄像头则固定显示
          controls: true,
          // 是否隐藏控制栏的昵称, 默认显示
          hideNickname: false,
          /*
           * 默认按非无延迟直播的主讲模式排版，在人数少于13包含13人时非主讲按播放器 1/6 宽度，16:9的比例显示，大于6人时分行显示
           * 大于13人时非主讲按播放器 1/8 宽度，16:9的比例显示，大于8人时分行显示
           * 设置后非主讲按每个人宽 1/3, 宽高 16/9显示，在一行显示，鼠标或者左右滑切换,建议在小尺寸和移动端使用
           */
          drag: false,
        },
      };
      if (this.scene === "ppt") {
        playerSetting.pptEl = "#ppt";
        playerSetting.el = ".ppt-player";
        // playerSetting.controllerEl = this.$refs.ppt;
        // playerSetting.controllerPosition = "ppt";
        // 切换tab之后要调用resize去刷新ppt, 触发点击事件后，可能tab还没切换完，
        // 所以将刷新逻辑写在setTimeout里
        // document
        //   .querySelector("[data-type=ppt]")
        //   .addEventListener("click", () => {
        //     setTimeout(() => {
        //       this.liveSdk.player.resize();
        //     }, 0);
        //   });
      }
      this.liveSdk.setupPlayer(playerSetting);
      console.log(this.liveSdk.player);
    },
    addReciveEvent(announcementSdk) {
      announcementSdk.on(announcementSdk.events.BULLETIN, function (msg) {
        console.log(
          `收到公告，公告ID：` + msg.id + `，公告内容：` + msg.content
        );
      });
    },
    addLotteryEvent(lotterySdk) {
      lotterySdk.on(lotterySdk.events.LotteryStart, function () {
        // 处理开始抽奖
        alert("抽奖开始");
      });
      lotterySdk.on(lotterySdk.events.OnLottery, function () {
        // 处理开始抽奖
        alert("抽奖进行中");
      });
      lotterySdk.on(lotterySdk.events.LotteryEnd, function (msg) {
        alert(
          `抽奖 id： ${msg.lotteryId}`,
          `是否中奖： ${msg.isWinner}`,
          `奖品名称：${msg.prize}`,
          `领奖信息：${msg.collectInfo}`
        );
      });
    },
  },
  destroyed() {
    this.liveSdk.destroy();
    // this.liveSdk.off(window.PolyvLiveSdk.EVENTS.STREAM_UPDATE,
    //     this.handleStreamUpload)
    console.info("destroy");
  },
};
</script>

<style scoped>
/* .box-card {
  width: 480px;
} */
#ppt {
  height: 800px;
}
.p-live {
  height: 100vh;
  overflow: hidden;
}
.live-player {
  height: 800px;
}
.live-chatroom {
  padding-top: 20px;
  height: 800px;
}
.ppt-chatroom {
  height: 600px;
}
.ppt-player {
  padding-top: 20px;
  height: 200px;
}
</style>
