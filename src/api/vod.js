
import Service from "./http/requset";

//定义请求方法，然后导出
export function getToken(data) {
  return Service({
    url: "/api/xxxx",
    params: {...data},
    method: "post"
  });
}