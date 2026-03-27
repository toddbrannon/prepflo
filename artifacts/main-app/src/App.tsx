import { useState, useEffect } from "react";

// ─── Types & constants ────────────────────────────────────────────────────────

type Tab = "events" | "build-event" | "menu-database";

const tabs: { id: Tab; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "build-event", label: "Build Event" },
  { id: "menu-database", label: "Menu Database" },
];

const CATEGORIES = [
  "Boards",
  "Passed Appetizers",
  "Sides / Salads",
  "Entrees",
  "Desserts",
  "Custom",
] as const;

type Category = (typeof CATEGORIES)[number];

interface PrepItem {
  id: string;
  name: string;
  defaultQty: string;
  allergyNote: string;
}

interface Dish {
  id: string;
  name: string;
  category: Category;
  prepItems: PrepItem[];
}

interface EventPrepItem {
  prepItemId: string;
  name: string;
  qty: string;
  allergyNote: string;
}

interface EventDish {
  dishId: string;
  name: string;
  category: Category;
  prepItems: EventPrepItem[];
}

interface SavedEvent {
  id: string;
  name: string;
  client: string;
  date: string;
  startTime: string;
  guestCount: string;
  venue: string;
  onsiteContact: string;
  allergies: string;
  notes: string;
  dishes: EventDish[];
  savedAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const MENU_KEY    = "pf_menu";
const EVENTS_KEY  = "build-events";
const COMPANY_KEY = "eventops-company-name";

function loadCompanyName(): string { return localStorage.getItem(COMPANY_KEY) ?? ""; }
function saveCompanyName(n: string) { localStorage.setItem(COMPANY_KEY, n); }

function saveDishes(dishes: Dish[]) { localStorage.setItem(MENU_KEY, JSON.stringify(dishes)); }
function loadDishes(): Dish[] {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw === null) { saveDishes(SEED_DISHES); return SEED_DISHES; }
    const parsed = JSON.parse(raw);
    // Auto-migrate from old MenuItem format (no prepItems) → reseed
    if (Array.isArray(parsed) && parsed.length > 0 && !("prepItems" in parsed[0])) {
      saveDishes(SEED_DISHES); return SEED_DISHES;
    }
    return parsed;
  } catch { return []; }
}

function persistEvents(events: SavedEvent[]) { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }
function loadEvents(): SavedEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Auto-migrate from old format (lineItems) → clear
    if (Array.isArray(parsed) && parsed.length > 0 && !("dishes" in parsed[0])) {
      localStorage.removeItem(EVENTS_KEY); return [];
    }
    return parsed;
  } catch { return []; }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_DISHES: Dish[] = [
  {
    id: "dish-1", name: "Charcuterie & Cheese Board", category: "Boards",
    prepItems: [
      { id: "d1p1", name: "Cured Meats Selection",    defaultQty: "2 lbs",    allergyNote: "" },
      { id: "d1p2", name: "Artisan Cheeses",           defaultQty: "1.5 lbs", allergyNote: "Dairy" },
      { id: "d1p3", name: "Seasonal Fruit & Garnish",  defaultQty: "1 lb",    allergyNote: "" },
      { id: "d1p4", name: "Crackers & Crostini",       defaultQty: "3 packs", allergyNote: "Gluten" },
      { id: "d1p5", name: "Honeycomb & Preserves",     defaultQty: "4 oz",    allergyNote: "" },
    ],
  },
  {
    id: "dish-2", name: "Bruschetta al Pomodoro", category: "Passed Appetizers",
    prepItems: [
      { id: "d2p1", name: "Toasted Crostini",          defaultQty: "60 pcs",  allergyNote: "Gluten" },
      { id: "d2p2", name: "Tomato & Basil Topping",    defaultQty: "2 qts",   allergyNote: "" },
    ],
  },
  {
    id: "dish-3", name: "Caprese Skewers", category: "Passed Appetizers",
    prepItems: [
      { id: "d3p1", name: "Fresh Mozzarella",          defaultQty: "1.5 lbs", allergyNote: "Dairy" },
      { id: "d3p2", name: "Cherry Tomatoes",           defaultQty: "1 pt",    allergyNote: "" },
      { id: "d3p3", name: "Basil Leaves",              defaultQty: "1 bunch", allergyNote: "" },
      { id: "d3p4", name: "Balsamic Glaze",            defaultQty: "4 oz",    allergyNote: "" },
    ],
  },
  {
    id: "dish-4", name: "Caesar Salad", category: "Sides / Salads",
    prepItems: [
      { id: "d4p1", name: "Romaine Hearts",            defaultQty: "4 heads", allergyNote: "" },
      { id: "d4p2", name: "House Caesar Dressing",     defaultQty: "1 qt",    allergyNote: "Eggs, Anchovies, Dairy" },
      { id: "d4p3", name: "Shaved Parmesan",           defaultQty: "0.5 lb",  allergyNote: "Dairy" },
      { id: "d4p4", name: "House-Made Croutons",       defaultQty: "2 cups",  allergyNote: "Gluten" },
    ],
  },
  {
    id: "dish-5", name: "Wild Rice Pilaf", category: "Sides / Salads",
    prepItems: [
      { id: "d5p1", name: "Wild Rice Blend",           defaultQty: "3 lbs dry", allergyNote: "" },
      { id: "d5p2", name: "Chicken Stock",             defaultQty: "2 qts",   allergyNote: "" },
      { id: "d5p3", name: "Toasted Pecans",            defaultQty: "0.5 lb",  allergyNote: "Tree Nuts" },
      { id: "d5p4", name: "Shallots & Fresh Herbs",    defaultQty: "4 oz",    allergyNote: "" },
    ],
  },
  {
    id: "dish-6", name: "Roasted Garlic Mashed Potatoes", category: "Sides / Salads",
    prepItems: [
      { id: "d6p1", name: "Yukon Gold Potatoes",       defaultQty: "10 lbs",  allergyNote: "" },
      { id: "d6p2", name: "Roasted Garlic",            defaultQty: "6 heads", allergyNote: "" },
      { id: "d6p3", name: "Butter & Heavy Cream",      defaultQty: "1 lb / 1 pt", allergyNote: "Dairy" },
    ],
  },
  {
    id: "dish-7", name: "Herb-Roasted Chicken Breast", category: "Entrees",
    prepItems: [
      { id: "d7p1", name: "Airline Chicken Breasts",   defaultQty: "30 portions", allergyNote: "" },
      { id: "d7p2", name: "Herb Marinade",             defaultQty: "1 qt",    allergyNote: "" },
      { id: "d7p3", name: "Pan Jus",                   defaultQty: "1 qt",    allergyNote: "" },
    ],
  },
  {
    id: "dish-8", name: "Beef Tenderloin", category: "Entrees",
    prepItems: [
      { id: "d8p1", name: "Beef Tenderloin Roasts",    defaultQty: "10 lbs",  allergyNote: "" },
      { id: "d8p2", name: "Red Wine Demi-Glace",       defaultQty: "1 qt",    allergyNote: "" },
      { id: "d8p3", name: "Garlic Compound Butter",    defaultQty: "0.5 lb",  allergyNote: "Dairy" },
    ],
  },
  {
    id: "dish-9", name: "Pan-Seared Salmon", category: "Entrees",
    prepItems: [
      { id: "d9p1", name: "Salmon Fillets 6 oz",       defaultQty: "30 portions", allergyNote: "Fish" },
      { id: "d9p2", name: "Lemon Beurre Blanc",        defaultQty: "1 qt",    allergyNote: "Dairy" },
      { id: "d9p3", name: "Fresh Dill Garnish",        defaultQty: "1 bunch", allergyNote: "" },
    ],
  },
  {
    id: "dish-10", name: "Chocolate Lava Cake", category: "Desserts",
    prepItems: [
      { id: "d10p1", name: "Lava Cake Molds",          defaultQty: "30 pcs",  allergyNote: "Eggs, Gluten, Dairy" },
      { id: "d10p2", name: "Vanilla Crème Anglaise",   defaultQty: "1 qt",    allergyNote: "Eggs, Dairy" },
      { id: "d10p3", name: "Fresh Berry Garnish",      defaultQty: "1 pt",    allergyNote: "" },
    ],
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(timeStr: string) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const WarningIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

// ─── Prep Sheet Modal ─────────────────────────────────────────────────────────

function PrepSheetModal({ event, companyName, onClose }: { event: SavedEvent; companyName: string; onClose: () => void }) {
  const generatedAt = new Date().toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  // Only show dishes that have at least one prep item with a qty entered
  const dishesWithQty = event.dishes.map((d) => ({
    ...d,
    prepItems: d.prepItems.filter((p) => p.qty.trim() !== ""),
  })).filter((d) => d.prepItems.length > 0);

  const usedCategories = CATEGORIES.filter((cat) => dishesWithQty.some((d) => d.category === cat));

  useEffect(() => {
    document.body.classList.add("prep-sheet-open");
    return () => document.body.classList.remove("prep-sheet-open");
  }, []);

  return (
    <div
      className="prep-sheet-backdrop fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="prep-sheet-content w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="border-b border-border px-6 pt-6 pb-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-accent flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="hsl(222 18% 9%)" strokeWidth={2.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {companyName || "EventOps"} — Prep Sheet
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Generated {generatedAt}</span>
              <button onClick={() => window.print()}
                className="no-print inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 112 0 1 1 0 01-2 0zm2 2v2h4v-2H8z" clipRule="evenodd" />
                </svg>
                Print
              </button>
              <button onClick={onClose}
                className="no-print rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Close">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <h1 className="font-heading text-3xl font-semibold tracking-wide text-foreground leading-tight">{event.name}</h1>
          {event.notes && <p className="mt-1.5 text-sm text-muted-foreground italic">{event.notes}</p>}

          {/* Metadata bar */}
          <div className="ps-meta-bar mt-4 flex flex-wrap gap-px rounded-lg border border-border overflow-hidden text-sm">
            {[
              { label: "Client",          value: event.client || "—" },
              { label: "Date",            value: event.date ? formatDate(event.date) : "—" },
              { label: "Start Time",      value: event.startTime ? formatTime(event.startTime) : "—" },
              { label: "Guest Count",     value: event.guestCount || "—" },
              { label: "Venue",           value: event.venue || "—" },
              { label: "Onsite Contact",  value: event.onsiteContact || "—" },
              { label: "Dishes",          value: String(dishesWithQty.length) },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 min-w-[110px] bg-muted/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Allergy warning banner */}
          {event.allergies && (
            <div className="ps-allergy-banner mt-4 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <span className="text-amber-400 mt-0.5"><WarningIcon /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Allergy Alert</p>
                <p className="text-sm text-foreground leading-relaxed">{event.allergies}</p>
              </div>
            </div>
          )}
        </div>

        {/* Items by category */}
        <div className="px-6 py-6 space-y-7">
          {dishesWithQty.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {event.dishes.length === 0
                ? "No dishes on this event."
                : "No prep items have quantities entered. Edit the event and fill in quantities."}
            </p>
          ) : (
            usedCategories.map((cat) => {
              const catDishes = dishesWithQty.filter((d) => d.category === cat);
              return (
                <div key={cat} className="ps-category-block">
                  <p className="ps-category-label font-heading text-xs font-bold uppercase tracking-widest text-accent pb-1.5 mb-4 border-b border-border">
                    {cat}
                  </p>
                  <div className="space-y-5">
                    {catDishes.map((dish) => (
                      <div key={dish.dishId}>
                        <p className="text-sm font-semibold text-foreground mb-2">{dish.name}</p>
                        <div className="rounded-lg border border-border overflow-x-auto">
                          <table className="w-full text-sm min-w-[440px]">
                            <thead>
                              <tr className="bg-muted/60 border-b border-border">
                                <th className="text-left px-4 py-2 font-semibold text-foreground w-[40%]">Prep Item</th>
                                <th className="text-right px-4 py-2 font-semibold text-foreground w-[18%]">Qty</th>
                                <th className="text-left px-4 py-2 font-semibold text-foreground">Allergy Note</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {dish.prepItems.map((p) => (
                                <tr key={p.prepItemId} className="bg-card">
                                  <td className="px-4 py-2.5 font-medium text-foreground align-top">{p.name}</td>
                                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground align-top">{p.qty}</td>
                                  <td className="px-4 py-2.5 align-top">
                                    {p.allergyNote
                                      ? <span className="inline-flex items-center gap-1 text-xs text-amber-400"><WarningIcon />{p.allergyNote}</span>
                                      : <span className="text-muted-foreground">—</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Signature lines */}
        <div className="ps-signature-block border-t border-border px-6 py-6">
          <div className="grid grid-cols-2 gap-12">
            {["Prepared by", "Approved by"].map((label) => (
              <div key={label}>
                <div className="h-10" />
                <div className="ps-sig-line border-t border-foreground/40 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <div className="mt-1 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="no-print border-t border-border px-6 py-4 flex justify-end">
          <button onClick={onClose}
            className="rounded-md border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({ onEdit, onViewPrepSheet }: {
  onEdit: (event: SavedEvent) => void;
  onViewPrepSheet: (event: SavedEvent) => void;
}) {
  const [events, setEvents] = useState<SavedEvent[]>([]);
  useEffect(() => { setEvents(loadEvents()); }, []);

  const sorted = [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">Events</h2>
        <p className="mt-1 text-muted-foreground">All saved events, sorted by date.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
          <p className="text-muted-foreground text-sm">
            No events saved yet. Use <span className="text-accent font-medium">Build Event</span> to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((event) => (
            <div key={event.id}
              className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4 hover:border-accent/50 transition-colors">
              <div className="flex-1 space-y-1.5">
                <h3 className="font-heading text-xl font-semibold text-foreground leading-tight">{event.name}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-60">
                        <path d="M5 .5a.5.5 0 0 1 .5.5v.5h5V1a.5.5 0 0 1 1 0v.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h1.5V1A.5.5 0 0 1 5 .5zM3 3a1 1 0 0 0-1 1v1h12V4a1 1 0 0 0-1-1H3zm11 3H2v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6z" />
                      </svg>
                      {formatDate(event.date)}{event.startTime ? ` · ${formatTime(event.startTime)}` : ""}
                    </span>
                  )}
                  {event.client && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-60">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                      </svg>
                      {event.client}
                    </span>
                  )}
                  {event.venue && (
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-60 flex-shrink-0">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                      </svg>
                      <span className="truncate">{event.venue}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {event.guestCount && (
                    <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {event.guestCount} guests
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {event.dishes.length} dish{event.dishes.length !== 1 ? "es" : ""}
                  </span>
                  {event.allergies && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                      <WarningIcon /> Allergens
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 border-t border-border pt-3">
                <button onClick={() => onEdit(event)}
                  className="flex-1 rounded-md border border-border py-1.5 text-xs font-medium text-foreground hover:bg-secondary hover:border-accent/40 transition-colors">
                  Edit
                </button>
                <button onClick={() => onViewPrepSheet(event)}
                  className="flex-1 rounded-md bg-accent py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all">
                  View Prep Sheet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Build Event Tab ──────────────────────────────────────────────────────────

const emptyDetails = {
  name: "", client: "", date: "", startTime: "", guestCount: "",
  venue: "", onsiteContact: "", allergies: "", notes: "",
};

function BuildEventTab({ editingEvent, onClearEdit }: {
  editingEvent: SavedEvent | null;
  onClearEdit: () => void;
}) {
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [details, setDetails] = useState(emptyDetails);
  const [eventDishes, setEventDishes] = useState<EventDish[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [selectedDishId, setSelectedDishId] = useState("");
  const [saveMsg, setSaveMsg] = useState<"saved" | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => { setAllDishes(loadDishes()); }, []);

  useEffect(() => {
    if (editingEvent) {
      setDetails({
        name: editingEvent.name,
        client: editingEvent.client,
        date: editingEvent.date,
        startTime: editingEvent.startTime ?? "",
        guestCount: editingEvent.guestCount,
        venue: editingEvent.venue ?? "",
        onsiteContact: editingEvent.onsiteContact ?? "",
        allergies: editingEvent.allergies ?? "",
        notes: editingEvent.notes,
      });
      setEventDishes(editingEvent.dishes);
      setSelectedCategory("");
      setSelectedDishId("");
      setFormError("");
      setSaveMsg(null);
    }
  }, [editingEvent]);

  const categoriesWithDishes = CATEGORIES.filter((cat) => allDishes.some((d) => d.category === cat));
  const dishesForCategory = selectedCategory ? allDishes.filter((d) => d.category === selectedCategory) : [];

  function handleAddDish() {
    if (!selectedCategory || !selectedDishId) return;
    const dish = allDishes.find((d) => d.id === selectedDishId);
    if (!dish || eventDishes.some((ed) => ed.dishId === selectedDishId)) return;
    setEventDishes((prev) => [
      ...prev,
      {
        dishId: dish.id,
        name: dish.name,
        category: dish.category,
        prepItems: dish.prepItems.map((p) => ({
          prepItemId: p.id,
          name: p.name,
          qty: p.defaultQty,
          allergyNote: p.allergyNote,
        })),
      },
    ]);
    setSelectedDishId("");
  }

  function handlePrepItemQtyChange(dishId: string, prepItemId: string, qty: string) {
    setEventDishes((prev) =>
      prev.map((d) =>
        d.dishId === dishId
          ? { ...d, prepItems: d.prepItems.map((p) => p.prepItemId === prepItemId ? { ...p, qty } : p) }
          : d
      )
    );
  }

  function handleRemoveDish(dishId: string) {
    setEventDishes((prev) => prev.filter((d) => d.dishId !== dishId));
  }

  function handleSave() {
    if (!details.name.trim()) { setFormError("Event Name is required."); return; }
    setFormError("");
    const existing = loadEvents();
    if (editingEvent) {
      persistEvents(existing.map((ev) =>
        ev.id === editingEvent.id
          ? { ...ev, ...details, name: details.name.trim(), client: details.client.trim(), dishes: eventDishes }
          : ev
      ));
    } else {
      persistEvents([...existing, {
        id: crypto.randomUUID(),
        ...details,
        name: details.name.trim(),
        client: details.client.trim(),
        dishes: eventDishes,
        savedAt: new Date().toISOString(),
      }]);
    }
    setSaveMsg("saved");
    setTimeout(() => setSaveMsg(null), 3000);
  }

  function handleReset() {
    setDetails(emptyDetails);
    setEventDishes([]);
    setSelectedCategory("");
    setSelectedDishId("");
    setFormError("");
    setSaveMsg(null);
    onClearEdit();
  }

  const dishesByCategory = CATEGORIES.filter((cat) => eventDishes.some((d) => d.category === cat));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">
            {editingEvent ? "Edit Event" : "Build Event"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {editingEvent
              ? `Editing "${editingEvent.name}" — changes will overwrite the saved version.`
              : "Fill in event details, then add dishes and adjust quantities."}
          </p>
        </div>
        {editingEvent && (
          <button onClick={handleReset}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            ← New Event
          </button>
        )}
      </div>

      {/* Event Details */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">Event Details</h3>
        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ev-name">Event Name *</label>
            <input id="ev-name" type="text" value={details.name}
              onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Spring Gala 2026" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ev-client">Client</label>
            <input id="ev-client" type="text" value={details.client}
              onChange={(e) => setDetails((d) => ({ ...d, client: e.target.value }))}
              placeholder="e.g. Acme Corp" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ev-date">Date</label>
            <input id="ev-date" type="date" value={details.date}
              onChange={(e) => setDetails((d) => ({ ...d, date: e.target.value }))}
              className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ev-time">Start Time</label>
            <input id="ev-time" type="time" value={details.startTime}
              onChange={(e) => setDetails((d) => ({ ...d, startTime: e.target.value }))}
              className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ev-guests">Guest Count</label>
            <input id="ev-guests" type="text" inputMode="numeric" value={details.guestCount}
              onChange={(e) => setDetails((d) => ({ ...d, guestCount: e.target.value }))}
              placeholder="e.g. 100" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ev-contact">Onsite Contact</label>
            <input id="ev-contact" type="text" value={details.onsiteContact}
              onChange={(e) => setDetails((d) => ({ ...d, onsiteContact: e.target.value }))}
              placeholder="Name & phone number" className={inputClass} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="ev-venue">Address / Venue</label>
          <input id="ev-venue" type="text" value={details.venue}
            onChange={(e) => setDetails((d) => ({ ...d, venue: e.target.value }))}
            placeholder="e.g. The Grand Ballroom, 123 Main St" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-amber-400" htmlFor="ev-allergies">
            <WarningIcon /> Allergies / Dietary Restrictions
          </label>
          <textarea id="ev-allergies" rows={2} value={details.allergies}
            onChange={(e) => setDetails((d) => ({ ...d, allergies: e.target.value }))}
            placeholder="List all known allergens for this event (e.g. Nut-free, gluten-free guests)..."
            className="w-full rounded-md border border-amber-500/50 bg-amber-500/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="ev-notes">Notes</label>
          <textarea id="ev-notes" rows={2} value={details.notes}
            onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Special requirements, themes, logistics..."
            className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* Two-panel dish builder */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: dish selector */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">Add Dishes</h3>
          {categoriesWithDishes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dishes in the Menu Database yet. Add some there first.</p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Category</label>
                <select value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value as Category | ""); setSelectedDishId(""); }}
                  className={inputClass}>
                  <option value="">— Select a category —</option>
                  {categoriesWithDishes.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Dish</label>
                <select value={selectedDishId}
                  onChange={(e) => setSelectedDishId(e.target.value)}
                  disabled={!selectedCategory}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">— Select a dish —</option>
                  {dishesForCategory.map((dish) => (
                    <option key={dish.id} value={dish.id}
                      disabled={eventDishes.some((ed) => ed.dishId === dish.id)}>
                      {dish.name}{eventDishes.some((ed) => ed.dishId === dish.id) ? " (added)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={handleAddDish}
                disabled={!selectedCategory || !selectedDishId}
                className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100">
                + Add Dish to Event
              </button>
            </div>
          )}
        </div>

        {/* Right: event dishes */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Event Dishes
            {eventDishes.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">({eventDishes.length})</span>
            )}
          </h3>
          {eventDishes.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No dishes added yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {dishesByCategory.map((cat) => {
                const catDishes = eventDishes.filter((d) => d.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">{cat}</p>
                    <div className="space-y-3">
                      {catDishes.map((dish) => (
                        <div key={dish.dishId} className="rounded-md border border-border bg-background overflow-hidden">
                          {/* Dish header */}
                          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                            <p className="text-sm font-semibold text-foreground">{dish.name}</p>
                            <button onClick={() => handleRemoveDish(dish.dishId)}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-2 flex-shrink-0"
                              aria-label="Remove dish">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          {/* Prep items */}
                          <div className="divide-y divide-border">
                            {dish.prepItems.map((p) => (
                              <div key={p.prepItemId} className="flex items-center gap-2 px-3 py-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                                  {p.allergyNote && (
                                    <p className="text-[10px] text-amber-400 flex items-center gap-0.5 mt-0.5">
                                      <WarningIcon /> {p.allergyNote}
                                    </p>
                                  )}
                                </div>
                                <input type="text" value={p.qty}
                                  onChange={(e) => handlePrepItemQtyChange(dish.dishId, p.prepItemId, e.target.value)}
                                  placeholder="Qty"
                                  className="w-24 rounded-md border border-input bg-card px-2 py-1 text-xs text-foreground text-right placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Save / Reset */}
      <div className="flex items-center gap-4 pb-4">
        <button type="button" onClick={handleSave}
          className="rounded-md bg-accent px-8 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all">
          {editingEvent ? "Save Changes" : "Save Event"}
        </button>
        <button type="button" onClick={handleReset}
          className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          {editingEvent ? "Cancel Edit" : "Reset"}
        </button>
        {saveMsg === "saved" && (
          <span className="text-sm text-accent font-medium">
            {editingEvent ? "Changes saved!" : "Event saved!"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Menu Database Tab ────────────────────────────────────────────────────────

function MenuDatabaseTab() {
  const [dishes, setDishes] = useState<Dish[]>(loadDishes);
  const [newForm, setNewForm] = useState<{ name: string; category: Category } | null>(null);
  const [newFormError, setNewFormError] = useState("");

  // Auto-persist on every change
  useEffect(() => { saveDishes(dishes); }, [dishes]);

  // ── Dish-level operations ──────────────────────────────────────────────────
  function handleAddDish(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm?.name.trim()) { setNewFormError("Dish name is required."); return; }
    setDishes((prev) => [...prev, {
      id: crypto.randomUUID(),
      name: newForm.name.trim(),
      category: newForm.category,
      prepItems: [],
    }]);
    setNewForm(null);
    setNewFormError("");
  }

  function updateDishName(dishId: string, name: string) {
    setDishes((prev) => prev.map((d) => d.id === dishId ? { ...d, name } : d));
  }

  function updateDishCategory(dishId: string, category: Category) {
    setDishes((prev) => prev.map((d) => d.id === dishId ? { ...d, category } : d));
  }

  function deleteDish(dishId: string) {
    setDishes((prev) => prev.filter((d) => d.id !== dishId));
  }

  // ── Prep-item-level operations ─────────────────────────────────────────────
  function addPrepItem(dishId: string) {
    setDishes((prev) => prev.map((d) =>
      d.id === dishId
        ? { ...d, prepItems: [...d.prepItems, { id: crypto.randomUUID(), name: "", defaultQty: "", allergyNote: "" }] }
        : d
    ));
  }

  function updatePrepItem(dishId: string, prepItemId: string, field: keyof PrepItem, value: string) {
    setDishes((prev) => prev.map((d) =>
      d.id === dishId
        ? { ...d, prepItems: d.prepItems.map((p) => p.id === prepItemId ? { ...p, [field]: value } : p) }
        : d
    ));
  }

  function removePrepItem(dishId: string, prepItemId: string) {
    setDishes((prev) => prev.map((d) =>
      d.id === dishId
        ? { ...d, prepItems: d.prepItems.filter((p) => p.id !== prepItemId) }
        : d
    ));
  }

  const usedCategories = CATEGORIES.filter((cat) => dishes.some((d) => d.category === cat));
  const cellInput = "w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition";
  const XIcon = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">Menu Database</h2>
          <p className="mt-1 text-muted-foreground">Dishes and their prep items — all fields editable inline, changes save automatically.</p>
        </div>
        {!newForm && (
          <button onClick={() => { setNewForm({ name: "", category: CATEGORIES[0] }); setNewFormError(""); }}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all flex-shrink-0">
            + Add Dish
          </button>
        )}
      </div>

      {/* New dish form */}
      {newForm && (
        <form onSubmit={handleAddDish}
          className="rounded-lg border border-border bg-card p-5 space-y-4">
          <h3 className="font-heading text-base font-semibold text-foreground">New Dish</h3>
          {newFormError && <p className="text-sm text-destructive">{newFormError}</p>}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dish Name *</label>
              <input type="text" value={newForm.name} autoFocus
                onChange={(e) => setNewForm((f) => f ? { ...f, name: e.target.value } : null)}
                placeholder="e.g. Herb-Roasted Chicken Breast"
                className={inputClass} />
            </div>
            <div className="space-y-1 w-48">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category *</label>
              <select value={newForm.category}
                onChange={(e) => setNewForm((f) => f ? { ...f, category: e.target.value as Category } : null)}
                className={inputClass}>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pb-0.5">
              <button type="submit"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition-all">
                Add
              </button>
              <button type="button" onClick={() => { setNewForm(null); setNewFormError(""); }}
                className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Dish list — empty state */}
      {dishes.length === 0 && !newForm && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
          <p className="text-muted-foreground text-sm">No dishes yet. Click <span className="text-accent font-medium">+ Add Dish</span> to get started.</p>
        </div>
      )}

      {/* Dishes grouped by category */}
      {usedCategories.length > 0 && (
        <div className="space-y-8">
          {usedCategories.map((category) => (
            <div key={category}>
              <h3 className="font-heading text-xs font-bold text-accent uppercase tracking-widest mb-3">{category}</h3>
              <div className="space-y-4">
                {dishes.filter((d) => d.category === category).map((dish) => (
                  <div key={dish.id}
                    className="rounded-lg border border-border bg-card overflow-hidden">

                    {/* ── Dish header: inline editable name + category + delete ── */}
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
                      <input
                        type="text"
                        value={dish.name}
                        onChange={(e) => updateDishName(dish.id, e.target.value)}
                        placeholder="Dish name"
                        className="flex-1 min-w-[180px] rounded border border-transparent bg-transparent px-1 py-0.5 font-heading text-base font-semibold text-foreground placeholder:text-muted-foreground focus:border-accent focus:bg-card focus:outline-none focus:ring-0 transition-colors"
                      />
                      <select
                        value={dish.category}
                        onChange={(e) => updateDishCategory(dish.id, e.target.value as Category)}
                        className="rounded border border-input bg-background px-2 py-1 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition">
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <button
                        onClick={() => deleteDish(dish.id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        title="Delete dish">
                        Delete dish
                      </button>
                    </div>

                    {/* ── Prep items: inline-editable rows ── */}
                    <div className="px-4 py-3 space-y-2">

                      {/* Column headers */}
                      {dish.prepItems.length > 0 && (
                        <div className="grid grid-cols-[1fr_130px_150px_28px] gap-2 px-0.5 mb-1">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Prep Item Name</p>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Default Qty</p>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Allergy Note</p>
                          <span />
                        </div>
                      )}

                      {/* Prep item rows */}
                      {dish.prepItems.map((p) => (
                        <div key={p.id} className="grid grid-cols-[1fr_130px_150px_28px] gap-2 items-center">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updatePrepItem(dish.id, p.id, "name", e.target.value)}
                            placeholder="e.g. Salmon Fillets 6 oz"
                            className={cellInput}
                          />
                          <input
                            type="text"
                            value={p.defaultQty}
                            onChange={(e) => updatePrepItem(dish.id, p.id, "defaultQty", e.target.value)}
                            placeholder="e.g. 10 lbs"
                            className={cellInput}
                          />
                          <input
                            type="text"
                            value={p.allergyNote}
                            onChange={(e) => updatePrepItem(dish.id, p.id, "allergyNote", e.target.value)}
                            placeholder="e.g. Dairy, Gluten"
                            className={cellInput}
                          />
                          <button
                            onClick={() => removePrepItem(dish.id, p.id)}
                            className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove prep item">
                            <XIcon />
                          </button>
                        </div>
                      ))}

                      {/* Empty state for prep items */}
                      {dish.prepItems.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-1">No prep items yet.</p>
                      )}

                      {/* Add prep item button */}
                      <button
                        onClick={() => addPrepItem(dish.id)}
                        className="mt-1 text-xs font-semibold text-accent hover:brightness-110 transition-all">
                        + Add Prep Item
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("events");
  const [editingEvent, setEditingEvent] = useState<SavedEvent | null>(null);
  const [prepSheetEvent, setPrepSheetEvent] = useState<SavedEvent | null>(null);
  const [companyName, setCompanyName] = useState(loadCompanyName);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleEdit(event: SavedEvent) { setEditingEvent(event); setActiveTab("build-event"); }
  function handleClearEdit() { setEditingEvent(null); }
  function handleTabChange(tab: Tab) { if (tab !== "build-event") setEditingEvent(null); setSettingsOpen(false); setActiveTab(tab); }
  function handleCompanyNameChange(val: string) { setCompanyName(val); saveCompanyName(val); }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col"
      onClick={(e) => { if (settingsOpen && !(e.target as HTMLElement).closest("[data-settings]")) setSettingsOpen(false); }}>

      {prepSheetEvent && (
        <PrepSheetModal event={prepSheetEvent} companyName={companyName} onClose={() => setPrepSheetEvent(null)} />
      )}

      <header className="no-print sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="hsl(222 18% 9%)" strokeWidth={2.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hidden sm:block min-w-0">
                {companyName ? (
                  <div className="leading-tight">
                    <p className="font-heading text-base font-semibold tracking-wide text-foreground truncate">{companyName}</p>
                    <p className="font-heading text-[11px] font-medium text-muted-foreground tracking-widest uppercase">EventOps</p>
                  </div>
                ) : (
                  <span className="font-heading text-xl font-semibold tracking-wide text-foreground">EventOps</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Nav */}
              <nav className="flex items-center gap-0.5 sm:gap-1 mr-1 sm:mr-2">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    className={[
                      "relative px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id ? "text-accent-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    ].join(" ")}>
                    <span className="font-heading tracking-wide">
                      <span className="sm:hidden">
                        {tab.id === "events" ? "Events" : tab.id === "build-event" ? "Build" : "Menu"}
                      </span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                ))}
              </nav>

              {/* Settings gear */}
              <div className="relative" data-settings>
                <button onClick={() => setSettingsOpen((o) => !o)}
                  className={["rounded-md p-2 transition-colors", settingsOpen ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"].join(" ")}
                  aria-label="Settings">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
                {settingsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-card shadow-xl z-50 p-4 space-y-3">
                    <p className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">Settings</p>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground" htmlFor="company-name-input">Company Name</label>
                      <input id="company-name-input" type="text" value={companyName}
                        onChange={(e) => handleCompanyNameChange(e.target.value)}
                        placeholder="e.g. Harvest Catering Co." className={inputClass} autoFocus />
                      <p className="text-xs text-muted-foreground">Appears in the header and on printed prep sheets.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {activeTab === "events" && <EventsTab onEdit={handleEdit} onViewPrepSheet={setPrepSheetEvent} />}
        {activeTab === "build-event" && <BuildEventTab editingEvent={editingEvent} onClearEdit={handleClearEdit} />}
        {activeTab === "menu-database" && <MenuDatabaseTab />}
      </main>
    </div>
  );
}

export default App;
