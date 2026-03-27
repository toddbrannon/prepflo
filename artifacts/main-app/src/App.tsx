import { useState, useEffect } from "react";

// ─── Shared types & constants ─────────────────────────────────────────────────

type Tab = "events" | "build-event" | "menu-database";

const tabs: { id: Tab; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "build-event", label: "Build Event" },
  { id: "menu-database", label: "Menu Database" },
];

const CATEGORIES = [
  "Appetizers",
  "Proteins",
  "Starches",
  "Vegetables",
  "Salads",
  "Sauces & Dressings",
  "Desserts",
  "Beverages",
  "Breads & Bakery",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

interface MenuItem {
  id: string;
  name: string;
  category: Category;
  unit: string;
  prepInstructions: string;
}

interface EventLineItem {
  menuItemId: string;
  name: string;
  category: Category;
  unit: string;
  quantity: string;
  prepInstructions?: string;
}

interface SavedEvent {
  id: string;
  name: string;
  client: string;
  date: string;
  guestCount: string;
  notes: string;
  lineItems: EventLineItem[];
  savedAt: string;
}

const MENU_KEY = "menu-database-items";
const EVENTS_KEY = "build-events";
const COMPANY_KEY = "eventops-company-name";

function loadCompanyName(): string {
  return localStorage.getItem(COMPANY_KEY) ?? "";
}
function saveCompanyName(name: string) {
  localStorage.setItem(COMPANY_KEY, name);
}

const SEED_ITEMS: MenuItem[] = [
  { id: "seed-1",  name: "Bruschetta al Pomodoro",       category: "Appetizers",       unit: "portions", prepInstructions: "Toast bread, rub with garlic, top with diced tomato, fresh basil, and olive oil. Season with flaky salt just before serving." },
  { id: "seed-2",  name: "Caprese Skewers",               category: "Appetizers",       unit: "pieces",   prepInstructions: "Thread cherry tomatoes, fresh mozzarella, and basil onto skewers. Drizzle with balsamic glaze before service." },
  { id: "seed-3",  name: "Herb-Roasted Chicken Breast",   category: "Proteins",         unit: "portions", prepInstructions: "Season with rosemary, thyme, garlic, and olive oil. Roast at 375°F to internal temp of 165°F. Rest 5 min before slicing." },
  { id: "seed-4",  name: "Pan-Seared Salmon",             category: "Proteins",         unit: "portions", prepInstructions: "Season with salt, pepper, lemon zest. Sear skin-side down 4 min, flip 3 min. Finish with butter baste and fresh dill." },
  { id: "seed-5",  name: "Beef Tenderloin",               category: "Proteins",         unit: "lbs",      prepInstructions: "Tie, season liberally with salt and pepper. Sear all sides in high-heat pan, roast at 425°F to 130°F internal for medium-rare. Rest 10 min before slicing." },
  { id: "seed-6",  name: "Roasted Garlic Mashed Potatoes",category: "Starches",         unit: "portions", prepInstructions: "Boil Yukon Golds until tender. Mash with roasted garlic, butter, and cream. Season to taste. Keep warm in bain-marie for service." },
  { id: "seed-7",  name: "Wild Rice Pilaf",               category: "Starches",         unit: "portions", prepInstructions: "Sauté shallots and thyme, toast rice 2 min. Add stock, bring to boil, then simmer 45 min. Fold in toasted pecans before serving." },
  { id: "seed-8",  name: "Roasted Seasonal Vegetables",   category: "Vegetables",       unit: "portions", prepInstructions: "Toss with olive oil, salt, pepper, and fresh thyme. Roast at 400°F 20–25 min until caramelized. Finish with squeeze of lemon." },
  { id: "seed-9",  name: "Sautéed Haricots Verts",        category: "Vegetables",       unit: "lbs",      prepInstructions: "Blanch 2 min, shock in ice water. Sauté with shallots and butter to order. Season and finish with lemon zest and toasted almonds." },
  { id: "seed-10", name: "Red Wine Demi-Glace",            category: "Sauces & Dressings", unit: "qts",  prepInstructions: "Reduce red wine with shallots, add brown stock, simmer until sauce coats spoon. Strain and mount with cold butter before service." },
  { id: "seed-11", name: "Caesar Salad",                  category: "Salads",           unit: "portions", prepInstructions: "Toss romaine with house Caesar dressing, shaved Parmesan, and croutons. Dress to order only — do not pre-dress." },
  { id: "seed-12", name: "Chocolate Lava Cake",           category: "Desserts",         unit: "portions", prepInstructions: "Bake at 425°F for exactly 12 min. Centers should be warm and molten. Serve immediately with vanilla crème anglaise." },
];

function loadMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw === null) {
      saveMenuItems(SEED_ITEMS);
      return SEED_ITEMS;
    }
    return JSON.parse(raw);
  } catch { return []; }
}
function saveMenuItems(items: MenuItem[]) {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

function loadEvents(): SavedEvent[] {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]"); } catch { return []; }
}
function persistEvents(events: SavedEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

const inputClass =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Prep Sheet Modal ─────────────────────────────────────────────────────────

function PrepSheetModal({ event, companyName, onClose }: { event: SavedEvent; companyName: string; onClose: () => void }) {
  // Only include items that have a quantity entered
  const itemsWithQty = event.lineItems.filter((li) => li.quantity.trim() !== "");
  const usedCategories = CATEGORIES.filter((cat) => itemsWithQty.some((li) => li.category === cat));
  const generatedAt = new Date().toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  // Add body class so print CSS can isolate this modal
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

        {/* ── Document header ── */}
        <div className="border-b border-border px-6 pt-6 pb-5">
          {/* Top row: brand + timestamp */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-accent flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="hsl(222 18% 9%)" strokeWidth={2.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {companyName ? companyName : "EventOps"} — Prep Sheet
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Generated {generatedAt}</span>
              {/* Print button */}
              <button
                onClick={() => window.print()}
                className="no-print inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v5a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 112 0 1 1 0 01-2 0zm2 2v2h4v-2H8z" clipRule="evenodd" />
                </svg>
                Print
              </button>
              {/* Close button */}
              <button
                onClick={onClose}
                className="no-print rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Event name */}
          <h1 className="font-heading text-3xl font-semibold tracking-wide text-foreground leading-tight">
            {event.name}
          </h1>
          {event.notes && (
            <p className="mt-1.5 text-sm text-muted-foreground italic">{event.notes}</p>
          )}

          {/* Metadata bar */}
          <div className="ps-meta-bar mt-4 flex flex-wrap gap-px rounded-lg border border-border overflow-hidden text-sm">
            {[
              { label: "Client", value: event.client || "—" },
              { label: "Date", value: event.date ? formatDate(event.date) : "—" },
              { label: "Guest Count", value: event.guestCount || "—" },
              { label: "Total Items", value: String(itemsWithQty.length) },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 min-w-[120px] bg-muted/40 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Items by category ── */}
        <div className="px-6 py-6 space-y-7">
          {itemsWithQty.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {event.lineItems.length === 0
                ? "No items on this event."
                : "No items have quantities entered. Go back to Build Event and add quantities."}
            </p>
          ) : (
            usedCategories.map((cat) => {
              const catItems = itemsWithQty.filter((li) => li.category === cat);
              return (
                <div key={cat} className="ps-category-block">
                  <p className="ps-category-label font-heading text-xs font-bold uppercase tracking-widest text-accent pb-1.5 mb-3 border-b border-border">
                    {cat}
                  </p>
                  <div className="rounded-lg border border-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border">
                          <th className="text-left px-4 py-2.5 font-semibold text-foreground w-[26%]">Item Name</th>
                          <th className="text-right px-4 py-2.5 font-semibold text-foreground w-[10%]">Qty</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-foreground w-[10%]">Unit</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-foreground">Prep Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {catItems.map((li) => (
                          <tr key={li.menuItemId} className="bg-card">
                            <td className="px-4 py-3 font-medium text-foreground align-top">{li.name}</td>
                            <td className="px-4 py-3 text-right text-foreground align-top tabular-nums font-medium">
                              {li.quantity || <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground align-top">{li.unit}</td>
                            <td className="px-4 py-3 text-muted-foreground align-top whitespace-pre-wrap text-xs leading-relaxed">
                              {li.prepInstructions || <span className="italic">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Signature lines ── */}
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

        {/* ── Footer action row (screen only) ── */}
        <div className="no-print border-t border-border px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({
  onEdit,
  onViewPrepSheet,
}: {
  onEdit: (event: SavedEvent) => void;
  onViewPrepSheet: (event: SavedEvent) => void;
}) {
  const [events, setEvents] = useState<SavedEvent[]>([]);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

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
            <div
              key={event.id}
              className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4 hover:border-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1.5">
                <h3 className="font-heading text-xl font-semibold text-foreground leading-tight">{event.name}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-60">
                        <path d="M5 .5a.5.5 0 0 1 .5.5v.5h5V1a.5.5 0 0 1 1 0v.5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h1.5V1A.5.5 0 0 1 5 .5zM3 3a1 1 0 0 0-1 1v1h12V4a1 1 0 0 0-1-1H3zm11 3H2v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6z"/>
                      </svg>
                      {formatDate(event.date)}
                    </span>
                  )}
                  {event.client && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-60">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                      {event.client}
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
                    {event.lineItems.length} item{event.lineItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 border-t border-border pt-3">
                <button
                  onClick={() => onEdit(event)}
                  className="flex-1 rounded-md border border-border py-1.5 text-xs font-medium text-foreground hover:bg-secondary hover:border-accent/40 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onViewPrepSheet(event)}
                  className="flex-1 rounded-md bg-accent py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110 transition-all"
                >
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

function BuildEventTab({
  editingEvent,
  onClearEdit,
}: {
  editingEvent: SavedEvent | null;
  onClearEdit: () => void;
}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [details, setDetails] = useState({ name: "", client: "", date: "", guestCount: "", notes: "" });
  const [lineItems, setLineItems] = useState<EventLineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [saveMsg, setSaveMsg] = useState<"saved" | null>(null);
  const [formError, setFormError] = useState("");

  // Load menu items on mount
  useEffect(() => {
    setMenuItems(loadMenuItems());
  }, []);

  // When editingEvent changes, pre-fill the form
  useEffect(() => {
    if (editingEvent) {
      setDetails({
        name: editingEvent.name,
        client: editingEvent.client,
        date: editingEvent.date,
        guestCount: editingEvent.guestCount,
        notes: editingEvent.notes,
      });
      setLineItems(editingEvent.lineItems);
      setSelectedCategory("");
      setSelectedItemId("");
      setFormError("");
      setSaveMsg(null);
    }
  }, [editingEvent]);

  const categoriesWithItems = CATEGORIES.filter((cat) => menuItems.some((m) => m.category === cat));
  const itemsForCategory = selectedCategory ? menuItems.filter((m) => m.category === selectedCategory) : [];

  function handleCategoryChange(cat: Category | "") {
    setSelectedCategory(cat);
    setSelectedItemId("");
  }

  function handleAddItem() {
    if (!selectedCategory || !selectedItemId) return;
    const menuItem = menuItems.find((m) => m.id === selectedItemId);
    if (!menuItem || lineItems.some((li) => li.menuItemId === selectedItemId)) return;
    setLineItems((prev) => [
      ...prev,
      { menuItemId: menuItem.id, name: menuItem.name, category: menuItem.category, unit: menuItem.unit, quantity: "", prepInstructions: menuItem.prepInstructions },
    ]);
    setSelectedItemId("");
  }

  function handleQuantityChange(menuItemId: string, qty: string) {
    setLineItems((prev) => prev.map((li) => li.menuItemId === menuItemId ? { ...li, quantity: qty } : li));
  }

  function handleRemoveItem(menuItemId: string) {
    setLineItems((prev) => prev.filter((li) => li.menuItemId !== menuItemId));
  }

  function handleSave() {
    if (!details.name.trim()) { setFormError("Event Name is required."); return; }
    setFormError("");

    const existing = loadEvents();

    if (editingEvent) {
      // Update existing event in place
      const updated = existing.map((ev) =>
        ev.id === editingEvent.id
          ? { ...ev, ...details, name: details.name.trim(), client: details.client.trim(), lineItems }
          : ev
      );
      persistEvents(updated);
    } else {
      const newEvent: SavedEvent = {
        id: crypto.randomUUID(),
        ...details,
        name: details.name.trim(),
        client: details.client.trim(),
        lineItems,
        savedAt: new Date().toISOString(),
      };
      persistEvents([...existing, newEvent]);
    }

    setSaveMsg("saved");
    setTimeout(() => setSaveMsg(null), 3000);
  }

  function handleReset() {
    setDetails({ name: "", client: "", date: "", guestCount: "", notes: "" });
    setLineItems([]);
    setSelectedCategory("");
    setSelectedItemId("");
    setFormError("");
    setSaveMsg(null);
    onClearEdit();
  }

  const lineItemsByCategory = CATEGORIES.filter((cat) => lineItems.some((li) => li.category === cat));

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
              : "Fill in event details, then add menu items with quantities."}
          </p>
        </div>
        {editingEvent && (
          <button
            onClick={handleReset}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
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
            <label className="text-sm font-medium text-foreground" htmlFor="ev-guests">Guest Count</label>
            <input id="ev-guests" type="number" min={1} value={details.guestCount}
              onChange={(e) => setDetails((d) => ({ ...d, guestCount: e.target.value }))}
              placeholder="e.g. 100" className={inputClass} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="ev-notes">Notes</label>
          <textarea id="ev-notes" rows={3} value={details.notes}
            onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Special requirements, themes, dietary notes..."
            className={`${inputClass} resize-none`} />
        </div>
      </div>

      {/* Two-panel item builder */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: selector */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">Add Menu Items</h3>
          {categoriesWithItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items in the Menu Database yet. Add some items there first.</p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Category</label>
                <select value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as Category | "")}
                  className={inputClass}>
                  <option value="">— Select a category —</option>
                  {categoriesWithItems.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Item</label>
                <select value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={!selectedCategory}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  <option value="">— Select an item —</option>
                  {itemsForCategory.map((item) => (
                    <option key={item.id} value={item.id}
                      disabled={lineItems.some((li) => li.menuItemId === item.id)}>
                      {item.name}{lineItems.some((li) => li.menuItemId === item.id) ? " (added)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={handleAddItem}
                disabled={!selectedCategory || !selectedItemId}
                className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100">
                + Add to Event
              </button>
            </div>
          )}
        </div>

        {/* Right: line items */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Event Items
            {lineItems.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">({lineItems.length})</span>
            )}
          </h3>
          {lineItems.length === 0 ? (
            <div className="rounded-md border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No items added yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {lineItemsByCategory.map((cat) => {
                const catItems = lineItems.filter((li) => li.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">{cat}</p>
                    <div className="space-y-2">
                      {catItems.map((li) => (
                        <div key={li.menuItemId} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{li.name}</p>
                            <p className="text-xs text-muted-foreground">{li.unit}</p>
                          </div>
                          <input type="number" min={0} step="any" value={li.quantity}
                            onChange={(e) => handleQuantityChange(li.menuItemId, e.target.value)}
                            placeholder="Qty"
                            className="w-20 rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground text-right placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition" />
                          <button onClick={() => handleRemoveItem(li.menuItemId)}
                            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            aria-label="Remove">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
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
  const [items, setItems] = useState<MenuItem[]>(loadMenuItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyForm = { name: "", category: CATEGORIES[0] as Category, unit: "", prepInstructions: "" };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => { saveMenuItems(items); }, [items]);

  function openAdd() { setEditingId(null); setForm(emptyForm); setError(""); setShowForm(true); }
  function openEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({ name: item.name, category: item.category, unit: item.unit, prepInstructions: item.prepInstructions });
    setError(""); setShowForm(true);
  }
  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) { setShowForm(false); setEditingId(null); }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    if (!form.unit.trim()) { setError("Unit is required."); return; }
    setError("");
    if (editingId) {
      setItems((prev) => prev.map((i) => i.id === editingId ? { ...i, ...form, name: form.name.trim(), unit: form.unit.trim() } : i));
    } else {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), name: form.name.trim(), category: form.category, unit: form.unit.trim(), prepInstructions: form.prepInstructions.trim() }]);
    }
    setShowForm(false); setEditingId(null); setForm(emptyForm);
  }
  function handleCancel() { setShowForm(false); setEditingId(null); setForm(emptyForm); setError(""); }

  const usedCategories = CATEGORIES.filter((cat) => items.some((i) => i.category === cat));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">Menu Database</h2>
          <p className="mt-1 text-muted-foreground">All menu items organized by category. Data is saved automatically.</p>
        </div>
        {!showForm && (
          <button onClick={openAdd}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all flex-shrink-0">
            + Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-heading text-xl font-semibold text-foreground">{editingId ? "Edit Item" : "Add New Item"}</h3>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="item-name">Item Name *</label>
                <input id="item-name" type="text" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Grilled Chicken Breast" className={inputClass} autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="item-category">Category *</label>
                <select id="item-category" value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className={inputClass}>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="item-unit">Unit *</label>
              <input id="item-unit" type="text" value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. lbs, portions, qts" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="item-prep">Default Prep Instructions</label>
              <textarea id="item-prep" rows={3} value={form.prepInstructions}
                onChange={(e) => setForm((f) => ({ ...f, prepInstructions: e.target.value }))}
                placeholder="Describe how to prepare this item..."
                className={`${inputClass} resize-none`} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit"
                className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all">
                {editingId ? "Save Changes" : "Add Item"}
              </button>
              <button type="button" onClick={handleCancel}
                className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 py-16 text-center">
          <p className="text-muted-foreground text-sm">No items yet. Click <span className="text-accent font-medium">+ Add Item</span> to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {usedCategories.map((category) => (
            <div key={category}>
              <h3 className="font-heading text-sm font-semibold text-accent uppercase tracking-widest mb-2">{category}</h3>
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="text-left px-4 py-2.5 font-semibold text-foreground w-[30%]">Item Name</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-foreground w-[12%]">Unit</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-foreground">Default Prep Instructions</th>
                      <th className="px-4 py-2.5 w-[100px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.filter((i) => i.category === category).map((item) => (
                      <tr key={item.id} className="bg-card hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground align-top">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground align-top">{item.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground align-top whitespace-pre-wrap">
                          {item.prepInstructions || <span className="italic text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openEdit(item)}
                              className="text-xs text-muted-foreground hover:text-accent transition-colors">Edit</button>
                            <button onClick={() => handleDelete(item.id)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

  function handleEdit(event: SavedEvent) {
    setEditingEvent(event);
    setActiveTab("build-event");
  }

  function handleClearEdit() {
    setEditingEvent(null);
  }

  function handleTabChange(tab: Tab) {
    if (tab !== "build-event") setEditingEvent(null);
    setSettingsOpen(false);
    setActiveTab(tab);
  }

  function handleCompanyNameChange(val: string) {
    setCompanyName(val);
    saveCompanyName(val);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (settingsOpen && !target.closest("[data-settings]")) setSettingsOpen(false);
      }}
    >
      {prepSheetEvent && (
        <PrepSheetModal event={prepSheetEvent} companyName={companyName} onClose={() => setPrepSheetEvent(null)} />
      )}

      <header className="no-print sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo + company name */}
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
              {/* Nav tabs */}
              <nav className="flex items-center gap-0.5 sm:gap-1 mr-1 sm:mr-2">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    className={[
                      "relative px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "text-accent-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
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
                <button
                  onClick={() => setSettingsOpen((o) => !o)}
                  className={[
                    "rounded-md p-2 transition-colors",
                    settingsOpen
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  ].join(" ")}
                  aria-label="Settings"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-card shadow-xl z-50 p-4 space-y-3">
                    <p className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">Settings</p>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground" htmlFor="company-name-input">
                        Company Name
                      </label>
                      <input
                        id="company-name-input"
                        type="text"
                        value={companyName}
                        onChange={(e) => handleCompanyNameChange(e.target.value)}
                        placeholder="e.g. Harvest Catering Co."
                        className={inputClass}
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Appears in the header and on printed prep sheets.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {activeTab === "events" && (
          <EventsTab onEdit={handleEdit} onViewPrepSheet={setPrepSheetEvent} />
        )}
        {activeTab === "build-event" && (
          <BuildEventTab editingEvent={editingEvent} onClearEdit={handleClearEdit} />
        )}
        {activeTab === "menu-database" && <MenuDatabaseTab />}
      </main>
    </div>
  );
}

export default App;
