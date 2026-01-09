import { Capacitor } from "@capacitor/core";
import LoginWeb from "./LoginWeb";
import LoginAndroid from "./LoginAndroid";

export default function Login() {
  const platform = Capacitor.getPlatform();
  console.log("PLATFORM:", Capacitor.getPlatform());

  if (platform === "android") {
    return <LoginAndroid />;
  }

  return <LoginWeb />;
}
