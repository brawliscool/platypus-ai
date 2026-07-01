"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Car,
  CheckCircle2,
  Gauge,
  Loader2,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import AnimatedBackground from "./components/AnimatedBackground";
import PWAInstall from "./components/PWAInstall";

interface CarPhoto {
  id: string;
  photo: string;
  make: string;
  model: string;
  year: string;
  color: string;
  location: string;
  notes: string;
  favorite: boolean;
  createdAt: number;
}

type DraftCar = Omit<CarPhoto, "id" | "createdAt">;

const STORAGE_KEY = "garage_roll_collection";

const emptyDraft: DraftCar = {
  photo: "",
  make: "",
  model: "",
  year: "",
  color: "",
  location: "",
  notes: "",
  favorite: false,
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

function readLocalCollection() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CarPhoto[]) : [];
  } catch {
    return [];
  }
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to prepare this photo. Please try another image.");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.84);
}

export default function Home() {
  const [collection, setCollection] = useState<CarPhoto[]>([]);
  const [draft, setDraft] = useState<DraftCar>(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingPhoto, setIsReadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrateCollection = async () => {
      const localCars = readLocalCollection();
      await Promise.resolve();

      if (cancelled) return;

      setCollection(localCars);
      setSelectedId(localCars[0]?.id ?? null);

      try {
        const response = await fetch("/api/cars");
        if (!response.ok) throw new Error("Unable to load server collection.");

        const data = (await response.json()) as { cars: CarPhoto[] };
        if (cancelled) return;

        if (data.cars.length > 0) {
          setCollection(data.cars);
          setSelectedId(data.cars[0].id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.cars));
        }
      } catch {
        if (!cancelled) {
          setOfflineMode(true);
        }
      }
    };

    hydrateCollection();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }, [collection]);

  const filteredCars = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return collection;

    return collection.filter((carPhoto) =>
      [carPhoto.make, carPhoto.model, carPhoto.year, carPhoto.color, carPhoto.location, carPhoto.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [collection, query]);

  const selectedCar = collection.find((carPhoto) => carPhoto.id === selectedId) ?? filteredCars[0] ?? null;
  const favoriteCount = collection.filter((carPhoto) => carPhoto.favorite).length;
  const latestSpot = collection[0]?.location || "No spots yet";

  const updateDraft = (field: keyof DraftCar, value: string | boolean) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setError(null);
    setIsReadingPhoto(true);

    try {
      const photo = await compressImage(selected);
      setDraft((current) => ({ ...current, photo }));
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Unable to read this image.");
    } finally {
      setIsReadingPhoto(false);
    }
  };

  const resetDraft = () => {
    setDraft(emptyDraft);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveCar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!draft.photo) {
      setError("Add a car photo before saving this spot.");
      return;
    }

    if (!draft.make.trim() && !draft.model.trim()) {
      setError("Add at least a make or model so this car is easy to find later.");
      return;
    }

    setIsSaving(true);

    const optimisticCar: CarPhoto = {
      ...draft,
      id: crypto.randomUUID(),
      make: draft.make.trim(),
      model: draft.model.trim(),
      year: draft.year.trim(),
      color: draft.color.trim(),
      location: draft.location.trim(),
      notes: draft.notes.trim(),
      createdAt: Date.now(),
    };

    try {
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Unable to save this car.");
      }

      const body = (await response.json()) as { car: CarPhoto };
      setCollection((current) => [body.car, ...current]);
      setSelectedId(body.car.id);
      setOfflineMode(false);
    } catch (saveError) {
      setCollection((current) => [optimisticCar, ...current]);
      setSelectedId(optimisticCar.id);
      setOfflineMode(true);
      if (saveError instanceof Error) {
        setError(`${saveError.message} Saved locally on this device.`);
      }
    } finally {
      resetDraft();
      setIsSaving(false);
    }
  };

  const deleteCar = async (carId: string) => {
    setCollection((current) => current.filter((carPhoto) => carPhoto.id !== carId));
    setSelectedId((current) => (current === carId ? null : current));

    try {
      await fetch(`/api/cars?id=${encodeURIComponent(carId)}`, { method: "DELETE" });
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#070707] text-white selection:bg-amber-500/30 flex flex-col font-sans relative">
      <AnimatedBackground />
      <PWAInstall />

      <nav className="border-b border-white/10 py-4 relative z-10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">iOS garage</p>
              <h1 className="font-black text-xl tracking-tight">Garage Roll</h1>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-2 rounded-full bg-white text-black px-5 py-3 text-sm font-bold hover:bg-amber-200 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Capture car
          </button>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto w-full px-5 py-8 md:py-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100 mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Built for quick curbside car spotting
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                Collect every car that catches your eye.
              </h2>
              <p className="text-zinc-300 text-lg mt-5 leading-relaxed">
                Snap a picture, tag the make, model, color, location, and notes, then browse your personal garage from your iPhone home screen.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-7">
                <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
                  <p className="text-3xl font-black">{collection.length}</p>
                  <p className="text-xs text-zinc-500 mt-1">cars saved</p>
                </div>
                <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
                  <p className="text-3xl font-black">{favoriteCount}</p>
                  <p className="text-xs text-zinc-500 mt-1">favorites</p>
                </div>
                <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
                  <p className="text-sm font-bold truncate">{latestSpot}</p>
                  <p className="text-xs text-zinc-500 mt-1">latest spot</p>
                </div>
              </div>
            </div>

            <form onSubmit={saveCar} className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-5 md:p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-black">Add a car</h3>
                  <p className="text-sm text-zinc-500">Use the camera button on iOS for instant capture.</p>
                </div>
                {offlineMode && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-200">
                    <WifiOff className="w-3.5 h-3.5" />
                    local
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full overflow-hidden rounded-3xl border-2 border-dashed border-white/15 bg-white/[0.03] hover:border-amber-300/70 transition-colors"
              >
                {draft.photo ? (
                  <div className="relative h-56">
                    <Image src={draft.photo} alt="New car preview" fill className="object-cover" unoptimized />
                    <span className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                      Change photo
                    </span>
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center gap-3 text-zinc-400">
                    {isReadingPhoto ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                    <span className="font-semibold text-white">{isReadingPhoto ? "Preparing photo..." : "Take or upload a car photo"}</span>
                    <span className="text-xs">JPG, PNG, HEIC exports, or WEBP</span>
                  </div>
                )}
              </button>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <input value={draft.make} onChange={(event) => updateDraft("make", event.target.value)} placeholder="Make, e.g. Porsche" className="garage-input" />
                <input value={draft.model} onChange={(event) => updateDraft("model", event.target.value)} placeholder="Model, e.g. 911 GT3" className="garage-input" />
                <input value={draft.year} onChange={(event) => updateDraft("year", event.target.value)} placeholder="Year" inputMode="numeric" className="garage-input" />
                <input value={draft.color} onChange={(event) => updateDraft("color", event.target.value)} placeholder="Color" className="garage-input" />
                <input value={draft.location} onChange={(event) => updateDraft("location", event.target.value)} placeholder="Location spotted" className="garage-input sm:col-span-2" />
                <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} placeholder="Notes: trim, wheels, story, condition..." className="garage-input sm:col-span-2 min-h-24 resize-none" />
              </div>

              <label className="flex items-center gap-3 mt-4 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={draft.favorite}
                  onChange={(event) => updateDraft("favorite", event.target.checked)}
                  className="size-4 accent-amber-400"
                />
                Mark as a favorite spot
              </label>

              {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}

              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  disabled={isSaving || isReadingPhoto}
                  className="flex-1 rounded-full bg-amber-300 px-5 py-3 font-black text-black hover:bg-amber-200 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save to garage
                </button>
                <button type="button" onClick={resetDraft} className="rounded-full border border-white/10 px-5 py-3 font-bold text-zinc-300 hover:text-white">
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5 backdrop-blur-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search make, model, color, location, notes..."
                  className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm outline-none focus:border-amber-300/70"
                />
              </div>
            </div>

            {selectedCar && (
              <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/90 shadow-2xl">
                <div className="relative h-[22rem]">
                  <Image src={selectedCar.photo} alt={`${selectedCar.make} ${selectedCar.model}`} fill className="object-cover" unoptimized priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-amber-100 font-bold">{selectedCar.year || "Unknown year"}</p>
                        <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                          {[selectedCar.make, selectedCar.model].filter(Boolean).join(" ")}
                        </h3>
                      </div>
                      {selectedCar.favorite && (
                        <div className="rounded-full bg-amber-300 p-3 text-black">
                          <Star className="w-5 h-5 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6 grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/[0.04] p-4 border border-white/10">
                    <Gauge className="w-4 h-4 text-amber-200 mb-2" />
                    <p className="text-xs text-zinc-500">Color</p>
                    <p className="font-bold">{selectedCar.color || "Unlisted"}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-4 border border-white/10">
                    <MapPin className="w-4 h-4 text-amber-200 mb-2" />
                    <p className="text-xs text-zinc-500">Location</p>
                    <p className="font-bold">{selectedCar.location || "Unlisted"}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.04] p-4 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-amber-200 mb-2" />
                    <p className="text-xs text-zinc-500">Added</p>
                    <p className="font-bold">{formatDate(selectedCar.createdAt)}</p>
                  </div>
                  {selectedCar.notes && (
                    <p className="sm:col-span-3 rounded-2xl bg-white/[0.04] p-4 border border-white/10 text-zinc-300 leading-relaxed">
                      {selectedCar.notes}
                    </p>
                  )}
                </div>
              </article>
            )}

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCars.map((carPhoto) => (
                <button
                  key={carPhoto.id}
                  onClick={() => setSelectedId(carPhoto.id)}
                  className={`group text-left overflow-hidden rounded-3xl border bg-white/[0.04] transition-all ${
                    selectedCar?.id === carPhoto.id ? "border-amber-300/80" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="relative h-40">
                    <Image src={carPhoto.photo} alt={`${carPhoto.make} ${carPhoto.model}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {carPhoto.favorite && <Star className="w-4 h-4 text-amber-300 fill-current" />}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteCar(carPhoto.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            deleteCar(carPhoto.id);
                          }
                        }}
                        className="rounded-full bg-black/60 p-2 text-zinc-300 hover:text-red-200 backdrop-blur"
                        aria-label={`Delete ${carPhoto.make} ${carPhoto.model}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-black truncate">{[carPhoto.make, carPhoto.model].filter(Boolean).join(" ")}</p>
                    <p className="text-sm text-zinc-500 truncate">{carPhoto.location || carPhoto.color || "Car spot"}</p>
                  </div>
                </button>
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <Car className="w-10 h-10 mx-auto text-zinc-600" />
                <h3 className="font-black text-xl mt-4">No cars found</h3>
                <p className="text-zinc-500 mt-2">{collection.length === 0 ? "Capture your first car to start the garage." : "Try a different search."}</p>
                {query && (
                  <button onClick={() => setQuery("")} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold">
                    <X className="w-4 h-4" />
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-zinc-600 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} Garage Roll. Collect responsibly and respect private property.</p>
      </footer>
    </main>
  );
}
