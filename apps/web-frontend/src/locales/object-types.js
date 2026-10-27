// App-authored supplements to upstream catalogs. Source labels match src/otypes.c.
const rows = `
Object of unknown nature|Objekt unbekannter Natur|Objet de nature inconnue|性质未知的天体
transient event|Vorübergehendes Ereignis|Événement transitoire|暂现事件
Radio-source|Radioquelle|Source radio|射电源
metric Radio-source|Meterwellen-Radioquelle|Source radio métrique|米波射电源
centimetric Radio-source|Zentimeterwellen-Radioquelle|Source radio centimétrique|厘米波射电源
millimetric Radio-source|Millimeterwellen-Radioquelle|Source radio millimétrique|毫米波射电源
sub-millimetric source|Submillimeterquelle|Source submillimétrique|亚毫米波源
HI source|HI-Quelle|Source HI|HI 源
radio Burst|Radioausbruch|Sursaut radio|射电暴
Infra-Red source|Infrarotquelle|Source infrarouge|红外源
Far-IR source|Ferne Infrarotquelle|Source infrarouge lointain|远红外源
Near-IR source|Nahe Infrarotquelle|Source infrarouge proche|近红外源
Very red source|Sehr rote Quelle|Source très rouge|极红源
Extremely Red Object|Extrem rotes Objekt|Objet extrêmement rouge|极红天体
Blue object|Blaues Objekt|Objet bleu|蓝色天体
UV-emission source|UV-Emissionsquelle|Source d’émission UV|紫外发射源
X-ray source|Röntgenquelle|Source de rayons X|X 射线源
Possible Ultra-luminous X-ray|Mögliche ultraleuchtkräftige Röntgenquelle|Source X ultralumineuse possible|候选超亮 X 射线源
Ultra-luminous X-ray source|Ultraleuchtkräftige Röntgenquelle|Source X ultralumineuse|超亮 X 射线源
gamma-ray source|Gammastrahlenquelle|Source de rayons gamma|伽马射线源
gamma-ray Burst|Gammastrahlenausbruch|Sursaut gamma|伽马射线暴
Not an object|Kein Objekt|Pas un objet|非天体
Possible gravitational lens System|Mögliches Gravitationslinsensystem|Système de lentille gravitationnelle possible|候选引力透镜系统
Possible gravitational lens|Mögliche Gravitationslinse|Lentille gravitationnelle possible|候选引力透镜
Possible gravitationally lensed image|Mögliches Gravitationslinsenbild|Image de lentille gravitationnelle possible|候选引力透镜像
Gravitational Lens System|Gravitationslinsensystem|Système de lentille gravitationnelle|引力透镜系统
Candidate objects|Kandidatenobjekte|Objets candidats|候选天体
Possible Galaxy|Mögliche Galaxie|Galaxie possible|候选星系
Possible Supercluster of Galaxies|Möglicher Galaxiensuperhaufen|Superamas de galaxies possible|候选星系超团
Possible Cluster of Galaxies|Möglicher Galaxienhaufen|Amas de galaxies possible|候选星系团
Possible Group of Galaxies|Mögliche Galaxiengruppe|Groupe de galaxies possible|候选星系群
Possible Association of Stars|Mögliche Sternassoziation|Association stellaire possible|候选星协
Possible Physical Binary|Mögliches physisches Doppelsternsystem|Système binaire physique possible|候选物理双星
Possible Eclipsing Binary|Möglicher Bedeckungsdoppelstern|Binaire à éclipses possible|候选食双星
Possible Symbiotic Star|Möglicher symbiotischer Stern|Étoile symbiotique possible|候选共生星
Possible Cataclysmic Binary|Mögliches kataklysmisches Doppelsternsystem|Binaire cataclysmique possible|候选激变双星
Possible Nova|Mögliche Nova|Nova possible|候选新星
Possible X-ray binary|Möglicher Röntgendoppelstern|Binaire X possible|候选 X 射线双星
Possible Low-Mass X-ray binary|Möglicher massearmer Röntgendoppelstern|Binaire X de faible masse possible|候选低质量 X 射线双星
Possible High-Mass X-ray binary|Möglicher massereicher Röntgendoppelstern|Binaire X de grande masse possible|候选高质量 X 射线双星
Possible Peculiar Star|Möglicher pekuliärer Stern|Étoile particulière possible|候选特殊恒星
Possible Young Stellar Object|Mögliches junges stellares Objekt|Objet stellaire jeune possible|候选年轻恒星体
Possible Pre-main sequence Star|Möglicher Vorhauptreihenstern|Étoile de pré-séquence principale possible|候选前主序星
Possible T Tau star|Möglicher T-Tauri-Stern|Étoile de type T Tau possible|候选 T Tau 型星
Possible Carbon Star|Möglicher Kohlenstoffstern|Étoile carbonée possible|候选碳星
Possible S Star|Möglicher S-Stern|Étoile de type S possible|候选 S 型星
Possible Star with envelope of OH/IR type|Möglicher Stern mit OH/IR-Hülle|Étoile avec enveloppe de type OH/IR possible|候选具有 OH/IR 型包层的恒星
Possible Star with envelope of CH type|Möglicher Stern mit CH-Hülle|Étoile avec enveloppe de type CH possible|候选具有 CH 型包层的恒星
Possible Wolf-Rayet Star|Möglicher Wolf-Rayet-Stern|Étoile Wolf-Rayet possible|候选沃尔夫–拉叶星
Possible Be Star|Möglicher Be-Stern|Étoile Be possible|候选 Be 星
Possible Herbig Ae/Be Star|Möglicher Herbig-Ae/Be-Stern|Étoile Herbig Ae/Be possible|候选赫比格 Ae/Be 星
Possible Horizontal Branch Star|Möglicher Horizontalaststern|Étoile de la branche horizontale possible|候选水平支星
Possible Star of RR Lyr type|Möglicher RR-Lyrae-Stern|Étoile de type RR Lyr possible|候选 RR Lyr 型星
Possible Cepheid|Möglicher Cepheid|Céphéide possible|候选造父变星
Possible Red Giant Branch star|Möglicher Roter-Riesenast-Stern|Étoile de la branche des géantes rouges possible|候选红巨星支星
Possible Supergiant star|Möglicher Überriese|Supergéante possible|候选超巨星
Possible Red supergiant star|Möglicher roter Überriese|Supergéante rouge possible|候选红超巨星
Possible Yellow supergiant star|Möglicher gelber Überriese|Supergéante jaune possible|候选黄超巨星
Possible Blue supergiant star|Möglicher blauer Überriese|Supergéante bleue possible|候选蓝超巨星
Possible Asymptotic Giant Branch Star|Möglicher asymptotischer Riesenaststern|Étoile de la branche asymptotique des géantes possible|候选渐近巨星支星
Possible Long Period Variable|Möglicher langperiodischer Veränderlicher|Variable à longue période possible|候选长周期变星
Possible Mira|Möglicher Mira-Stern|Variable de type Mira possible|候选米拉型变星
Possible Semi-regular variable|Möglicher halbregelmäßiger Veränderlicher|Variable semi-régulière possible|候选半规则变星
Possible Post-AGB Star|Möglicher Post-AGB-Stern|Étoile post-AGB possible|候选后渐近巨星支星
Possible Blue Straggler Star|Möglicher blauer Nachzügler|Étoile traînarde bleue possible|候选蓝离散星
Possible Hot subdwarf|Möglicher heißer Unterzwerg|Sous-naine chaude possible|候选热亚矮星
Possible White Dwarf|Möglicher weißer Zwerg|Naine blanche possible|候选白矮星
Possible Neutron Star|Möglicher Neutronenstern|Étoile à neutrons possible|候选中子星
Possible Black Hole|Mögliches Schwarzes Loch|Trou noir possible|候选黑洞
Possible SuperNova|Mögliche Supernova|Supernova possible|候选超新星
Possible Low-mass star|Möglicher massearmer Stern|Étoile de faible masse possible|候选低质量恒星
Possible Brown Dwarf|Möglicher brauner Zwerg|Naine brune possible|候选褐矮星
Composite object|Zusammengesetztes Objekt|Objet composite|复合天体
Region defined in the sky|Definierte Himmelsregion|Région définie du ciel|指定天区
Underdense region of the Universe|Unterdichte Region des Universums|Région de faible densité de l’Univers|宇宙低密度区
Possible Star Cluster|Möglicher Sternhaufen|Amas stellaire possible|候选星团
Possible Globular Cluster|Möglicher Kugelsternhaufen|Amas globulaire possible|候选球状星团
Double or multiple star|Doppel- oder Mehrfachstern|Étoile double ou multiple|双星或聚星
Eclipsing binary|Bedeckungsdoppelstern|Binaire à éclipses|食双星
Eclipsing binary of Algol type|Bedeckungsdoppelstern vom Algol-Typ|Binaire à éclipses de type Algol|大陵五型食双星
Eclipsing binary of beta Lyr type|Bedeckungsdoppelstern vom Beta-Lyrae-Typ|Binaire à éclipses de type beta Lyr|渐台二型食双星
Eclipsing binary of W UMa type|Bedeckungsdoppelstern vom W-UMa-Typ|Binaire à éclipses de type W UMa|W UMa 型食双星
Star showing eclipses by its planet|Stern mit Planetentransits|Étoile présentant des transits planétaires|出现行星凌星的恒星
Spectroscopic binary|Spektroskopischer Doppelstern|Binaire spectroscopique|分光双星
Ellipsoidal variable Star|Ellipsoidischer Veränderlicher|Variable ellipsoïdale|椭球变星
Cataclysmic Variable Star|Kataklysmischer Veränderlicher|Variable cataclysmique|激变变星
CV DQ Her type|Kataklysmischer Veränderlicher vom DQ-Her-Typ|Variable cataclysmique de type DQ Her|DQ Her 型激变变星
CV of AM Her type|Kataklysmischer Veränderlicher vom AM-Her-Typ|Variable cataclysmique de type AM Her|AM Her 型激变变星
Nova-like Star|Novaähnlicher Stern|Étoile de type nova|类新星
Nova|Nova|Nova|新星
Dwarf Nova|Zwergnova|Nova naine|矮新星
Possible Planetary Nebula|Möglicher planetarischer Nebel|Nébuleuse planétaire possible|候选行星状星云
Cometary Globule|Kometare Globule|Globule cométaire|彗状球云
Interstellar Cloud|Interstellare Wolke|Nuage interstellaire|星际云
Interstellar matter|Interstellare Materie|Matière interstellaire|星际物质
Galactic Nebula|Galaktischer Nebel|Nébuleuse galactique|银河星云
Bright Nebula|Heller Nebel|Nébuleuse brillante|亮星云
Dark Cloud|Dunkelwolke|Nuage sombre|暗云
Globule|Globule|Globule|球状云
Dense core|Dichter Kern|Cœur dense|致密核
Star forming region|Sternentstehungsgebiet|Région de formation stellaire|恒星形成区
HI shell|HI-Schale|Coquille HI|HI 壳层
Possible SuperNova Remnant|Möglicher Supernovaüberrest|Rémanent de supernova possible|候选超新星遗迹
CircumStellar matter|Zirkumstellare Materie|Matière circumstellaire|星周物质
Possible Outflow|Möglicher Ausfluss|Écoulement sortant possible|候选外流
Star|Stern|Étoile|恒星
Star in Cluster|Stern in einem Sternhaufen|Étoile dans un amas|星团中的恒星
Star in Nebula|Stern in einem Nebel|Étoile dans une nébuleuse|星云中的恒星
Star in Association|Stern in einer Assoziation|Étoile dans une association|星协中的恒星
Star in double system|Stern in einem Doppelsternsystem|Étoile dans un système double|双星系统中的恒星
Star suspected of Variability|Vermutlich veränderlicher Stern|Étoile soupçonnée de variabilité|疑似变星
Peculiar Star|Pekuliärer Stern|Étoile particulière|特殊恒星
Herbig Ae/Be star|Herbig-Ae/Be-Stern|Étoile Herbig Ae/Be|赫比格 Ae/Be 星
Blue Straggler Star|Blauer Nachzügler|Étoile traînarde bleue|蓝离散星
Evolved supergiant star|Entwickelter Überriese|Supergéante évoluée|演化超巨星
Red supergiant star|Roter Überriese|Supergéante rouge|红超巨星
Yellow supergiant star|Gelber Überriese|Supergéante jaune|黄超巨星
Blue supergiant star|Blauer Überriese|Supergéante bleue|蓝超巨星
Hot subdwarf|Heißer Unterzwerg|Sous-naine chaude|热亚矮星
Pulsating White Dwarf|Pulsierender weißer Zwerg|Naine blanche pulsante|脉动白矮星
Low-mass star|Massearmer Stern|Étoile de faible masse|低质量恒星
Confirmed Neutron Star|Bestätigter Neutronenstern|Étoile à neutrons confirmée|已确认中子星
OH/IR star|OH/IR-Stern|Étoile OH/IR|OH/IR 星
Star with envelope of CH type|Stern mit CH-Hülle|Étoile avec enveloppe de type CH|具有 CH 型包层的恒星
Pre-main sequence Star|Vorhauptreihenstern|Étoile de pré-séquence principale|前主序星
T Tau-type Star|T-Tauri-Stern|Étoile de type T Tau|T Tau 型星
Wolf-Rayet Star|Wolf-Rayet-Stern|Étoile Wolf-Rayet|沃尔夫–拉叶星
High proper-motion Star|Stern mit hoher Eigenbewegung|Étoile à grand mouvement propre|高自行恒星
High-velocity Star|Hochgeschwindigkeitsstern|Étoile à grande vitesse|高速恒星
Variable Star of irregular type|Unregelmäßiger Veränderlicher|Variable irrégulière|不规则变星
Variable Star of Orion Type|Veränderlicher vom Orion-Typ|Variable de type Orion|猎户型变星
Variable Star with rapid variations|Schnell veränderlicher Stern|Étoile à variations rapides|快速变化变星
Eruptive variable Star|Eruptiver Veränderlicher|Variable éruptive|爆发变星
Flare Star|Flarestern|Étoile éruptive à sursauts|耀星
Variable Star of FU Ori type|Veränderlicher vom FU-Ori-Typ|Variable de type FU Ori|FU Ori 型变星
Variable Star of R CrB type|Veränderlicher vom R-CrB-Typ|Variable de type R CrB|R CrB 型变星
Variable Star of R CrB type candiate|Kandidat für einen R-CrB-Veränderlichen|Candidate variable de type R CrB|候选 R CrB 型变星
Rotationally variable Star|Rotationsveränderlicher Stern|Variable par rotation|旋转变星
Variable Star of alpha2 CVn type|Veränderlicher vom Alpha2-CVn-Typ|Variable de type alpha2 CVn|alpha2 CVn 型变星
Variable of BY Dra type|Veränderlicher vom BY-Dra-Typ|Variable de type BY Dra|BY Dra 型变星
Variable of RS CVn type|Veränderlicher vom RS-CVn-Typ|Variable de type RS CVn|RS CVn 型变星
Pulsating variable Star|Pulsierender Veränderlicher|Variable pulsante|脉动变星
Variable Star of RR Lyr type|RR-Lyrae-Veränderlicher|Variable de type RR Lyr|RR Lyr 型变星
Cepheid variable Star|Cepheiden-Veränderlicher|Variable céphéide|造父变星
Variable Star of delta Sct type|Veränderlicher vom Delta-Sct-Typ|Variable de type delta Sct|delta Sct 型变星
Variable Star of RV Tau type|Veränderlicher vom RV-Tau-Typ|Variable de type RV Tau|RV Tau 型变星
Variable Star of W Vir type|Veränderlicher vom W-Vir-Typ|Variable de type W Vir|W Vir 型变星
Variable Star of beta Cep type|Veränderlicher vom Beta-Cep-Typ|Variable de type beta Cep|beta Cep 型变星
Classical Cepheid|Klassischer Cepheid|Céphéide classique|经典造父变星
Variable Star of gamma Dor type|Veränderlicher vom Gamma-Dor-Typ|Variable de type gamma Dor|gamma Dor 型变星
Variable Star of SX Phe type|Veränderlicher vom SX-Phe-Typ|Variable de type SX Phe|SX Phe 型变星
Long-period variable star|Langperiodischer Veränderlicher|Variable à longue période|长周期变星
Variable Star of Mira Cet type|Mira-Veränderlicher|Variable de type Mira Cet|Mira Cet 型变星
Semi-regular pulsating Star|Halbregelmäßig pulsierender Stern|Étoile pulsante semi-régulière|半规则脉动变星
Sub-stellar object|Substellares Objekt|Objet substellaire|亚恒星体
Possible Extra-solar Planet|Möglicher Exoplanet|Exoplanète possible|候选系外行星
Extra-solar Confirmed Planet|Bestätigter Exoplanet|Exoplanète confirmée|已确认系外行星
Galaxy in Cluster of Galaxies|Galaxie in einem Galaxienhaufen|Galaxie dans un amas de galaxies|星系团中的星系
Brightest Galaxy in a Cluster|Hellste Galaxie eines Haufens|Galaxie la plus brillante d’un amas|星系团最亮星系
Galaxy in Group of Galaxies|Galaxie in einer Galaxiengruppe|Galaxie dans un groupe de galaxies|星系群中的星系
Galaxy with high redshift|Galaxie mit hoher Rotverschiebung|Galaxie à grand décalage vers le rouge|高红移星系
Absorption Line system|Absorptionsliniensystem|Système de raies d’absorption|吸收线系统
Ly alpha Absorption Line system|Ly-Alpha-Absorptionsliniensystem|Système d’absorption Ly alpha|莱曼 α 吸收线系统
Damped Ly-alpha Absorption Line system|Gedämpftes Ly-Alpha-Absorptionsliniensystem|Système d’absorption Ly alpha amortie|阻尼莱曼 α 吸收线系统
metallic Absorption Line system|Metall-Absorptionsliniensystem|Système de raies d’absorption métalliques|金属吸收线系统
Lyman limit system|Lyman-Limit-System|Système de limite de Lyman|莱曼限系统
Broad Absorption Line system|Breites Absorptionsliniensystem|Système de raies d’absorption larges|宽吸收线系统
Possible Active Galaxy Nucleus|Möglicher aktiver Galaxienkern|Noyau actif de galaxie possible|候选活动星系核
Possible Quasar|Möglicher Quasar|Quasar possible|候选类星体
Possible Blazar|Möglicher Blazar|Blazar possible|候选耀变体
Possible BL Lac|Mögliches BL-Lac-Objekt|Objet BL Lac possible|候选蝎虎座 BL 型天体
Emission-line Galaxy|Emissionsliniengalaxie|Galaxie à raies d’émission|发射线星系
Blue compact Galaxy|Blaue kompakte Galaxie|Galaxie bleue compacte|蓝致密星系
BL Lac - type object|BL-Lac-Objekt|Objet de type BL Lac|蝎虎座 BL 型天体
Optically Violently Variable object|Optisch stark veränderliches Objekt|Objet à forte variabilité optique|光学剧变天体
Solar System Object|Sonnensystemobjekt|Objet du Système solaire|太阳系天体
Sun|Sonne|Soleil|太阳
Artificial Satellite|Künstlicher Satellit|Satellite artificiel|人造卫星
Communication Satellite|Kommunikationssatellit|Satellite de télécommunications|通信卫星
Amateur Radio Satellite|Amateurfunksatellit|Satellite radioamateur|业余无线电卫星
Science Satellite|Wissenschaftssatellit|Satellite scientifique|科学卫星
Space Science Satellite|Weltraumforschungssatellit|Satellite de sciences spatiales|空间科学卫星
Earth Science Satellite|Erdforschungssatellit|Satellite de sciences de la Terre|地球科学卫星
Education Satellite|Bildungssatellit|Satellite éducatif|教育卫星
Engineering Satellite|Technologiesatellit|Satellite technologique|工程卫星
Rocket Body|Raketenkörper|Corps de fusée|火箭体
Rocket First Stage|Erste Raketenstufe|Premier étage de fusée|火箭第一级
Rocket Second Stage|Zweite Raketenstufe|Deuxième étage de fusée|火箭第二级
Satellite Debris|Satellitentrümmer|Débris de satellite|卫星碎片
Satellite Platform|Satellitenplattform|Plateforme de satellite|卫星平台
Space Station|Raumstation|Station spatiale|空间站
Navigation Satellite|Navigationssatellit|Satellite de navigation|导航卫星
Minor Planet|Kleinplanet|Planète mineure|小行星
Dwarf Planet|Zwergplanet|Planète naine|矮行星
Comet|Komet|Comète|彗星
Periodic Comet|Periodischer Komet|Comète périodique|周期彗星
Non Periodic Comet|Nichtperiodischer Komet|Comète non périodique|非周期彗星
Unreliable (Historical) Comet|Unsicherer historischer Komet|Comète historique incertaine|不可靠的历史彗星
Disappeared Comet|Verschwundener Komet|Comète disparue|消失彗星
Interstellar Object|Interstellares Objekt|Objet interstellaire|星际天体
Near Earth Object|Erdnahes Objekt|Objet géocroiseur|近地天体
Atira Asteroid|Atira-Asteroid|Astéroïde Atira|阿蒂拉型小行星
Aten Asteroid|Aten-Asteroid|Astéroïde Aton|阿登型小行星
Apollo Asteroid|Apollo-Asteroid|Astéroïde Apollon|阿波罗型小行星
Amor Asteroid|Amor-Asteroid|Astéroïde Amor|阿莫尔型小行星
Hungaria Asteroid|Hungaria-Asteroid|Astéroïde Hungaria|匈牙利族小行星
Phocaea Asteroid|Phocaea-Asteroid|Astéroïde Phocée|福后族小行星
Hilda Asteroid|Hilda-Asteroid|Astéroïde Hilda|希尔达族小行星
Jupiter Trojan Asteroid|Jupiter-Trojaner|Astéroïde troyen de Jupiter|木星特洛伊小行星
Distant Object Asteroid|Entfernter Asteroid|Astéroïde lointain|远距小行星
Main Belt Asteroid|Hauptgürtelasteroid|Astéroïde de la ceinture principale|主带小行星
Interplanetary Spacecraft|Interplanetare Raumsonde|Sonde interplanétaire|行星际航天器
Meteor Shower|Meteorstrom|Pluie de météores|流星雨
Cultural Sky Representation|Kulturelle Himmelsdarstellung|Représentation culturelle du ciel|文化天空图景
Asterism|Asterismus|Astérisme|星群
Coordinates|Koordinaten|Coordonnées|坐标
Planetary Feature|Planetares Oberflächenmerkmal|Formation planétaire|行星地貌
Lunar Mare|Mondmeer|Mer lunaire|月海
Landing Site|Landestelle|Site d’atterrissage|着陆点
Human Landing Site|Bemannte Landestelle|Site d’atterrissage habité|载人着陆点
Robotic Landing Site|Unbemannte Landestelle|Site d’atterrissage robotique|无人着陆点
Plain|Ebene|Plaine|平原
Volcano|Vulkan|Volcan|火山
`

export const objectTypeMessages = { en: {}, de: {}, fr: {}, 'zh-Hans': {} }
rows.trim().split('\n').forEach(row => {
  const values = row.split('|')
  if (values.length !== 4 || values.some(value => !value)) throw new Error('Invalid object type translation: ' + row)
  Object.keys(objectTypeMessages).forEach((locale, index) => { objectTypeMessages[locale][values[0]] = values[index] })
})
