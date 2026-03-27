import { useState } from "react";

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

function MenuDatabaseTab() {
  const menuItems = [
    { category: "Appetizers", name: "Bruschetta", description: "Tomato, basil, garlic on toasted bread", dietary: ["V"] },
    { category: "Appetizers", name: "Shrimp Cocktail", description: "Chilled shrimp with house cocktail sauce", dietary: ["GF"] },
    { category: "Mains", name: "Filet Mignon", description: "8oz center-cut, served with seasonal vegetables", dietary: ["GF"] },
    { category: "Mains", name: "Pan-Seared Salmon", description: "Atlantic salmon with lemon beurre blanc", dietary: ["GF"] },
    { category: "Mains", name: "Mushroom Risotto", description: "Wild mushroom blend, parmesan, truffle oil", dietary: ["V", "GF"] },
    { category: "Desserts", name: "Chocolate Lava Cake", description: "Warm chocolate cake with vanilla bean ice cream", dietary: [] },
    { category: "Desserts", name: "Crème Brûlée", description: "Classic vanilla custard with caramelized sugar", dietary: ["GF"] },
  ];

  const categories = [...new Set(menuItems.map((i) => i.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-wide text-foreground">
            Menu Database
          </h2>
          <p className="mt-1 text-muted-foreground">
            All available menu items organized by category.
          </p>
        </div>
        <button className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110 active:brightness-95 transition-all flex-shrink-0">
          + Add Item
        </button>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="font-heading text-xl font-semibold text-accent mb-3 uppercase tracking-widest text-sm">
              {category}
            </h3>
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between gap-4 bg-card px-5 py-4 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-lg font-medium text-foreground">
                          {item.name}
                        </span>
                        {item.dietary.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <button className="flex-shrink-0 text-xs text-muted-foreground hover:text-accent transition-colors">
                      Edit
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">V</span>
          Vegetarian
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">GF</span>
          Gluten Free
        </span>
      </div>
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
