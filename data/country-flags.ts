// English country name → ISO 3166-1 alpha-2, covering data/onboarding-options
// COUNTRIES. Used to render a flag emoji next to a country in the account area.
const COUNTRY_ISO: Record<string, string> = {
  Afghanistan: 'AF', Albania: 'AL', Algeria: 'DZ', Andorra: 'AD', Angola: 'AO', Argentina: 'AR',
  Armenia: 'AM', Australia: 'AU', Austria: 'AT', Azerbaijan: 'AZ', Bahrain: 'BH', Bangladesh: 'BD',
  Belarus: 'BY', Belgium: 'BE', Benin: 'BJ', Bolivia: 'BO', 'Bosnia and Herzegovina': 'BA',
  Botswana: 'BW', Brazil: 'BR', Bulgaria: 'BG', 'Burkina Faso': 'BF', Cambodia: 'KH', Cameroon: 'CM',
  Canada: 'CA', Chile: 'CL', China: 'CN', Colombia: 'CO', 'Costa Rica': 'CR', Croatia: 'HR',
  Cyprus: 'CY', Czechia: 'CZ', Denmark: 'DK', 'Dominican Republic': 'DO', Ecuador: 'EC', Egypt: 'EG',
  'El Salvador': 'SV', Estonia: 'EE', Ethiopia: 'ET', Finland: 'FI', France: 'FR', Georgia: 'GE',
  Germany: 'DE', Ghana: 'GH', Greece: 'GR', Guatemala: 'GT', Honduras: 'HN', 'Hong Kong': 'HK',
  Hungary: 'HU', Iceland: 'IS', India: 'IN', Indonesia: 'ID', Iran: 'IR', Iraq: 'IQ', Ireland: 'IE',
  Israel: 'IL', Italy: 'IT', 'Ivory Coast': 'CI', Japan: 'JP', Jordan: 'JO', Kazakhstan: 'KZ',
  Kenya: 'KE', Kuwait: 'KW', Latvia: 'LV', Lebanon: 'LB', Libya: 'LY', Lithuania: 'LT',
  Luxembourg: 'LU', Malaysia: 'MY', Malta: 'MT', Mexico: 'MX', Moldova: 'MD', Monaco: 'MC',
  Mongolia: 'MN', Montenegro: 'ME', Morocco: 'MA', Netherlands: 'NL', 'New Zealand': 'NZ',
  Nigeria: 'NG', 'North Macedonia': 'MK', Norway: 'NO', Oman: 'OM', Pakistan: 'PK', Panama: 'PA',
  Paraguay: 'PY', Peru: 'PE', Philippines: 'PH', Poland: 'PL', Portugal: 'PT', Qatar: 'QA',
  Romania: 'RO', 'Saudi Arabia': 'SA', Senegal: 'SN', Serbia: 'RS', Singapore: 'SG', Slovakia: 'SK',
  Slovenia: 'SI', 'South Africa': 'ZA', 'South Korea': 'KR', Spain: 'ES', 'Sri Lanka': 'LK',
  Sweden: 'SE', Switzerland: 'CH', Taiwan: 'TW', Tanzania: 'TZ', Thailand: 'TH', Tunisia: 'TN',
  Turkey: 'TR', Ukraine: 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB',
  'United States': 'US', Uruguay: 'UY', Uzbekistan: 'UZ', Venezuela: 'VE', Vietnam: 'VN',
};

/** Flag emoji for a country name, or '' if unknown ('Other', empty, etc.). */
export function countryFlag(name: string | null | undefined): string {
  if (!name) return '';
  const code = COUNTRY_ISO[name.trim()];
  if (!code) return '';
  return code.replace(/./g, (ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65));
}
