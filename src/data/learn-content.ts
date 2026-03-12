export interface LearnSection {
  slug: string;
  title: string;
  content: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const pollenTypeSections: LearnSection[] = [
  {
    slug: "what-is-pollen",
    title: "What is Pollen?",
    content: `Pollen is a fine powder produced by the male parts of flowering plants, trees, grasses, and weeds. Each pollen grain contains the plant's male reproductive cells. While most pollen is meant to be carried by insects (entomophilous), the pollen that causes allergies is wind-dispersed (anemophilous) — plants release it in massive quantities, hoping some will reach another plant.

**Key facts:**
- A single ragweed plant can produce **1 billion pollen grains** in one season
- Pollen grains range from **10 to 100 micrometres** in diameter (a human hair is about 70 micrometres)
- Pollen can travel **hundreds of miles** on wind currents
- Pollen grains are counted in **grains per cubic metre of air** (grains/m³)
- Most allergenic pollen is invisible to the naked eye — if you can see it (like yellow pine pollen dust), it's usually less allergenic

**Why does pollen cause allergies?**
When pollen lands on the mucous membranes of your nose, eyes, or lungs, your immune system may mistake the proteins on the pollen grain's surface for a harmful invader. It produces IgE antibodies, which trigger the release of histamine and other chemicals. Histamine causes the classic allergy symptoms: sneezing, runny nose, itchy eyes, and congestion.`,
  },
  {
    slug: "tree-pollen",
    title: "Tree Pollen — The Spring Trigger",
    content: `Tree pollen is the first major pollen of the year, typically starting in late winter (January-February in southern regions) and lasting through spring (May-June). Trees release pollen before or as their leaves emerge, which is why you can be suffering from allergies before trees even look green.

**Season:** January–June (varies by species and latitude)
**Peak:** March–April in most of the United States

**Most allergenic trees:**
- **Oak** — The heaviest pollinator. Produces visible yellow-green pollen clouds.
- **Birch** — Most allergenic in northern climates. Causes extensive food cross-reactions.
- **Cedar/Juniper** — Notorious in Texas and the southwest. 'Cedar fever' can feel like the flu.
- **Elm** — Very early pollinator, often mistaken for winter illness.
- **Maple** — Early season, moderate allergenicity.
- **Ash** — Cross-reacts with olive pollen.
- **Pine** — Dramatic but actually less allergenic than most trees.

**What makes tree pollen unique:**
- Tree pollen seasons are **species-specific** — different trees bloom at different times, creating a cascade of allergens from January through June
- Trees produce pollen **before leaves emerge**, so bare trees can still be making you sick
- A single mature oak tree can produce **millions of pollen grains per day**
- Tree pollen grains are generally **20-40 micrometres** in diameter`,
  },
  {
    slug: "grass-pollen",
    title: "Grass Pollen — The Summer Scourge",
    content: `Grass pollen is the most common cause of hay fever worldwide. The term 'hay fever' (allergic rhinitis) originally referred to symptoms during the hay-making season in summer — which is grass pollen season. Grass pollen affects approximately 20% of the general population and up to 95% of hay fever sufferers.

**Season:** April–September
**Peak:** May–July in most of the United States

**Most allergenic grasses:**
- **Timothy grass** — The reference standard for grass allergy testing
- **Bermuda grass** — Dominant in the southern U.S., long season
- **Kentucky Bluegrass** — Common lawn grass, significant allergen
- **Ryegrass** — Highly allergenic, common in temperate areas
- **Orchard grass** — Early-season grass pollinator
- **Fescue** — Common in lawns, moderate allergenicity

**Key characteristics:**
- Unlike trees, **all grasses cross-react** with each other significantly — if you're allergic to one, you're allergic to most
- Grass pollen season is **longer** than tree pollen season (months vs. weeks per species)
- Mowing lawns **releases massive pollen clouds** — one of the highest-exposure activities
- **Thunderstorm asthma**: Rain can cause grass pollen grains to burst, releasing tiny allergenic particles that penetrate deep into the lungs. This is a genuine medical emergency that has caused mass hospitalizations

**The NAB grass pollen scale:**
| Level | Grains/m³ | What to Expect |
|-------|-----------|----------------|
| Low | 1-4 | Only the most sensitive affected |
| Moderate | 5-19 | Many allergy sufferers affected |
| High | 20-199 | Most sufferers symptomatic |
| Very High | 200+ | Nearly all sufferers severely affected |`,
  },
  {
    slug: "weed-pollen",
    title: "Weed Pollen — The Fall Finale",
    content: `Weed pollen dominates the late summer and fall allergy season. Ragweed is by far the most significant weed allergen in North America — it affects 15-26% of the U.S. population. Weed pollen season typically starts in August and continues until the first hard frost.

**Season:** July–November
**Peak:** August–October

**Most allergenic weeds:**
- **Ragweed** — The single biggest fall allergen. Up to 1 billion grains per plant per season.
- **Mugwort** — Second most significant. Causes food cross-reactions with celery, spices.
- **Plantain weed** — Often overlooked allergen found in lawns everywhere.
- **Lamb's quarters** — Common in gardens and disturbed soil.
- **Pigweed / Amaranth** — Significant in the southwest.
- **Sagebrush** — Major allergen in the western U.S.

**Key characteristics:**
- Ragweed pollen is **extremely small** (18-22 micrometres) and lightweight, travelling up to **400 miles** on wind
- A single ragweed plant produces up to **1 billion pollen grains** per season
- **Climate change is extending ragweed season** by 2-3 weeks compared to 20 years ago
- Weed pollen season **ends abruptly with the first hard frost** — unlike tree and grass seasons that taper off
- Many common herbal products (chamomile tea, echinacea) cross-react with ragweed

**The NAB weed pollen scale:**
| Level | Grains/m³ | What to Expect |
|-------|-----------|----------------|
| Low | 1-9 | Minimal symptoms |
| Moderate | 10-49 | Symptoms in many sufferers |
| High | 50-499 | Significant symptoms |
| Very High | 500+ | Extreme — everyone affected |`,
  },
  {
    slug: "understanding-counts",
    title: "Understanding Pollen Counts",
    content: `Pollen counts measure the concentration of pollen grains in the air, expressed as **grains per cubic metre (grains/m³)**. These counts are established by the National Allergy Bureau (NAB), a section of the American Academy of Allergy, Asthma & Immunology (AAAAI).

**How pollen is counted:**
1. Air sampling devices (usually Rotorod or Burkard traps) capture airborne particles over 24 hours
2. Certified counters examine the samples under a microscope
3. Pollen grains are identified by species and counted
4. Results are expressed as grains/m³ for each pollen type

**NAB Threshold Reference Table:**

| Category | Low | Moderate | High | Very High |
|----------|-----|----------|------|-----------|
| **Tree** | 1-14 | 15-89 | 90-1,499 | 1,500+ |
| **Grass** | 1-4 | 5-19 | 20-199 | 200+ |
| **Weed** | 1-9 | 10-49 | 50-499 | 500+ |

**Why the thresholds are different:**
- Grass pollen is more allergenic per grain than tree pollen, so lower counts cause more symptoms
- Weed pollen (especially ragweed) is moderately allergenic but produced in enormous quantities
- Tree pollen is produced in massive quantities but individual grains are often less potent (except birch and oak)

**Universal Pollen Index (UPI):**
Google's Pollen API uses a 0-5 scale called the UPI that normalises across pollen types:
| UPI Value | Level | Description |
|-----------|-------|-------------|
| 0 | None | No pollen detected |
| 1 | Very Low | Minimal — only extremely sensitive individuals affected |
| 2 | Low | Some sensitive individuals may experience symptoms |
| 3 | Moderate | Many allergy sufferers will be symptomatic |
| 4 | High | Most allergy sufferers significantly affected |
| 5 | Very High | Extreme — widespread severe symptoms |

**Important caveats:**
- Counts represent the **previous 24 hours**, not real-time conditions
- Pollen counts vary dramatically by **time of day** (highest 5-10am), **weather** (higher on warm, dry, windy days), and **location** (urban vs. rural)
- Indoor pollen counts are typically **5-10x lower** than outdoor counts
- Pollen forecasts are **estimates** based on weather models and historical data — actual counts can vary significantly`,
  },
  {
    slug: "cross-reactivity",
    title: "Cross-Reactivity: When Foods Fight Back",
    content: `If you're allergic to certain pollens, you may also react to specific foods. This is called **Pollen-Food Allergy Syndrome (PFAS)** or **Oral Allergy Syndrome (OAS)**. It happens because proteins in certain foods are structurally similar to pollen allergens — your immune system can't tell them apart.

**How it works:**
1. You develop an allergy to a pollen (e.g., birch)
2. Birch pollen contains the protein Bet v 1
3. Apples contain a similar protein (Mal d 1)
4. When you eat a raw apple, your immune system reacts to the apple protein as if it were birch pollen
5. You experience tingling, itching, or swelling in your mouth and throat

**Key cross-reaction patterns:**

**Birch → Rosaceae fruits and more:**
- Raw apples, pears, cherries, peaches, plums, apricots
- Hazelnuts, almonds, walnuts
- Carrots, celery, parsley
- Soy milk (Gly m 4 protein)
- Kiwi

**Ragweed → Cucurbits and more:**
- Bananas, melons (watermelon, cantaloupe, honeydew)
- Zucchini, cucumber
- Chamomile tea, echinacea
- Sunflower seeds

**Mugwort → Celery-spice complex:**
- Celery, carrots
- Fennel, coriander, cumin, anise
- Mango
- Pepper (black pepper)

**Grass → Limited food reactions:**
- Tomatoes, potatoes (some individuals)
- Melons, oranges (limited)
- Wheat (rarely causes oral symptoms)

**Important notes:**
- **Cooking destroys the cross-reactive proteins** — if raw apples make your mouth itch but apple pie doesn't, this is why
- PFAS is usually **mild** (oral tingling/itching) and rarely causes anaphylaxis
- Reactions are **worse during pollen season** when your immune system is already primed
- About **50-75% of birch pollen allergy sufferers** experience some food cross-reaction`,
  },
  {
    slug: "when-pollen-peaks",
    title: "When Pollen Peaks: Daily and Seasonal Patterns",
    content: `Understanding when pollen levels are highest helps you plan your day to minimise exposure.

**Daily pattern:**
- **5am–10am**: Pollen counts are typically highest. Plants release pollen in the early morning as the air warms and dew dries. This is the worst time for outdoor activities if you have allergies.
- **10am–3pm**: Pollen rises into the upper atmosphere as the air heats up. Ground-level counts may decrease.
- **3pm–7pm**: Generally the best time for outdoor activities. Pollen starts settling.
- **After sunset**: Pollen settles further. Evening is often comfortable for allergy sufferers.
- **Exception**: In urban areas with tall buildings, pollen can be trapped and concentrated during the afternoon heat.

**Weather effects:**
- **Warm, dry, windy days**: Worst for pollen. Wind keeps grains airborne and dry conditions prevent them from clumping.
- **Rain**: Washes pollen from the air — counts drop during rain. BUT: right after rain stops, a burst of pollen release often occurs. Also, heavy rain can cause pollen grains to rupture ('thunderstorm asthma').
- **Cool, damp, overcast days**: Generally best for allergy sufferers.
- **After frost**: Kills annual plants like ragweed, ending their pollen season immediately.

**Seasonal calendar (approximate for central United States):**

| Month | Dominant Pollen | Notes |
|-------|----------------|-------|
| Jan-Feb | Elm, Cedar/Juniper, Alder | Early trees; 'Cedar fever' in Texas |
| Mar | Maple, Elm, Oak (starting) | Tree season ramps up |
| Apr | Oak, Birch, Ash, Pine | Peak tree pollen |
| May | Oak (ending), Grass (starting) | Transition from tree to grass |
| Jun-Jul | Grass (peak) | Hay fever season |
| Aug | Ragweed (starting), Grass (declining) | Transition to weed season |
| Sep-Oct | Ragweed (peak), Mugwort | Peak fall allergies |
| Nov | Ragweed (ending with frost) | Season winds down |
| Dec | Cedar/Juniper (south) | Winter pollen in warm climates |

**Latitude matters:**
- Southern states: Pollen season starts 4-8 weeks earlier and ends later
- Northern states: Shorter, more compressed pollen season
- Mountain areas: Season starts later due to cooler temperatures
- Coastal areas: Sea breezes can reduce pollen but can also bring in offshore pollen`,
  },
  {
    slug: "climate-change",
    title: "Climate Change and Pollen",
    content: `Climate change is directly affecting pollen levels and allergy seasons worldwide. This is well-documented by research and is causing measurable increases in allergy burden.

**Key findings:**
- **Pollen seasons are 20 days longer** on average than they were in 1990 (Ziska et al., 2019; Anderegg et al., 2021)
- **Pollen concentrations have increased by 21%** since 1990 across North America
- **Ragweed season has extended by 13-27 days** in northern latitudes since 1995
- Rising CO₂ levels cause plants to produce **more pollen per plant** — ragweed pollen production doubles when CO₂ levels double (Wayne et al., 2002)
- The allergenic potency of individual pollen grains is increasing — more allergen protein per grain

**What's driving this:**
1. **Warmer temperatures** → earlier spring onset → earlier pollen release → longer season
2. **Higher CO₂** → plants grow larger → more reproductive capacity → more pollen
3. **Delayed frost** → later end to weed pollen season → more total pollen exposure days
4. **Changing precipitation patterns** → drought stress triggers some plants to produce more pollen as a survival response
5. **Urbanisation** → heat island effect → even earlier, longer local seasons

**Projections:**
- By 2050, pollen seasons could start **40 days earlier** and last **19 days longer** than the 2000 baseline
- Total pollen emissions could increase by **200%** by end of century under high-emission scenarios
- Areas previously considered low-allergy (higher latitudes, higher elevations) will see increasing pollen as ranges shift northward

**What this means for allergy sufferers:**
- If your allergies seem to be getting worse year over year, they probably are — it's not just perception
- People in areas that historically had mild allergy seasons are developing new allergies
- Starting allergy medications earlier in the year than 'traditional' allergy season is increasingly necessary`,
  },
];

export const faqs: FAQ[] = [
  {
    question: "What's the difference between pollen count and pollen index?",
    answer:
      "A pollen **count** is the raw number of pollen grains per cubic metre of air (grains/m³), measured by physical air sampling. A pollen **index** (like Google's Universal Pollen Index, UPI) is a normalised score (usually 0-5) that adjusts for how allergenic each pollen type is. An index of 3 for grass pollen represents a different grain count than an index of 3 for tree pollen, because grass pollen is more potent per grain.",
  },
  {
    question: "Why do my allergies seem worse some years than others?",
    answer:
      "Several factors cause year-to-year variation: (1) **Weather patterns** — a mild winter followed by warm spring causes more prolific pollen production; (2) **Mast years** — some trees (like oak and birch) have boom years where they produce dramatically more pollen; (3) **Rain timing** — rain during peak season suppresses counts, rain before the season promotes growth; (4) **Your immune system** — stress, illness, and immune changes affect your sensitivity; (5) **Climate trends** — pollen levels are increasing overall due to climate change.",
  },
  {
    question: "Can you develop pollen allergies as an adult?",
    answer:
      "Yes. Adult-onset pollen allergies are very common. Moving to a new geographic area is a classic trigger — after 2-3 years of exposure to new pollen types, your immune system may develop sensitisation. Hormonal changes, immune system shifts, and cumulative exposure can all trigger new allergies at any age. Cedar fever in Texas frequently develops in adults who moved there from other regions.",
  },
  {
    question: "Does rain help or hurt pollen allergies?",
    answer:
      "Both. During rain, pollen is washed from the air and counts drop — this provides relief. However, heavy rain and especially thunderstorms can cause pollen grains to absorb water and burst (osmotic rupture), releasing tiny allergenic particles that penetrate deeper into the lungs. This 'thunderstorm asthma' phenomenon has caused mass hospitalisation events. After rain stops, there's often a burst of new pollen release. Light, steady rain is best for allergy relief.",
  },
  {
    question: "Are pollen forecasts accurate?",
    answer:
      "Pollen forecasts are estimates based on weather models, historical patterns, and current conditions. They're generally reliable for broad trends (e.g., 'high tree pollen this week') but less accurate for specific daily counts. Factors like localised weather events, proximity to specific plant species, and altitude can cause significant local variation from the forecast. Think of pollen forecasts like weather forecasts — useful for planning but not precise predictions.",
  },
  {
    question: "What's the best time of day to go outside if I have allergies?",
    answer:
      "Late afternoon to early evening (3pm-7pm) is generally best. Pollen release peaks between 5-10am, and grains are carried upward by warming air during midday. By late afternoon, pollen is settling and counts tend to be lower at ground level. Evening is also good. Avoid early morning outdoor exercise during pollen season.",
  },
  {
    question: "Why are my allergies worse in the city than the countryside?",
    answer:
      "The urban heat island effect causes city temperatures to be 2-5°F warmer, which extends pollen season and increases production. Urban air pollution (ozone, diesel particles) can make pollen grains more allergenic and can directly irritate airways, making them more reactive to pollen. Buildings create wind tunnels that concentrate pollen. However, rural areas near agricultural land may have higher grass and weed pollen counts.",
  },
  {
    question:
      "I'm allergic to birch pollen and raw apples make my mouth itch. Are these related?",
    answer:
      "Yes — this is Pollen-Food Allergy Syndrome (PFAS), also called Oral Allergy Syndrome. Birch pollen contains the protein Bet v 1, and apples contain a structurally similar protein (Mal d 1). Your immune system cross-reacts between them. This also applies to pears, cherries, peaches, carrots, celery, hazelnuts, and almonds. Cooking destroys these proteins, so cooked apple (pie, sauce) won't trigger the reaction. Reactions are typically worst during birch pollen season.",
  },
];
