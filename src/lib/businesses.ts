// ─── Shared business config & API helper ─────────────────────────────────────
// Used by the compare page and booking page alike.

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export type BusinessConfig = {
  id: string;
  img: string;
  bg?: string;
  /** null means dummy/static — no real backend business */
  businessId: string | null;
  name: string;
  rating: string;
  distance: string;
  tags: string[];
  transfer: string;
  type: string;
  cancellation: string;
  security: string;
  /** External booking URL for the business's own site; null for dummies */
  bookingUrl: string | null;
  highlighted: boolean;
  dummyStartingPrice?: number;
};

export const BUSINESSES: BusinessConfig[] = [
  // {
  //   id: "parkease",
  //   img: "/parkease_logo.svg",
  //   bg: "bg-[#155263]",
  //   businessId: null,
  //   name: "ParkEase",
  //   rating: "4.4 Excellent",
  //   distance: "0.8 miles",
  //   tags: ["Best Price", "Cheapest"],
  //   transfer: "12 min",
  //   type: "Indoor Covered",
  //   cancellation: "Free",
  //   security: "24/7 Patrol",
  //   bookingUrl: null,
  //   highlighted: true,
  //   dummyStartingPrice: 4.9,
  // },
  {
    id: "parkpro",
    img: "https://parkpro.uk/logo.svg",
    bg: "bg-[#ffeada]",
    businessId: "69c58c8616860ff720b40e4c",
    name: "ParkPro",
    rating: "4.8 Excellent",
    distance: "0.3 miles",
    tags: ["Best Rated"],
    transfer: "8 min",
    type: "Indoor Covered",
    cancellation: "Free",
    security: "24/7 Patrol",
    bookingUrl: "https://parkpro.uk",
    highlighted: false,
  },
  {
    id: "heathrow",
    img: "https://heathrowsafeparking.com/favicon.svg",
    bg: "bg-[#d3eff4]",
    businessId: "69d3f081f2245d52c5927d3d",
    name: "Heathrow Safe Parking",
    rating: "4.6 Excellent",
    distance: "0.1 miles",
    tags: ["Fastest Transfer"],
    transfer: "5 min",
    type: "Open Air",
    cancellation: "Free",
    security: "24/7 Patrol",
    bookingUrl: "https://heathrowsafeparking.com",
    highlighted: false,
  },
];

/** Returns the BusinessConfig for a given businessId, or undefined if not found. */
export const getBrandByBusinessId = (businessId: string): BusinessConfig | undefined =>
  BUSINESSES.find((b) => b.businessId === businessId);

/** Fetch any business API endpoint with the given business ID header. */
export async function fetchForBusiness<T>(
  endpoint: string,
  businessId: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "X-Business-Id": businessId,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as T;
}
