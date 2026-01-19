import { computed, type Ref, ref } from 'vue';
import { keccak256 } from 'viem';

/**
 * Party organ types matching the Solidity enum
 */
export enum PartyOrganType {
  LocalSoviet = 0,
  LocalGeneralAssembly = 1,
  RegionalSoviet = 2,
  RegionalConference = 3,
  RegionalGeneralAssembly = 4,
  Chairperson = 5,
  CentralSoviet = 6,
  Congress = 7
}

/**
 * Region enum matching Solidity Regions library
 * Based on: https://www.consultant.ru/document/cons_doc_LAW_287480/8f29ebe5f8d588f758502bc41ff2da96a45fc497/
 */
export enum Region {
  FEDERAL = 0, ADYGEA_REPUBLIC = 1, BASHKORTOSTAN_REPUBLIC = 2, BURYATIA_REPUBLIC = 3,
  ALTAY_REPUBLIC = 4, DAGHESTAN_REPUBLIC = 5, INGUSHETIA_REPUBLIC = 6, KABARDINO_BALKAR_REPUBLIC = 7,
  KALMYKIYA_REPUBLIC = 8, KARACHAY_CHERKESS_REPUBLIC = 9, KARELIA_REPUBLIC = 10, KOMI_REPUBLIC = 11,
  MARIY_EL_REPUBLIC = 12, MORDOVIA_REPUBLIC = 13, SAKHA_REPUBLIC_YAKUTIA = 14, NORTH_OSSETIA_ALANIA_REPUBLIC = 15,
  TATARSTAN_REPUBLIC = 16, TYVA_REPUBLIC = 17, UDMURTIA_REPUBLIC = 18, HAKASSIA_REPUBLIC = 19,
  CHECHEN_REPUBLIC = 20, CHUVASHIA_REPUBLIC = 21, ALTAYSKY_KRAI = 23,
  PERMSKY_KRAI = 24, PRIMORSKY_KRAI = 25, STAVROPOL_KRAI = 26, HABAROVSKY_KRAI = 27,
  AMURSKAYA_OBLAST = 28, ARCHANGELSKAYA_OBLAST = 29, ASTRAKHANSKAYA_OBLAST = 30, BELGORODSKAYA_OBLAST = 31,
  BRYANSKAYA_OBLAST = 32, VLADIMIRSKAYA_OBLAST = 33, VOLGOGRADSKAYA_OBLAST = 34, VOLOGODSKAYA_OBLAST = 35,
  VORONEZHSKAYA_OBLAST = 36, IVANOVSKAYA_OBLAST = 37, IRKUTSKAYA_OBLAST = 38, KALININGRADSKAYA_OBLAST = 39,
  KALUZHSKAYA_OBLAST = 40, KEMEROVSKAYA_OBLAST = 41, KIROVSKAYA_OBLAST = 42, KOSTROMSKAYA_OBLAST = 43,
  KURGANSKAYA_OBLAST = 44, KURSKAYA_OBLAST = 45, LENINGRADSKAYA_OBLAST = 46, LIPETSKAYA_OBLAST = 47,
  MAGADANSKAYA_OBLAST = 48, MOSKOVSKAYA_OBLAST_50 = 49, MOSKOVSKAYA_OBLAST_90 = 50, MURMANSKAYA_OBLAST = 51,
  ZABAIKALSKY_KRAI = 52, KAMCHATKSKY_KRAI = 53, KRASNODARSKY_KRAI_23 = 54, KRASNODARSKY_KRAI_93 = 55,
  KRASNOYARSKY_KRAI = 56, ORLOVSKAYA_OBLAST = 57, PENZENSKAYA_OBLAST = 58, PSKOVSKAYA_OBLAST = 59,
  ROSTOVSKAYA_OBLAST = 60, RYAZANSKAYA_OBLAST = 61, SAMARSKAYA_OBLAST = 62, SARATOVSKAYA_OBLAST = 63,
  SAKHALINSKAYA_OBLAST = 64, SVERDLOVSKAYA_OBLAST_66 = 65, SVERDLOVSKAYA_OBLAST_96 = 66, SMOLENSKAYA_OBLAST = 67,
  TAMBOVSKAYA_OBLAST = 68, TVERSKAYA_OBLAST = 69, TOMSKAYA_OBLAST = 70, TULSKAYA_OBLAST = 71,
  TUMENSKAYA_OBLAST = 72, ULYANOVSKAYA_OBLAST = 73, CHELYABINSKAYA_OBLAST = 74, YAROSLAVSKAYA_OBLAST = 75,
  NIZHEGORODSKAYA_OBLAST = 76, NOVGORODSKAYA_OBLAST = 77, NOVOSIBIRSKAYA_OBLAST = 78, OMSKAYA_OBLAST = 79,
  ORENBURGSKAYA_OBLAST = 80, MOSCOW_77 = 81, MOSCOW_97 = 82, MOSCOW_99 = 83,
  SAINT_PETERSBURG_78 = 84, SAINT_PETERSBURG_98 = 85, SEVASTOPOL = 86, EVREYSKAYA_AUTONOMNAYA_OBLAST = 87,
  NENETSKY_AUTONOMNY_OKRUG = 88, HANTY_MANSIYSKY_AUTONOMNY_OKRUG_YUGRA = 89, CHUKOTKSKY_AUTONOMNY_OKRUG = 90,
  YAMALO_NENETSKY_AUTONOMNY_OKRUG = 91, EXTERNAL_LANDS_88 = 92, EXTERNAL_LANDS_94 = 93,
  // The following regions de jure are a part of the Russian Federation and are included for completeness.
  // The team and the project do not recognize the annexation of these territories.
  DONETSK_PEOPLES_REPUBLIC = 94, LUGANSK_PEOPLES_REPUBLIC = 95, HERSONSKAYA_OBLAST = 96, ZAPOROZHSKAYA_OBLAST = 97, KRYM_REPUBLIC = 22
}

const POSTFIX = { CONGRESS: 'СЗД', SOVIET: 'СОВ', CHAIR: 'ПРЛ', ASSEMBLY: 'ОБС', CONF: 'КОН' };

// Region code mapping (matches Solidity Regions.toString())
const REGION_CODES: Record<Region, string> = {
  0:"00",1:"01",2:"02",3:"03",4:"04",5:"05",6:"06",7:"07",8:"08",9:"09",10:"10",11:"11",12:"12",13:"13",14:"14",15:"15",
  16:"16",17:"17",18:"18",19:"19",20:"95",21:"21",22:"82",23:"22",24:"59",25:"25",26:"26",27:"27",28:"28",29:"29",30:"30",
  31:"31",32:"32",33:"33",34:"34",35:"35",36:"36",37:"37",38:"38",39:"39",40:"40",41:"42",42:"43",43:"44",44:"45",45:"46",
  46:"47",47:"48",48:"49",49:"50",50:"90",51:"51",52:"75",53:"41",54:"23",55:"93",56:"24",57:"57",58:"58",59:"60",60:"61",
  61:"62",62:"63",63:"64",64:"65",65:"66",66:"96",67:"67",68:"68",69:"69",70:"70",71:"71",72:"72",73:"73",74:"74",75:"76",
  76:"52",77:"53",78:"54",79:"55",80:"56",81:"77",82:"97",83:"99",84:"78",85:"98",86:"92",87:"79",88:"83",89:"86",90:"87",
  91:"89",92:"88",93:"94",94:"80",95:"81",96:"84",97:"85"
};

function regionToString(region: Region): string {
  return REGION_CODES[region] || "00";
}

export function getPartyOrganIdentifier(organType: PartyOrganType, region: Region, number: number): string {
  const r = regionToString(region);
  switch (organType) {
    case PartyOrganType.LocalSoviet: return `${r}.${number}.${POSTFIX.SOVIET}`;
    case PartyOrganType.LocalGeneralAssembly: return `${r}.${number}.${POSTFIX.ASSEMBLY}`;
    case PartyOrganType.RegionalSoviet: return `${r}.${POSTFIX.SOVIET}`;
    case PartyOrganType.RegionalConference: return `${r}.${POSTFIX.CONF}`;
    case PartyOrganType.RegionalGeneralAssembly: return `${r}.${POSTFIX.ASSEMBLY}`;
    case PartyOrganType.Chairperson: return POSTFIX.CHAIR;
    case PartyOrganType.CentralSoviet: return POSTFIX.SOVIET;
    case PartyOrganType.Congress: return POSTFIX.CONGRESS;
    default: throw new Error(`Invalid party organ type: ${organType}`);
  }
}

export function generateOrganHash(organType: PartyOrganType, region: Region, number: number): `0x${string}` {
  return keccak256(new TextEncoder().encode(getPartyOrganIdentifier(organType, region, number)));
}

export function usePartyOrgan(
  organType: Ref<PartyOrganType> | PartyOrganType = ref(PartyOrganType.Chairperson),
  region: Ref<Region> | Region = ref(Region.FEDERAL),
  number: Ref<number> | number = ref(0)
) {
  const organTypeRef = ref(organType);
  const regionRef = ref(region);
  const numberRef = ref(number);

  const identifier = computed(() => 
    getPartyOrganIdentifier(organTypeRef.value as PartyOrganType, regionRef.value as Region, numberRef.value as number)
  );

  const organHash = computed(() => 
    generateOrganHash(organTypeRef.value as PartyOrganType, regionRef.value as Region, numberRef.value as number)
  );

  return { identifier, organHash, organType: organTypeRef, region: regionRef, number: numberRef };
}

export function createOrganHash(
  organType: PartyOrganType,
  region: Region = Region.FEDERAL,
  number: number = 0
): `0x${string}` {
  return generateOrganHash(organType, region, number);
}

/**
 * Decode organ hash back to human-readable identifier
 * Note: This is an approximation for local organs with numbers, as we can't know the exact number from hash alone
 * @param hash - The organ hash to decode
 * @param t - Optional i18n translate function for error messages
 */
export function decodeOrganHash(hash: `0x${string}`, t?: (key: string) => string): string {
  // Guard against undefined or invalid hash
  if (!hash || typeof hash !== 'string' || !hash.startsWith('0x')) {
    return t ? t('voting.errors.invalidHash') : 'Invalid hash';
  }
  
  // Try all non-local organs first (they don't have numbers)
  const nonLocalTypes = [
    PartyOrganType.Chairperson,
    PartyOrganType.CentralSoviet,
    PartyOrganType.Congress
  ];
  
  for (const type of nonLocalTypes) {
    const testHash = generateOrganHash(type, Region.FEDERAL, 0);
    if (testHash === hash) {
      return getPartyOrganIdentifier(type, Region.FEDERAL, 0);
    }
  }
  
  // Try regional organs
  const regionalTypes = [
    PartyOrganType.RegionalSoviet,
    PartyOrganType.RegionalConference,
    PartyOrganType.RegionalGeneralAssembly
  ];
  
  for (const type of regionalTypes) {
    for (let regionValue = 0; regionValue < 98; regionValue++) {
      const testHash = generateOrganHash(type, regionValue as Region, 0);
      if (testHash === hash) {
        return getPartyOrganIdentifier(type, regionValue as Region, 0);
      }
    }
  }
  
  // For local organs, we'd need to try all combinations of region and number
  // This is computationally expensive, so we return the hash as fallback
  return hash.slice(0, 10) + '...';
}

/**
 * Get localized party organ name
 * @param organType - The party organ type
 * @param t - The i18n translate function
 */
export function getLocalizedOrganName(organType: PartyOrganType, t: (key: string) => string): string {
  const keyMap: Record<PartyOrganType, string> = {
    [PartyOrganType.LocalSoviet]: 'partyOrgans.localSoviet',
    [PartyOrganType.LocalGeneralAssembly]: 'partyOrgans.localGeneralAssembly',
    [PartyOrganType.RegionalSoviet]: 'partyOrgans.regionalSoviet',
    [PartyOrganType.RegionalConference]: 'partyOrgans.regionalConference',
    [PartyOrganType.RegionalGeneralAssembly]: 'partyOrgans.regionalGeneralAssembly',
    [PartyOrganType.Chairperson]: 'partyOrgans.chairperson',
    [PartyOrganType.CentralSoviet]: 'partyOrgans.centralSoviet',
    [PartyOrganType.Congress]: 'partyOrgans.congress'
  };
  return t(keyMap[organType]);
}

/**
 * Get localized region name
 * @param region - The region enum value
 * @param t - The i18n translate function
 */
export function getLocalizedRegionName(region: Region, t: (key: string) => string): string {
  const keyMap: Record<Region, string> = {
    [Region.FEDERAL]: 'regions.federal',
    [Region.ADYGEA_REPUBLIC]: 'regions.adygeaRepublic',
    [Region.BASHKORTOSTAN_REPUBLIC]: 'regions.bashkortostanRepublic',
    [Region.BURYATIA_REPUBLIC]: 'regions.buryatiaRepublic',
    [Region.ALTAY_REPUBLIC]: 'regions.altayRepublic',
    [Region.DAGHESTAN_REPUBLIC]: 'regions.daghestanRepublic',
    [Region.INGUSHETIA_REPUBLIC]: 'regions.ingushetiaRepublic',
    [Region.KABARDINO_BALKAR_REPUBLIC]: 'regions.kabardinoBalkarRepublic',
    [Region.KALMYKIYA_REPUBLIC]: 'regions.kalmykiyaRepublic',
    [Region.KARACHAY_CHERKESS_REPUBLIC]: 'regions.karachayCherkessRepublic',
    [Region.KARELIA_REPUBLIC]: 'regions.kareliaRepublic',
    [Region.KOMI_REPUBLIC]: 'regions.komiRepublic',
    [Region.MARIY_EL_REPUBLIC]: 'regions.mariyElRepublic',
    [Region.MORDOVIA_REPUBLIC]: 'regions.mordoviaRepublic',
    [Region.SAKHA_REPUBLIC_YAKUTIA]: 'regions.sakhaRepublicYakutia',
    [Region.NORTH_OSSETIA_ALANIA_REPUBLIC]: 'regions.northOssetiaAlaniaRepublic',
    [Region.TATARSTAN_REPUBLIC]: 'regions.tatarstanRepublic',
    [Region.TYVA_REPUBLIC]: 'regions.tyvaRepublic',
    [Region.UDMURTIA_REPUBLIC]: 'regions.udmurtiaRepublic',
    [Region.HAKASSIA_REPUBLIC]: 'regions.hakassiaRepublic',
    [Region.CHECHEN_REPUBLIC]: 'regions.chechenRepublic',
    [Region.CHUVASHIA_REPUBLIC]: 'regions.chuvashiaRepublic',
    [Region.KRYM_REPUBLIC]: 'regions.krymRepublic',
    [Region.ALTAYSKY_KRAI]: 'regions.altayskyKrai',
    [Region.PERMSKY_KRAI]: 'regions.permskyKrai',
    [Region.PRIMORSKY_KRAI]: 'regions.primorskyKrai',
    [Region.STAVROPOL_KRAI]: 'regions.stavropolKrai',
    [Region.HABAROVSKY_KRAI]: 'regions.habarovskyKrai',
    [Region.KRASNOYARSKY_KRAI]: 'regions.krasnoyarskyKrai',
    [Region.KRASNODARSKY_KRAI_23]: 'regions.krasnodarskyKrai23',
    [Region.KRASNODARSKY_KRAI_93]: 'regions.krasnodarskyKrai93',
    [Region.ZABAIKALSKY_KRAI]: 'regions.zabaykalskyKrai',
    [Region.KAMCHATKSKY_KRAI]: 'regions.kamchatkkyKrai',
    [Region.AMURSKAYA_OBLAST]: 'regions.amurskayaOblast',
    [Region.ARCHANGELSKAYA_OBLAST]: 'regions.archangelskayaOblast',
    [Region.ASTRAKHANSKAYA_OBLAST]: 'regions.astrakhanskayaOblast',
    [Region.BELGORODSKAYA_OBLAST]: 'regions.belgorodskayaOblast',
    [Region.BRYANSKAYA_OBLAST]: 'regions.bryanskayaOblast',
    [Region.VLADIMIRSKAYA_OBLAST]: 'regions.vladimirskayaOblast',
    [Region.VOLGOGRADSKAYA_OBLAST]: 'regions.volgogradskayaOblast',
    [Region.VOLOGODSKAYA_OBLAST]: 'regions.vologodskayaOblast',
    [Region.VORONEZHSKAYA_OBLAST]: 'regions.voronezhskayaOblast',
    [Region.IVANOVSKAYA_OBLAST]: 'regions.ivanovskayaOblast',
    [Region.IRKUTSKAYA_OBLAST]: 'regions.irkutskayaOblast',
    [Region.KALININGRADSKAYA_OBLAST]: 'regions.kaliningradskayaOblast',
    [Region.KALUZHSKAYA_OBLAST]: 'regions.kaluzhskayaOblast',
    [Region.KEMEROVSKAYA_OBLAST]: 'regions.kemerovskayaOblast',
    [Region.KIROVSKAYA_OBLAST]: 'regions.kirovskayaOblast',
    [Region.KOSTROMSKAYA_OBLAST]: 'regions.kostromskayaOblast',
    [Region.KURGANSKAYA_OBLAST]: 'regions.kurganskayaOblast',
    [Region.KURSKAYA_OBLAST]: 'regions.kurskayaOblast',
    [Region.LENINGRADSKAYA_OBLAST]: 'regions.leningradskayaOblast',
    [Region.LIPETSKAYA_OBLAST]: 'regions.lipetskayaOblast',
    [Region.MAGADANSKAYA_OBLAST]: 'regions.magadanskayaOblast',
    [Region.MOSKOVSKAYA_OBLAST_50]: 'regions.moskovskayaOblast50',
    [Region.MOSKOVSKAYA_OBLAST_90]: 'regions.moskovskayaOblast90',
    [Region.MURMANSKAYA_OBLAST]: 'regions.murmanskayaOblast',
    [Region.ORLOVSKAYA_OBLAST]: 'regions.orlovskayaOblast',
    [Region.PENZENSKAYA_OBLAST]: 'regions.penzenskayaOblast',
    [Region.PSKOVSKAYA_OBLAST]: 'regions.pskovskayaOblast',
    [Region.ROSTOVSKAYA_OBLAST]: 'regions.rostovskayaOblast',
    [Region.RYAZANSKAYA_OBLAST]: 'regions.ryazanskayaOblast',
    [Region.SAMARSKAYA_OBLAST]: 'regions.samarskayaOblast',
    [Region.SARATOVSKAYA_OBLAST]: 'regions.saratovskayaOblast',
    [Region.SAKHALINSKAYA_OBLAST]: 'regions.sakhalinskayaOblast',
    [Region.SVERDLOVSKAYA_OBLAST_66]: 'regions.sverdlovskayaOblast66',
    [Region.SVERDLOVSKAYA_OBLAST_96]: 'regions.sverdlovskayaOblast96',
    [Region.SMOLENSKAYA_OBLAST]: 'regions.smolenskayaOblast',
    [Region.TAMBOVSKAYA_OBLAST]: 'regions.tambovskayaOblast',
    [Region.TVERSKAYA_OBLAST]: 'regions.tverskayaOblast',
    [Region.TOMSKAYA_OBLAST]: 'regions.tomskayaOblast',
    [Region.TULSKAYA_OBLAST]: 'regions.tulskayaOblast',
    [Region.TUMENSKAYA_OBLAST]: 'regions.tumenskayaOblast',
    [Region.ULYANOVSKAYA_OBLAST]: 'regions.ulyanovskayaOblast',
    [Region.CHELYABINSKAYA_OBLAST]: 'regions.chelyabinskayaOblast',
    [Region.YAROSLAVSKAYA_OBLAST]: 'regions.yaroslavskayaOblast',
    [Region.NIZHEGORODSKAYA_OBLAST]: 'regions.nizhegorodskayaOblast',
    [Region.NOVGORODSKAYA_OBLAST]: 'regions.novgorodskayaOblast',
    [Region.NOVOSIBIRSKAYA_OBLAST]: 'regions.novosibirskayaOblast',
    [Region.OMSKAYA_OBLAST]: 'regions.omskayaOblast',
    [Region.ORENBURGSKAYA_OBLAST]: 'regions.orenburgskayaOblast',
    [Region.MOSCOW_77]: 'regions.moscow77',
    [Region.MOSCOW_97]: 'regions.moscow97',
    [Region.MOSCOW_99]: 'regions.moscow99',
    [Region.SAINT_PETERSBURG_78]: 'regions.saintPetersburg78',
    [Region.SAINT_PETERSBURG_98]: 'regions.saintPetersburg98',
    [Region.SEVASTOPOL]: 'regions.sevastopol',
    [Region.EVREYSKAYA_AUTONOMNAYA_OBLAST]: 'regions.evreyskayaAvtonomnayaOblast',
    [Region.NENETSKY_AUTONOMNY_OKRUG]: 'regions.nenetskyAvtonomnyOkrug',
    [Region.HANTY_MANSIYSKY_AUTONOMNY_OKRUG_YUGRA]: 'regions.hantyMansiyksyAvtonomnyOkrugYugra',
    [Region.CHUKOTKSKY_AUTONOMNY_OKRUG]: 'regions.chukotkkyAvtonomnyOkrug',
    [Region.YAMALO_NENETSKY_AUTONOMNY_OKRUG]: 'regions.yamaloNenetskyAvtonomnyOkrug',
    [Region.EXTERNAL_LANDS_88]: 'regions.externalLands88',
    [Region.EXTERNAL_LANDS_94]: 'regions.externalLands94',
    [Region.DONETSK_PEOPLES_REPUBLIC]: 'regions.donetskPeoplesRepublic',
    [Region.LUGANSK_PEOPLES_REPUBLIC]: 'regions.luganskPeoplesRepublic',
    [Region.HERSONSKAYA_OBLAST]: 'regions.hersonskayaOblast',
    [Region.ZAPOROZHSKAYA_OBLAST]: 'regions.zaporozhskayaOblast'
  };
  return t(keyMap[region]);
}

/**
 * Get all organ type options with localized labels
 * @param t - The i18n translate function
 */
export function getLocalizedOrganTypeOptions(t: (key: string) => string) {
  return Object.values(PartyOrganType)
    .filter(v => typeof v === 'number')
    .map((value) => ({
      value: value as number,
      label: getLocalizedOrganName(value as PartyOrganType, t)
    }));
}

/**
 * Get all region options with localized labels
 * @param t - The i18n translate function
 */
export function getLocalizedRegionOptions(t: (key: string) => string) {
  return Object.values(Region)
    .filter(v => typeof v === 'number')
    .map((value) => ({
      value: value as number,
      label: getLocalizedRegionName(value as Region, t)
    }));
}
