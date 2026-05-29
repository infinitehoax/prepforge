import Database from "@tauri-apps/plugin-sql";
import type {
  Question,
  ExamType,
  SubjectId,
  ExamSession,
  ExamResult,
} from "@/types";

let initPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await Database.load("sqlite:prepforge.db");
      await seedInitialData(db);
      return db;
    })();
  }
  return initPromise;
}

async function seedInitialData(database: Database): Promise<void> {
  // Check if already seeded
  const existing = await database.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM questions"
  );
  if (existing[0].count > 0) return;

  // Seed sample questions across subjects
  const sampleQuestions = [
    // --- PHYSICS ---
    {
      exam: "JAMB", subject: "physics", year: 2023, num: 1,
      q: "A body of mass 5 kg moving with a velocity of 10 m/s collides with a stationary body of mass 3 kg. If they move together after impact, what is their common velocity?",
      a: "6.25 m/s", b: "5.75 m/s", c: "4.50 m/s", d: "8.00 m/s", ans: "A",
      exp: "Using conservation of momentum: m₁v₁ = (m₁+m₂)v₂. So 5×10 = (5+3)v₂, giving v₂ = 50/8 = 6.25 m/s",
      topic: "Momentum"
    },
    {
      exam: "JAMB", subject: "physics", year: 2023, num: 2,
      q: "Which of the following correctly describes the relationship between the period T and frequency f of a wave?",
      a: "T = 1/f", b: "T = f", c: "T = f²", d: "T = 2πf", ans: "A",
      exp: "The period T is the time for one complete oscillation. Frequency f is the number of oscillations per second. Therefore T = 1/f.",
      topic: "Waves"
    },
    {
      exam: "JAMB", subject: "physics", year: 2023, num: 3,
      q: "A transformer has 500 turns in the primary coil and 2000 turns in the secondary coil. If the primary voltage is 220V, what is the secondary voltage?",
      a: "55 V", b: "440 V", c: "880 V", d: "1100 V", ans: "C",
      exp: "Vs/Vp = Ns/Np. So Vs = Vp × (Ns/Np) = 220 × (2000/500) = 220 × 4 = 880 V",
      topic: "Electromagnetic Induction"
    },
    {
      exam: "JAMB", subject: "physics", year: 2022, num: 1,
      q: "The gravitational potential energy of a body of mass 2 kg at a height of 10 m above the ground is: (g = 10 m/s²)",
      a: "2 J", b: "20 J", c: "200 J", d: "2000 J", ans: "C",
      exp: "GPE = mgh = 2 × 10 × 10 = 200 J",
      topic: "Energy"
    },
    {
      exam: "JAMB", subject: "physics", year: 2022, num: 2,
      q: "In a nuclear fission reaction, the mass defect is converted into energy according to:",
      a: "E = mc", b: "E = mc²", c: "E = m/c²", d: "E = m²c", ans: "B",
      exp: "Einstein's mass-energy equivalence principle states that E = mc², where c is the speed of light (3×10⁸ m/s).",
      topic: "Nuclear Physics"
    },
    {
      exam: "JAMB", subject: "physics", year: 2021, num: 1,
      q: "The boiling point of water on the Kelvin scale is:",
      a: "100 K", b: "212 K", c: "273 K", d: "373 K", ans: "D",
      exp: "K = °C + 273. So 100°C + 273 = 373 K.",
      topic: "Heat"
    },
    {
      exam: "WAEC", subject: "physics", year: 2023, num: 1,
      q: "A car travels at 20 m/s and brakes to a stop in 4 seconds. What is the deceleration?",
      a: "2.5 m/s²", b: "5 m/s²", c: "10 m/s²", d: "80 m/s²", ans: "B",
      exp: "Deceleration = change in velocity / time = (20 - 0) / 4 = 5 m/s²",
      topic: "Motion"
    },
    {
      exam: "WAEC", subject: "physics", year: 2023, num: 2,
      q: "The unit of electrical resistance is:",
      a: "Ampere", b: "Volt", c: "Ohm", d: "Watt", ans: "C",
      exp: "Electrical resistance is measured in Ohms (Ω), named after Georg Ohm. V=IR, so Ohm = Volt/Ampere.",
      topic: "Electricity"
    },
    {
      exam: "WAEC", subject: "physics", year: 2022, num: 1,
      q: "Which of the following is a scalar quantity?",
      a: "Force", b: "Velocity", c: "Mass", d: "Acceleration", ans: "C",
      exp: "Scalar quantities only have magnitude (e.g., mass, time, temperature). Vector quantities have both magnitude and direction (e.g., force, velocity, acceleration).",
      topic: "Scalars and Vectors"
    },

    // --- CHEMISTRY ---
    {
      exam: "JAMB", subject: "chemistry", year: 2023, num: 1,
      q: "What is the IUPAC name of the compound CH₃-CH₂-CH₂-OH?",
      a: "propan-1-ol", b: "propan-2-ol", c: "propanol", d: "1-propanol", ans: "A",
      exp: "The compound is a 3-carbon chain (prop-) with a hydroxyl group (-OH) at carbon 1, hence propan-1-ol.",
      topic: "Nomenclature"
    },
    {
      exam: "JAMB", subject: "chemistry", year: 2023, num: 2,
      q: "The pH of a 0.01 mol/dm³ HCl solution is:",
      a: "1", b: "2", c: "3", d: "4", ans: "B",
      exp: "HCl is a strong acid that fully dissociates. [H⁺] = 0.01 = 10⁻² mol/dm³. pH = -log[H⁺] = -log(10⁻²) = 2.",
      topic: "Acids and Bases"
    },
    {
      exam: "JAMB", subject: "chemistry", year: 2023, num: 3,
      q: "How many moles of NaOH are required to neutralize 2 moles of H₂SO₄?",
      a: "1 mole", b: "2 moles", c: "3 moles", d: "4 moles", ans: "D",
      exp: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. The mole ratio is 1:2, so 2 moles of H₂SO₄ requires 4 moles of NaOH.",
      topic: "Stoichiometry"
    },
    {
      exam: "JAMB", subject: "chemistry", year: 2022, num: 1,
      q: "Which of the following is NOT a property of ionic compounds?",
      a: "High melting point", b: "Conduct electricity when molten", c: "Soluble in non-polar solvents", d: "Form crystalline solids", ans: "C",
      exp: "Ionic compounds are polar and dissolve in polar solvents like water. They do NOT dissolve readily in non-polar solvents like benzene.",
      topic: "Chemical Bonding"
    },
    {
      exam: "JAMB", subject: "chemistry", year: 2021, num: 1,
      q: "The process of a solid changing directly into a gas is called:",
      a: "Evaporation", b: "Condensation", c: "Sublimation", d: "Deposition", ans: "C",
      exp: "Sublimation is the transition of a substance directly from the solid to the gas phase, without passing through the intermediate liquid phase.",
      topic: "States of Matter"
    },
    {
      exam: "WAEC", subject: "chemistry", year: 2023, num: 1,
      q: "Which of the following gases is produced when zinc reacts with dilute hydrochloric acid?",
      a: "Oxygen", b: "Hydrogen", c: "Chlorine", d: "Nitrogen", ans: "B",
      exp: "Zn + 2HCl → ZnCl₂ + H₂↑. Zinc displaces hydrogen from the acid, producing hydrogen gas which burns with a squeaky pop.",
      topic: "Reactivity Series"
    },
    {
      exam: "WAEC", subject: "chemistry", year: 2022, num: 1,
      q: "The atomic number of an element is the number of ______ in its nucleus.",
      a: "Neutrons", b: "Protons", c: "Electrons", d: "Positrons", ans: "B",
      exp: "Atomic number (Z) is the number of protons. Mass number (A) is protons + neutrons.",
      topic: "Atomic Structure"
    },

    // --- MATHEMATICS ---
    {
      exam: "JAMB", subject: "mathematics", year: 2023, num: 1,
      q: "If log₁₀ 2 = 0.3010, find the value of log₁₀ 8.",
      a: "0.6020", b: "0.9030", c: "1.2040", d: "2.4082", ans: "B",
      exp: "log₁₀ 8 = log₁₀ 2³ = 3 × log₁₀ 2 = 3 × 0.3010 = 0.9030",
      topic: "Logarithms"
    },
    {
      exam: "JAMB", subject: "mathematics", year: 2023, num: 2,
      q: "Solve the quadratic equation: x² - 5x + 6 = 0",
      a: "x = 1, x = 6", b: "x = 2, x = 3", c: "x = -2, x = -3", d: "x = -1, x = -6", ans: "B",
      exp: "Factor: (x-2)(x-3) = 0. Therefore x = 2 or x = 3. Verify: 4-10+6=0 and 9-15+6=0",
      topic: "Quadratic Equations"
    },
    {
      exam: "JAMB", subject: "mathematics", year: 2023, num: 3,
      q: "The sum of the first 10 terms of an arithmetic progression is 155. If the first term is 5, find the common difference.",
      a: "2", b: "3", c: "4", d: "5", ans: "B",
      exp: "Sn = n/2[2a + (n-1)d]. If a=5, d=2, n=10 -> S=5(10+18)=140. If a=5, d=3, n=10 -> S=5(10+27)=185.",
      topic: "Arithmetic Progression"
    },
    {
      exam: "JAMB", subject: "mathematics", year: 2022, num: 1,
      q: "If the mean of 5 numbers is 8, and four of the numbers are 6, 8, 10, and 12, what is the fifth number?",
      a: "2", b: "4", c: "6", d: "8", ans: "B",
      exp: "Total sum = mean × count = 8 × 5 = 40. Sum of known numbers = 6+8+10+12 = 36. Fifth number = 40 - 36 = 4.",
      topic: "Statistics"
    },
    {
      exam: "JAMB", subject: "mathematics", year: 2022, num: 2,
      q: "Simplify: (3x² - 12) / (x - 2)",
      a: "3(x + 2)", b: "3(x - 2)", c: "3x + 6", d: "x + 2", ans: "A",
      exp: "3x² - 12 = 3(x² - 4) = 3(x+2)(x-2). Divide by (x-2): result = 3(x+2).",
      topic: "Algebraic Fractions"
    },
    {
      exam: "JAMB", subject: "mathematics", year: 2021, num: 1,
      q: "If 2x + 3 = 11, what is the value of x²?",
      a: "4", b: "16", c: "25", d: "64", ans: "B",
      exp: "2x = 8, so x = 4. x² = 16.",
      topic: "Algebra"
    },
    {
      exam: "WAEC", subject: "mathematics", year: 2023, num: 1,
      q: "Find the value of x if 3^(x+1) = 27",
      a: "1", b: "2", c: "3", d: "4", ans: "B",
      exp: "27 = 3³. So 3^(x+1) = 3³, therefore x+1 = 3, giving x = 2.",
      topic: "Indices"
    },
    {
      exam: "WAEC", subject: "mathematics", year: 2023, num: 2,
      q: "A bag contains 4 red balls, 3 blue balls, and 5 green balls. What is the probability of picking a blue ball?",
      a: "1/4", b: "1/3", c: "1/5", d: "3/12", ans: "A",
      exp: "Total balls = 4+3+5 = 12. Blue balls = 3. P(blue) = 3/12 = 1/4.",
      topic: "Probability"
    },
    {
      exam: "WAEC", subject: "mathematics", year: 2022, num: 1,
      q: "If the area of a circle is 154 cm², find its radius. (π = 22/7)",
      a: "7 cm", b: "14 cm", c: "21 cm", d: "28 cm", ans: "A",
      exp: "A = πr². 154 = (22/7)r². r² = 154 × 7/22 = 49. r = 7 cm.",
      topic: "Mensuration"
    },
    {
      exam: "WAEC", subject: "further_mathematics", year: 2023, num: 1,
      q: "Differentiate y = x³ + 2x² - 5x + 7 with respect to x.",
      a: "3x² + 4x - 5", b: "x² + 2x - 5", c: "3x² + 4x", d: "3x² - 5", ans: "A",
      exp: "dy/dx = 3x^(3-1) + 2*2x^(2-1) - 5 = 3x² + 4x - 5.",
      topic: "Calculus"
    },
    {
      exam: "WAEC", subject: "further_mathematics", year: 2022, num: 1,
      q: "If f(x) = 2x² - 3x + 1, find f(2).",
      a: "1", b: "3", c: "5", d: "7", ans: "B",
      exp: "f(2) = 2(2)² - 3(2) + 1 = 8 - 6 + 1 = 3.",
      topic: "Functions"
    },

    // --- ENGLISH ---
    {
      exam: "JAMB", subject: "english", year: 2023, num: 1,
      q: "Choose the word that is most nearly OPPOSITE in meaning to the word in capitals: BELLIGERENT",
      a: "aggressive", b: "peaceful", c: "warlike", d: "hostile", ans: "B",
      exp: "BELLIGERENT means hostile or aggressive. Its antonym (opposite) is PEACEFUL.",
      topic: "Antonyms"
    },
    {
      exam: "JAMB", subject: "english", year: 2023, num: 2,
      q: "Select the option that best explains the information conveyed in the sentence: 'The politician was accused of burning the candle at both ends.'",
      a: "He was wasteful with resources", b: "He worked excessively hard", c: "He was dishonest in his dealings", d: "He was guilty of arson", ans: "B",
      exp: "'Burning the candle at both ends' is an idiom meaning to exhaust oneself by working very hard, especially late at night and early in the morning.",
      topic: "Idioms"
    },
    {
      exam: "JAMB", subject: "english", year: 2023, num: 3,
      q: "Choose the option that has the same consonant sound as the one represented by the letters in the capitalized word: THING",
      a: "the", b: "that", c: "three", d: "there", ans: "C",
      exp: "The 'th' in THING is unvoiced /θ/. 'Three' also has unvoiced /θ/. 'The', 'that', and 'there' use voiced /ð/.",
      topic: "Phonology"
    },
    {
      exam: "JAMB", subject: "english", year: 2022, num: 1,
      q: "Fill in the gap: She has been in Lagos _____ two years.",
      a: "since", b: "for", c: "from", d: "during", ans: "B",
      exp: "Use 'for' with a duration of time (two years, three days). Use 'since' with a point in time (since 2020, since Monday).",
      topic: "Grammar"
    },
    {
      exam: "WAEC", subject: "english", year: 2023, num: 1,
      q: "Choose the option nearest in meaning to the underlined word: The professor gave an ERUDITE lecture on modern economics.",
      a: "boring", b: "lengthy", c: "scholarly", d: "expensive", ans: "C",
      exp: "ERUDITE means having or showing great knowledge or learning. The closest synonym from the options is 'scholarly'.",
      topic: "Vocabulary"
    },

    // --- BIOLOGY ---
    {
      exam: "JAMB", subject: "biology", year: 2023, num: 1,
      q: "Which of the following is the correct sequence of the cardiac cycle?",
      a: "Systole → Diastole → Atrial contraction", b: "Atrial contraction → Ventricular contraction → Diastole", c: "Diastole → Systole → Atrial relaxation", d: "Ventricular contraction → Atrial contraction → Diastole", ans: "B",
      exp: "The cardiac cycle: 1) Atrial contraction (atrial systole) fills ventricles, 2) Ventricular contraction (ventricular systole) pumps blood out, 3) Diastole — heart relaxes and refills.",
      topic: "Circulatory System"
    },
    {
      exam: "JAMB", subject: "biology", year: 2023, num: 2,
      q: "Photosynthesis takes place in the:",
      a: "Mitochondria", b: "Ribosome", c: "Chloroplast", d: "Nucleus", ans: "C",
      exp: "Photosynthesis occurs in the chloroplast. The light reactions take place in the thylakoid membranes and the Calvin cycle in the stroma.",
      topic: "Photosynthesis"
    },
    {
      exam: "JAMB", subject: "biology", year: 2023, num: 3,
      q: "Which of these is NOT a characteristic of living organisms?",
      a: "Growth", b: "Reproduction", c: "Crystallization", d: "Excretion", ans: "C",
      exp: "Crystallization is a physical/chemical process, not a life process. The characteristics of living organisms (MRS GREN) are: Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition.",
      topic: "Characteristics of Living Things"
    },
    {
      exam: "JAMB", subject: "biology", year: 2022, num: 1,
      q: "The primary site for absorption of digested food in humans is the:",
      a: "Stomach", b: "Large intestine", c: "Small intestine", d: "Oesophagus", ans: "C",
      exp: "The small intestine is the primary site for absorption. Its inner lining has villi and microvilli that greatly increase the surface area for absorption of nutrients into the bloodstream.",
      topic: "Digestion"
    },
    {
      exam: "JAMB", subject: "agricultural_science", year: 2023, num: 1,
      q: "Which of the following is a leguminous crop?",
      a: "Maize", b: "Cassava", c: "Groundnut", d: "Rice", ans: "C",
      exp: "Groundnut (peanut) is a legume. Legumes are plants that can fix atmospheric nitrogen in their root nodules.",
      topic: "Crop Science"
    },
    {
      exam: "JAMB", subject: "agricultural_science", year: 2022, num: 1,
      q: "The process of removing excess water from the soil is:",
      a: "Irrigation", b: "Drainage", c: "Erosion", d: "Mulching", ans: "B",
      exp: "Drainage is the natural or artificial removal of surface and sub-surface water from an area.",
      topic: "Soil Science"
    },
    {
      exam: "WAEC", subject: "biology", year: 2023, num: 1,
      q: "Which blood group is known as the 'universal donor'?",
      a: "A", b: "B", c: "AB", d: "O", ans: "D",
      exp: "Blood group O (specifically O negative) is the universal donor because it lacks A and B antigens on red blood cells, so it won't trigger immune reactions in other blood groups.",
      topic: "Blood and Circulation"
    },
    {
      exam: "WAEC", subject: "biology", year: 2021, num: 1,
      q: "Which of the following is responsible for carrying oxygen in the blood?",
      a: "White blood cells", b: "Platelets", c: "Hemoglobin", d: "Plasma", ans: "C",
      exp: "Hemoglobin in red blood cells binds to oxygen and transports it throughout the body.",
      topic: "Transport System"
    },

    // --- ECONOMICS & GOVERNMENT ---
    {
      exam: "JAMB", subject: "economics", year: 2023, num: 1,
      q: "Inflation caused by an increase in the cost of production is known as:",
      a: "Demand-pull inflation", b: "Cost-push inflation", c: "Hyperinflation", d: "Stagflation", ans: "B",
      exp: "Cost-push inflation occurs when production costs (like wages or raw materials) rise, leading to higher prices for finished goods.",
      topic: "Inflation"
    },
    {
      exam: "JAMB", subject: "economics", year: 2022, num: 1,
      q: "The law of demand states that as price increases, quantity demanded:",
      a: "Increases", b: "Decreases", c: "Remains constant", d: "Becomes zero", ans: "B",
      exp: "The law of demand describes an inverse relationship between price and quantity demanded, ceteris paribus.",
      topic: "Demand and Supply"
    },
    {
      exam: "JAMB", subject: "government", year: 2023, num: 1,
      q: "Which of the following is NOT a feature of a federal system of government?",
      a: "Division of powers between central and regional governments", b: "A written constitution", c: "Concentration of all powers in the central government", d: "Independent judiciary", ans: "C",
      exp: "In federalism, powers are DIVIDED between central and component units. Concentration of all powers in the centre describes a unitary system, not federal.",
      topic: "Federalism"
    },
    {
      exam: "JAMB", subject: "government", year: 2023, num: 2,
      q: "Nigeria gained independence from Britain on:",
      a: "October 1, 1960", b: "January 15, 1966", c: "July 29, 1966", d: "October 1, 1963", ans: "A",
      exp: "Nigeria gained independence on October 1, 1960. October 1, 1963 was when Nigeria became a republic (still within the Commonwealth).",
      topic: "Nigerian History"
    },
    {
      exam: "WAEC", subject: "economics", year: 2023, num: 1,
      q: "The term 'opportunity cost' refers to:",
      a: "The monetary cost of a good", b: "The value of the next best alternative forgone", c: "The total cost of production", d: "The price paid for a resource", ans: "B",
      exp: "Opportunity cost is the value of the next best alternative you give up when making a choice. It represents the true economic cost of any decision.",
      topic: "Basic Economic Concepts"
    },
    {
      exam: "WAEC", subject: "economics", year: 2023, num: 2,
      q: "When demand is perfectly elastic, the demand curve is:",
      a: "Vertical", b: "Horizontal", c: "Upward sloping", d: "Downward sloping", ans: "B",
      exp: "A perfectly elastic demand curve is horizontal (flat), meaning any price increase causes demand to fall to zero. The price elasticity of demand = ∞.",
      topic: "Elasticity"
    },
    {
      exam: "WAEC", subject: "government", year: 2023, num: 1,
      q: "The ultimate power to make laws in a state resides in the:",
      a: "Judiciary", b: "Executive", c: "Legislature", d: "Bureaucracy", ans: "C",
      exp: "The legislature is the law-making arm of government.",
      topic: "Arms of Government"
    },

    // --- LITERATURE ---
    {
      exam: "JAMB", subject: "literature", year: 2023, num: 1,
      q: "In drama, a soliloquy is used to:",
      a: "Address the audience directly", b: "Reveal a character's inner thoughts while alone", c: "Engage in a dialogue with another character", d: "Summarize the plot of the play", ans: "B",
      exp: "A soliloquy is a dramatic device where a character speaks their thoughts aloud when alone, giving the audience insight into their state of mind.",
      topic: "Literary Terms"
    },
    {
      exam: "JAMB", subject: "literature", year: 2023, num: 2,
      q: "A figure of speech where a part represents the whole is:",
      a: "Metaphor", b: "Synecdoche", c: "Personification", d: "Irony", ans: "B",
      exp: "Synecdoche is a figure of speech in which a part is made to represent the whole or vice versa, as in 'hired hands' for workers.",
      topic: "Figures of Speech"
    },
    {
      exam: "JAMB", subject: "literature", year: 2022, num: 1,
      q: "The perspective from which a story is told is the:",
      a: "Plot", b: "Setting", c: "Point of view", d: "Theme", ans: "C",
      exp: "Point of view refers to who is telling the story (e.g., first-person, third-person limited).",
      topic: "Literary Terms"
    },
    {
      exam: "WAEC", subject: "literature", year: 2023, num: 1,
      q: "A poem of fourteen lines is an:",
      a: "Ode", b: "Epic", c: "Sonnet", d: "Elegy", ans: "C",
      exp: "A sonnet is a poem of fourteen lines using any of a number of formal rhyme schemes, typically having ten syllables per line.",
      topic: "Poetry"
    },

    // --- GEOGRAPHY ---
    {
      exam: "JAMB", subject: "geography", year: 2023, num: 1,
      q: "The lines on a map connecting places of equal temperature are:",
      a: "Isohyets", b: "Isobars", c: "Isotherms", d: "Isohels", ans: "C",
      exp: "Isotherms are lines on a map connecting points having the same temperature at a given time or on average over a given period.",
      topic: "Map Work"
    },
    {
      exam: "JAMB", subject: "geography", year: 2023, num: 2,
      q: "The planet closest to the sun is:",
      a: "Venus", b: "Mars", c: "Mercury", d: "Earth", ans: "C",
      exp: "Mercury is the smallest and innermost planet in the Solar System, orbiting the Sun at an average distance of about 58 million kilometers.",
      topic: "The Solar System"
    },
    {
      exam: "WAEC", subject: "geography", year: 2023, num: 1,
      q: "The instrument used for measuring wind speed is:",
      a: "Barometer", b: "Anemometer", c: "Hygrometer", d: "Wind Vane", ans: "B",
      exp: "An anemometer is a device used for measuring wind speed and direction.",
      topic: "Weather and Climate"
    },
    {
      exam: "WAEC", subject: "geography", year: 2022, num: 1,
      q: "The latitude that divides the earth into two equal halves is the:",
      a: "Prime Meridian", b: "Equator", c: "Tropic of Cancer", d: "Arctic Circle", ans: "B",
      exp: "The Equator (0° latitude) divides the Earth into the Northern and Southern Hemispheres.",
      topic: "The Earth"
    },

    // --- COMMERCE & ACCOUNTING ---
    {
      exam: "JAMB", subject: "accounting", year: 2023, num: 1,
      q: "The document used to record small, everyday expenses in an office is the:",
      a: "General Ledger", b: "Sales Journal", c: "Petty Cash Book", d: "Bank Statement", ans: "C",
      exp: "A petty cash book is a ledger for recording small payments (e.g., postage, office snacks) before they are transferred to the main ledger.",
      topic: "Books of Account"
    },
    {
      exam: "JAMB", subject: "accounting", year: 2022, num: 1,
      q: "Which of the following is a fixed asset?",
      a: "Cash at bank", b: "Inventory", c: "Machinery", d: "Accounts Receivable", ans: "C",
      exp: "Fixed assets (non-current assets) are long-term tangible pieces of property or equipment.",
      topic: "Financial Statements"
    },
    {
      exam: "WAEC", subject: "commerce", year: 2023, num: 1,
      q: "Which of the following is an invisible export?",
      a: "Sale of crude oil", b: "Sale of cocoa beans", c: "Tourism services", d: "Export of manufactured goods", ans: "C",
      exp: "Invisible exports are services (like tourism, banking, and insurance) sold to foreign residents.",
      topic: "International Trade"
    },
    {
      exam: "WAEC", subject: "commerce", year: 2022, num: 1,
      q: "A person who buys in bulk from producers and sells in small quantities to retailers is a:",
      a: "Consumer", b: "Wholesaler", c: "Broker", d: "Agent", ans: "B",
      exp: "Wholesalers act as intermediaries in the distribution chain.",
      topic: "Channels of Distribution"
    },
    {
      exam: "WAEC", subject: "accounting", year: 2023, num: 1,
      q: "According to the double-entry principle, every credit entry must have a corresponding:",
      a: "Asset", b: "Liability", c: "Debit entry", d: "Revenue", ans: "C",
      exp: "The fundamental principle of double-entry bookkeeping is that for every debit entry, there must be an equal and opposite credit entry.",
      topic: "Double Entry System"
    },

    // --- CIVIC EDUCATION ---
    {
      exam: "JAMB", subject: "civic_education", year: 2023, num: 1,
      q: "Which of the following is a core value in civic education?",
      a: "Selfishness", b: "Corruption", c: "Integrity", d: "Indiscipline", ans: "C",
      exp: "Integrity, honesty, and transparency are fundamental civic values that promote a healthy society.",
      topic: "Values"
    },
    {
      exam: "JAMB", subject: "civic_education", year: 2022, num: 1,
      q: "The highest law of the land in Nigeria is the:",
      a: "State Law", b: "Police Act", c: "Constitution", d: "Customary Law", ans: "C",
      exp: "The Constitution of the Federal Republic of Nigeria is supreme and its provisions have binding force on all authorities and persons throughout the country.",
      topic: "Constitution"
    }
  ];

  for (const q of sampleQuestions) {
    await database.execute(
      "INSERT INTO questions (exam_type, subject_id, year, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [q.exam, q.subject, q.year, q.num, q.q, q.a, q.b, q.c, q.d, q.ans, q.exp, q.topic || null]
    );
  }
}

export async function getQuestions(
  examType: ExamType,
  subjectIds: SubjectId[],
  year?: number,
  limit?: number
): Promise<Question[]> {
  const database = await getDb();
  const placeholders = subjectIds.map(() => "?").join(", ");
  let query = `SELECT * FROM questions WHERE exam_type = ? AND subject_id IN (${placeholders})`;
  const params: (string | number)[] = [examType, ...subjectIds];

  if (year) {
    query += " AND year = ?";
    params.push(year);
  }

  query += " ORDER BY subject_id, RANDOM()";

  if (limit) {
    query += " LIMIT ?";
    params.push(limit);
  }

  const rows = await database.select<Record<string, unknown>[]>(query, params);
  return rows.map(mapRowToQuestion);
}

export async function getAvailableYears(
  examType: ExamType,
  subjectId?: SubjectId
): Promise<number[]> {
  const database = await getDb();
  let query =
    "SELECT DISTINCT year FROM questions WHERE exam_type = ? ORDER BY year DESC";
  const params: (string | number)[] = [examType];

  if (subjectId) {
    query =
      "SELECT DISTINCT year FROM questions WHERE exam_type = ? AND subject_id = ? ORDER BY year DESC";
    params.push(subjectId);
  }

  const rows = await database.select<{ year: number }[]>(query, params);
  return rows.map((r) => r.year);
}

export async function saveExamResult(session: ExamSession): Promise<number> {
  const database = await getDb();
  const percentage =
    session.totalQuestions > 0
      ? (session.score / session.totalQuestions) * 100
      : 0;

  const result = await database.execute(
    "INSERT INTO exam_results (exam_type, subjects, mode, year, score, total_questions, percentage, time_taken_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      session.examType,
      session.subjects.join(","),
      session.mode,
      session.year,
      session.score,
      session.totalQuestions,
      percentage,
      session.timeTakenSeconds,
    ]
  );

  const resultId = result.lastInsertId ?? 0;

  for (const answer of session.answers) {
    await database.execute(
      "INSERT INTO exam_answers (result_id, question_id, selected_option, is_correct, time_spent_seconds) VALUES (?, ?, ?, ?, ?)",
      [
        resultId,
        answer.questionId,
        answer.selectedOption,
        answer.isCorrect ? 1 : 0,
        answer.timeSpentSeconds,
      ]
    );
  }

  return resultId;
}

export async function getRecentResults(limit = 10): Promise<ExamResult[]> {
  const database = await getDb();
  const rows = await database.select<ExamResult[]>(
    "SELECT id, exam_type as examType, subjects, mode, year, score, total_questions as totalQuestions, percentage, time_taken_seconds as timeTakenSeconds, completed_at as completedAt FROM exam_results ORDER BY completed_at DESC LIMIT ?",
    [limit]
  );
  return rows;
}

export async function getResultById(id: number): Promise<{
  result: ExamResult;
  questions: Question[];
  answers: Record<number, string | null>;
} | null> {
  const database = await getDb();

  const results = await database.select<ExamResult[]>(
    "SELECT id, exam_type as examType, subjects, mode, year, score, total_questions as totalQuestions, percentage, time_taken_seconds as timeTakenSeconds, completed_at as completedAt FROM exam_results WHERE id = ?",
    [id]
  );

  if (results.length === 0) return null;

  const answerRows = await database.select<
    { question_id: number; selected_option: string | null; is_correct: number }[]
  >(
    "SELECT question_id, selected_option, is_correct FROM exam_answers WHERE result_id = ?",
    [id]
  );

  const questionIds = answerRows.map((r) => r.question_id);
  if (questionIds.length === 0) return { result: results[0], questions: [], answers: {} };

  const placeholders = questionIds.map(() => "?").join(",");
  const questionRows = await database.select<Record<string, unknown>[]>(
    `SELECT * FROM questions WHERE id IN (${placeholders})`,
    questionIds
  );

  const answersMap: Record<number, string | null> = {};
  for (const row of answerRows) {
    answersMap[row.question_id] = row.selected_option;
  }

  return {
    result: results[0],
    questions: questionRows.map(mapRowToQuestion),
    answers: answersMap,
  };
}

export async function getStatsOverview(): Promise<{
  totalExams: number;
  averageScore: number;
  bestScore: number;
  totalTimeHours: number;
}> {
  const database = await getDb();
  const rows = await database.select<
    {
      total: number;
      avg_pct: number;
      best: number;
      total_time: number;
    }[]
  >(
    "SELECT COUNT(*) as total, AVG(percentage) as avg_pct, MAX(percentage) as best, SUM(time_taken_seconds) as total_time FROM exam_results"
  );

  const r = rows[0];
  return {
    totalExams: r.total || 0,
    averageScore: Math.round(r.avg_pct || 0),
    bestScore: Math.round(r.best || 0),
    totalTimeHours: Math.round((r.total_time || 0) / 3600),
  };
}

function mapRowToQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as number,
    examType: row.exam_type as ExamType,
    subjectId: row.subject_id as SubjectId,
    year: row.year as number,
    questionNumber: row.question_number as number,
    questionText: row.question_text as string,
    optionA: row.option_a as string,
    optionB: row.option_b as string,
    optionC: row.option_c as string,
    optionD: row.option_d as string,
    correctAnswer: row.correct_answer as "A" | "B" | "C" | "D",
    explanation: row.explanation as string,
    topic: row.topic as string | undefined,
  };
}
