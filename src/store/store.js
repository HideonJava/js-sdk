import Vue from "vue"
import Vuex from "vuex"
Vue.use(Vuex);

var state = {
    userId: 'fd2a1ad40a',
    // 直播参数
    appId: 'fy5hlyatci',
    AppSecret: 'c994caaba1d64c1794f16eded4cd2f9d',
    // 点播参数
    secretkey: 'Yc3Y4IJ5fk',
    writetoken: 'e25e1b66-601f-4cda-8cc0-52134e177eba',
    readtoken: '7f030e64-330f-4a8f-8ce8-f4b9082b3d11'
}

var store = new Vuex.Store({
    state
})

export default store