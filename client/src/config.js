import { io } from "socket.io-client";
import throttle from "lodash.throttle";

// rem
window.onload = function () {
  getRem(3840, 10);
};
window.onresize = throttle(() => {
  getRem(3840, 10);
}, 100);

function getRem(pwidth, prem) {
  const html = document.getElementsByTagName("html")[0];
  const oWidth =
    document.body.clientWidth || document.documentElement.clientWidth;
  html.style.fontSize = (oWidth / pwidth) * prem + "px";
}

// user identity
const currentUser =
  new URLSearchParams(window.location.search).get("username") || "userA";

// const serverUrl = "http://localhost:4000/";
const serverUrl = "http://34.216.167.252:4000/";

const socket = io(serverUrl, { autoConnect: false });
socket.auth = { username: currentUser };
socket.connect();

export { currentUser, socket };
