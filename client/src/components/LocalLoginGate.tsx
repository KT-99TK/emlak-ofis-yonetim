import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function LocalLoginGate() {
  const utils = trpc.useUtils();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [message, setMessage] = useState("");
  const loginSubmitLock = useRef(false);
  const login = trpc.auth.localLogin.useMutation({
    onSuccess: result => {
      setMustChangePassword(result.mustChangePassword);
      setMessage(result.mustChangePassword ? "Geçici parola kabul edildi. Şimdi kişisel parolanızı belirleyin." : "Giriş başarılı.");
      if (!result.mustChangePassword) void utils.auth.me.invalidate();
    },
    onError: error => setMessage(error.message),
  });
  const changePassword = trpc.auth.changeLocalPassword.useMutation({
    onSuccess: async () => {
      setMessage("Parolanız değiştirildi; çalışma alanı açılıyor.");
      setMustChangePassword(false);
      await utils.auth.me.invalidate();
    },
    onError: error => setMessage(error.message),
  });
  const submitLogin = () => {
    if (loginSubmitLock.current || login.isPending) return;
    loginSubmitLock.current = true;
    setMessage("");
    login.mutate(
      { loginName: loginName.trim().toUpperCase(), password },
      { onSettled: () => { loginSubmitLock.current = false; } },
    );
  };
  const submitPassword = () => {
    if (newPassword !== confirmPassword) {
      setMessage("Yeni parola ve tekrarı aynı olmalıdır.");
      return;
    }
    changePassword.mutate({ newPassword });
  };
  return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-5">
    <div className="w-full max-w-md rounded-2xl border border-[#dbe5dd] bg-white p-8 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Global 1881</p>
      <h1 className="mt-2 font-serif text-3xl text-[#223230]">Danışman girişi</h1>
      <p className="mt-2 text-sm text-[#70807c]">Uzun login adınızı kullanın; örneğin C-TERCAN veya I-PARIN.</p>
      {!mustChangePassword ? <div className="mt-6 space-y-4">
        <div><label className="mb-1 block text-xs font-semibold text-[#56635f]">Login adı</label><Input value={loginName} onChange={event => setLoginName(event.target.value.toUpperCase())} placeholder="C-TERCAN" autoComplete="username" /></div>
        <div><label className="mb-1 block text-xs font-semibold text-[#56635f]">Parola</label><Input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></div>
        <Button type="button" className="w-full bg-[#173e39] hover:bg-[#20554e]" disabled={!loginName || !password || login.isPending} onClick={submitLogin}>{login.isPending ? "Kontrol ediliyor…" : "Giriş yap"}</Button>
      </div> : <div className="mt-6 space-y-4">
        <p className="rounded-lg bg-[#f8fbf8] p-3 text-sm text-[#285347]">Geçici parola yalnızca ilk giriş içindir ve süresi sınırlıdır.</p>
        <div><label className="mb-1 block text-xs font-semibold text-[#56635f]">Yeni parola</label><Input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" /></div>
        <div><label className="mb-1 block text-xs font-semibold text-[#56635f]">Yeni parola tekrarı</label><Input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" /></div>
        <p className="text-xs text-[#70807c]">En az 12 karakter; büyük harf, küçük harf ve rakam içermelidir.</p>
        <Button type="button" className="w-full bg-[#173e39] hover:bg-[#20554e]" disabled={!newPassword || !confirmPassword || changePassword.isPending} onClick={submitPassword}>{changePassword.isPending ? "Kaydediliyor…" : "Parolayı değiştir"}</Button>
      </div>}
      {message && <p role="status" className="mt-4 rounded-lg bg-[#fff8e8] p-3 text-sm text-[#74561f]">{message}</p>}
      <Button variant="link" className="mt-4 px-0 text-xs" onClick={() => window.location.href = "/api/oauth/login"}>Manus hesabıyla giriş seçeneği</Button>
    </div>
  </div>;
}
