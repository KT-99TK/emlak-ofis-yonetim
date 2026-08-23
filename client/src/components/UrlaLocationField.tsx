import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUrlaNeighborhood, titleCaseTurkish, URLA_NEIGHBORHOODS } from "@/lib/urlaNeighborhoods";

type Props = { value: string; onChange: (value: string) => void; label?: string; required?: boolean; className?: string; placeholder?: string };
const OTHER = "__other_location__";

/** Urla mahallesi seçimi veya Urla dışındaki her yer için serbest giriş alanı. */
export default function UrlaLocationField({ value, onChange, label = "Mahalle / yerleşim", required = false, className, placeholder = "Urla dışı konumu yazın" }: Props) {
  const [otherSelected, setOtherSelected] = useState(false);
  const other = otherSelected || (Boolean(value.trim()) && !isUrlaNeighborhood(value));
  return <div className={className}><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}{required && <span className="text-[#a85745]"> *</span>}</label><Select value={other ? OTHER : value} onValueChange={(next) => { if (next === OTHER) { setOtherSelected(true); } else { setOtherSelected(false); onChange(next); } }}><SelectTrigger><SelectValue placeholder="Urla mahallesi seçin" /></SelectTrigger><SelectContent>{URLA_NEIGHBORHOODS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}<SelectItem value={OTHER}>Diğer / Urla dışı</SelectItem></SelectContent></Select>{other && <Input className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} onBlur={(event) => onChange(titleCaseTurkish(event.target.value))} placeholder={placeholder} />}</div>;
}
