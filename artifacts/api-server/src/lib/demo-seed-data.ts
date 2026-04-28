type DemoCategory =
  | "Boards"
  | "Passed Appetizers"
  | "Sides / Salads"
  | "Entrees"
  | "Desserts"
  | "Custom";

type DemoPrepItem = {
  prepItemId: string;
  name: string;
  qty: string;
  location: string;
  allergyNote: string;
};

type DemoEventDish = {
  dishId: string;
  name: string;
  category: DemoCategory;
  subNote: string;
  prepItems: DemoPrepItem[];
};

type DemoEvent = {
  name: string;
  client: string;
  date: string;
  startTime: string;
  guestCount: string;
  venue: string;
  onsiteContact: string;
  allergies: string;
  notes: string;
  dishes: DemoEventDish[];
};

type DemoDish = {
  id: string;
  name: string;
  category: DemoCategory;
  prepItems: Array<{
    id: string;
    name: string;
    defaultQty: string;
    allergyNote: string;
  }>;
};

export const DEMO_EVENTS: DemoEvent[] = [
  {
    name: "Showcase Wedding — Fully Planned",
    client: "Mike and Michelle",
    date: "2025-10-13",
    startTime: "17:00",
    guestCount: "120",
    venue: "SPC Venue, 400 N Main St",
    onsiteContact: "Michelle — 214-555-0192",
    allergies:
      "Pescatarian bride. Lots of vegetarians. Father of groom: fish and shellfish allergy — keep completely separate.",
    notes: "Showcase event: this one is fully planned so new demo users can open a complete prep sheet immediately.",
    dishes: [
      {
        dishId: "d01",
        name: "Autumn Board",
        category: "Boards",
        subNote: "Station one board near bar and one near ceremony patio.",
        prepItems: [
          { prepItemId: "d01-p01", name: "Hummus", qty: "1 qt", location: "walk-in shelf 2", allergyNote: "" },
          { prepItemId: "d01-p02", name: "Pickled veggies assorted", qty: "3 pints", location: "walk-in shelf 2", allergyNote: "" },
          { prepItemId: "d01-p03", name: "Farmers cheese", qty: "1 qt", location: "walk-in shelf 1", allergyNote: "Dairy" },
          { prepItemId: "d01-p04", name: "Spiced chopped pepitas", qty: "1 pint", location: "dry storage", allergyNote: "Nut-Free" },
          { prepItemId: "d01-p10", name: "Garnishes / edible flowers", qty: "as needed", location: "", allergyNote: "" },
        ],
      },
      {
        dishId: "d08",
        name: "Lobster Brulee Passed",
        category: "Passed Appetizers",
        subNote: "Flag for FOG shellfish allergy — do not serve to table 1.",
        prepItems: [
          { prepItemId: "d08-p01", name: "Brioche rounds", qty: "50 each", location: "dry storage", allergyNote: "Gluten" },
          { prepItemId: "d08-p02", name: "Bechamel with herb", qty: "1 qt", location: "walk-in shelf 1", allergyNote: "Dairy" },
          { prepItemId: "d08-p03", name: "Lobster pulled", qty: "2 lbs", location: "walk-in shelf 1", allergyNote: "Shellfish" },
        ],
      },
      {
        dishId: "d07",
        name: "Smoked Sausage Passed",
        category: "Passed Appetizers",
        subNote: "Pass hot in first 45 minutes of cocktail hour.",
        prepItems: [
          { prepItemId: "d07-p01", name: "Sausages smoked", qty: "24 links", location: "upright freezer", allergyNote: "" },
          { prepItemId: "d07-p02", name: "Brioche rounds cut", qty: "180 each", location: "dry storage", allergyNote: "Gluten" },
          { prepItemId: "d07-p03", name: "Mustard glaze", qty: "2 quarts", location: "walk-in door", allergyNote: "" },
          { prepItemId: "d07-p04", name: "Bread & butter pickle", qty: "2 quarts", location: "walk-in door", allergyNote: "" },
        ],
      },
      {
        dishId: "d21",
        name: "Short Ribs",
        category: "Entrees",
        subNote: "Buffet line hot hold in two chafer pans.",
        prepItems: [
          { prepItemId: "d21-p01", name: "Short ribs braised", qty: "20 lbs", location: "upright freezer bottom", allergyNote: "" },
          { prepItemId: "d21-p02", name: "Agrodolce sauce", qty: "2 qt", location: "upright freezer bottom", allergyNote: "" },
          { prepItemId: "d21-p03", name: "Carrot julienne", qty: "1 qt", location: "walk-in shelf 2", allergyNote: "" },
          { prepItemId: "d21-p05", name: "Parsley picked", qty: "1 qt", location: "walk-in shelf 3", allergyNote: "" },
        ],
      },
      {
        dishId: "d22",
        name: "Eggplant Mangal",
        category: "Entrees",
        subNote: "Vegetarian main — clearly label on buffet and hold separate serving utensils.",
        prepItems: [
          { prepItemId: "d22-p01", name: "Eggplant large dice", qty: "20 lbs raw", location: "upright freezer", allergyNote: "Vegan" },
          { prepItemId: "d22-p02", name: "Roasted pepper puree", qty: "3 quarts", location: "walk-in shelf 1", allergyNote: "Vegan" },
          { prepItemId: "d22-p03", name: "Chickpea mash", qty: "2 can batch", location: "walk-in shelf 1", allergyNote: "Vegan" },
          { prepItemId: "d22-p04", name: "Parsley + mint garnish", qty: "2 quarts", location: "walk-in shelf 3", allergyNote: "Vegan" },
        ],
      },
      {
        dishId: "d12",
        name: "House Greens Salad",
        category: "Sides / Salads",
        subNote: "Plate first course in waves; keep croutons on side for GF guests.",
        prepItems: [
          { prepItemId: "d12-p01", name: "Greens washed and dried", qty: "10 lbs", location: "walk-in shelf 3", allergyNote: "" },
          { prepItemId: "d12-p02", name: "Cider vinaigrette", qty: "4 quarts", location: "walk-in door", allergyNote: "" },
          { prepItemId: "d12-p03", name: "Carrot julienne", qty: "4 quarts", location: "walk-in shelf 3", allergyNote: "" },
          { prepItemId: "d12-p04", name: "Cucumber thin sliced", qty: "4 quarts", location: "walk-in shelf 3", allergyNote: "" },
        ],
      },
      {
        dishId: "d14",
        name: "Carrots & Couscous",
        category: "Sides / Salads",
        subNote: "Serve with both mains; pre-portion garnish cups for speed.",
        prepItems: [
          { prepItemId: "d14-p01", name: "Couscous cooked", qty: "10 lbs raw", location: "walk-in shelf 1", allergyNote: "Gluten" },
          { prepItemId: "d14-p02", name: "Carrots half moon roasted", qty: "14 lbs", location: "walk-in shelf 2", allergyNote: "" },
          { prepItemId: "d14-p03", name: "Herbs picked", qty: "5 quarts", location: "walk-in shelf 3", allergyNote: "" },
          { prepItemId: "d14-p04", name: "Golden raisins", qty: "2 lbs", location: "dry storage", allergyNote: "" },
        ],
      },
      {
        dishId: "d28",
        name: "Cannolis",
        category: "Desserts",
        subNote: "Dust to order right before tray pass.",
        prepItems: [
          { prepItemId: "d28-p01", name: "Cannoli shells", qty: "40 each", location: "dry storage", allergyNote: "Gluten" },
          { prepItemId: "d28-p02", name: "Ricotta cream filling", qty: "2 qt", location: "walk-in shelf 1", allergyNote: "Dairy" },
          { prepItemId: "d28-p03", name: "Mini chocolate chips", qty: "1 pint", location: "dry storage", allergyNote: "" },
          { prepItemId: "d28-p04", name: "Powdered sugar for dusting", qty: "as needed", location: "dry storage", allergyNote: "" },
        ],
      },
    ],
  },
  {
    name: "Sydney Farewell Dinner",
    client: "Sydney",
    date: "2025-09-13",
    startTime: "16:00",
    guestCount: "25",
    venue: "SPC Venue",
    onsiteContact: "Sydney — on site",
    allergies:
      "1 nut allergy. 1 GF vegan. Confirm no cross-contamination on vegan dishes.",
    notes: "Family-style dinner with heavy vegan accommodations and menu substitutions.",
    dishes: [
      {
        dishId: "d02",
        name: "Veg / Med Board",
        category: "Boards",
        subNote: "Keep vegan items grouped on one side with dedicated utensils.",
        prepItems: [
          { prepItemId: "d02-p01", name: "Yogurt flatbread", qty: "3 orders", location: "dry storage", allergyNote: "Gluten" },
          { prepItemId: "d02-p03", name: "Muhammara", qty: "1 pint", location: "walk-in shelf 1", allergyNote: "Nut-Free" },
          { prepItemId: "d02-p04", name: "Hummus", qty: "1 qt", location: "walk-in shelf 2", allergyNote: "Vegan" },
          { prepItemId: "d02-p12", name: "Pickled veggies 2 kinds", qty: "2 pints", location: "walk-in shelf 2", allergyNote: "Vegan" },
        ],
      },
      {
        dishId: "d05",
        name: "Vegan Cornbread Bites",
        category: "Passed Appetizers",
        subNote: "Tray pass first; label vegan at kitchen handoff.",
        prepItems: [
          { prepItemId: "d05-p01", name: "Cornbread baked and cut", qty: "30 pieces", location: "dry storage", allergyNote: "Vegan" },
          { prepItemId: "d05-p02", name: "Vegan butter", qty: "1 pack", location: "walk-in door", allergyNote: "Vegan" },
          { prepItemId: "d05-p03", name: "Pepper jelly", qty: "1 pint", location: "walk-in door", allergyNote: "Vegan" },
        ],
      },
      {
        dishId: "d20",
        name: "Roasted Chicken",
        category: "Entrees",
        subNote: "Gluten-free main; serve vegan guests from separate hotbox.",
        prepItems: [
          { prepItemId: "d20-p01", name: "Chicken on brine", qty: "15 lbs", location: "walk-in shelf 1", allergyNote: "" },
          { prepItemId: "d20-p03", name: "Sunflower seed pesto", qty: "1 qt", location: "walk-in shelf 2", allergyNote: "Nut-Free" },
          { prepItemId: "d20-p04", name: "Chicken jus", qty: "2 qt", location: "walk-in shelf 1", allergyNote: "" },
          { prepItemId: "d20-p05", name: "Herbs for garnish", qty: "as needed", location: "", allergyNote: "" },
        ],
      },
      {
        dishId: "d16",
        name: "Plancha Potatoes",
        category: "Sides / Salads",
        subNote: "Custom add — not on original menu.",
        prepItems: [
          { prepItemId: "d16-p01", name: "Fingerlings blanched", qty: "5 lbs", location: "walk-in shelf 2", allergyNote: "" },
          { prepItemId: "d16-p02", name: "Garlic butter", qty: "1 pint", location: "walk-in door", allergyNote: "Dairy" },
          { prepItemId: "d16-p03", name: "Fresh herbs", qty: "as needed", location: "", allergyNote: "" },
        ],
      },
    ],
  },
  {
    name: "Riverside Arts Foundation Gala",
    client: "Riverside Arts Foundation",
    date: "2025-11-08",
    startTime: "18:00",
    guestCount: "140",
    venue: "Riverside Grand Hall, 1 River Dr",
    onsiteContact: "James Whitfield — 972-555-0144",
    allergies:
      "Nut-free venue — no nuts anywhere on property. 12 GF guests confirmed. 8 vegan guests need full vegan plate option.",
    notes: "Large gala with stations, plated first course, and separate vegan entree production.",
    dishes: [
      {
        dishId: "d03",
        name: "Charcuterie & Cheese Board",
        category: "Boards",
        subNote: "Stationed — 4 boards total around cocktail space.",
        prepItems: [
          { prepItemId: "d03-p01", name: "Cured meats — 3 kinds", qty: "8 lbs total", location: "walk-in shelf 1", allergyNote: "" },
          { prepItemId: "d03-p02", name: "Hard cheese sliced", qty: "4 lbs", location: "walk-in shelf 1", allergyNote: "Dairy" },
          { prepItemId: "d03-p09", name: "Crackers assorted", qty: "12 packs", location: "dry storage", allergyNote: "Gluten" },
          { prepItemId: "d03-p11", name: "Grapes washed", qty: "8 lbs", location: "walk-in shelf 3", allergyNote: "" },
        ],
      },
      {
        dishId: "d09",
        name: "Caprese Skewers",
        category: "Passed Appetizers",
        subNote: "Passed during cocktail hour — 2 per guest.",
        prepItems: [
          { prepItemId: "d09-p01", name: "Cherry tomatoes washed", qty: "8 pints", location: "walk-in shelf 3", allergyNote: "" },
          { prepItemId: "d09-p02", name: "Fresh mozzarella balled", qty: "8 lbs", location: "walk-in shelf 1", allergyNote: "Dairy" },
          { prepItemId: "d09-p04", name: "Balsamic glaze", qty: "2 qt", location: "dry storage", allergyNote: "" },
          { prepItemId: "d09-p05", name: "Skewers prepped", qty: "300 each", location: "dry storage", allergyNote: "" },
        ],
      },
      {
        dishId: "d25",
        name: "Beef Tenderloin",
        category: "Entrees",
        subNote: "Carve at station — whole tenderloins.",
        prepItems: [
          { prepItemId: "d25-p01", name: "Tenderloins tied & dry brined", qty: "10 loins", location: "walk-in shelf 1", allergyNote: "" },
          { prepItemId: "d25-p02", name: "Red wine demi-glace", qty: "6 qt", location: "walk-in shelf 1", allergyNote: "" },
          { prepItemId: "d25-p03", name: "Compound butter", qty: "4 lbs", location: "walk-in door", allergyNote: "Dairy" },
          { prepItemId: "d25-p05", name: "Micro herbs for plating", qty: "as needed", location: "", allergyNote: "" },
        ],
      },
      {
        dishId: "d30",
        name: "Creme Brulee",
        category: "Desserts",
        subNote: "Torch tableside at dessert service.",
        prepItems: [
          { prepItemId: "d30-p01", name: "Custard set in ramekins", qty: "150 ramekins", location: "walk-in shelf 4", allergyNote: "Dairy" },
          { prepItemId: "d30-p02", name: "Sugar for torching", qty: "3 lbs", location: "dry storage", allergyNote: "" },
          { prepItemId: "d30-p03", name: "Fresh berries for garnish", qty: "4 pints", location: "walk-in shelf 3", allergyNote: "" },
          { prepItemId: "d30-p04", name: "Mint sprigs", qty: "as needed", location: "walk-in shelf 3", allergyNote: "" },
        ],
      },
    ],
  },
];

export const DEMO_DISHES: DemoDish[] = Array.from(
  new Map(
    DEMO_EVENTS.flatMap((event) =>
      event.dishes.map((dish) => [
        dish.dishId,
        {
          id: dish.dishId,
          name: dish.name,
          category: dish.category,
          prepItems: dish.prepItems.map((prepItem) => ({
            id: prepItem.prepItemId,
            name: prepItem.name,
            defaultQty: prepItem.qty,
            allergyNote: prepItem.allergyNote,
          })),
        },
      ]),
    ),
  ).values(),
);