export type AuthorityContractDetails = {
  mode: "sale" | "rent";
  ownerName: string;
  ownerIdentity: string;
  ownerPhone: string;
  ownerAddress: string;
  propertyAddress: string;
  parcelInfo: string;
  propertyType: string;
  grossM2: string;
  roomCount: string;
  floorAndView: string;
  condition: string;
  price: string;
  contractDate: string;
  consultantName: string;
  consultantPhone: string;
  consultantCode: string;
  consultantTitle: string;
  officeName: string;
  officeAuthorizationNo: string;
  officePhone: string;
  officeAddress: string;
};

export const emptyAuthorityDetails = (): AuthorityContractDetails => ({
  mode: "rent", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerAddress: "",
  propertyAddress: "", parcelInfo: "", propertyType: "", grossM2: "", roomCount: "",
  floorAndView: "", condition: "", price: "", contractDate: new Date().toISOString().slice(0, 10),
  consultantName: "", consultantPhone: "", consultantCode: "", consultantTitle: "",
  officeName: "Global 1881 Gayrimenkul", officeAuthorizationNo: "3500211", officePhone: "", officeAddress: "",
});

export function authorityContractTitle(mode: AuthorityContractDetails["mode"]) {
  return mode === "sale" ? "SATIŞ YETKİ SÖZLEŞMESİ" : "KİRALAMA YETKİ SÖZLEŞMESİ";
}

export function renderAuthorityContract(details: AuthorityContractDetails) {
  const display = (value: string) => value.trim() || "................................";
  const action = details.mode === "sale" ? "satış" : "kiralama";
  const priceLabel = details.mode === "sale" ? "satış bedeli" : "aylık kira bedeli";
  return [
    authorityContractTitle(details.mode), "",
    `Taşınmaz maliki: ${display(details.ownerName)} | TCKN/VKN: ${display(details.ownerIdentity)}`,
    `Malik iletişim: ${display(details.ownerPhone)} | Adres: ${display(details.ownerAddress)}`,
    `Taşınmaz: ${display(details.propertyAddress)}`,
    `Ada/Parsel/Bağımsız Bölüm: ${display(details.parcelInfo)} | Nitelik: ${display(details.propertyType)}`,
    `Alan: ${display(details.grossM2)} m² | Oda: ${display(details.roomCount)} | Kat/Cephe: ${display(details.floorAndView)}`,
    `Durum: ${display(details.condition)} | Sözleşmeye esas ${priceLabel}: ${display(details.price)} ₺`, "",
    `Malik, yukarıda bilgileri belirtilen taşınmazın ${action} işlemleri için aşağıda bilgileri bulunan emlak danışmanını yetkilendirir.`,
    `Danışman: ${display(details.consultantName)} | Kod: ${display(details.consultantCode)} | Sıfat: ${display(details.consultantTitle)}`,
    `Danışman iletişim: ${display(details.consultantPhone)}`,
    `Ofis: ${display(details.officeName)} | Yetki belgesi no: ${display(details.officeAuthorizationNo)}`,
    `Ofis iletişim: ${display(details.officePhone)} | ${display(details.officeAddress)}`, "",
    `Bu belge ${display(details.contractDate)} tarihinde iki nüsha olarak düzenlenmiştir. Ana sözleşme maddeleri, ofis tarafından onaylanmış şablon sürümü üzerinden uygulanır.`,
  ].join("\n");
}
