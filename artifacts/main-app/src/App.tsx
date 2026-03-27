import { useState, useEffect } from "react";

type Tab = "events" | "build-event" | "menu-database";

const tabs: { id: Tab; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "build-event", label: "Build Event" },
  { id: "menu-database", label: "Menu Database" },
];

function EventsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">
        Upcoming Events
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Browse and manage all scheduled events. Select an event to view details or make changes.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Spring Gala", date: "April 12, 2026", guests: 120 },
          { name: "Corporate Dinner", date: "May 3, 2026", guests: 85 },
          { name: "Summer BBQ", date: "June 21, 2026", guests: 200 },
          { name: "Wine Tasting", date: "July 8, 2026", guests: 40 },
          { name: "Holiday Party", date: "December 19, 2026", guests: 150 },
          { name: "Product Launch", date: "August 15, 2026", guests: 300 },
        ].map((event) => (
          <div
            key={event.name}
            className="rounded-lg border border-border bg-card p-5 hover:border-accent transition-colors cursor-pointer group"
          >
            <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
              {event.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{event.date}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {event.guests} guests
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildEventTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">
        Build Event
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        Create a new event by filling in the details below. All fields marked with * are required.
      </p>
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="event-name">
            Event Name *
          </label>
          <input
            id="event-name"
            type="text"
            placeholder="e.g. Summer Gala 2026"
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="event-date">
              Date *
            </label>
            <input
              id="event-date"
              type="date"
              className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="event-guests">
              Guest Count *
            </label>
            <input
              id="event-guests"
              type="number"
              min={1}
              placeholder="e.g. 100"
              className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="event-venue">
            Venue
          </label>
          <input
            id="event-venue"
            type="text"
            placeholder="e.g. Grand Ballroom, City Hotel"
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="event-notes">
            Notes
          </label>
          <textarea
            id="event-notes"
            rows={4}
            placeholder="Special requirements, dietary restrictions, themes..."
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all"
          >
            Create Event
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

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

const STORAGE_KEY = "menu-database-items";

function loadItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: MenuItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const inputClass =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition";

function MenuDatabaseTab() {
  const [items, setItems] = useState<MenuItem[]>(loadItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = { name: "", category: CATEGORIES[0] as Category, unit: "", prepInstructions: "" };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    saveItems(items);
  }, [items]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({ name: item.name, category: item.category, unit: item.unit, prepInstructions: item.prepInstructions });
    setError("");
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editingId === id) {
      setShowForm(false);
      setEditingId(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    if (!form.unit.trim()) { setError("Unit is required."); return; }
    setError("");

    if (editingId) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, ...form, name: form.name.trim(), unit: form.unit.trim() } : i))
      );
    } else {
      const newItem: MenuItem = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        category: form.category,
        unit: form.unit.trim(),
        prepInstructions: form.prepInstructions.trim(),
      };
      setItems((prev) => [...prev, newItem]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  const usedCategories = CATEGORIES.filter((cat) => items.some((i) => i.category === cat));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">
            Menu Database
          </h2>
          <p className="mt-1 text-muted-foreground">
            All menu items organized by category. Data is saved automatically.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all flex-shrink-0"
          >
            + Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {editingId ? "Edit Item" : "Add New Item"}
          </h3>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="item-name">
                  Item Name *
                </label>
                <input
                  id="item-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Grilled Chicken Breast"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="item-category">
                  Category *
                </label>
                <select
                  id="item-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className={inputClass}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="item-unit">
                Unit *
              </label>
              <input
                id="item-unit"
                type="text"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. lbs, portions, qts"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="item-prep">
                Default Prep Instructions
              </label>
              <textarea
                id="item-prep"
                rows={3}
                value={form.prepInstructions}
                onChange={(e) => setForm((f) => ({ ...f, prepInstructions: e.target.value }))}
                placeholder="Describe how to prepare this item..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all"
              >
                {editingId ? "Save Changes" : "Add Item"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
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
          {usedCategories.map((category) => {
            const catItems = items.filter((i) => i.category === category);
            return (
              <div key={category}>
                <h3 className="font-heading text-sm font-semibold text-accent uppercase tracking-widest mb-2">
                  {category}
                </h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border">
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground w-[30%]">Item Name</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground w-[12%]">Unit</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-foreground">Default Prep Instructions</th>
                        <th className="px-4 py-2.5 w-[100px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {catItems.map((item) => (
                        <tr key={item.id} className="bg-card hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground align-top">{item.name}</td>
                          <td className="px-4 py-3 text-muted-foreground align-top">{item.unit}</td>
                          <td className="px-4 py-3 text-muted-foreground align-top whitespace-pre-wrap">
                            {item.prepInstructions || <span className="italic text-muted-foreground/50">—</span>}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-xs text-muted-foreground hover:text-accent transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("events");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="hsl(222 18% 9%)" strokeWidth={2.5}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-heading text-xl font-semibold tracking-wide text-foreground hidden sm:block">
                EventOps
              </span>
            </div>

            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "relative px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "text-accent-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  <span className="font-heading tracking-wide">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
        {activeTab === "events" && <EventsTab />}
        {activeTab === "build-event" && <BuildEventTab />}
        {activeTab === "menu-database" && <MenuDatabaseTab />}
      </main>
    </div>
  );
}

export default App;
