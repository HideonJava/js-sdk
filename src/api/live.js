
import Service from "./http/requset";

//定义请求方法，然后导出
export function getChatToken(data) {
  return Service({
    url: "/live/v3/channel/common/get-chat-token",
    params: {...data},
    method: "get"
  });
}