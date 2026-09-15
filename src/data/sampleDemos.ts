import { AgriculturalDoc } from "../types";

export const SAMPLE_AGRICULTURAL_DEMOS: AgriculturalDoc[] = [
  {
    id: "sample-rice-manual",
    title: "Rice Cultivation & Crop Management Handbook",
    filename: "rice_cultivation_handbook.pdf",
    totalPages: 5,
    isPreloaded: true,
    fileSize: "1.4 MB",
    pages: [
      {
        pageNumber: 1,
        text: `CHAPTER 1: SEED SELECTION & NURSERY MANAGEMENT IN RICE (Oryza sativa)

1.1 Recommended Varieties:
- Medium Duration Varieties (125-135 days): IR-64, MTU 1010, Samba Mahsuri (BPT 5204).
- Short Duration Varieties (105-115 days): ADT 43, Tellahamsa.
- Aromatic Varieties: Basmati 370, Pusa Basmati 1121.

1.2 Seed Selection & Treatment:
Select healthy, certified seeds with >80% germination rate. Use salt water test (specific gravity 1.06; floating egg test) to eliminate chaffy and diseased seeds.
- Dry Seed Treatment: Carbendazim 50% WP @ 2 g/kg seed or Trichoderma viride @ 5-10 g/kg seed to protect seedlings against seed-borne foot rot (Bakanae) and blast.
- Wet Seed Treatment: Soak seeds in water with Carbendazim (1 g/L water) for 12 hours, followed by incubation in moist gunny bags for 24-36 hours until sprouting.

1.3 Nursery Bed Preparation:
- Wet Bed Nursery: Prepare raised beds (1.5 m width, convenient length, 15 cm height). Provide 30 cm drainage channels between beds.
- Seed Rate: 40-50 kg/ha for normal transplanting; 5-7 kg/ha for System of Rice Intensification (SRI).
- Nursery Fertilization: Apply 1 tonne of well-rotted FYM, 1 kg Nitrogen, 1 kg P2O5, and 1 kg K2O per 100 m² of nursery area. Maintain a thin film of water after seedling emergence.`,
      },
      {
        pageNumber: 2,
        text: `CHAPTER 2: MAIN FIELD PREPARATION & TRANSPLANTING TECHNIQUES

2.1 Land Preparation & Puddling:
Primary tillage using mouldboard plough or disc harrow to a depth of 15-20 cm, followed by two passes with cultivator. Flood the field and puddle thoroughly using a tractor cage wheel or rotary tiller.
- Benefits of Puddling: Destroys soil macropores, creates an impermeable subsurface layer (hardpan) to reduce percolation water loss, suppresses initial weed growth, and facilitates soft seedling anchorage.
- Leveling: Precise laser leveling ensures uniform water depth, saves 20-25% irrigation water, and ensures uniform fertilizer absorption.

2.2 Transplanting Guidelines:
- Optimal Seedling Age: 18-22 days old seedlings (4-5 leaf stage) for short duration varieties; 22-25 days for medium duration. Older seedlings (>30 days) suffer from reduced tiller production.
- Planting Density & Spacing: Standard spacing of 20 cm x 15 cm (33 hills/m²) or 15 cm x 15 cm (44 hills/m²) depending on soil fertility.
- Seedlings per Hill: Transplant 2-3 seedlings per hill at a shallow depth of 2-3 cm. Deep planting (>4 cm) delays tiller emergence and reduces effective panicle count.

2.3 System of Rice Intensification (SRI) Principles:
- Single young seedling (8-12 days old, 2-leaf stage) transplanted carefully with seed and soil intact.
- Wide square spacing of 25 cm x 25 cm.
- Rotary cono-weeding at 10, 20, 30, and 40 days after transplanting (DAT) to aerate the soil and incorporate weeds as green manure.`,
      },
      {
        pageNumber: 3,
        text: `CHAPTER 3: INTEGRATED NUTRIENT MANAGEMENT & FERTILIZER DOSAGES

3.1 Recommended Dose of Fertilizers (RDF):
For high-yielding semi-dwarf varieties under irrigated conditions:
- Nitrogen (N): 120 - 150 kg/ha
- Phosphorus (P2O5): 60 kg/ha
- Potassium (K2O): 40 - 60 kg/ha

3.2 Timing and Application Schedule:
- Basal Application (at final puddling before transplanting): Apply 25% of total Nitrogen, 100% of Phosphorus (Single Super Phosphate or DAP), and 50% of Potassium (Muriate of Potash).
- First Top Dressing (Active Tillering Stage, 20-25 DAT): Apply 50% of total Nitrogen as Urea. Ensure thin layer of water, incorporate into soil.
- Second Top Dressing (Panicle Initiation Stage, 40-45 DAT): Apply remaining 25% Nitrogen and remaining 50% Potassium. Potassium at this stage enhances grain weight, prevents lodging, and improves disease tolerance.

3.3 Micronutrient Deficiencies:
- Zinc Deficiency (Khaira Disease): Symptoms appear 2-3 weeks after transplanting. Chlorosis at the base of young leaves, followed by reddish-brown or rusty spots merging together.
  Treatment: Basal soil application of Zinc Sulphate (ZnSO4) @ 25 kg/ha once every 2-3 seasons. For standing crop, foliar spray with 0.5% ZnSO4 (5 g/L) + 1% Urea (10 g/L) applied twice at 7-day intervals.
- Iron Chlorosis: Appears on light sandy or alkaline soils. Spray ferrous sulphate 1.0% + citric acid 0.1%.`,
      },
      {
        pageNumber: 4,
        text: `CHAPTER 4: WATER MANAGEMENT & WEED CONTROL

4.1 Water Saving Technology - Alternate Wetting and Drying (AWD):
- Install a perforated PVC field water tube (15 cm diameter, 30 cm length, bottom 20 cm perforated with 5 mm holes) 20 cm deep in the field.
- After transplanting, maintain 2-3 cm standing water for the first 1-2 weeks for seedling establishment.
- Introduce AWD: Allow water to naturally drop to 15 cm below ground surface (monitored inside the tube) before re-irrigating to 5 cm depth.
- Critical Stages (NO WATER STRESS ALLOWED): Maintain continuous 3-5 cm standing water during Panicle Initiation, Booting, Flowering/Anthesis, and Milking stages. Water stress during anthesis causes severe spikelet sterility (>50% yield loss).
- Drain field completely 10-14 days before harvest to hasten uniform grain ripening and ease mechanical combine harvesting.

4.2 Integrated Weed Management:
- Critical Period of Crop-Weed Competition: 15 to 45 days after transplanting (DAT).
- Major Weeds: Echinochloa crus-galli (Barnyard grass), Cyperus rotundus (Sedge), Monochoria vaginalis (Broadleaf).
- Chemical Control:
  * Pre-emergence (3-5 DAT): Pretilachlor 50% EC @ 1.0-1.5 L/ha or Pyrazosulfuron-ethyl 10% WP @ 200 g/ha applied in thin standing water.
  * Post-emergence (20-25 DAT): Bispyribac-sodium 10% SC @ 200-250 ml/ha applied when weeds are at 2-3 leaf stage.`,
      },
      {
        pageNumber: 5,
        text: `CHAPTER 5: MAJOR PESTS, DISEASES & SAFE HARVEST PRACTICES

5.1 Major Insect Pests:
- Yellow Stem Borer (Scirpophaga incertulas):
  Symptoms: Larva bores into leaf sheath and central stem. Causes "Dead Heart" during vegetative phase (drying of central tiller) and "White Head" or "White Ear" during panicle emergence (erect, bleached, empty panicles).
  Management: Install pheromone traps @ 8-10 traps/ha. Release egg parasitoid Trichogramma japonicum @ 100,000/ha at weekly intervals. Chemical spray: Chlorantraniliprole 18.5% SC @ 150 ml/ha or Cartap hydrochloride 50% SP @ 1 kg/ha.
- Brown Planthopper (BPH - Nilaparvata lugens):
  Symptoms: Both nymphs and adults suck sap from stem base, resulting in circular patches of dried, lodged plants known as "Hopper Burn".
  Management: Provide alleyways (skip one row every 2-3 meters) for aeration. Avoid excess nitrogen. Spray Pymetrozine 50% WDG @ 300 g/ha or Triflumezopyrim 10% SC @ 240 ml/ha directed at stem base.

5.2 Major Plant Diseases:
- Rice Blast (Magnaporthe oryzae):
  Symptoms: Spindle-shaped lesions with brown borders and grayish-white centers on leaves. Causes nodal blast and neck blast (rotting and breaking of panicle neck).
  Control: Seed treatment with Tricyclazole 75% WP @ 2 g/kg seed. Foliar spray with Tricyclazole 75% WP @ 0.6 g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L at initiation of disease.
- Bacterial Leaf Blight (BLB - Xanthomonas oryzae pv. oryzae):
  Symptoms: Wavy margins on leaves turning straw yellow to white starting from tips downwards. Bacterial ooze drops visible in morning.
  Control: Spray Streptocycline (copper-free antibiotic) @ 100 mg/L + Copper Oxychloride @ 2.5 g/L.

5.3 Harvest & Moisture Standards:
Harvest when 80-85% of panicles turn golden yellow. Grains should have 20-22% moisture at harvest. Dry immediately on clean thrashing floors to safe storage moisture level of 12-14% to prevent aflatoxin contamination.`,
      },
    ],
  },
  {
    id: "sample-pest-manual",
    title: "Integrated Pest & Disease Management Manual",
    filename: "pest_and_disease_management_manual.pdf",
    totalPages: 4,
    isPreloaded: true,
    fileSize: "1.1 MB",
    pages: [
      {
        pageNumber: 1,
        text: `SECTION 1: PRINCIPLES OF INTEGRATED PEST MANAGEMENT (IPM)

1.1 Core IPM Philosophy:
Integrated Pest Management is an ecosystem-based strategy focusing on long-term prevention of pests through a combination of techniques: biological control, habitat manipulation, modification of cultural practices, and use of resistant crop varieties.
Pesticides are applied only after monitoring indicates that pests have exceeded the Economic Threshold Level (ETL), minimizing hazards to human health, beneficial insects, and the environment.

1.2 Economic Threshold Levels (ETL):
- Rice Stem Borer: 5% dead hearts at vegetative stage or 1 egg mass per m².
- Fall Armyworm (Maize): 10% damaged whorls in seedling/early vegetative stage, 20% in mid-whorl stage.
- Cotton Bollworm: 1 larva/meter row or 5% damaged squares/bolls.
- Aphids/Thrips (Vegetables): 5-10 insects per leaf.

1.3 Biological Control Agents:
- Predators: Ladybird beetles (Coccinellidae), hoverflies (Syrphidae), spiders, and predatory green lacewings (Chrysoperla carnea).
- Parasitoids: Trichogramma chilonis and Trichogramma brassicae (egg parasitoids), Bracon hebetor (larval parasitoid).
- Entomopathogenic Microbials:
  * Bacillus thuringiensis (Bt kurstaki) @ 1.5-2.0 g/L for lepidopteran caterpillar pests.
  * Beauveria bassiana @ 5 g/L for thrips, whiteflies, and beetles.
  * Metarhizium anisopliae @ 5 g/L for soil grubs and armyworms.
  * Verticillium lecanii @ 5 g/L for soft-bodied aphids and scales.`,
      },
      {
        pageNumber: 2,
        text: `SECTION 2: FALL ARMYWORM (Spodoptera frugiperda) IN MAIZE & MILLETS

2.1 Pest Biology and Damage Symptoms:
The Fall Armyworm is an invasive polyphagous pest capable of complete crop devastation in sweet corn, field maize, sorghum, and millets.
- Key Identification: Adult larvae possess an inverted white 'Y' suture on the front of the dark head capsule and four distinct elevated black dots forming a square on the 8th abdominal segment.
- Damage Patterns:
  * Seedling stage: Pinholes and shot-holes on emerging leaves.
  * Whorl stage: Ragged, chewed-up leaves with copious damp, sawdust-like larval fecal frass clogging the central funnel whorl.
  * Reproductive stage: Larvae bore into tassels and ear husks, damaging developing kernels.

2.2 Stepwise Management Strategy:
- Cultural Practices: Intercropping maize with non-host pulses (Cowpea, Pigeonpea) at 2:1 or 4:1 ratio. Deep summer ploughing to expose pupae to predatory birds.
- Mechanical Control: Collect and destroy egg masses (covered with light brown hairs). Apply dry sand or wood ash into whorls to mechanically disrupt young larvae.
- Pheromone Monitoring: Install FAW pheromone lure traps @ 10 traps/ha.
- Biopesticides: Spray neem seed kernel extract (NSKE 5%) or Azadirachtin 10,000 ppm @ 2-3 ml/L at first appearance of pinholes.
- Chemical Intervention (when ETL > 10%):
  * Spinetoram 11.7% SC @ 0.5 ml/L of water.
  * Chlorantraniliprole 18.5% SC @ 0.4 ml/L of water.
  * Emamectin benzoate 5% SG @ 0.4 g/L of water.
  Target the central leaf whorls directly using a single-nozzle knapsack sprayer.`,
      },
      {
        pageNumber: 3,
        text: `SECTION 3: WHEAT RUSTS AND FOLIAR BLIGHT MANAGEMENT

3.1 Yellow (Stripe) Rust of Wheat (Puccinia striiformis):
- Temperature & Climate: Favored by cool temperatures (10-18°C) and high relative humidity (>85%). Prevalent in Northern hills and plains.
- Visual Symptoms: Linear, bright yellow or orange-yellow powdery pustules (uredinia) arranged in distinct stripes parallel to the leaf veins.
- Devastating Impact: Can cause 40-100% grain yield reduction if it attacks the flag leaf prior to flowering.
- Resistant Varieties: Cultivate resistant varieties such as HD 2967, PBW 550, WH 1105, DBW 187 (Karan Vandana).
- Fungicidal Control: Apply Propiconazole 25% EC (Tilt) @ 1.0 ml/L or Tebuconazole 25.9% EC @ 1.2 ml/L at first notice of yellow pustules. Repeat after 15 days if conditions favor rust progression.

3.2 Spot Blight & Tan Spot (Bipolaris sorokiniana):
- Symptoms: Small, oval or oblong chocolate brown spots with chlorotic yellow halos. Spots coalesce into large necrotic lesions causing premature leaf death.
- Management: Seed treatment with Carboxin 37.5% + Thiram 37.5% DS @ 2.5 g/kg seed. Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1.0 ml/L.`,
      },
      {
        pageNumber: 4,
        text: `SECTION 4: SUCKING PEST COMPLEXES & VIRAL DISEASE VECTORS

4.1 Major Sucking Pests:
- Whitefly (Bemisia tabaci): Vector of Cotton Leaf Curl Virus (CLCuV) and Tomato Yellow Leaf Curl Virus (TYLCV).
- Thrips (Thrips tabaci / Scirtothrips dorsalis): Causes upward leaf curling in chili ("Murda" complex) and silvering of onion leaves.
- Green Peach Aphid (Myzus persicae): Sucks sap and secretes sticky honeydew attracting black sooty mold fungus (Capnodium spp.), reducing photosynthetic capacity.

4.2 IPM Schedule for Sucking Pests:
- Physical Barriers: Install Yellow and Blue sticky traps @ 20 traps/acre (yellow for whiteflies and aphids; blue for thrips) at 15 cm above crop canopy.
- Border Crops: Plant 2-3 dense barrier rows of tall fodder sorghum, pearl millet, or maize around fields to physically impede whitefly migration.
- Botanicals: Spray cold-pressed Neem Oil (10,000 ppm) @ 3 ml/L with 1 ml liquid soap sticker.
- Selective Chemistry:
  * Flonicamid 50% WG @ 0.3 g/L (highly selective, zero toxicity to honeybees and natural predators).
  * Diafenthiuron 50% WP @ 1.2 g/L for stubborn whitefly nymphs and mites.
  * Dinotefuran 20% SG @ 0.4 g/L for rapid knockdown.`,
      },
    ],
  },
  {
    id: "sample-soil-guide",
    title: "Soil Health, Fertilizer & Drip Irrigation Guide",
    filename: "soil_health_and_irrigation_guide.pdf",
    totalPages: 3,
    isPreloaded: true,
    fileSize: "0.9 MB",
    pages: [
      {
        pageNumber: 1,
        text: `CHAPTER 1: SOIL TESTING, SOIL REACTION (pH) & AMENDMENTS

1.1 Soil Health & Parameter Interpretation:
A balanced soil requires optimal physical structure, organic matter content (>0.75%), and microbial biodiversity.
- Ideal Agricultural Soil pH: 6.2 to 7.2 (Neutral range ensures maximum bioavailability of macro and micronutrients).
- Electrical Conductivity (EC): Safe for crops if <1.0 dS/m; EC >2.0 dS/m indicates harmful soil salinity.

1.2 Soil Reaction Corrections:
- Acidic Soils (pH < 5.5): Common in high-rainfall tropical regions. Aluminum and Manganese toxicity develop, while Phosphorus gets fixed as insoluble aluminum phosphate.
  Correction: Apply Agricultural Lime (CaCO3) or Dolomitic Limestone (CaCO3.MgCO3) @ 2-4 tonnes/ha based on buffer pH test. Apply 4-6 weeks before sowing and incorporate thoroughly.
- Alkaline / Sodic Soils (pH > 8.5, ESP > 15%): Characterized by poor drainage, puddling, surface crusting, and poor aeration due to sodium ion dominance.
  Correction: Apply Mineral Gypsum (Calcium Sulphate - CaSO4·2H2O) @ 3-5 tonnes/ha. Gypsum displaces sodium from soil clay colloids with calcium, followed by deep ponding and leaching with good quality irrigation water.

1.3 Organic Carbon Enrichment:
Incorporate well-decomposed Farmyard Manure (FYM) @ 10-12 tonnes/ha or Vermicompost @ 3-5 tonnes/ha. Green manuring with Sunnhemp (Crotalaria juncea) or Dhaincha (Sesbania aculeata) adds 20-25 tonnes of green biomass and 60-80 kg organic nitrogen per hectare.`,
      },
      {
        pageNumber: 2,
        text: `CHAPTER 2: BALANCED PLANT NUTRITION & DEFICIENCY DIAGNOSTICS

2.1 Macronutrient Functions & Symptoms:
- Nitrogen (N):
  Function: Synthesizes amino acids, proteins, and chlorophyll; promotes vegetative growth.
  Deficiency: General chlorosis (uniform yellowing) starting first on older bottom leaves; stunted plant height and spindly stalks.
- Phosphorus (P):
  Function: Nucleic acids, root elongation, early seedling vigor, flowering, and ATP energy transfer.
  Deficiency: Dark green to distinct purple or bronze coloration on leaves, stems, and veins; delayed maturity and severely restricted root architecture.
- Potassium (K):
  Function: Enzyme activation, stomatal regulation, osmotic balance, stalk strength, and disease resistance.
  Deficiency: Marginal chlorosis and scorching (tip burn) along the edges of older leaves; weak stems prone to lodging.

2.2 Micronutrient Diagnostics:
- Zinc (Zn): Interveinal chlorosis on middle leaves, rosetting of leaves, and white bud in corn. Foliar spray 0.5% ZnSO4.
- Boron (B): Death of terminal growing points, brittle stems, hollow heart in cauliflower/potato, cracking of fruit in tomato and pomegranate. Soil application of Borax @ 10 kg/ha or foliar Solubor (20% B) @ 1.5 g/L.
- Iron (Fe): Distinct ivory-white interveinal chlorosis on youngest leaves. Soil application of Fe-EDDHA chelated iron @ 5 kg/ha or spray ferrous sulphate 1%.`,
      },
      {
        pageNumber: 3,
        text: `CHAPTER 3: PRECISION DRIP IRRIGATION & FERTIGATION TECHNOLOGY

3.1 Drip Irrigation Efficiency:
Precision micro-irrigation delivers water and dissolved nutrients directly to the plant root zone via emitters.
- Benefits: 40-60% water savings compared to flood/furrow irrigation; 20-35% higher crop yields; eliminates deep percolation nutrient leaching.
- Emitter Selection: Inline drippers with discharge rates of 1.6 to 4.0 Liters Per Hour (LPH) at 1.0-1.5 bar operating pressure. Spacing: 30-50 cm along lateral lines.

3.2 Fertigation Scheduling with Water-Soluble Fertilizers (WSF):
Nutrients are split into frequent daily or weekly micro-doses matched to crop growth stages:
- Vegetative Stage: High Nitrogen formulation like Urea and 19:19:19.
- Flowering & Fruit Set Stage: High Phosphorus formulation like Monopotassium Phosphate (MKP - 0:52:34).
- Fruit Enlargement & Maturation: High Potassium formulation like Potassium Nitrate (13:0:45) and Potassium Sulphate (SOP - 0:0:50).

3.3 Drip System Maintenance:
- Acid Treatment: Dissolve calcium and magnesium carbonate precipitates by injecting Hydrochloric acid (HCl) or Phosphoric acid until system water pH reaches 4.0; hold in lines for 60 minutes, then flush lateral sub-mains.
- Chlorination: Inject Sodium Hypochlorite (bleach) at 10-20 ppm free chlorine to control bacterial slime and algae growth.`,
      },
    ],
  },
];
