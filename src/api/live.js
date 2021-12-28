
import Service from "./http/requset";

// 聊天室token
export function getChatToken(data) {
  return Service({
    url: "/live/v3/channel/common/get-chat-token",
    params: {...data},
    method: "get"
  });
}
// 互动token
export function getApiToken(data) {
  return Service({
    url: "/live/v3/channel/watch/get-api-token",
    data,
    method: "post"
  });
}
// 获取频道信息
export function getChannelInfo(data) {
  return Service({
    url: "/live/v3/channel/basic/get",
    params: {...data},
    method: "get"
  });
}