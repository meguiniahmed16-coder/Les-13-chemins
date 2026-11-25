import {MAKEHUMAN_HAIR,MAKEHUMAN_BEARD} from './makehuman-catalog.js?v=incarnations33';
// Public selections from the male V27 wardrobe.
export const traits = [
 {
  "key": "face",
  "label": "Volume des joues",
  "options": [
   "Naturelles",
   "Légèrement creuses",
   "Creuses",
   "Pleines",
   "Très pleines"
  ]
 },
 {
  "key": "forehead",
  "label": "Front",
  "options": [
   "D’origine",
   "Plus haut",
   "Plus court",
   "Tempes douces",
   "Tempes creusées"
  ]
 },
 {
  "key": "chin",
  "label": "Menton",
  "options": [
   "D’origine",
   "Court",
   "Allongé",
   "Fin",
   "À fossette"
  ]
 },
 {
  "key": "jawline",
  "label": "Ligne de mâchoire",
  "options": [
   "D’origine",
   "Adoucie",
   "Définie",
   "En retrait",
   "Avancée"
  ]
 },
 {
  "key": "brows",
  "label": "Sourcils",
  "options": [
   "Naturels",
   "Fins",
   "Définis"
  ]
 },
 {
  "key": "lashes",
  "label": "Cils",
  "options": [
   "Naturels",
   "Discrets",
   "Soulignés"
  ]
 },
 {
  "key": "makeup",
  "label": "Maquillage",
  "options": [
   "Sans maquillage",
   "Nude",
   "Rosé",
   "Cuivré",
   "Soirée"
  ],
  "swatches": [
   "#eee6d8",
   "#aa7968",
   "#b96679",
   "#b0784d",
   "#824659"
  ]
 },
 {
  "key": "age",
  "label": "Tranche d’âge",
  "options": [
   "18–29 ans",
   "30–39 ans",
   "40–49 ans",
   "50–64 ans",
   "65 ans et plus",
   "Moins de 18 ans"
  ]
 },
 {
  "key": "beard",
  "label": "Barbe et moustache",
  "options": [
   "Rasé",
   "Barbe de trois jours",
   "Moustache",
   "Bouc et moustache",
   "Barbe courte",
   ...MAKEHUMAN_BEARD.map(item=>item.label+' · 3D')
  ]
 },
 {
  "key": "pile",
  "label": "Pilosité du corps",
  "options": [
   "Imberbe",
   "Discrète",
   "Naturelle",
   "Fournie",
   "Dense"
  ]
 },
 {
  "key": "skin",
  "label": "Teinte de peau",
  "options": [
   "Porcelaine",
   "Ivoire",
   "Beige clair",
   "Beige doré",
   "Miel",
   "Caramel",
   "Brun",
   "Brun foncé",
   "Brun profond"
  ],
  "swatches": [
   "#f3d8c8",
   "#e6c4ad",
   "#d9b194",
   "#cd9c7c",
   "#bc896a",
   "#a57356",
   "#896048",
   "#6e4939",
   "#50372e"
  ]
 },
 {
  "key": "body",
  "label": "Corpulence",
  "options": [
   "Équilibré",
   "Mince",
   "Corpulence forte",
   "Athlétique",
   "Très musclé"
  ]
 },
 {
  "key": "mouth",
  "label": "Bouche",
  "options": [
   "D’origine",
   "Lèvres fines",
   "Lèvres pulpeuses",
   "Arc de Cupidon",
   "Bouche large"
  ]
 },
 {
  "key": "gaze",
  "label": "Regard",
  "options": [
   "D’origine",
   "En amande",
   "Arrondi",
   "Coins relevés",
   "Paupières couvrantes"
  ]
 },
 {
  "key": "nose",
  "label": "Nez",
  "options": [
   "Droit",
   "Fin",
   "Aquilin",
   "Arrondi",
   "Concave"
  ]
 },
 {
  "key": "ears",
  "label": "Oreilles",
  "options": [
   "Ovales",
   "Rapprochées",
   "Lobes libres",
   "Décollées",
   "Allongées"
  ]
 },
 {
  "key": "iris",
  "label": "Couleur des yeux",
  "options": [
   "Bleu",
   "Vert",
   "Noisette",
   "Marron",
   "Gris"
  ],
  "swatches": [
   "#638ca9",
   "#719476",
   "#ae8251",
   "#724833",
   "#919ca6"
  ]
 },
 {
  "key": "hair",
  "label": "Coiffure",
  "options": [
   "Queue-de-cheval",
   "Coupe courte",
   "Carré dégagé",
   "Cheveux longs",
   "Tresse",
   "Carré droit",
   "Pixie",
   "Courte texturée",
   "Courte asymétrique",
   "Afro court",
   "Chignon de Marianne",
   "Boucles d’Ahmed Marie",
   ...MAKEHUMAN_HAIR.map(item=>item.label)
  ]
 },
 {
  "key": "hairTone",
  "label": "Couleur des cheveux",
  "options": [
   "Brun",
   "Noir",
   "Châtain",
   "Blond doré",
   "Roux cuivré",
   "Blond beige",
   "Blond cendré",
   "Blond platine",
   "Blond miel",
   "Châtain clair",
   "Auburn",
   "Poivre et sel"
  ],
  "swatches": [
   "#493329",
   "#211e21",
   "#875d44",
   "#d5b480",
   "#a05938",
   "#d5be9c",
   "#c0b199",
   "#e0d6c4",
   "#bb925b",
   "#976c4d",
   "#804133",
   "#a19f99"
  ]
 }
];
export const families = [
 [
  "visage",
  "Visage",
  [
   "face",
   "forehead",
   "chin",
   "jawline",
   "mouth",
   "nose",
   "ears",
   "gaze",
   "iris"
  ]
 ],
 [
  "regard",
  "Sourcils, cils et maquillage",
  [
   "brows",
   "lashes",
   "makeup"
  ]
 ],
 [
  "cheveux",
  "Cheveux et barbe",
  [
   "hair",
   "hairTone",
   "beard"
  ]
 ],
 [
  "peau",
  "Âge et peau",
  [
   "age",
   "skin"
  ]
 ],
 [
  "corps",
  "Corps",
  [
   "body",
   "pile"
  ]
 ]
];
export const sections = [
 [
  "Vêtements",
  [
   [
    "hauts",
    "Hauts et chemises"
   ],
   [
    "vestes",
    "Vestes et manteaux"
   ],
   [
    "pantalons",
    "Pantalons et shorts"
   ],
   [
    "robes",
    "Tuniques et vêtements longs"
   ],
   [
    "jupes",
    "Kilts"
   ],
   [
    "combinaisons",
    "Costumes et combinaisons"
   ]
  ]
 ],
 [
  "Sous-vêtements et bain",
  [
   [
    "culottes",
    "Slips, boxers et maillots"
   ],
   [
    "chaussettes",
    "Chaussettes"
   ],
   [
    "collants",
    "Collants et leggings"
   ]
  ]
 ],
 [
  "Chaussures",
  "chaussures"
 ],
 [
  "Accessoires",
  [
   [
    "chapeaux",
    "Chapeaux et casquettes"
   ],
   [
    "gants",
    "Gants"
   ],
   [
    "lunettes",
    "Lunettes"
   ],
   [
    "masques",
    "Masques"
   ],
   [
    "bijoux",
    "Bijoux"
   ],
   [
    "accessoires",
    "Cravates, ceintures et accessoires"
   ]
  ]
 ],
 [
  "Tenues complètes",
  [
   [
    "tenues",
    "Ville et détente"
   ],
   [
    "sport",
    "Sport"
   ]
  ]
 ]
];
export const pieces = [
 {"id":"mh1726","group":"hauts","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/866348581/camisole_top.mhclo","label":"Débardeur fleuri de Marianne","thumb":0,"sheet":"duo"},
 {"id":"mh391","group":"pantalons","author":"punkduck","license":"CC BY 3.0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1665/2097948445/tightjeans.mhclo","label":"Jean ajusté de Marianne","thumb":1,"sheet":"duo"},
 {
  "id": "mh1743",
  "label": "Ankle Boots Male",
  "group": "chaussures",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/720949648/boots_ankle_male.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 0
 },
 {
  "id": "mh226",
  "label": "Arabic Male gown Abaya",
  "group": "robes",
  "author": "abumeqbel",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1181/1233936837/bisth.mhclo",
  "thumb": 1
 },
 {
  "id": "mh210",
  "label": "Arabic Male Head Cover '3eqal'",
  "group": "chapeaux",
  "author": "abumeqbel",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1181/949995459/3eqal.mhclo",
  "thumb": 2
 },
 {
  "id": "mh2545",
  "label": "Blue scarf",
  "group": "accessoires",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1246952610/blue_scarf.mhclo",
  "thumb": 3
 },
 {
  "id": "mh807",
  "label": "Jean évasé",
  "group": "pantalons",
  "author": "vitalemarco",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1894/2114107974/jeans.mhclo",
  "thumb": 4
 },
 {
  "id": "mh3461",
  "label": "Boxer ajusté",
  "group": "culottes",
  "author": "WojackOWL",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/8124/1331590547/Boxer_Breifs_-_CausalUnderwear.mhclo",
  "thumb": 5
 },
 {
  "id": "mh3462",
  "label": "Caleçon",
  "group": "culottes",
  "author": "WojackOWL",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/8124/578653659/Boxers_-_CausalUnderwear.mhclo",
  "thumb": 6
 },
 {
  "id": "mh1963",
  "label": "Chiton Doric 01 male",
  "group": "robes",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/2119904296/chiton_doric_01_male.mhclo",
  "thumb": 7
 },
 {
  "id": "mh3627",
  "label": "CL Atoman mask",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/930923197/cl_atoman_mask.mhclo",
  "thumb": 8
 },
 {
  "id": "mh3626",
  "label": "CL Atoman suit",
  "group": "combinaisons",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/698585853/cl_atoman_suit.mhclo",
  "thumb": 9
 },
 {
  "id": "mh3089",
  "label": "CL bowler hat",
  "group": "chapeaux",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/74667065/cl_bowler_hat.mhclo",
  "thumb": 10
 },
 {
  "id": "mh3001",
  "label": "CL male sport suit",
  "group": "combinaisons",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/2129253196/cl_male_sport_suit.mhclo",
  "thumb": 11
 },
 {
  "id": "mh438",
  "label": "Baskets",
  "group": "chaussures",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/1067685982/sneakers.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 12
 },
 {
  "id": "mh25",
  "label": "Crude High Socks",
  "group": "chaussettes",
  "author": "Joel Palmius",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1/crudehighsocks.mhclo",
  "thumb": 13
 },
 {
  "id": "mh26",
  "label": "Crude Leggings",
  "group": "collants",
  "author": "Joel Palmius",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1/crudeleggings.mhclo",
  "thumb": 14
 },
 {
  "id": "mh32",
  "label": "Crude Low Socks",
  "group": "chaussettes",
  "author": "Joel Palmius",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1/crudelowsocks.mhclo",
  "thumb": 15
 },
 {
  "id": "mh2501",
  "label": "Elvs Canadian Airforce Jacket Vintage~Male",
  "group": "vestes",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1477556277/canadian_airforce_jacket.mhclo",
  "thumb": 16
 },
 {
  "id": "mh2431",
  "label": "Elvs Frog Feet1-male",
  "group": "chaussures",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/2043781732/elvs_frogfeet1male.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 17
 },
 {
  "id": "mh1477",
  "label": "Elvs M Facial Jewel Array1",
  "group": "bijoux",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1764872692/malefacejewels1.mhclo",
  "thumb": 18
 },
 {
  "id": "mh1321",
  "label": "Elvs M Swim Shorts1",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1655930251/elvs_male_shorts1.mhclo",
  "thumb": 19
 },
 {
  "id": "mh1431",
  "label": "Elvs Male Athletic Tank1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/450155546/m_wifebeater_elv1.mhclo",
  "thumb": 20
 },
 {
  "id": "mh1809",
  "label": "Elvs Male Boho bottom1",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/907319669/mens_boho_bottom1elv.mhclo",
  "thumb": 21
 },
 {
  "id": "mh1808",
  "label": "Elvs Male Boho top1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/445767355/mens_boho_top1elv.mhclo",
  "thumb": 22
 },
 {
  "id": "mh1626",
  "label": "Elvs Male Cargo Shorts1",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1479030177/mens_cargo_short1j.mhclo",
  "thumb": 23
 },
 {
  "id": "mh2698",
  "label": "Elvs Male Coveralls 1",
  "group": "combinaisons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/2011500870/elvs_male_mechanics_coverall1a.mhclo",
  "thumb": 24
 },
 {
  "id": "mh1814",
  "label": "Elvs Male Flat Cap1",
  "group": "chapeaux",
  "author": "Elvaerwyn",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/485401482/elvs_male_flat_cap1.mhclo",
  "thumb": 25
 },
 {
  "id": "mh1453",
  "label": "Elvs Male Flip Flop Sandals1",
  "group": "chaussures",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/918685925/maleflipflops1.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 26
 },
 {
  "id": "mh1797",
  "label": "Elvs Male Kilt 1",
  "group": "jupes",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1347024235/mens_kilt_elv1_f.mhclo",
  "thumb": 27
 },
 {
  "id": "mh1661",
  "label": "Elvs Male Logo TShirt1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1782648001/mens_teeshirt1j.mhclo",
  "thumb": 28
 },
 {
  "id": "mh1803",
  "label": "Elvs Male muscle shirt1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1913970404/mens_tanks_elvmuscle1f.mhclo",
  "thumb": 29
 },
 {
  "id": "mh1800",
  "label": "Elvs Male shirt untucked bd1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1214712272/mens_shirt_untuck_elvbhp1f.mhclo",
  "thumb": 30
 },
 {
  "id": "mh1799",
  "label": "Elvs Male Shirt w/tie tucked1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/178120150/mens_shirt_tie_tuck_elv1f.mhclo",
  "thumb": 31
 },
 {
  "id": "mh1804",
  "label": "Elvs Male tankshirt1",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1897022494/mens_tanks_elv1f.mhclo",
  "thumb": 32
 },
 {
  "id": "mh1815",
  "label": "Elvs Male Trench Coat1",
  "group": "vestes",
  "author": "Elvaerwyn",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1210216429/mens_trench_coat_elv1.mhclo",
  "thumb": 33
 },
 {
  "id": "mh1413",
  "label": "Elvs Male Trilby Hat",
  "group": "chapeaux",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1655852395/m_trilby_hat.mhclo",
  "thumb": 34
 },
 {
  "id": "mh1796",
  "label": "Elvs Male trouser 1",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1745672953/mens_trouser_f_elv1.mhclo",
  "thumb": 35
 },
 {
  "id": "mh1801",
  "label": "Elvs Male trouser short 1",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/993263764/mens_trouser_short_elv1crf.mhclo",
  "thumb": 36
 },
 {
  "id": "mh1806",
  "label": "Elvs Male trouser short 2",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1796715546/mens_trouser_short_nc_elvcrf.mhclo",
  "thumb": 37
 },
 {
  "id": "mh1805",
  "label": "Elvs Male trouser with Chain1",
  "group": "pantalons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/2028500718/mens_trouser_f_elv_chr.mhclo",
  "thumb": 38
 },
 {
  "id": "mh2542",
  "label": "Elvs Mens Apron1",
  "group": "combinaisons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1935068444/elvs_mens_apron1.mhclo",
  "thumb": 39
 },
 {
  "id": "mh2496",
  "label": "Elvs Mens sweater pant set1",
  "group": "combinaisons",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/1617451793/elvs_mens_sweatersuitset1.mhclo",
  "thumb": 40
 },
 {
  "id": "mh2967",
  "label": "Elvs Unisex Chef Hat 1",
  "group": "chapeaux",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/2120515121/elvs_unisex_chef_hat1.mhclo",
  "thumb": 41
 },
 {
  "id": "mh2687",
  "label": "Elvs Zombie killer Sneakers",
  "group": "chaussures",
  "author": "Elvaerwyn",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/396133122/elvs_zombiekiller_sneakers1.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 42
 },
 {
  "id": "mh2510",
  "label": "Eyepatch",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/121086457/eyepatch.mhclo",
  "thumb": 43
 },
 {
  "id": "mh153",
  "label": "Lunettes de lecture",
  "group": "lunettes",
  "author": "frankyaye",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/114/1749741252/glasses_library_male.mhclo",
  "thumb": 44
 },
 {
  "id": "mh371",
  "label": "Harvey_Socks1",
  "group": "chaussettes",
  "author": "callharvey3d",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1256/1391372618/harvey_socks1.mhclo",
  "thumb": 45
 },
 {
  "id": "mh3288",
  "label": "Hero belt 3",
  "group": "accessoires",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1361304127/hero_belt_3.mhclo",
  "thumb": 46
 },
 {
  "id": "mh2424",
  "label": "Hero boots 5",
  "group": "chaussures",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1282739215/hero_boots_5.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 47
 },
 {
  "id": "mh2411",
  "label": "Hero cape 2",
  "group": "robes",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/508155205/hero_cape_2.mhclo",
  "thumb": 48
 },
 {
  "id": "mh2406",
  "label": "Hero cape 3",
  "group": "robes",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1777545858/hero_cape_3.mhclo",
  "thumb": 49
 },
 {
  "id": "mh2454",
  "label": "Hero cape 5",
  "group": "robes",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/775605947/hero_cape_5.mhclo",
  "thumb": 50
 },
 {
  "id": "mh2202",
  "label": "Hero mask 3",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1738620206/hero_mask_3.mhclo",
  "thumb": 51
 },
 {
  "id": "mh2220",
  "label": "Hero mask 4",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/882864655/hero_mask_4.mhclo",
  "thumb": 52
 },
 {
  "id": "mh2396",
  "label": "Hero mask 5",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1248569729/hero_mask_5.mhclo",
  "thumb": 53
 },
 {
  "id": "mh3277",
  "label": "Hero mask 6",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/794185497/hero_mask_6.mhclo",
  "thumb": 54
 },
 {
  "id": "mh3349",
  "label": "Hero mask 7",
  "group": "masques",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1363892754/hero_mask_7.mhclo",
  "thumb": 55
 },
 {
  "id": "mh3282",
  "label": "Hero suit 4",
  "group": "combinaisons",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/1693657198/hero_suit_4.mhclo",
  "thumb": 56
 },
 {
  "id": "mh2298",
  "label": "Hero-heroine  armbands 1",
  "group": "accessoires",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/364620393/hero_heroine_armbands_1.mhclo",
  "thumb": 57
 },
 {
  "id": "mh2295",
  "label": "Hero-heroine  bracers 1",
  "group": "accessoires",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/798669607/hero-heroine_bracers_1.mhclo",
  "thumb": 58
 },
 {
  "id": "mh2074",
  "label": "Hero-heroine gloves 1",
  "group": "gants",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/909644156/hero-heroine_gloves_1.mhclo",
  "thumb": 59
 },
 {
  "id": "mh2093",
  "label": "Hero-heroine gloves 2",
  "group": "gants",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/83851271/hero-heroine_gloves_2.mhclo",
  "thumb": 60
 },
 {
  "id": "mh2193",
  "label": "Hero-heroine gloves 3",
  "group": "gants",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/877998936/hero-heroine_gloves_3.mhclo",
  "thumb": 61
 },
 {
  "id": "mh2333",
  "label": "Hero-heroine gloves 4",
  "group": "gants",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/447745932/hero-heroine_gloves_4.mhclo",
  "thumb": 62
 },
 {
  "id": "mh2401",
  "label": "Hero-heroine gloves 5",
  "group": "gants",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/526024634/hero-heroine_gloves_5.mhclo",
  "thumb": 63
 },
 {
  "id": "mh390",
  "label": "M Suit 01",
  "group": "combinaisons",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/1205150525/m_suit_01.mhclo",
  "thumb": 64
 },
 {
  "id": "mh329",
  "label": "M Swimming trunks 01",
  "group": "culottes",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/1766799519/m_swimming_trunks_01.mhclo",
  "thumb": 65
 },
 {
  "id": "mh340",
  "label": "M Swimming trunks 02",
  "group": "culottes",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/1936156134/m_swimming_trunks_02.mhclo",
  "thumb": 66
 },
 {
  "id": "mh851",
  "label": "M Swimming trunks 03",
  "group": "culottes",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/1360309905/m_swimming_trunks_03.mhclo",
  "thumb": 67
 },
 {
  "id": "mh746",
  "label": "M Trousers 01",
  "group": "pantalons",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/2087198175/m_trousers_01.mhclo",
  "thumb": 68
 },
 {
  "id": "mh1497",
  "label": "M Trousers 02",
  "group": "pantalons",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/16749318/m_trousers_02.mhclo",
  "thumb": 69
 },
 {
  "id": "mh717",
  "label": "MakeHuman Medal",
  "group": "bijoux",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/1149290703/makehuman_medal.mhclo",
  "thumb": 70
 },
 {
  "id": "mh3473",
  "label": "Male - High Cut Briefs",
  "group": "culottes",
  "author": "WojackOWL",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/8124/2052999492/HiCut_Briefs.mhclo",
  "thumb": 71
 },
 {
  "id": "mh225",
  "label": "male Arabic Dress White Simple",
  "group": "robes",
  "author": "abumeqbel",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1181/1037221273/dish_f2.mhclo",
  "thumb": 72
 },
 {
  "id": "mh224",
  "label": "Male Arabic Head Cover '3eqal'",
  "group": "chapeaux",
  "author": "abumeqbel",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1181/921959466/3qallast.mhclo",
  "thumb": 73
 },
 {
  "id": "mh2548",
  "label": "Male boots",
  "group": "chaussures",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/408543495/male_boots.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 74
 },
 {
  "id": "mhs-male_casualsuit01",
  "label": "Male casualsuit01",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 75
 },
 {
  "id": "mhs-male_casualsuit02",
  "label": "Male casualsuit02",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 76
 },
 {
  "id": "mhs-male_casualsuit03",
  "label": "Male casualsuit03",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 77
 },
 {
  "id": "mhs-male_casualsuit04",
  "label": "Male casualsuit04",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 78
 },
 {
  "id": "mhs-male_casualsuit05",
  "label": "Male casualsuit05",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 79
 },
 {
  "id": "mhs-male_casualsuit06",
  "label": "Male casualsuit06",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 80
 },
 {
  "id": "mh657",
  "label": "Male Chiton",
  "group": "robes",
  "author": "Aethelraed_Unraed",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/995/1408315127/male_chiton.mhclo",
  "thumb": 81
 },
 {
  "id": "mh1655",
  "label": "Jean classique",
  "group": "pantalons",
  "author": "punkduck",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/1056023358/male-classic-jeans.mhclo",
  "thumb": 82
 },
 {
  "id": "mh1656",
  "label": "male classic jeans (belt)",
  "group": "accessoires",
  "author": "punkduck",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/128518754/belt4-male-cjeans.mhclo",
  "thumb": 83
 },
 {
  "id": "mh1412",
  "label": "Male Crude Labcoat",
  "group": "vestes",
  "author": "Elvaerwyn",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/782291216/male_crude_labcoatop.mhclo",
  "thumb": 84
 },
 {
  "id": "mh1416",
  "label": "T-shirt en coton",
  "group": "hauts",
  "author": "Elvaerwyn",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2512/2033440468/crude_male_shirt.mhclo",
  "thumb": 85
 },
 {
  "id": "mhs-male_elegantsuit01",
  "label": "Male elegantsuit01",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 86
 },
 {
  "id": "mh2626",
  "label": "Male pajamas 01",
  "group": "combinaisons",
  "author": "jpujolar",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/5736/937454473/Male_pajamas2.mhclo",
  "thumb": 87
 },
 {
  "id": "mh2909",
  "label": "Polo",
  "group": "hauts",
  "author": "namuhekam",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4402/706596724/Polo_t-shirt.mhclo",
  "thumb": 88
 },
 {
  "id": "mh1754",
  "label": "Male Soldier Chainmail Skirt",
  "group": "jupes",
  "author": "Robitron",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/3029/1402212313/soldiers_skirt.mhclo",
  "thumb": 89
 },
 {
  "id": "mhs-male_worksuit01",
  "label": "Male worksuit01",
  "group": "combinaisons",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "thumb": 90
 },
 {
  "id": "mh1732",
  "label": "Mocassins",
  "group": "chaussures",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/1711036613/shoes_loafers.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 91
 },
 {
  "id": "mh1733",
  "label": "Men's Suit 3",
  "group": "combinaisons",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/510129102/suit3.mhclo",
  "thumb": 92
 },
 {
  "id": "mh1265",
  "label": "Men's Suit Tie and Jacket",
  "group": "vestes",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/2004310191/jacket_tie_pants.mhclo",
  "thumb": 93
 },
 {
  "id": "mh1740",
  "label": "Mens' Double-breasted Suit",
  "group": "combinaisons",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/1225819979/suit_double_breasted.mhclo",
  "thumb": 94
 },
 {
  "id": "mh3683",
  "label": "Powerman suit",
  "group": "combinaisons",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/725883604/powerman_suit.mhclo",
  "thumb": 95
 },
 {
  "id": "mh671",
  "label": "race number belt (back)",
  "group": "accessoires",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/105664689/race_number_belt_back.mhclo",
  "thumb": 96
 },
 {
  "id": "mh696",
  "label": "race number belt (front)",
  "group": "accessoires",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/550930354/race_number_belt_front.mhclo",
  "thumb": 97
 },
 {
  "id": "mh624",
  "label": "Shoes Biker Boots male",
  "group": "chaussures",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/696610518/shoes_biker_boots_male.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 98
 },
 {
  "id": "mh622",
  "label": "Shoes Monk Strap male",
  "group": "chaussures",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/639298423/shoes_monk_strap_male.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 99
 },
 {
  "id": "mh620",
  "label": "Shoes Oxford male",
  "group": "chaussures",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/1278566577/shoes_oxford_male.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 100
 },
 {
  "id": "mhs-shoes01",
  "label": "Shoes01",
  "group": "chaussures",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "heel": 0,
  "sole": 0.3,
  "thumb": 101
 },
 {
  "id": "mhs-shoes02",
  "label": "Shoes02",
  "group": "chaussures",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "heel": 0,
  "sole": 0.3,
  "thumb": 102
 },
 {
  "id": "mhs-shoes04",
  "label": "Shoes04",
  "group": "chaussures",
  "author": "makehuman_system",
  "license": "CC0",
  "source": "https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html",
  "heel": 0,
  "sole": 0.3,
  "thumb": 103
 },
 {
  "id": "mh462",
  "label": "Simple Male Bodysuit",
  "group": "combinaisons",
  "author": "Freehunter",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/674/115836542/male_skinsuit_01.mhclo",
  "thumb": 104
 },
 {
  "id": "mh579",
  "label": "simple Pants",
  "group": "pantalons",
  "author": "vitalemarco",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1894/2128170585/simple_pants.mhclo",
  "thumb": 105
 },
 {
  "id": "mh2349",
  "label": "Skull helmet",
  "group": "chapeaux",
  "author": "culturalibre",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/365332238/skull_helmet.mhclo",
  "thumb": 106
 },
 {
  "id": "mh2555",
  "label": "Sneakers",
  "group": "chaussures",
  "author": "culturalibre",
  "license": "CC-BY",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/4881/234119587/sneakers.mhclo",
  "heel": 0,
  "sole": 0.3,
  "thumb": 107
 },
 {
  "id": "mh3551",
  "label": "Sports Tights 1",
  "group": "pantalons",
  "author": "green_tomato",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/7571/1863076601/Sports_Tights_1.mhclo",
  "thumb": 108
 },
 {
  "id": "mh1333",
  "label": "Starship Uniform Male (Trek Style) Science Blue",
  "group": "combinaisons",
  "author": "ken1138",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2952/1191382349/star_fleet_uniform_tunic_male_blue.mhclo",
  "thumb": 109
 },
 {
  "id": "mh1330",
  "label": "Starship Uniform Male (Trek Style) Shirt RED",
  "group": "hauts",
  "author": "ken1138",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2952/951743323/star_fleet_uniform_tunic_male_red.mhclo",
  "thumb": 110
 },
 {
  "id": "mh1329",
  "label": "Starship Uniform Male (Trek Style) Trousers",
  "group": "pantalons",
  "author": "ken1138",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/2952/1101025806/star_fleet_uniform_trousers_male.mhclo",
  "thumb": 111
 },
 {
  "id": "mh694",
  "label": "sun visor (sports visor)",
  "group": "lunettes",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/438573719/sunvisor.mhclo",
  "thumb": 112
 },
 {
  "id": "mh1203",
  "label": "T-shirt rentré",
  "group": "hauts",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/1325045904/t_shirt_basic_tucked.mhclo",
  "thumb": 113
 },
 {
  "id": "mh848",
  "label": "Tactical Vest male",
  "group": "vestes",
  "author": "Mindfront",
  "license": "CC BY 4.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1422/1111053292/tactical_vest_male.mhclo",
  "thumb": 114
 },
 {
  "id": "mh181",
  "label": "Tie 1 Male",
  "group": "accessoires",
  "author": "frankyaye",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/114/1749145135/tie_1_male.mhclo",
  "thumb": 115
 },
 {
  "id": "mh147",
  "label": "Tights",
  "group": "collants",
  "author": "frankyaye",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/114/76541883/tights.mhclo",
  "thumb": 116
 },
 {
  "id": "mh631",
  "label": "uniform cap (train driver)",
  "group": "chapeaux",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/58135164/uniform_cap.mhclo",
  "thumb": 117
 },
 {
  "id": "mh629",
  "label": "uniform jacket (train driver)",
  "group": "vestes",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/1273355801/uniform_jacket.mhclo",
  "thumb": 118
 },
 {
  "id": "mh630",
  "label": "uniform pants (train driver)",
  "group": "pantalons",
  "author": "punkduck",
  "license": "CC BY 3.0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1665/1582676689/uniform_pants.mhclo",
  "thumb": 119
 },
 {
  "id": "mh1194",
  "label": "Pantalon en laine",
  "group": "pantalons",
  "author": "MargaretToigo",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/1968/286296307/pants_wool.mhclo",
  "thumb": 120
 },
 {
  "id": "mh80",
  "label": "Wrestling suit",
  "group": "combinaisons",
  "author": "learning",
  "license": "CC0",
  "source": "https://files.makehumancommunity.org/sites/default/files/clothes/39/1438803629/wrestling_suit.mhclo",
  "thumb": 121
 },
 {"id":"mh22","label":"T-shirt droit","group":"hauts","author":"Joel Palmius","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1/crudefemaletshirt.mhclo","thumb":0,"sheet":"femme"},
 {"id":"mh1158","label":"Chemisier","group":"hauts","author":"reizibarrientos","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1601/2039487116/preppyblouse.mhclo","thumb":1,"sheet":"femme"},
 {"id":"mh1338","label":"T-shirt tie-dye","group":"hauts","author":"Mayhem281","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/2961/798660404/tie_dye_shirt_female.mhclo","thumb":2,"sheet":"femme"},
 {"id":"mh1728","label":"Pantalon ample","group":"pantalons","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/41028514/pants_harem.mhclo","thumb":3,"sheet":"femme"},
 {"id":"mh2800","label":"Short en jean","group":"pantalons","author":"Cortu","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/4298/1882157200/jean_shorts.mhclo","thumb":4,"sheet":"femme"},
 {"id":"mh1727","label":"Jupe longue","group":"jupes","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/822388727/skirt_full_long.mhclo","thumb":5,"sheet":"femme"},
 {"id":"mh417","label":"Jupe rouge","group":"jupes","author":"reizibarrientos","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1601/1221480974/ewan.mhclo","thumb":6,"sheet":"femme"},
 {"id":"mh1640","label":"Robe à volants","group":"robes","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/1866133041/dresstierskirt.mhclo","thumb":7,"sheet":"femme"},
 {"id":"mh1853","label":"Robe au genou","group":"robes","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/1857475569/dress_knee_halter.mhclo","thumb":8,"sheet":"femme"},
 {"id":"mh1734","label":"Ballerines","group":"chaussures","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/1461460635/flats_ballet.mhclo","thumb":9,"sheet":"femme"},
 {"id":"mh1738","label":"Bottines","group":"chaussures","author":"MargaretToigo","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/1968/609559763/boots_ankle.mhclo","thumb":10,"sheet":"femme"},
 {"id":"mh674","label":"Gilet à capuche","group":"vestes","author":"RadicalToast","license":"CC0","source":"https://files.makehumancommunity.org/sites/default/files/clothes/2045/2053108029/hooded_cardigan.mhclo","thumb":11,"sheet":"femme"}
];
export const looks = [
 [
  "jour",
  "Polo, jean et baskets",
  {
   "haut": "mh2909",
   "bas": "mh1655",
   "souliers": "mh438"
  },
  122
 ],
 [
  "ville",
  "Costume de ville",
  {
   "robe": "mhs-male_elegantsuit01",
   "souliers": "mh620"
  },
  123
 ],
 [
  "weekend",
  "Chemise et pantalon",
  {
   "haut": "mh1800",
   "bas": "mh1796",
   "souliers": "mh1732"
  },
  124
 ],
 [
  "course",
  "Sport · Course",
  {
   "haut": "mh1431",
   "bas": "mh1801",
   "souliers": "mh2555"
  },
  125
 ],
 [
  "training",
  "Sport · Entraînement",
  {
   "haut": "mh1803",
   "bas": "mh3551",
   "souliers": "mh438"
  },
  126
 ]
];
export const thumbRows = 11;
