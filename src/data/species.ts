import type { SpeciesProfile } from "@/types/species";

export const species: SpeciesProfile[] = [
  {
    slug: "oak",
    name: "Oak",
    scientificName: "Quercus",
    category: "tree",
    description:
      "Oak trees are one of the most prolific pollen producers in North America. A single oak tree can produce billions of pollen grains in a season. The yellow-green dust you see coating cars in spring is often oak pollen. Oak pollen grains are relatively small (20-30 micrometres), allowing them to travel hundreds of miles on wind currents.",
    allergySeverity: "severe",
    bloomPeriod: { start: 3, end: 5 },
    peakMonths: [3, 4],
    crossReactivity: [
      "Birch (shared Bet v 1-like proteins)",
      "Chestnut",
      "Beech (same Fagaceae family)",
      "Apples, cherries, and hazelnuts (oral allergy syndrome)",
    ],
    prevalence:
      "Extremely common across the eastern and central United States. Over 90 species of oak grow in North America.",
    grainSize: "20-30 micrometres",
    tips: [
      "Oak season peaks in March-April — start antihistamines 2 weeks before.",
      "Pollen is heaviest in the morning. Schedule outdoor activities for late afternoon.",
      "The yellow coating on your car is largely oak pollen — wash it off regularly.",
      "Oak pollen cross-reacts with certain fruits. If your mouth itches after eating apples during oak season, this is oral allergy syndrome.",
    ],
  },
  {
    slug: "birch",
    name: "Birch",
    scientificName: "Betula",
    category: "tree",
    description:
      "Birch pollen is one of the most allergenic tree pollens worldwide. It contains the protein Bet v 1, which is the primary allergen responsible for birch pollen allergy and is also the protein behind many food cross-reactions. A single birch catkin releases about 5.5 million pollen grains, and a mature tree can have thousands of catkins.",
    allergySeverity: "severe",
    bloomPeriod: { start: 3, end: 5 },
    peakMonths: [4],
    crossReactivity: [
      "Apples, pears, cherries, peaches (Rosaceae family fruits)",
      "Hazelnuts, almonds, walnuts",
      "Carrots, celery, parsley",
      "Soy (significant cross-reactor via Gly m 4 protein)",
      "Alder, hazel, hornbeam (related tree species)",
    ],
    prevalence:
      "Very common in the northern United States, Canada, and throughout Europe. Birch is the most significant allergenic tree in northern temperate climates.",
    grainSize: "22-28 micrometres",
    tips: [
      "Birch-fruit syndrome: if you're allergic to birch, you may react to raw apples, cherries, and peaches. Cooking these foods breaks down the cross-reactive proteins.",
      "Birch season is short but intense — typically 2-4 weeks in April.",
      "Consider immunotherapy (allergy shots) — birch pollen immunotherapy is one of the best-studied and most effective.",
      "HEPA air purifiers are especially effective against birch pollen particles.",
    ],
  },
  {
    slug: "maple",
    name: "Maple",
    scientificName: "Acer",
    category: "tree",
    description:
      "Maple trees are early-season pollinators, often among the first trees to bloom in late winter. While less allergenic than oak or birch individually, their early timing catches many people off guard. Box elder (Acer negundo) is actually a maple species and is the most allergenic of the group.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 2, end: 4 },
    peakMonths: [3],
    crossReactivity: [
      "Other maple species",
      "Box elder (which is a maple)",
    ],
    prevalence:
      "Widespread across the eastern United States and southern Canada. Sugar maples, red maples, and silver maples are the most common species.",
    grainSize: "25-35 micrometres",
    tips: [
      "Maple is an early pollinator — symptoms starting in February/March are often maple.",
      "Box elder is the most allergenic maple. If you have box elders near your home, consider removal.",
      "Maple pollen season is relatively short (4-6 weeks).",
    ],
  },
  {
    slug: "pine",
    name: "Pine",
    scientificName: "Pinus",
    category: "tree",
    description:
      "Pine pollen is dramatic — you can literally see yellow clouds of it — but it's actually less allergenic than most other tree pollens. The grains are very large (45-65 micrometres) with distinctive air bladders that help them travel long distances. Because the grains are so large, they're less likely to penetrate deep into the respiratory tract. However, the sheer volume of pine pollen can irritate anyone.",
    allergySeverity: "mild",
    bloomPeriod: { start: 3, end: 6 },
    peakMonths: [4, 5],
    crossReactivity: [
      "Spruce",
      "Fir",
      "Other conifers (limited cross-reactivity)",
    ],
    prevalence:
      "Extremely common throughout North America. Pine forests cover vast areas of the southern and western United States.",
    grainSize: "45-65 micrometres (one of the largest pollen grains)",
    tips: [
      "Don't be fooled by the dramatic yellow clouds — pine is actually less allergenic than invisible pollens like ragweed.",
      "If pine makes you sneeze, it's likely the volume and physical irritation rather than a true allergic reaction.",
      "The yellow coating on everything outdoors during pine season is annoying but relatively harmless.",
      "True pine allergy is rare but does exist — if symptoms are severe during pine season, get tested.",
    ],
  },
  {
    slug: "elm",
    name: "Elm",
    scientificName: "Ulmus",
    category: "tree",
    description:
      "Elm trees are very early pollinators, sometimes blooming as early as January in southern regions. American elm was once the dominant street tree in the United States before Dutch elm disease devastated populations. Despite reduced numbers, elm pollen remains a significant allergen, particularly because it pollinates when few other trees are active.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 1, end: 3 },
    peakMonths: [2, 3],
    crossReactivity: [
      "Hackberry (Celtis)",
      "Mulberry (limited)",
    ],
    prevalence:
      "Common in urban areas across the eastern and central United States. Many disease-resistant cultivars have been planted.",
    grainSize: "28-40 micrometres",
    tips: [
      "Elm is one of the earliest pollinators — winter 'colds' that don't respond to treatment may actually be elm allergy.",
      "Elm pollen is often mistaken for a late-winter virus because few people expect allergies in January/February.",
      "If you react early in the year before other trees bloom, elm is a prime suspect.",
    ],
  },
  {
    slug: "ash",
    name: "Ash",
    scientificName: "Fraxinus",
    category: "tree",
    description:
      "Ash trees produce moderate amounts of allergenic pollen. They are related to olive trees and share significant cross-reactivity. Ash pollen contains the allergen Fra e 1, which is structurally similar to olive pollen's Ole e 1. The emerald ash borer has severely impacted ash populations in recent years.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 3, end: 5 },
    peakMonths: [4],
    crossReactivity: [
      "Olive (strong cross-reactivity — same family Oleaceae)",
      "Privet (Ligustrum)",
      "Lilac (Syringa)",
    ],
    prevalence:
      "Common but declining across the eastern United States due to the emerald ash borer. Still significant in urban landscapes.",
    grainSize: "22-28 micrometres",
    tips: [
      "If you're allergic to olive pollen (common in California), you'll likely react to ash as well.",
      "Ash populations are declining due to the emerald ash borer, which may gradually reduce ash pollen levels.",
      "Ash pollen overlaps with oak season, so symptoms may be attributed to oak when ash is the actual trigger.",
    ],
  },
  {
    slug: "juniper-cedar",
    name: "Juniper / Cedar",
    scientificName: "Juniperus",
    category: "tree",
    description:
      "Mountain cedar (Juniperus ashei) and other junipers are notorious allergens, especially in Texas and the southwest. 'Cedar fever' is a well-known phenomenon in central Texas where mountain cedar pollen causes intense allergic reactions in winter. These trees release massive amounts of pollen — visible as clouds of 'smoke' rising from the trees on dry, windy days.",
    allergySeverity: "severe",
    bloomPeriod: { start: 12, end: 3 },
    peakMonths: [12, 1, 2],
    crossReactivity: [
      "Cypress (strong cross-reactivity)",
      "Japanese cedar (Cryptomeria)",
      "Other Cupressaceae family trees",
    ],
    prevalence:
      "Dominant in Texas Hill Country, the southwest, and parts of the west. Mountain cedar is the primary culprit in Texas. Eastern red cedar (J. virginiana) is common in the east.",
    grainSize: "20-30 micrometres",
    tips: [
      "'Cedar fever' in Texas peaks December-February. Despite the name, it's an allergic reaction, not an infection.",
      "Cedar pollen can trigger asthma attacks in sensitive individuals.",
      "The visible 'smoke' from juniper trees on windy days is pure pollen — avoid being downwind.",
      "Cedar allergies often develop after moving to Texas, even in people with no prior allergy history.",
    ],
  },
  {
    slug: "cottonwood",
    name: "Cottonwood / Poplar",
    scientificName: "Populus",
    category: "tree",
    description:
      "Cottonwood trees are famous for their fluffy white seeds that fill the air in late spring, but this 'cotton' is not the allergenic part. The actual pollen is released weeks earlier and is invisible. Many people blame the cotton fluff for their allergies, but their symptoms are usually caused by grass pollen that peaks at the same time the cotton is flying.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 3, end: 5 },
    peakMonths: [3, 4],
    crossReactivity: [
      "Willow (same family Salicaceae)",
      "Aspen (same genus Populus)",
    ],
    prevalence:
      "Very common along waterways and in urban areas across North America. Fast-growing and widely planted as shade trees.",
    grainSize: "25-35 micrometres",
    tips: [
      "The white fluffy 'cotton' is NOT pollen — it's the seed dispersal mechanism. The actual pollen was released weeks earlier.",
      "If you sneeze when the cotton flies, you're likely reacting to grass pollen, which peaks at the same time.",
      "True cottonwood pollen allergy exists but is less common than people think.",
      "Cottonwood pollen is released in March-April, while the cotton fluff appears in May-June.",
    ],
  },
  {
    slug: "alder",
    name: "Alder",
    scientificName: "Alnus",
    category: "tree",
    description:
      "Alder is an early-season pollinator closely related to birch. In the Pacific Northwest, alder is the dominant allergenic tree. Red alder (Alnus rubra) is the most common species in western North America. Alder pollen contains allergens that cross-react significantly with birch.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 1, end: 4 },
    peakMonths: [2, 3],
    crossReactivity: [
      "Birch (strong cross-reactivity)",
      "Hazel",
      "Hornbeam",
      "Same fruit cross-reactions as birch (apples, pears)",
    ],
    prevalence:
      "Very common in the Pacific Northwest and along waterways. Red alder is the most widespread broadleaf tree in western Oregon and Washington.",
    grainSize: "20-30 micrometres",
    tips: [
      "In the Pacific Northwest, alder is often the first tree to trigger allergies, starting as early as January.",
      "Alder cross-reacts with birch — if you're allergic to one, you're likely allergic to both.",
      "The same fruit cross-reactions apply: raw apples, pears, and stone fruits may cause oral tingling.",
    ],
  },
  {
    slug: "ragweed",
    name: "Ragweed",
    scientificName: "Ambrosia",
    category: "weed",
    description:
      "Ragweed is the single most significant cause of fall allergies in North America. A single ragweed plant can produce up to one billion pollen grains per season. The pollen is extremely lightweight and can travel up to 400 miles on wind currents. Ragweed pollen contains the allergen Amb a 1, which causes reactions in approximately 15-26% of the U.S. population.",
    allergySeverity: "severe",
    bloomPeriod: { start: 8, end: 11 },
    peakMonths: [8, 9, 10],
    crossReactivity: [
      "Bananas, melons (watermelon, cantaloupe, honeydew)",
      "Zucchini, cucumber, sunflower seeds",
      "Chamomile tea",
      "Echinacea supplements",
      "Mugwort (strong cross-reactivity)",
      "Other Asteraceae family plants",
    ],
    prevalence:
      "Found throughout the United States but concentrated in the Midwest and East. 17 species of ragweed grow in North America. Climate change is extending ragweed season by weeks.",
    grainSize: "18-22 micrometres (very small — penetrates deep into lungs)",
    tips: [
      "Ragweed season has gotten longer due to climate change — it now extends 2-3 weeks later than it did 20 years ago.",
      "Peak pollen release is between 6-10am. This is the worst time to be outdoors during ragweed season.",
      "If you're ragweed-allergic and chamomile tea makes you feel worse, this is cross-reactivity — avoid it.",
      "Ragweed allergy is one of the most responsive to immunotherapy (allergy shots). Talk to your allergist.",
      "First frost kills ragweed plants, ending the season abruptly.",
    ],
  },
  {
    slug: "grass-general",
    name: "Grass (General)",
    scientificName: "Poaceae",
    category: "grass",
    description:
      "Grass pollen is the most common cause of allergic rhinitis (hay fever) worldwide. The major allergenic grasses include Timothy, Bermuda, Kentucky Bluegrass, Ryegrass, and Fescue. Unlike trees that bloom for a few weeks, grass pollen season can last for months. Grass pollen grains are moderately sized and highly allergenic — the allergens are concentrated on the surface of the grain and are released immediately on contact with mucous membranes.",
    allergySeverity: "severe",
    bloomPeriod: { start: 4, end: 9 },
    peakMonths: [5, 6, 7],
    crossReactivity: [
      "Wheat, rye, barley, oats (cereal grains are grasses)",
      "Tomatoes, potatoes (in some individuals)",
      "Melons, oranges (limited)",
      "All grasses cross-react with each other significantly",
    ],
    prevalence:
      "Universal — grasses grow on every continent including Antarctica. Grass pollen allergy affects approximately 20% of the general population and up to 95% of hay fever sufferers.",
    grainSize: "25-45 micrometres",
    tips: [
      "Mowing the lawn releases massive amounts of grass pollen. If you're allergic, have someone else mow or wear an N95 mask.",
      "Grass pollen peaks in the morning and on warm, windy days. Late evening is the best time for outdoor activities.",
      "All grasses cross-react, so you can't avoid grass allergy by avoiding specific grass species.",
      "Rain washes pollen from the air but also causes pollen grains to burst, releasing smaller allergenic particles. Symptoms can spike after thunderstorms ('thunderstorm asthma').",
      "Sublingual immunotherapy (allergy tablets) for grass pollen is FDA-approved and can be done at home.",
    ],
  },
  {
    slug: "timothy-grass",
    name: "Timothy Grass",
    scientificName: "Phleum pratense",
    category: "grass",
    description:
      "Timothy grass is the most studied allergenic grass and is used as the standard reference for grass pollen allergy testing. It originated in Europe but is now widespread across North America as a pasture and hay grass. The allergen Phl p 1 is the primary protein responsible for reactions and is the basis for most grass pollen immunotherapy products.",
    allergySeverity: "severe",
    bloomPeriod: { start: 5, end: 8 },
    peakMonths: [6, 7],
    crossReactivity: [
      "All other grass species (extensive cross-reactivity)",
      "Rye grass (very strong)",
      "Orchard grass",
    ],
    prevalence:
      "Common throughout the northern United States and Canada. Widely cultivated for hay and pasture.",
    grainSize: "30-40 micrometres",
    tips: [
      "Timothy grass allergy is the benchmark for grass pollen allergy — most allergy tests use Timothy pollen.",
      "If you're allergic to Timothy, you're allergic to essentially all northern grass species.",
      "Grastek (sublingual tablet) for Timothy grass allergy is FDA-approved for home use.",
    ],
  },
  {
    slug: "bermuda-grass",
    name: "Bermuda Grass",
    scientificName: "Cynodon dactylon",
    category: "grass",
    description:
      "Bermuda grass is the dominant allergenic grass in the southern United States. It has a longer pollen season than northern grasses and can pollinate from spring through fall in warm climates. Bermuda grass is unique among grasses because it has limited cross-reactivity with northern grass species — it belongs to the Chloridoideae subfamily while most northern grasses are in the Pooideae subfamily.",
    allergySeverity: "severe",
    bloomPeriod: { start: 4, end: 10 },
    peakMonths: [5, 6, 7, 8],
    crossReactivity: [
      "Limited cross-reactivity with northern grasses (different subfamily)",
      "Bahia grass",
      "Johnson grass",
    ],
    prevalence:
      "Dominant grass in the southern United States, from the Carolinas to California. Used extensively for lawns, golf courses, and athletic fields.",
    grainSize: "25-35 micrometres",
    tips: [
      "Bermuda grass has a much longer season than northern grasses — April through October in the South.",
      "Unlike other grasses, Bermuda doesn't fully cross-react with Timothy/Rye. You may need specific testing.",
      "Bermuda grass lawns can be switched to alternatives like St. Augustine grass, which produces less airborne pollen.",
    ],
  },
  {
    slug: "mugwort",
    name: "Mugwort",
    scientificName: "Artemisia vulgaris",
    category: "weed",
    description:
      "Mugwort is a widespread weed whose pollen is a major allergen in late summer and fall. It's in the same family as ragweed (Asteraceae) and the two cross-react significantly. Mugwort allergy is particularly notable for causing celery-birch-mugwort syndrome, a complex food allergy pattern. The pollen contains the allergen Art v 1, which triggers reactions in 10-14% of pollen allergy sufferers.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 7, end: 10 },
    peakMonths: [8, 9],
    crossReactivity: [
      "Ragweed (same family, strong cross-reactivity)",
      "Celery, carrots, parsley, fennel (celery-mugwort-spice syndrome)",
      "Sunflower, chamomile, echinacea",
      "Birch (birch-mugwort-celery syndrome)",
      "Mango (tropical fruit cross-reaction)",
    ],
    prevalence:
      "Common throughout North America and Europe, especially in disturbed soils, roadsides, and waste areas. More significant as an allergen in Europe than in the U.S.",
    grainSize: "18-25 micrometres",
    tips: [
      "If celery makes your mouth itch during late summer, mugwort pollen cross-reactivity is the likely cause.",
      "Mugwort-celery-spice syndrome: allergy to mugwort, celery, carrots, and various spices (coriander, cumin, fennel) — these are linked.",
      "Mugwort season overlaps with ragweed. If fall is your worst season, you may be reacting to both.",
    ],
  },
  {
    slug: "plantain",
    name: "Plantain (Weed)",
    scientificName: "Plantago",
    category: "weed",
    description:
      "Not to be confused with the banana-like fruit, Plantago is a common broadleaf weed found in lawns and disturbed areas worldwide. English plantain (Plantago lanceolata) is the most allergenic species. It produces small, inconspicuous flower spikes that release moderate amounts of wind-dispersed pollen. Plantain allergy is often underdiagnosed because the plants are so unassuming.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 4, end: 10 },
    peakMonths: [5, 6, 7],
    crossReactivity: [
      "Olive (shared Ole e 1-like proteins)",
      "Ash tree",
      "Melon (limited cross-reactivity)",
    ],
    prevalence:
      "Extremely common in lawns, paths, and disturbed areas throughout North America and Europe. English plantain is the most widespread species.",
    grainSize: "20-30 micrometres",
    tips: [
      "Plantain weed allergy is often missed in testing. If you react during grass season but grass allergy tests are negative, ask about plantain.",
      "These weeds thrive in compacted soil and are common in lawns, sidewalk cracks, and paths.",
      "Maintaining a thick, healthy lawn reduces plantain weed growth.",
    ],
  },
  {
    slug: "nettle",
    name: "Nettle / Pellitory",
    scientificName: "Urtica / Parietaria",
    category: "weed",
    description:
      "Nettle family plants (Urticaceae) are significant pollen producers that are often overlooked as allergens. Pellitory (Parietaria) is particularly important in Mediterranean climates and coastal areas. These plants produce small, inconspicuous flowers that release lightweight pollen in enormous quantities. The sting of stinging nettle is caused by histamine and formic acid in the plant's hairs — completely separate from the pollen allergy.",
    allergySeverity: "moderate",
    bloomPeriod: { start: 3, end: 10 },
    peakMonths: [5, 6, 7],
    crossReactivity: [
      "Other Urticaceae family plants",
      "Mulberry (same order Rosales — limited)",
    ],
    prevalence:
      "Common in urban areas, along walls, and in waste areas. Pellitory is particularly common in coastal and Mediterranean climates.",
    grainSize: "12-16 micrometres (very small — easily inhaled deep into lungs)",
    tips: [
      "Nettle pollen is extremely small, making it highly respirable — it reaches deep into the lungs more easily than larger pollens.",
      "Pellitory grows on walls and in cracks — it's an urban allergen that thrives in cities.",
      "The stinging sensation from touching nettles is unrelated to pollen allergy.",
    ],
  },
];

export function getSpeciesBySlug(slug: string): SpeciesProfile | undefined {
  return species.find((s) => s.slug === slug);
}

export function getSpeciesByCategory(
  category: SpeciesProfile["category"]
): SpeciesProfile[] {
  return species.filter((s) => s.category === category);
}

export function getAllSlugs(): string[] {
  return species.map((s) => s.slug);
}
