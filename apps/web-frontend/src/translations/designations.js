// IAU abbreviations/genitives mapped to the bundled Western culture's keys.
// These are display mappings only; catalog IDs and search aliases stay canonical.
const rows = `And|Andromedae|Chained Maiden|Andromeda
Ant|Antliae|Air Pump|Antlia
Aps|Apodis|Bird of Paradise|Apus
Aqr|Aquarii|Water Bearer|Aquarius
Aql|Aquilae|Eagle|Aquila
Ara|Arae|Altar|Ara
Ari|Arietis|Ram|Aries
Aur|Aurigae|Charioteer|Auriga
Boo|Boötis|Herdsman|Bootes
Cae|Caeli|Engraving Tool|Caelum
Cam|Camelopardalis|Giraffe|Camelopardalis
Cnc|Cancri|Crab|Cancer
CVn|Canum Venaticorum|Hunting Dogs|Canes Venatici
CMa|Canis Majoris|Great Dog|Canis Major
CMi|Canis Minoris|Lesser Dog|Canis Minor
Cap|Capricorni|Sea Goat|Capricornus
Car|Carinae|Keel|Carina
Cas|Cassiopeiae|Seated Queen|Cassiopeia
Cen|Centauri|Centaur|Centaurus
Cep|Cephei|King|Cepheus
Cet|Ceti|Sea Monster|Cetus
Cha|Chamaeleontis|Chameleon|Chamaeleon
Cir|Circini|Compass|Circinus
Col|Columbae|Dove|Columba
Com|Comae Berenices|Bernice's Hair|Coma Berenices
CrA|Coronae Australis|Southern Crown|Corona Australis
CrB|Coronae Borealis|Northern Crown|Corona Borealis
Crv|Corvi|Crow|Corvus
Crt|Crateris|Cup|Crater
Cru|Crucis|Southern Cross|Crux
Cyg|Cygni|Swan|Cygnus
Del|Delphini|Dolphin|Delphinus
Dor|Doradus|Swordfish|Dorado
Dra|Draconis|Dragon|Draco
Equ|Equulei|Little Horse|Equuleus
Eri|Eridani|River|Eridanus
For|Fornacis|Furnace|Fornax
Gem|Geminorum|Twins|Gemini
Gru|Gruis|Crane|Grus
Her|Herculis|Hercules|Hercules
Hor|Horologii|Clock|Horologium
Hya|Hydrae|Female Water Snake|Hydra
Hyi|Hydri|Male Water Snake|Hydrus
Ind|Indi|Indian|Indus
Lac|Lacertae|Lizard|Lacerta
Leo|Leonis|Lion|Leo
LMi|Leonis Minoris|Lesser Lion|Leo Minor
Lep|Leporis|Hare|Lepus
Lib|Librae|Scales|Libra
Lup|Lupi|Wolf|Lupus
Lyn|Lyncis|Lynx|Lynx
Lyr|Lyrae|Lyre|Lyra
Men|Mensae|Table Mountain|Mensa
Mic|Microscopii|Microscope|Microscopium
Mon|Monocerotis|Unicorn|Monoceros
Mus|Muscae|Fly|Musca
Nor|Normae|Carpenter's Square|Norma
Oct|Octantis|Octant|Octans
Oph|Ophiuchi|Serpent Bearer|Ophiuchus
Ori|Orionis|Hunter|Orion
Pav|Pavonis|Peacock|Pavo
Peg|Pegasi|Winged Horse|Pegasus
Per|Persei|Hero|Perseus
Phe|Phoenicis|Phoenix|Phoenix
Pic|Pictoris|Painter's Easel|Pictor
Psc|Piscium|Fishes|Pisces
PsA|Piscis Austrini|Southern Fish|Piscis Austrinus
Pup|Puppis|Stern|Puppis
Pyx|Pyxidis|Compass|Pyxis
Ret|Reticuli|Reticle|Reticulum
Sge|Sagittae|Arrow|Sagitta
Sgr|Sagittarii|Archer|Sagittarius
Sco|Scorpii|Scorpion|Scorpius
Scl|Sculptoris|Sculptor|Sculptor
Sct|Scuti|Shield|Scutum
Ser|Serpentis|Serpent|Serpens
Sex|Sextantis|Sextant|Sextans
Tau|Tauri|Bull|Taurus
Tel|Telescopii|Telescope|Telescopium
Tri|Trianguli|Triangle|Triangulum
TrA|Trianguli Australis|Southern Triangle|Triangulum Australe
Tuc|Tucanae|Toucan|Tucana
UMa|Ursae Majoris|Great Bear|Ursa Major
UMi|Ursae Minoris|Little Bear|Ursa Minor
Vel|Velorum|Sails|Vela
Vir|Virginis|Maiden|Virgo
Vol|Volantis|Flying Fish|Volans
Vul|Vulpeculae|Fox|Vulpecula`

export const constellations = rows.split('\n').map(row => row.split('|'))

export function translateConstellation (text, lookup) {
  const row = constellations.find(([short, genitive]) => short === text || genitive === text)
  if (!row) return text
  const [, , english, native] = row
  return lookup('skyculture/western/' + native, english)
}

const greek = 'alf,alpha,α|bet,beta,β|gam,gamma,γ|del,delta,δ|eps,epsilon,ε|zet,zeta,ζ|eta,η|tet,theta,θ|iot,iota,ι|kap,kappa,κ|lam,lambda,λ|mu,μ|nu,ν|ksi,xi,ξ|omi,omicron,ο|pi,π|rho,ρ|sig,sigma,σ|tau,τ|ups,upsilon,υ|phi,φ|chi,χ|psi,ψ|ome,omega,ω'
  .split('|').flatMap(row => {
    const names = row.split(',')
    return names.map(name => [name, names[names.length - 1]])
  })

export function translateStarDesignation (text, lookup, locale) {
  if (locale === 'en') return text
  const match = text.replace(/^(?:\*|V\*) /, '').match(/^(\S+) (.+?)( [A-Z])?$/)
  if (!match) return text
  const [, letter, constellation, suffix = ''] = match
  const row = constellations.find(([short, genitive]) => short === constellation || genitive === constellation)
  if (!row || !/^(?:[A-Za-z]{1,2}[\d⁰¹²³⁴⁵⁶⁷⁸⁹]*|\d+|[α-ω][\d⁰¹²³⁴⁵⁶⁷⁸⁹]*|[A-Za-z]+[\d⁰¹²³⁴⁵⁶⁷⁸⁹]*)$/.test(letter)) return text
  const parts = letter.match(/^([^\d⁰¹²³⁴⁵⁶⁷⁸⁹]+)(.*)$/)
  const symbol = parts && greek.find(([name]) => name === parts[1].toLowerCase())
  if (parts && !symbol && !/^[A-Za-z]{1,2}$/.test(parts[1]) && !/^V\d+$/.test(letter)) return text
  const name = translateConstellation(row[1], lookup)
  const identifier = symbol ? symbol[1] + parts[2] : letter
  return locale.startsWith('zh') ? name + identifier + suffix : identifier + ' ' + name + suffix
}

export function translateGreek (text, locale) {
  if (locale === 'en') return text
  const match = greek.find(([name]) => name === text.toLowerCase())
  return match ? match[1] : text
}

export function localizedNameOnly (translated, locale) {
  if (!locale.startsWith('zh')) return translated
  // Stellarium's Chinese catalog deliberately appends Latin aliases. Keep them
  // in canonical search data, not in the translated display label.
  return translated.replace(/^(.+[\u3400-\u9fff])\s+[A-Za-z][A-Za-z0-9 .,'’()+/-]*$/, '$1')
}
