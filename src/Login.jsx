import { useState } from "react";
import { login } from "./auth";

function Login() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(code, password);
    } catch (err) {
      alert("登入失敗");
      console.log(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>登入</h2>

      <input
        placeholder="代號（A001）"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>登入</button>
    </div>
  );
}

export default Login;