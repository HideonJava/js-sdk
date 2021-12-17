/**
 * 加载线上 js 资源。
 * @param {String} src - js 资源地址。
 * @param {Function} cb - 加载成功时的回调。
 * @param {String} [name] - js 资源加载成功后会挂载到 window 变量上的名字。如果已经存在，就不需要重复加载。
 */
 export function loadScript(src, cb, name) {
    
    if (!window.polyvPlayer) {
        const myScript = document.createElement('script');
        myScript.setAttribute('src', src);
        myScript.onload = cb;
        document.body.appendChild(myScript);
      } else {
        cb();
      }
    
  }
  