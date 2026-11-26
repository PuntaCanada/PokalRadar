// Explicit aliases observed in the vendored Bundesliga files; no fuzzy matching.
const aliases=new Map(Object.entries({"FC Bayern München":"Bayern München","Bayer 04 Leverkusen":"Bayer Leverkusen","SV Werder Bremen":"Werder Bremen","TSG 1899 Hoffenheim":"1899 Hoffenheim","Borussia Mönchengladbach":"Bor. Mönchengladbach","VfL Bochum 1848":"VfL Bochum","FC St. Pauli 1910":"FC St. Pauli"}));
export const canonicalName=name=>aliases.get(name)||name;
