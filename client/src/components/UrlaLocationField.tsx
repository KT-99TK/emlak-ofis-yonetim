import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { isUrlaNeighborhood, titleCaseTurkish, URLA_NEIGHBORHOODS } from "@/lib/urlaNeighborhoods";

type Props = { value: string; onChange: (value: string) => void; label?: string; required?: boolean; className?: string; placeholder?: string };
const OTHER = "Diğer / Urla dışı";

/** Urla mahallesi seçimi veya Urla dışındaki her yer için form akışında görünen, okunaklı seçim alanı. */
export default function UrlaLocationField({ value, onChange, label = "Mahalle / yerleşim", required = false, className, placeholder = "Urla dışı konumu yazın" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [otherSelected, setOtherSelected] = useState(false);
  const other = otherSelected || (Boolean(value.trim()) && !isUrlaNeighborhood(value));
  const selectedLabel = other ? (value || OTHER) : (value || "Urla mahallesi seçin");

  const selectNeighborhood = (name: string) => {
    setOtherSelected(false);
    onChange(name);
    setIsOpen(false);
  };

  const selectOther = () => {
    setOtherSelected(true);
    if (isUrlaNeighborhood(value)) onChange("");
    setIsOpen(false);
  };

  return <div className={className}>
    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}{required && <span className="text-[#a85745]"> *</span>}</label>
    <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="listbox" className="flex h-10 w-full items-center justify-between rounded-md border border-[#dfe4df] bg-white px-3 text-left text-sm text-[#34433f] shadow-xs outline-none transition-colors hover:border-[#a6946e] focus-visible:border-[#8eae9f] focus-visible:ring-2 focus-visible:ring-[#8eae9f]/30">
      <span className={value ? "truncate" : "text-[#87938f]"}>{selectedLabel}</span><ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-[#718079] transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && <div className="mt-2 rounded-xl border border-[#d9dfd9] bg-white p-2 shadow-md" role="listbox" aria-label={`${label} seçenekleri`}>
      <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d6f3f]">Urla mahalleleri</p>
      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
        {URLA_NEIGHBORHOODS.map((name) => {
          const selected = !other && value === name;
          return <button key={name} type="button" role="option" aria-selected={selected} onClick={() => selectNeighborhood(name)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${selected ? "bg-[#eaf2ee] text-[#173e39]" : "bg-white text-[#34433f] hover:bg-[#f6f7f4]"}`}><span>{name}</span>{selected && <Check className="h-4 w-4 text-[#2b786e]" />}</button>;
        })}
      </div>
      <div className="mt-2 border-t border-[#edf0ec] pt-2"><button type="button" role="option" aria-selected={other} onClick={selectOther} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${other ? "bg-[#fff5e6] text-[#8d6f3f]" : "bg-white text-[#34433f] hover:bg-[#f6f7f4]"}`}><span>{OTHER}</span>{other && <Check className="h-4 w-4 text-[#8d6f3f]" />}</button></div>
    </div>}
    {other && <Input className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} onBlur={(event) => onChange(titleCaseTurkish(event.target.value))} placeholder={placeholder} aria-label={`${label} serbest giriş`} />}
  </div>;
}
