export async function geocodeLocation(
  city: string,
  state: string,
  country: string
): Promise<{ latitude: number; longitude: number } | null> {
  const query = encodeURIComponent(`${city}, ${state}, ${country}`);

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
    {
      headers: {
        "User-Agent": "BarterHub/1.0 (support@postocard.com)",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();

  if (!data || data.length === 0) return null;

  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
  };
}
