export interface Agent {
  id: string;
  slug: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  bio: string;
  shortBio: string;
  photo: string | null;
  specialties: string[];
  licenseNumber?: string;
  designations?: string[];
  languages?: string[];
  serviceAreas: string[];
  /**
   * One or more name strings exactly as they appear in GAMLS (ShowingContactName field).
   * Supports multiple variants — e.g. ["Heather Kirk", "Heather"] — because GAMLS
   * sometimes stores only a first name or uses a different last name on older listings.
   */
  mlsNames?: string[];
  /**
   * GAMLS agent code from the ListAgent field (e.g. "BELLRENAE").
   * More reliable than mlsNames — use this when ShowingContactName is blank.
   * When set, listings are matched by code first; mlsNames used as fallback.
   */
  mlsAgentCode?: string;
}

export const agents: Agent[] = [
  {
    id: "1",
    slug: "renae-bell",
    name: "Renae Bell",
    title: "REALTOR®",
    phone: "770-555-0001",
    email: "agent1@journeyrealtygroup.net",
    shortBio:
      "Dedicated real estate professional serving the West Georgia area with integrity and expertise.",
    bio: "Placeholder bio — update with agent's full biography. This agent is a dedicated real estate professional serving the West Georgia area with a commitment to integrity, local expertise, and exceptional client service. With years of experience guiding buyers and sellers through every step of the real estate journey, they bring both market knowledge and genuine care to every transaction.",
    photo: null,
    specialties: ["Residential Sales", "First-Time Buyers", "Relocation"],
    serviceAreas: ["Tallapoosa", "Bremen", "Cedartown", "Carrollton"],
    designations: ["REALTOR®"],
    // ShowingContactName is blank on all her listings — matched by ListAgent code instead.
    mlsAgentCode: "BELLRENAE",
  },
  {
    id: "2",
    slug: "christy-kilgore",
    name: "Christy Kilgore",
    title: "REALTOR®",
    phone: "770-555-0002",
    email: "agent2@journeyrealtygroup.net",
    shortBio:
      "Passionate about connecting clients with their perfect home in West Georgia.",
    bio: "Placeholder bio — update with agent's full biography. This agent brings passion and dedication to every client interaction, helping buyers and sellers navigate the real estate market with confidence. Their deep knowledge of the local area and commitment to client satisfaction makes them a trusted partner in any real estate transaction.",
    photo: null,
    specialties: ["Buyer Representation", "Seller Representation", "Land"],
    serviceAreas: ["Tallapoosa", "Haralson County", "Polk County"],
    designations: ["REALTOR®"],
    mlsNames: ["Christy Kilgore"],
  },
  {
    id: "3",
    slug: "ethan-zell",
    name: "Ethan Zell",
    title: "REALTOR®",
    phone: "770-555-0003",
    email: "agent3@journeyrealtygroup.net",
    shortBio:
      "Committed to making the home buying and selling process smooth and stress-free.",
    bio: "Placeholder bio — update with agent's full biography. With a focus on clear communication and personalized service, this agent ensures every client feels informed and supported throughout their real estate journey. Their attention to detail and market insight consistently deliver outstanding results.",
    photo: null,
    specialties: ["Residential", "Investment Properties", "Condos & Townhomes"],
    serviceAreas: ["Tallapoosa", "Dallas", "Villa Rica"],
    designations: ["REALTOR®"],
    mlsNames: ["Ethan Zell"],
  },
  {
    id: "4",
    slug: "heather-kirk",
    name: "Heather Kirk",
    title: "REALTOR®",
    phone: "770-555-0004",
    email: "agent4@journeyrealtygroup.net",
    shortBio:
      "Helping families find their place in the community with dedication and local knowledge.",
    bio: "Placeholder bio — update with agent's full biography. This agent is deeply rooted in the community and leverages that connection to help clients find not just a home, but the right neighborhood and lifestyle fit. Their warm, client-first approach and tireless work ethic make every transaction a positive experience.",
    photo: null,
    specialties: ["Family Homes", "New Construction", "Relocation"],
    serviceAreas: ["Tallapoosa", "Buchanan", "Bowdon"],
    designations: ["REALTOR®"],
    // GAMLS stores her name as "Heather Kirk" on most listings, and just "Heather" on one older listing.
    mlsNames: ["Heather Kirk", "Heather"],
  },
  {
    id: "5",
    slug: "brantley-ivey",
    name: "Brantley Ivey",
    title: "REALTOR®",
    phone: "770-555-0005",
    email: "agent5@journeyrealtygroup.net",
    shortBio:
      "Your trusted guide through every step of the real estate process in West Georgia.",
    bio: "Placeholder bio — update with agent's full biography. This agent combines professional expertise with a personalized touch to deliver an exceptional experience for every client. Whether you are buying your first home, upgrading, or selling, they provide the guidance and support needed to achieve your goals with confidence.",
    photo: null,
    specialties: ["Residential Sales", "Commercial", "Property Management"],
    serviceAreas: ["Tallapoosa", "Carrollton", "Anniston", "Cleburne County"],
    designations: ["REALTOR®"],
    // GAMLS stores his name as just "Ivey" on his current listing.
    mlsNames: ["Brantley Ivey", "Ivey"],
  },
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}
