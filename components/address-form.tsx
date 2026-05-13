"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AddressResult {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  apartment: string;
}

interface LocationIQItem {
  display_name: string;
  type?: string;
  class?: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    region?: string;
    county?: string;
    road?: string;
    pedestrian?: string;
    house_number?: string;
    postcode?: string;
    country?: string;
    name?: string;
  };
}

const LIQ_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY ?? "";

function useLIQ(query: string, extraParams: Record<string, string> = {}) {
  const [suggestions, setSuggestions] = useState<LocationIQItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const extraKey = JSON.stringify(extraParams);

  useEffect(() => {
    if (!query || query.length < 2) { setSuggestions([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          key: LIQ_KEY,
          q: query,
          countrycodes: "by",
          "accept-language": "ru",
          addressdetails: "1",
          limit: "7",
          dedupe: "1",
          normalizeaddress: "1",
          ...extraParams,
        });
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete?${params}`);
        if (!res.ok) return;
        const json = await res.json();
        setSuggestions(Array.isArray(json) ? json : []);
      } catch { /* ignore */ }
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, extraKey]);

  return { suggestions, clear: () => setSuggestions([]) };
}

function inputCls(error?: string, touched?: boolean) {
  return cn(
    "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
    !touched
      ? "border-input focus-visible:ring-ring"
      : error
      ? "border-red-500 focus-visible:ring-red-500"
      : "border-green-500 focus-visible:ring-green-500"
  );
}

function ACField({
  label, placeholder, value, onChange, onBlur, onSelect, suggestions, clearSuggestions, renderLabel, error, touched, disabled,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; onBlur?: () => void;
  onSelect: (f: LocationIQItem) => void;
  suggestions: LocationIQItem[]; clearSuggestions: () => void;
  renderLabel: (f: LocationIQItem) => string;
  error?: string; touched?: boolean; disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) clearSuggestions(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="space-y-1" ref={ref}>
      <label className="text-sm font-medium leading-none">{label}</label>
      <div className="relative">
        <input
          className={inputCls(error, touched)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete="off"
          disabled={disabled}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-52 overflow-y-auto">
            {suggestions.map((f, i) => (
              <li key={i} className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                onMouseDown={(e) => { e.preventDefault(); onSelect(f); }}>
                {renderLabel(f)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {touched && error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const emptyAddr = { street: "", city: "", state: "", postalCode: "", country: "Беларусь" };

interface Props {
  onChange: (result: AddressResult | null) => void;
  initialValue?: Partial<AddressResult>;
}

function parseStreetAndHouse(street: string): { streetName: string; house: string } {
  const match = street.match(/^(.+?),\s*д\.\s*(.+)$/);
  if (match) return { streetName: match[1].trim(), house: match[2].trim() };
  return { streetName: street, house: "" };
}

export function AddressFormLIQ({ onChange, initialValue }: Props) {
  const hasInitial = !!(initialValue?.city && initialValue?.street);
  const { streetName: initStreetName, house: initHouse } = hasInitial
    ? parseStreetAndHouse(initialValue!.street!)
    : { streetName: "", house: "" };

  const [cityQuery, setCityQuery] = useState(initialValue?.city ?? "");
  const [cityConfirmed, setCityConfirmed] = useState(hasInitial);
  const [streetQuery, setStreetQuery] = useState(initStreetName);
  const [streetConfirmed, setStreetConfirmed] = useState(hasInitial);
  const [houseQuery, setHouseQuery] = useState(initHouse);
  const [houseConfirmed, setHouseConfirmed] = useState(hasInitial);
  const [apartment, setApartment] = useState(initialValue?.apartment ?? "");
  const [addr, setAddr] = useState({
    ...emptyAddr,
    city: initialValue?.city ?? "",
    state: initialValue?.state ?? "",
    postalCode: initialValue?.postalCode ?? "",
    street: initialValue?.street ?? "",
    country: initialValue?.country ?? "Беларусь",
  });
  const [touched, setTouched] = useState({ city: false, street: false, house: false, apartment: false });

  const { suggestions: rawCity, clear: clearCity } = useLIQ(cityConfirmed ? "" : cityQuery, {});
  const citySuggestions = rawCity.filter((f) => {
    const t = f.type ?? "";
    const cls = f.class ?? "";
    return cls === "place" && ["city", "town", "village", "hamlet"].includes(t);
  });

  const { suggestions: rawStreet, clear: clearStreet } = useLIQ(
    cityConfirmed && !streetConfirmed && streetQuery ? `${addr.city} ${streetQuery}` : "",
    {}
  );
  const streetSuggestions = (() => {
    const seen = new Set<string>();
    const result: LocationIQItem[] = [];
    for (const f of rawStreet) {
      const road = f.address.road || f.address.pedestrian || f.address.name;
      if (!road) continue;
      if (!f.class || !["highway"].includes(f.class)) continue;
      const city = f.address.city || f.address.town || f.address.village;
      if (city && addr.city && city !== addr.city) continue;
      if (seen.has(road)) continue;
      seen.add(road);
      result.push(f);
    }
    return result;
  })();

  const { suggestions: rawHouse, clear: clearHouse } = useLIQ(
    cityConfirmed && streetConfirmed && !houseConfirmed && houseQuery
      ? `${addr.city} ${streetQuery} ${houseQuery}`
      : "",
    {}
  );
  const houseSuggestions = rawHouse.filter((f) => {
    if (!f.address.house_number) return false;
    const road = f.address.road || f.address.pedestrian || f.address.name || "";
    return road.toLowerCase().includes(streetQuery.toLowerCase()) ||
      streetQuery.toLowerCase().includes(road.toLowerCase());
  });

  useEffect(() => {
    if (houseConfirmed && apartment) {
      onChange({ ...addr, apartment });
    } else {
      onChange(null);
    }
  }, [houseConfirmed, addr, apartment]);

  // Emit initial value immediately if pre-filled
  useEffect(() => {
    if (hasInitial && initialValue?.apartment) {
      onChange({ ...addr, apartment: initialValue.apartment });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickCity(f: LocationIQItem) {
    const a = f.address;
    const city = a.city || a.town || a.village || a.municipality || a.name || "";
    const next = { ...emptyAddr, city, state: a.state || a.region || a.county || "" };
    setCityQuery(city); setCityConfirmed(true); setAddr(next);
    clearCity();
    setStreetQuery(""); setStreetConfirmed(false);
    setHouseQuery(""); setHouseConfirmed(false);
  }

  function pickStreet(f: LocationIQItem) {
    const street = f.address.road || f.address.pedestrian || f.address.name || "";
    setStreetQuery(street); setStreetConfirmed(true);
    setAddr((p) => ({ ...p, street }));
    clearStreet();
    setHouseQuery(""); setHouseConfirmed(false);
  }

  function pickHouse(f: LocationIQItem) {
    const a = f.address;
    const house = a.house_number || houseQuery;
    setHouseQuery(house); setHouseConfirmed(true);
    setAddr((p) => {
      const n = {
        ...p,
        street: `${p.street}, д. ${house}`,
        postalCode: a.postcode || p.postalCode,
      };
      return n;
    });
    clearHouse();
  }

  function handleApartmentChange(v: string) {
    setApartment(v);
  }

  const errors = {
    city: !cityConfirmed ? "Выберите город из списка" : undefined,
    street: cityConfirmed && !streetConfirmed ? "Выберите улицу из списка" : undefined,
    house: cityConfirmed && streetConfirmed && !houseConfirmed ? "Выберите дом из списка" : undefined,
    apartment: houseConfirmed && !apartment ? "Обязательное поле" : undefined,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <ACField
          label="Город *"
          placeholder="Минск"
          value={cityQuery}
          onChange={(v) => { setCityQuery(v); setCityConfirmed(false); setStreetQuery(""); setStreetConfirmed(false); setHouseQuery(""); setHouseConfirmed(false); }}
          onBlur={() => setTouched((p) => ({ ...p, city: true }))}
          onSelect={pickCity}
          suggestions={citySuggestions}
          clearSuggestions={clearCity}
          renderLabel={(f) => {
            const a = f.address;
            const city = a.city || a.town || a.village || a.municipality || a.name || "";
            const region = a.state || a.region || a.county || "";
            return [city, region].filter(Boolean).join(", ");
          }}
          error={errors.city}
          touched={touched.city}
        />
      </div>

      <div className="sm:col-span-2">
        <ACField
          label="Улица *"
          placeholder="Независимости"
          value={streetQuery}
          onChange={(v) => { setStreetQuery(v); setStreetConfirmed(false); setHouseQuery(""); setHouseConfirmed(false); }}
          onBlur={() => setTouched((p) => ({ ...p, street: true }))}
          onSelect={pickStreet}
          suggestions={streetSuggestions}
          clearSuggestions={clearStreet}
          renderLabel={(f) => f.address.road || f.address.pedestrian || f.address.name || ""}
          error={errors.street}
          touched={touched.street}
          disabled={!cityConfirmed}
        />
      </div>

      {/* House */}
      <div>
        <ACField
          label="Дом *"
          placeholder="10"
          value={houseQuery}
          onChange={(v) => { setHouseQuery(v); setHouseConfirmed(false); }}
          onBlur={() => setTouched((p) => ({ ...p, house: true }))}
          onSelect={pickHouse}
          suggestions={houseSuggestions}
          clearSuggestions={clearHouse}
          renderLabel={(f) => [f.address.road || f.address.pedestrian, f.address.house_number].filter(Boolean).join(", д. ")}
          error={errors.house}
          touched={touched.house}
          disabled={!streetConfirmed}
        />
      </div>

      {/* Apartment */}
      <div className="space-y-1">
        <label className="text-sm font-medium leading-none">Квартира *</label>
        <input
          className={inputCls(errors.apartment, touched.apartment)}
          placeholder="15"
          value={apartment}
          disabled={!houseConfirmed}
          autoComplete="off"
          onChange={(e) => handleApartmentChange(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, apartment: true }))}
        />
        {touched.apartment && errors.apartment && <p className="text-xs text-red-500">{errors.apartment}</p>}
      </div>

      {/* Postal code */}
      <div className="space-y-1">
        <label className="text-sm font-medium leading-none text-muted-foreground">Индекс</label>
        <input
          readOnly disabled
          className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          value={addr.postalCode}
          placeholder="Определяется автоматически"
        />
      </div>

      {/* Region */}
      {addr.state && (
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none text-muted-foreground">Область</label>
          <input
            readOnly disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            value={addr.state}
          />
        </div>
      )}
    </div>
  );
}
