<script setup>
import { ref } from "vue";
import { loadScript } from "../assets/utils/loadJS";
</script>

<template>
  <div id="player"></div>
</template>

<script>
export default {
  data() {
    return {
      vid: "2aad30cbba8ac6485498205dfb5ea359_2",
    };
  },
  created() {},
  mounted() {
    this.loadChatScript(this.loadPlayer);
  },

  methods: {
    loadChatScript(callback) {
      loadScript(
        "https://player.polyv.net/resp/vod-player/latest/player.js",
        callback,
        "polyvPlayer"
      );
    },

    loadPlayer() {
      const polyvPlayer = window.polyvPlayer;
      // 加密视频需后台同时回调playsafe,vid,移动端播放需要回调ts和sign
      this.player = polyvPlayer({
        wrap: "#player",
        width: "100%",
        height: 500,
        vid: this.vid,
        ban_seek: "on",
        ban_seek_by_limit_time: 'on'
      });
      this.addEvents();
    },

    addEvents() {
      this.player.on("s2j_onPlayerInitOver", (...params) => {
        console.log("播放器数据初始化完毕：", params);
      });
      this.player.on("s2j_onPlayOver", (...params) => {
        console.log("播放器数据初始化完毕：", params);
      });
    },
  },
  destroyed() {
    if (this.player) {
      this.player.destroy();
    }
  },
};
</script>

<style scoped>
</style>
