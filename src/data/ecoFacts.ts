export type EcoFactCategory =
  | "TREES & FORESTS"
  | "WATER & OCEANS"
  | "ANIMALS & WILDLIFE"
  | "RECYCLING & WASTE"
  | "ENERGY & CLIMATE"
  | "PLANTS & GARDENS";

export type EcoFact = {
  id: number;
  category: EcoFactCategory;
  emoji: string;
  fact: string; // <= 100 chars, kid friendly
  source: string; // org name
  lessonId: number; // 1-100
};

// NOTE:
// - Facts are written to avoid dubious/variable statistics.
// - Each entry includes an inline comment pointing to a credible source organization.
export const ecoFacts: EcoFact[] = [
  // TREES & FORESTS (25)
  { id: 1, category: "TREES & FORESTS", emoji: "🌳", fact: "Trees make oxygen we breathe.", source: "National Geographic", lessonId: 1 }, // NatGeo
  { id: 2, category: "TREES & FORESTS", emoji: "🌲", fact: "Forests are homes for many animals.", source: "WWF", lessonId: 2 }, // WWF
  { id: 3, category: "TREES & FORESTS", emoji: "🍃", fact: "Tree roots help stop soil from washing away.", source: "FAO", lessonId: 3 }, // FAO
  { id: 4, category: "TREES & FORESTS", emoji: "🌿", fact: "Leaves help trees turn sunlight into food.", source: "National Geographic", lessonId: 4 }, // NatGeo
  { id: 5, category: "TREES & FORESTS", emoji: "🪵", fact: "Dead wood can feed bugs and fungi in forests.", source: "National Geographic", lessonId: 5 }, // NatGeo
  { id: 6, category: "TREES & FORESTS", emoji: "🌳", fact: "Planting native trees helps local wildlife.", source: "WWF", lessonId: 6 }, // WWF
  { id: 7, category: "TREES & FORESTS", emoji: "🌲", fact: "Mangrove forests protect coasts from storms.", source: "UNEP", lessonId: 7 }, // UNEP
  { id: 8, category: "TREES & FORESTS", emoji: "🌳", fact: "Some forests help store carbon in trees and soil.", source: "IPCC", lessonId: 8 }, // IPCC
  { id: 9, category: "TREES & FORESTS", emoji: "🐦", fact: "Forests give birds places to nest and find food.", source: "WWF", lessonId: 9 }, // WWF
  { id: 10, category: "TREES & FORESTS", emoji: "💧", fact: "Trees can help shade streams and keep water cooler.", source: "FAO", lessonId: 10 }, // FAO
  { id: 11, category: "TREES & FORESTS", emoji: "🌳", fact: "Reforestation means growing forests again.", source: "FAO", lessonId: 11 }, // FAO
  { id: 12, category: "TREES & FORESTS", emoji: "🔥", fact: "Healthy forests can reduce wildfire risk when managed well.", source: "FAO", lessonId: 12 }, // FAO
  { id: 13, category: "TREES & FORESTS", emoji: "🦋", fact: "Forests support pollinators like butterflies.", source: "WWF", lessonId: 13 }, // WWF
  { id: 14, category: "TREES & FORESTS", emoji: "🌱", fact: "Tiny seedlings need light, water, and soil to grow.", source: "National Geographic", lessonId: 14 }, // NatGeo
  { id: 15, category: "TREES & FORESTS", emoji: "🌍", fact: "Protecting forests helps protect biodiversity.", source: "WWF", lessonId: 15 }, // WWF
  { id: 16, category: "TREES & FORESTS", emoji: "🏞️", fact: "National parks can help protect forests.", source: "National Geographic", lessonId: 16 }, // NatGeo
  { id: 17, category: "TREES & FORESTS", emoji: "🍂", fact: "Fallen leaves become soil nutrients over time.", source: "FAO", lessonId: 17 }, // FAO
  { id: 18, category: "TREES & FORESTS", emoji: "🦌", fact: "Many animals use forests for shelter and shade.", source: "WWF", lessonId: 18 }, // WWF
  { id: 19, category: "TREES & FORESTS", emoji: "🌳", fact: "Deforestation is when forests are cleared.", source: "FAO", lessonId: 19 }, // FAO
  { id: 20, category: "TREES & FORESTS", emoji: "🧑‍🌾", fact: "Agroforestry mixes trees with farms to help soil.", source: "FAO", lessonId: 20 }, // FAO
  { id: 21, category: "TREES & FORESTS", emoji: "🌲", fact: "Trees can give shade that cools hot places.", source: "UNEP", lessonId: 21 }, // UNEP
  { id: 22, category: "TREES & FORESTS", emoji: "🌳", fact: "Some tree rings can tell a story about past years.", source: "National Geographic", lessonId: 22 }, // NatGeo
  { id: 23, category: "TREES & FORESTS", emoji: "🐜", fact: "Forest insects help recycle nutrients in nature.", source: "National Geographic", lessonId: 23 }, // NatGeo
  { id: 24, category: "TREES & FORESTS", emoji: "🌱", fact: "Planting trees is best where forests naturally belong.", source: "FAO", lessonId: 24 }, // FAO
  { id: 25, category: "TREES & FORESTS", emoji: "🌿", fact: "Protecting forests helps keep air and water cleaner.", source: "UNEP", lessonId: 25 }, // UNEP

  // WATER & OCEANS (25)
  { id: 26, category: "WATER & OCEANS", emoji: "🌊", fact: "Oceans help move heat around Earth.", source: "NASA", lessonId: 26 }, // NASA
  { id: 27, category: "WATER & OCEANS", emoji: "💧", fact: "Clean water is important for people and nature.", source: "UNEP", lessonId: 27 }, // UNEP
  { id: 28, category: "WATER & OCEANS", emoji: "🐠", fact: "Coral reefs are habitats for many sea animals.", source: "National Geographic", lessonId: 28 }, // NatGeo
  { id: 29, category: "WATER & OCEANS", emoji: "🧊", fact: "Melting ice can change ocean levels over time.", source: "NASA", lessonId: 29 }, // NASA
  { id: 30, category: "WATER & OCEANS", emoji: "🚰", fact: "Turning off taps saves water.", source: "UNEP", lessonId: 30 }, // UNEP
  { id: 31, category: "WATER & OCEANS", emoji: "🌧️", fact: "The water cycle moves water through air, land, and sea.", source: "NASA", lessonId: 31 }, // NASA
  { id: 32, category: "WATER & OCEANS", emoji: "🐢", fact: "Sea turtles can be harmed by plastic in the ocean.", source: "Ocean Conservancy", lessonId: 32 }, // Ocean Conservancy
  { id: 33, category: "WATER & OCEANS", emoji: "🧼", fact: "Soap and oil can pollute water if poured down drains.", source: "UNEP", lessonId: 33 }, // UNEP
  { id: 34, category: "WATER & OCEANS", emoji: "🐳", fact: "Whales help ocean food webs by moving nutrients.", source: "National Geographic", lessonId: 34 }, // NatGeo
  { id: 35, category: "WATER & OCEANS", emoji: "🏞️", fact: "Wetlands help filter water and reduce floods.", source: "UNEP", lessonId: 35 }, // UNEP
  { id: 36, category: "WATER & OCEANS", emoji: "🪸", fact: "Healthy reefs protect coasts from waves.", source: "UNEP", lessonId: 36 }, // UNEP
  { id: 37, category: "WATER & OCEANS", emoji: "🐬", fact: "Many sea animals use sound to communicate.", source: "National Geographic", lessonId: 37 }, // NatGeo
  { id: 38, category: "WATER & OCEANS", emoji: "🧭", fact: "Ocean currents can carry tiny plants called plankton.", source: "NASA", lessonId: 38 }, // NASA
  { id: 39, category: "WATER & OCEANS", emoji: "🦀", fact: "Tide pools are mini-habitats full of life.", source: "National Geographic", lessonId: 39 }, // NatGeo
  { id: 40, category: "WATER & OCEANS", emoji: "🧴", fact: "Using less plastic helps keep oceans cleaner.", source: "Ocean Conservancy", lessonId: 40 }, // Ocean Conservancy
  { id: 41, category: "WATER & OCEANS", emoji: "🧯", fact: "Oil spills can harm birds and sea animals.", source: "UNEP", lessonId: 41 }, // UNEP
  { id: 42, category: "WATER & OCEANS", emoji: "🧊", fact: "Sea ice is important habitat for some animals.", source: "NASA", lessonId: 42 }, // NASA
  { id: 43, category: "WATER & OCEANS", emoji: "🏝️", fact: "Beaches change shape with waves and storms.", source: "National Geographic", lessonId: 43 }, // NatGeo
  { id: 44, category: "WATER & OCEANS", emoji: "🐟", fact: "Overfishing can reduce fish populations.", source: "UNEP", lessonId: 44 }, // UNEP
  { id: 45, category: "WATER & OCEANS", emoji: "💦", fact: "Shorter showers can save lots of water.", source: "UNEP", lessonId: 45 }, // UNEP
  { id: 46, category: "WATER & OCEANS", emoji: "🧃", fact: "Litter can wash from streets into rivers and oceans.", source: "Ocean Conservancy", lessonId: 46 }, // Ocean Conservancy
  { id: 47, category: "WATER & OCEANS", emoji: "🪼", fact: "Jellyfish are animals, not plants.", source: "National Geographic", lessonId: 47 }, // NatGeo
  { id: 48, category: "WATER & OCEANS", emoji: "🌊", fact: "Oceans absorb some carbon dioxide from the air.", source: "NASA", lessonId: 48 }, // NASA
  { id: 49, category: "WATER & OCEANS", emoji: "🫧", fact: "Tiny ocean plants make lots of Earth’s oxygen.", source: "NASA", lessonId: 49 }, // NASA
  { id: 50, category: "WATER & OCEANS", emoji: "🧽", fact: "Sponges are simple animals that filter water.", source: "National Geographic", lessonId: 50 }, // NatGeo

  // ANIMALS & WILDLIFE (25)
  { id: 51, category: "ANIMALS & WILDLIFE", emoji: "🦁", fact: "Biodiversity means many kinds of living things.", source: "WWF", lessonId: 51 }, // WWF
  { id: 52, category: "ANIMALS & WILDLIFE", emoji: "🦋", fact: "Butterflies help pollinate some flowers.", source: "National Geographic", lessonId: 52 }, // NatGeo
  { id: 53, category: "ANIMALS & WILDLIFE", emoji: "🐝", fact: "Bees are important pollinators for many crops.", source: "FAO", lessonId: 53 }, // FAO
  { id: 54, category: "ANIMALS & WILDLIFE", emoji: "🐘", fact: "Some animals are endangered and need protection.", source: "IUCN Red List", lessonId: 54 }, // IUCN
  { id: 55, category: "ANIMALS & WILDLIFE", emoji: "🦉", fact: "Many birds migrate to find food and safe weather.", source: "National Geographic", lessonId: 55 }, // NatGeo
  { id: 56, category: "ANIMALS & WILDLIFE", emoji: "🐧", fact: "Changing ice and oceans can affect polar animals.", source: "NASA", lessonId: 56 }, // NASA
  { id: 57, category: "ANIMALS & WILDLIFE", emoji: "🦊", fact: "Habitats are places animals live and find food.", source: "WWF", lessonId: 57 }, // WWF
  { id: 58, category: "ANIMALS & WILDLIFE", emoji: "🦜", fact: "Rainforests have many species that live nowhere else.", source: "WWF", lessonId: 58 }, // WWF
  { id: 59, category: "ANIMALS & WILDLIFE", emoji: "🐬", fact: "Some dolphins use clicks to find things underwater.", source: "National Geographic", lessonId: 59 }, // NatGeo
  { id: 60, category: "ANIMALS & WILDLIFE", emoji: "🦇", fact: "Bats can help by eating insects and pollinating plants.", source: "National Geographic", lessonId: 60 }, // NatGeo
  { id: 61, category: "ANIMALS & WILDLIFE", emoji: "🐢", fact: "Wildlife needs clean water, clean air, and safe homes.", source: "UNEP", lessonId: 61 }, // UNEP
  { id: 62, category: "ANIMALS & WILDLIFE", emoji: "🐆", fact: "Protecting habitats helps protect animals.", source: "WWF", lessonId: 62 }, // WWF
  { id: 63, category: "ANIMALS & WILDLIFE", emoji: "🦭", fact: "Ocean animals can be harmed by lost fishing gear.", source: "UNEP", lessonId: 63 }, // UNEP
  { id: 64, category: "ANIMALS & WILDLIFE", emoji: "🦌", fact: "Some animals spread seeds by carrying fruit.", source: "National Geographic", lessonId: 64 }, // NatGeo
  { id: 65, category: "ANIMALS & WILDLIFE", emoji: "🐦", fact: "Invasive species can harm native wildlife.", source: "UNEP", lessonId: 65 }, // UNEP
  { id: 66, category: "ANIMALS & WILDLIFE", emoji: "🦎", fact: "Reptiles are cold-blooded and need warmth to move.", source: "National Geographic", lessonId: 66 }, // NatGeo
  { id: 67, category: "ANIMALS & WILDLIFE", emoji: "🦒", fact: "Different animals eat different foods in food webs.", source: "National Geographic", lessonId: 67 }, // NatGeo
  { id: 68, category: "ANIMALS & WILDLIFE", emoji: "🐟", fact: "Healthy rivers help fish and people.", source: "WWF", lessonId: 68 }, // WWF
  { id: 69, category: "ANIMALS & WILDLIFE", emoji: "🦀", fact: "Crabs and shellfish help clean some coastal waters.", source: "National Geographic", lessonId: 69 }, // NatGeo
  { id: 70, category: "ANIMALS & WILDLIFE", emoji: "🦔", fact: "Helping nature in your yard can help wildlife.", source: "WWF", lessonId: 70 }, // WWF
  { id: 71, category: "ANIMALS & WILDLIFE", emoji: "🦆", fact: "Birds need safe places to rest during migration.", source: "WWF", lessonId: 71 }, // WWF
  { id: 72, category: "ANIMALS & WILDLIFE", emoji: "🦩", fact: "Some animals eat algae and tiny plants.", source: "National Geographic", lessonId: 72 }, // NatGeo
  { id: 73, category: "ANIMALS & WILDLIFE", emoji: "🦈", fact: "Sharks can help keep ocean ecosystems balanced.", source: "National Geographic", lessonId: 73 }, // NatGeo
  { id: 74, category: "ANIMALS & WILDLIFE", emoji: "🦜", fact: "Pet trade can threaten some wild species.", source: "UNEP", lessonId: 74 }, // UNEP
  { id: 75, category: "ANIMALS & WILDLIFE", emoji: "🧭", fact: "Some animals navigate using Earth’s magnetic field.", source: "National Geographic", lessonId: 75 }, // NatGeo

  // RECYCLING & WASTE (25)
  { id: 76, category: "RECYCLING & WASTE", emoji: "♻️", fact: "Recycling turns old materials into new products.", source: "EPA", lessonId: 76 }, // EPA
  { id: 77, category: "RECYCLING & WASTE", emoji: "🗑️", fact: "Reducing waste starts with buying only what you need.", source: "UNEP", lessonId: 77 }, // UNEP
  { id: 78, category: "RECYCLING & WASTE", emoji: "🧴", fact: "Plastic litter can harm animals on land and sea.", source: "UNEP", lessonId: 78 }, // UNEP
  { id: 79, category: "RECYCLING & WASTE", emoji: "🥫", fact: "Metal cans can often be recycled.", source: "EPA", lessonId: 79 }, // EPA
  { id: 80, category: "RECYCLING & WASTE", emoji: "📦", fact: "Cardboard can often be recycled when clean and dry.", source: "EPA", lessonId: 80 }, // EPA
  { id: 81, category: "RECYCLING & WASTE", emoji: "🧻", fact: "Composting turns food scraps into soil helpers.", source: "EPA", lessonId: 81 }, // EPA
  { id: 82, category: "RECYCLING & WASTE", emoji: "🛍️", fact: "Reusable bags can reduce single-use plastic.", source: "UNEP", lessonId: 82 }, // UNEP
  { id: 83, category: "RECYCLING & WASTE", emoji: "🧃", fact: "Litter can block storm drains and cause flooding.", source: "UNEP", lessonId: 83 }, // UNEP
  { id: 84, category: "RECYCLING & WASTE", emoji: "📱", fact: "Old electronics should be recycled safely.", source: "EPA", lessonId: 84 }, // EPA
  { id: 85, category: "RECYCLING & WASTE", emoji: "🧯", fact: "Batteries need special recycling, not regular trash.", source: "EPA", lessonId: 85 }, // EPA
  { id: 86, category: "RECYCLING & WASTE", emoji: "🍎", fact: "Food waste in landfills can make methane gas.", source: "UNEP", lessonId: 86 }, // UNEP
  { id: 87, category: "RECYCLING & WASTE", emoji: "🧼", fact: "Using refill bottles can cut plastic waste.", source: "UNEP", lessonId: 87 }, // UNEP
  { id: 88, category: "RECYCLING & WASTE", emoji: "🧴", fact: "Microplastics are tiny plastic bits found in nature.", source: "UNEP", lessonId: 88 }, // UNEP
  { id: 89, category: "RECYCLING & WASTE", emoji: "🧠", fact: "Sorting recycling correctly helps it get reused.", source: "EPA", lessonId: 89 }, // EPA
  { id: 90, category: "RECYCLING & WASTE", emoji: "🧹", fact: "Clean-up days can remove litter before it reaches rivers.", source: "Ocean Conservancy", lessonId: 90 }, // Ocean Conservancy
  { id: 91, category: "RECYCLING & WASTE", emoji: "🥤", fact: "Using a reusable bottle can reduce trash.", source: "UNEP", lessonId: 91 }, // UNEP
  { id: 92, category: "RECYCLING & WASTE", emoji: "🍽️", fact: "Reusable lunch boxes can reduce packaging waste.", source: "EPA", lessonId: 92 }, // EPA
  { id: 93, category: "RECYCLING & WASTE", emoji: "📃", fact: "Paper comes from trees—use both sides when you can.", source: "WWF", lessonId: 93 }, // WWF
  { id: 94, category: "RECYCLING & WASTE", emoji: "👕", fact: "Donating clothes helps items get used longer.", source: "World Bank", lessonId: 94 }, // World Bank
  { id: 95, category: "RECYCLING & WASTE", emoji: "🧪", fact: "Some plastics can’t be recycled everywhere.", source: "EPA", lessonId: 95 }, // EPA
  { id: 96, category: "RECYCLING & WASTE", emoji: "🧺", fact: "Repairing toys can keep them out of the trash.", source: "UNEP", lessonId: 96 }, // UNEP
  { id: 97, category: "RECYCLING & WASTE", emoji: "📦", fact: "Reusing boxes is a simple way to reduce waste.", source: "EPA", lessonId: 97 }, // EPA
  { id: 98, category: "RECYCLING & WASTE", emoji: "🪙", fact: "Buying durable items can reduce waste over time.", source: "UNEP", lessonId: 98 }, // UNEP
  { id: 99, category: "RECYCLING & WASTE", emoji: "🚮", fact: "Trash can travel far if wind blows it away.", source: "UNEP", lessonId: 99 }, // UNEP
  { id: 100, category: "RECYCLING & WASTE", emoji: "🌍", fact: "Reducing waste helps protect nature and oceans.", source: "UNEP", lessonId: 100 }, // UNEP

  // ENERGY & CLIMATE (25)
  { id: 101, category: "ENERGY & CLIMATE", emoji: "☀️", fact: "Solar panels turn sunlight into electricity.", source: "IEA", lessonId: 1 }, // IEA
  { id: 102, category: "ENERGY & CLIMATE", emoji: "🌬️", fact: "Wind turbines use moving air to make power.", source: "IEA", lessonId: 2 }, // IEA
  { id: 103, category: "ENERGY & CLIMATE", emoji: "🌍", fact: "Climate is the usual weather over many years.", source: "NASA", lessonId: 3 }, // NASA
  { id: 104, category: "ENERGY & CLIMATE", emoji: "🌡️", fact: "Greenhouse gases trap heat in Earth’s atmosphere.", source: "NASA", lessonId: 4 }, // NASA
  { id: 105, category: "ENERGY & CLIMATE", emoji: "💡", fact: "Turning off lights saves energy.", source: "IEA", lessonId: 5 }, // IEA
  { id: 106, category: "ENERGY & CLIMATE", emoji: "🏠", fact: "Insulation helps keep homes warm or cool using less energy.", source: "IEA", lessonId: 6 }, // IEA
  { id: 107, category: "ENERGY & CLIMATE", emoji: "🚲", fact: "Walking or biking can reduce air pollution.", source: "UNEP", lessonId: 7 }, // UNEP
  { id: 108, category: "ENERGY & CLIMATE", emoji: "🚌", fact: "Public transport can save energy per person.", source: "World Bank", lessonId: 8 }, // World Bank
  { id: 109, category: "ENERGY & CLIMATE", emoji: "🌳", fact: "Trees can store carbon as they grow.", source: "IPCC", lessonId: 9 }, // IPCC
  { id: 110, category: "ENERGY & CLIMATE", emoji: "⚡", fact: "Energy efficiency means doing the same with less energy.", source: "IEA", lessonId: 10 }, // IEA
  { id: 111, category: "ENERGY & CLIMATE", emoji: "🧊", fact: "Ice reflects sunlight and helps cool Earth.", source: "NASA", lessonId: 11 }, // NASA
  { id: 112, category: "ENERGY & CLIMATE", emoji: "🌊", fact: "Warmer oceans can affect storms and sea life.", source: "NASA", lessonId: 12 }, // NASA
  { id: 113, category: "ENERGY & CLIMATE", emoji: "🔌", fact: "Unplugging chargers can save a bit of energy.", source: "IEA", lessonId: 13 }, // IEA
  { id: 114, category: "ENERGY & CLIMATE", emoji: "🌤️", fact: "Weather can change day to day, climate changes slowly.", source: "NASA", lessonId: 14 }, // NASA
  { id: 115, category: "ENERGY & CLIMATE", emoji: "🏭", fact: "Burning fossil fuels releases carbon dioxide.", source: "IPCC", lessonId: 15 }, // IPCC
  { id: 116, category: "ENERGY & CLIMATE", emoji: "🔋", fact: "Batteries can store energy for later use.", source: "IEA", lessonId: 16 }, // IEA
  { id: 117, category: "ENERGY & CLIMATE", emoji: "🌱", fact: "Planting and protecting forests can help climate.", source: "IPCC", lessonId: 17 }, // IPCC
  { id: 118, category: "ENERGY & CLIMATE", emoji: "🏙️", fact: "Cities can be hotter than nearby areas (heat islands).", source: "NASA", lessonId: 18 }, // NASA
  { id: 119, category: "ENERGY & CLIMATE", emoji: "🍃", fact: "Clean energy can reduce air pollution.", source: "UNEP", lessonId: 19 }, // UNEP
  { id: 120, category: "ENERGY & CLIMATE", emoji: "📉", fact: "Using less energy can lower greenhouse gas emissions.", source: "IPCC", lessonId: 20 }, // IPCC
  { id: 121, category: "ENERGY & CLIMATE", emoji: "🧠", fact: "Small daily actions can add up when many people help.", source: "UNEP", lessonId: 21 }, // UNEP
  { id: 122, category: "ENERGY & CLIMATE", emoji: "🌾", fact: "Healthy soils can store carbon and grow plants better.", source: "FAO", lessonId: 22 }, // FAO
  { id: 123, category: "ENERGY & CLIMATE", emoji: "🌧️", fact: "A warmer world can change rain and drought patterns.", source: "IPCC", lessonId: 23 }, // IPCC
  { id: 124, category: "ENERGY & CLIMATE", emoji: "🌈", fact: "Some sunlight powers life through photosynthesis.", source: "NASA", lessonId: 24 }, // NASA
  { id: 125, category: "ENERGY & CLIMATE", emoji: "⚡", fact: "Renewable energy comes from sources that refill naturally.", source: "IEA", lessonId: 25 }, // IEA

  // PLANTS & GARDENS (25)
  { id: 126, category: "PLANTS & GARDENS", emoji: "🌱", fact: "Plants make food using sunlight, air, and water.", source: "Royal Botanic Gardens, Kew", lessonId: 26 }, // Kew
  { id: 127, category: "PLANTS & GARDENS", emoji: "🌸", fact: "Flowers help plants make seeds.", source: "Royal Botanic Gardens, Kew", lessonId: 27 }, // Kew
  { id: 128, category: "PLANTS & GARDENS", emoji: "🥕", fact: "Roots can store food and water for a plant.", source: "Royal Botanic Gardens, Kew", lessonId: 28 }, // Kew
  { id: 129, category: "PLANTS & GARDENS", emoji: "🍅", fact: "Many fruits grow from flowers after pollination.", source: "Royal Botanic Gardens, Kew", lessonId: 29 }, // Kew
  { id: 130, category: "PLANTS & GARDENS", emoji: "🪴", fact: "Houseplants can make rooms feel calmer and greener.", source: "National Geographic", lessonId: 30 }, // NatGeo
  { id: 131, category: "PLANTS & GARDENS", emoji: "🌿", fact: "Herbs like mint and basil are easy garden plants.", source: "National Geographic", lessonId: 31 }, // NatGeo
  { id: 132, category: "PLANTS & GARDENS", emoji: "🐞", fact: "Ladybugs can help by eating plant pests.", source: "National Geographic", lessonId: 32 }, // NatGeo
  { id: 133, category: "PLANTS & GARDENS", emoji: "🦋", fact: "Planting flowers can help pollinators find food.", source: "WWF", lessonId: 33 }, // WWF
  { id: 134, category: "PLANTS & GARDENS", emoji: "🌾", fact: "Soil is full of tiny living things that help plants.", source: "FAO", lessonId: 34 }, // FAO
  { id: 135, category: "PLANTS & GARDENS", emoji: "🍀", fact: "Some plants fix nitrogen and help soil stay healthy.", source: "FAO", lessonId: 35 }, // FAO
  { id: 136, category: "PLANTS & GARDENS", emoji: "🌻", fact: "Sunflowers can turn their faces toward the sun.", source: "National Geographic", lessonId: 36 }, // NatGeo
  { id: 137, category: "PLANTS & GARDENS", emoji: "🥬", fact: "Leafy greens grow best with enough water and sun.", source: "Royal Botanic Gardens, Kew", lessonId: 37 }, // Kew
  { id: 138, category: "PLANTS & GARDENS", emoji: "🍓", fact: "Bees help many fruits form, like strawberries.", source: "FAO", lessonId: 38 }, // FAO
  { id: 139, category: "PLANTS & GARDENS", emoji: "🌼", fact: "Native plants usually need less extra water and care.", source: "WWF", lessonId: 39 }, // WWF
  { id: 140, category: "PLANTS & GARDENS", emoji: "🪱", fact: "Earthworms help soil by breaking down dead plants.", source: "FAO", lessonId: 40 }, // FAO
  { id: 141, category: "PLANTS & GARDENS", emoji: "🍂", fact: "Mulch can help keep soil moist and cool.", source: "FAO", lessonId: 41 }, // FAO
  { id: 142, category: "PLANTS & GARDENS", emoji: "🧑‍🌾", fact: "Compost adds nutrients back into garden soil.", source: "EPA", lessonId: 42 }, // EPA
  { id: 143, category: "PLANTS & GARDENS", emoji: "🌵", fact: "Desert plants store water to survive dry times.", source: "National Geographic", lessonId: 43 }, // NatGeo
  { id: 144, category: "PLANTS & GARDENS", emoji: "🌳", fact: "Trees are plants too—some live for a very long time.", source: "National Geographic", lessonId: 44 }, // NatGeo
  { id: 145, category: "PLANTS & GARDENS", emoji: "🌿", fact: "Plants breathe through tiny holes in their leaves.", source: "Royal Botanic Gardens, Kew", lessonId: 45 }, // Kew
  { id: 146, category: "PLANTS & GARDENS", emoji: "🍄", fact: "Fungi help plants by sharing nutrients in soil.", source: "Royal Botanic Gardens, Kew", lessonId: 46 }, // Kew
  { id: 147, category: "PLANTS & GARDENS", emoji: "🌱", fact: "Seeds can travel by wind, water, or animals.", source: "National Geographic", lessonId: 47 }, // NatGeo
  { id: 148, category: "PLANTS & GARDENS", emoji: "🌼", fact: "Pollination helps plants make seeds for new plants.", source: "Royal Botanic Gardens, Kew", lessonId: 48 }, // Kew
  { id: 149, category: "PLANTS & GARDENS", emoji: "🪴", fact: "Plants need light, water, and nutrients to grow well.", source: "Royal Botanic Gardens, Kew", lessonId: 49 }, // Kew
  { id: 150, category: "PLANTS & GARDENS", emoji: "🌍", fact: "Gardens can be mini-habitats for insects and birds.", source: "WWF", lessonId: 50 }, // WWF
];

