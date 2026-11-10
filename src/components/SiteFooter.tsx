import { useState } from "react";
import { Copy, Check, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import qrAsset from "@/assets/techcombank-qr.jpg.asset.json";
import supportIcon from "@/assets/support-emoji.png";

const ACCOUNT_NO = "19076711211011";
const ACCOUNT_DISPLAY = "1907-6711-2110-11";
const ACCOUNT_NAME = "NGUYEN QUANG MINH";
const BANK = "Techcombank";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ACCOUNT_NO);
    } catch {
      const t = document.createElement("textarea");
      t.value = ACCOUNT_NO;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="mx-auto mt-10 flex max-w-4xl items-center justify-between gap-3 border-t px-4 pt-5 pb-4 text-sm text-muted-foreground">
      <Dialog>
        <DialogTrigger asChild>
          <button className="group inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3.5 pl-1 text-xs font-medium text-foreground transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary hover:shadow-lift active:scale-95">
            <img src={supportIcon} alt="" width={26} height={26} className="h-[26px] w-[26px] transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110" />
            Ủng hộ quỹ thi lại
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 font-display">
              <img src={supportIcon} alt="" className="h-8 w-8" /> Cảm ơn bạn!
            </DialogTitle>
            <DialogDescription className="text-center">
              Mỗi ly cà phê là động lực để mình tiếp tục cập nhật câu hỏi và làm ứng dụng tốt hơn. Chúc bạn ôn thi thật tốt <Heart className="inline h-3.5 w-3.5 text-destructive" />
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-xl border bg-card">
            <img src={qrAsset.url} alt="Mã QR chuyển khoản Techcombank" className="w-full" loading="lazy" />
          </div>

          <dl className="space-y-2 rounded-xl bg-secondary p-3 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Ngân hàng</dt>
              <dd className="font-medium text-foreground">{BANK}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Chủ tài khoản</dt>
              <dd className="font-medium text-foreground">{ACCOUNT_NAME}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Số tài khoản</dt>
              <dd className="font-mono font-semibold tracking-wide text-foreground">{ACCOUNT_DISPLAY}</dd>
            </div>
          </dl>

          <button
            onClick={copy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Đã copy số tài khoản" : "Copy số tài khoản"}
          </button>
        </DialogContent>
      </Dialog>
      <p className="font-display text-[13px] italic tracking-wide text-muted-foreground">
        By <span className="font-semibold text-foreground">Minh</span>
        <span className="text-accent">.</span>
      </p>
    </footer>
  );
}
