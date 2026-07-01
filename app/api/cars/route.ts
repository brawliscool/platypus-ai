import { NextResponse } from "next/server";

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

type CarDraft = Omit<CarPhoto, "id" | "createdAt">;

const cars = new Map<string, CarPhoto>();

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 240) : "";
}

function parseDraft(body: unknown): CarDraft | null {
  if (!body || typeof body !== "object") return null;

  const payload = body as Record<string, unknown>;
  const photo = clean(payload.photo);
  const make = clean(payload.make);
  const model = clean(payload.model);

  if (!photo.startsWith("data:image/")) return null;
  if (!make && !model) return null;

  return {
    photo,
    make,
    model,
    year: clean(payload.year).slice(0, 12),
    color: clean(payload.color),
    location: clean(payload.location),
    notes: clean(payload.notes).slice(0, 1000),
    favorite: Boolean(payload.favorite),
  };
}

export async function GET() {
  return NextResponse.json({
    cars: Array.from(cars.values()).sort((a, b) => b.createdAt - a.createdAt),
  });
}

export async function POST(request: Request) {
  const draft = parseDraft(await request.json().catch(() => null));

  if (!draft) {
    return NextResponse.json(
      { error: "A car photo and at least a make or model are required." },
      { status: 400 },
    );
  }

  const car: CarPhoto = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  cars.set(car.id, car);

  return NextResponse.json({ car }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing car id." }, { status: 400 });
  }

  cars.delete(id);

  return NextResponse.json({ ok: true });
}
