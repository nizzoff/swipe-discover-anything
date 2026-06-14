import { Bell, ChevronRight, Globe2, Lock, Moon, UserRound } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const rows = [
  { icon: Moon, label: "Mode sombre", control: <Switch defaultChecked aria-label="Mode sombre" /> },
  { icon: Bell, label: "Notifications", control: <Switch defaultChecked aria-label="Notifications" /> },
  { icon: Globe2, label: "Langue", detail: "Français" },
  { icon: Lock, label: "Confidentialité" },
  { icon: UserRound, label: "Compte" },
];

export function SettingsPanel() {
  return <section className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
    {rows.map(({ icon: Icon, label, control, detail }, index) => <div key={label} className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 ${index ? "border-t border-border" : ""}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><Icon className="h-4.5 w-4.5" /></span>
      <span className="truncate text-sm font-semibold">{label}</span>
      {control ?? <span className="flex items-center gap-1 text-xs text-muted-foreground">{detail}<ChevronRight className="h-4 w-4" /></span>}
    </div>)}
  </section>;
}