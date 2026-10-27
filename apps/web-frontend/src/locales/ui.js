// Additional application messages. Each row is English | German | French | Simplified Chinese.
const rows = `
Time|Zeit|Heure|时间
Real time|Echtzeit|Temps réel|实时
Paused|Angehalten|En pause|已暂停
Use autolocation|Automatische Standortbestimmung|Utiliser la géolocalisation|使用自动定位
UTC offset|UTC-Abweichung|Décalage UTC|UTC 偏移
Search City|Stadt suchen|Rechercher une ville|搜索城市
Enter city name...|Stadtnamen eingeben…|Saisissez le nom d’une ville…|输入城市名称…
Edit Latitude|Breitengrad bearbeiten|Modifier la latitude|编辑纬度
Edit Longitude|Längengrad bearbeiten|Modifier la longitude|编辑经度
Degrees|Grad|Degrés|度
Minutes|Minuten|Minutes|分
Seconds|Sekunden|Secondes|秒
Direction|Richtung|Direction|方向
North|Norden|Nord|北
East|Osten|Est|东
South|Süden|Sud|南
West|Westen|Ouest|西
Decimal Preview|Dezimalvorschau|Aperçu décimal|十进制预览
Apply|Anwenden|Appliquer|应用
Western|Westlich|Occidentale|西方
Indian|Indisch|Indienne|印度
Belarusian|Belarussisch|Biélorusse|白俄罗斯
Anutan|Anuta|Anuta|阿努塔
Arabic Al-sufi|Arabisch (Al-Sufi)|Arabe (Al-Sufi)|阿拉伯（苏菲）
Arabic Ancient|Altarabisch|Arabe ancienne|古阿拉伯
Arabic Lunar Stations|Arabische Mondstationen|Stations lunaires arabes|阿拉伯月宿
Blackfoot|Blackfoot|Pieds-Noirs|黑脚族
Bugis|Bugis|Bugis|布吉
Chinese|Chinesisch|Chinoise|中国
Chinese Contemporary|Modernes Chinesisch|Chinoise contemporaine|现代中国
Egyptian|Ägyptisch|Égyptienne|埃及
Hawaiian Starlines|Hawaiianische Sternlinien|Lignes stellaires hawaïennes|夏威夷星线
Inuit|Inuit|Inuit|因纽特
Japanese Moon Stations|Japanische Mondstationen|Stations lunaires japonaises|日本月宿
Kamilaroi|Kamilaroi|Kamilaroi|卡米拉罗伊
Korean|Koreanisch|Coréenne|韩国
Mandar|Mandar|Mandar|曼达尔
Maori|Māori|Maorie|毛利
Mongolian|Mongolisch|Mongole|蒙古
Navajo|Navajo|Navajo|纳瓦霍
Norse|Altnordisch|Nordique|北欧
Romanian|Rumänisch|Roumaine|罗马尼亚
Ruelle|Ruelle|Ruelle|吕埃勒
Sami|Samisch|Samie|萨米
Sardinian|Sardisch|Sarde|撒丁
Siberian|Sibirisch|Sibérienne|西伯利亚
Tongan|Tongaisch|Tongienne|汤加
Tukano|Tukano|Tukano|图库纳
Tupi|Tupi|Tupi|图皮
Western SnT|Westlich (Sky & Telescope)|Occidentale (Sky & Telescope)|西方（Sky & Telescope）
Western Hlad|Westlich (Hlad)|Occidentale (Hlad)|西方（Hlad）
Western Rey|Westlich (Rey)|Occidentale (Rey)|西方（Rey）
Near {city}|Nahe {city}|Près de {city}|{city}附近
Stars|Sterne|Étoiles|恒星
View in Sky|Am Himmel anzeigen|Voir dans le ciel|在天空中查看
Jump to {object} in the sky at this event’s time|Zu {object} am Himmel zur Zeit dieses Ereignisses springen|Afficher {object} dans le ciel à l’heure de cet événement|在此事件发生时跳转至天空中的{object}
Circumpolar (always visible)|Zirkumpolar (immer sichtbar)|Circumpolaire (toujours visible)|拱极天体（始终可见）
Unknown Type|Unbekannter Typ|Type inconnu|未知类型
Elliptical|Elliptisch|Elliptique|椭圆
Barred Spiral|Balkenspirale|Spirale barrée|棒旋
Intermediate Spiral|Zwischenspirale|Spirale intermédiaire|中间型旋涡
Spiral|Spirale|Spirale|旋涡
Lenticular|Linsenförmig|Lenticulaire|透镜
Irregular|Unregelmäßig|Irrégulière|不规则
Dwarf Spheroidal|Zwergsphäroid|Naine sphéroïdale|矮椭球
Dwarf Elliptical|Zwergelliptisch|Naine elliptique|矮椭圆
is an open-source mobile planetarium application that transforms your Android device into a powerful astronomical tool. Point at the sky to identify stars, planets, constellations, and deep sky objects in real-time.|ist eine quelloffene mobile Planetariums-App, die dein Android-Gerät in ein leistungsfähiges astronomisches Werkzeug verwandelt. Richte es auf den Himmel, um Sterne, Planeten, Sternbilder und Deep-Sky-Objekte in Echtzeit zu erkennen.|est une application mobile de planétarium libre qui transforme votre appareil Android en un puissant outil astronomique. Pointez le ciel pour identifier étoiles, planètes, constellations et objets du ciel profond en temps réel.|是一款开源移动天象仪应用，将 Android 设备变为强大的天文工具。指向天空即可实时识别恒星、行星、星座和深空天体。
- A high-performance astronomical rendering engine by Stellarium Labs SRL.|– Eine leistungsfähige astronomische Rendering-Engine von Stellarium Labs SRL.|– Un moteur de rendu astronomique performant de Stellarium Labs SRL.|— 由 Stellarium Labs SRL 开发的高性能天文渲染引擎。
Get Astara on your Android device for gyroscope-based sky tracking, AR camera overlay, and offline star maps.|Installiere Astara auf deinem Android-Gerät für gyroskopbasierte Himmelsverfolgung, AR-Kameraüberlagerung und Offline-Sternkarten.|Installez Astara sur Android pour le suivi du ciel par gyroscope, la superposition AR et les cartes du ciel hors ligne.|在 Android 设备上安装 Astara，体验陀螺仪天空跟踪、AR 相机叠加和离线星图。
Astara uses astronomical data from multiple sources including Gaia, Hipparcos, HyperLeda, and more.|Astara nutzt astronomische Daten aus mehreren Quellen, darunter Gaia, Hipparcos und HyperLeda.|Astara utilise des données astronomiques provenant notamment de Gaia, Hipparcos et HyperLeda.|Astara 使用 Gaia、Hipparcos、HyperLeda 等多个来源的天文数据。
(AGPL-3.0), inherited from Stellarium Web Engine. This means the source code is freely available and any modifications must also be open-sourced under the same license.|(AGPL-3.0), übernommen von Stellarium Web Engine. Der Quellcode ist frei verfügbar; Änderungen müssen ebenfalls unter derselben Lizenz veröffentlicht werden.|(AGPL-3.0), héritée de Stellarium Web Engine. Le code source est librement disponible et les modifications doivent être publiées sous la même licence.|(AGPL-3.0)，继承自 Stellarium Web Engine。源代码可自由获取，任何修改也必须以相同许可证开源。
GPS access failed. Using default location.|GPS-Zugriff fehlgeschlagen. Standardstandort wird verwendet.|Échec de l’accès GPS. Utilisation du lieu par défaut.|GPS 访问失败，使用默认位置。
Point your device up!|Richte dein Gerät nach oben!|Pointez votre appareil vers le haut !|请将设备朝上！
Light Pollution|Lichtverschmutzung|Pollution lumineuse|光污染
Fog|Nebel|Brouillard|雾
Lines|Linien|Lignes|连线
Labels|Beschriftungen|Étiquettes|标签
Drawings|Abbildungen|Illustrations|图绘
Boundaries|Grenzen|Limites|边界
Centered only|Nur zentrierte|Uniquement au centre|仅显示居中的星座
Grids & Lines|Gitter und Linien|Grilles et lignes|网格与线条
Ecliptic|Ekliptik|Écliptique|黄道
Meridian|Meridian|Méridien|子午线
Celestial Equator|Himmelsäquator|Équateur céleste|天赤道
Grids|Gitter|Grilles|网格
Azimuthal|Azimutal|Azimutale|地平坐标
Equatorial|Äquatorial|Équatoriale|赤道坐标
Equatorial J2000|Äquatorial J2000|Équatoriale J2000|赤道坐标 J2000
Solar System|Sonnensystem|Système solaire|太阳系
Deep sky|Deep Sky|Ciel profond|深空
Satellites|Satelliten|Satellites|卫星
Reset|Zurücksetzen|Réinitialiser|重置
Select landscape|Landschaft auswählen|Choisir un paysage|选择地景
Astronomical Calendar|Astronomischer Kalender|Calendrier astronomique|天文日历
Tap for today|Tippen für heute|Touchez pour aujourd’hui|点击返回今天
List|Liste|Liste|列表
Grid|Raster|Grille|网格
No events found for this month|Keine Ereignisse für diesen Monat|Aucun événement ce mois-ci|本月没有事件
Calculating astronomical events...|Astronomische Ereignisse werden berechnet…|Calcul des événements astronomiques…|正在计算天文事件…
Done|Fertig|Terminé|完成
Previous night|Vorherige Nacht|Nuit précédente|前一夜
Set time to now|Aktuelle Zeit einstellen|Régler sur maintenant|设为当前时间
Next night|Nächste Nacht|Nuit suivante|后一夜
Date & Time|Datum und Uhrzeit|Date et heure|日期与时间
Description|Beschreibung|Description|描述
Details|Details|Détails|详情
Close|Schließen|Fermer|关闭
Auto|Automatisch|Automatique|自动
Filter|Filter|Filtre|筛选
Add Filter|Filter hinzufügen|Ajouter un filtre|添加筛选
Loading...|Wird geladen…|Chargement…|正在加载…
Center|Zentrieren|Centrer|居中
Zoom|Zoom|Zoom|缩放
Constellation|Sternbild|Constellation|星座
Magnitude|Helligkeit|Magnitude|星等
Distance|Entfernung|Distance|距离
Phase|Phase|Phase|相位
Angular Size|Winkeldurchmesser|Taille angulaire|角直径
Spectral Type|Spektraltyp|Type spectral|光谱类型
RA (J2000)|Rektaszension (J2000)|AD (J2000)|赤经 (J2000)
Dec (J2000)|Deklination (J2000)|Déc. (J2000)|赤纬 (J2000)
Az/Alt|Azimut/Höhe|Azimut/hauteur|方位角/高度角
Visibility|Sichtbarkeit|Visibilité|可见性
Rise / Set|Aufgang / Untergang|Lever / coucher|升起 / 落下
Next Pass|Nächster Überflug|Prochain passage|下次过境
Range|Entfernung|Distance|距离
Est. Error (~age)|Geschätzter Fehler (~Alter)|Erreur estimée (~âge)|估计误差（依数据年龄）
NORAD ID|NORAD-ID|Identifiant NORAD|NORAD 编号
Designation|Bezeichnung|Désignation|编号
Group|Gruppe|Groupe|分组
Launch Date|Startdatum|Date de lancement|发射日期
Selection|Auswahl|Sélection|所选天体
Unknown|Unbekannt|Inconnu|未知
VISIBLE NOW|JETZT SICHTBAR|VISIBLE MAINTENANT|当前可见
Starting...|Beginnt…|Début…|即将开始…
Visible|Sichtbar|Visible|可见
Not visible|Nicht sichtbar|Non visible|不可见
Below horizon|Unter dem Horizont|Sous l’horizon|地平线以下
Above horizon|Über dem Horizont|Au-dessus de l’horizon|地平线以上
Never rises|Geht nie auf|Ne se lève jamais|永不升起
Circumpolar|Zirkumpolar|Circumpolaire|拱极天体
No favorites yet|Noch keine Favoriten|Aucun favori pour le moment|暂无收藏
Tap the heart icon on any object to add it to favorites|Tippe auf das Herz eines Objekts, um es zu den Favoriten hinzuzufügen|Touchez le cœur d’un objet pour l’ajouter aux favoris|点击天体的爱心图标即可收藏
No recent searches|Keine letzten Suchen|Aucune recherche récente|暂无最近搜索
No results found|Keine Ergebnisse gefunden|Aucun résultat|未找到结果
Planet|Planet|Planète|行星
Star|Stern|Étoile|恒星
Deep Sky Object|Deep-Sky-Objekt|Objet du ciel profond|深空天体
Galaxy|Galaxie|Galaxie|星系
Nebula|Nebel|Nébuleuse|星云
Star Cluster|Sternhaufen|Amas d’étoiles|星团
Other DSO|Andere Deep-Sky-Objekte|Autres objets du ciel profond|其他深空天体
Artificial Satellite|Künstlicher Satellit|Satellite artificiel|人造卫星
Minor Planet|Kleinplanet|Planète mineure|小行星
Comet|Komet|Comète|彗星
Moon Events|Mondereignisse|Événements lunaires|月球事件
Solar Events|Sonnenereignisse|Événements solaires|太阳事件
Planetary Events|Planetenereignisse|Événements planétaires|行星事件
Eclipses|Finsternisse|Éclipses|日月食
Historical Events|Historische Ereignisse|Événements historiques|历史事件
New Moon|Neumond|Nouvelle lune|新月
First Quarter|Erstes Viertel|Premier quartier|上弦月
Full Moon|Vollmond|Pleine lune|满月
Last Quarter|Letztes Viertel|Dernier quartier|下弦月
Lunar Perigee|Mond im Perigäum|Périgée lunaire|月球近地点
Lunar Apogee|Mond im Apogäum|Apogée lunaire|月球远地点
March Equinox|März-Tagundnachtgleiche|Équinoxe de mars|三月分点
June Solstice|Juni-Sonnenwende|Solstice de juin|六月至点
September Equinox|September-Tagundnachtgleiche|Équinoxe de septembre|九月分点
December Solstice|Dezember-Sonnenwende|Solstice de décembre|十二月至点
Morning|Morgen|Matin|清晨
Evening|Abend|Soir|傍晚
The moon will be in {phase} phase.|Der Mond befindet sich in der Phase {phase}.|La Lune sera dans la phase {phase}.|月球将处于{phase}相位。
The Moon will be {distance} km from Earth at perigee.|Der Mond ist im Perigäum {distance} km von der Erde entfernt.|La Lune sera à {distance} km de la Terre au périgée.|月球在近地点距地球 {distance} 千米。
The Moon will be {distance} km from Earth at apogee.|Der Mond ist im Apogäum {distance} km von der Erde entfernt.|La Lune sera à {distance} km de la Terre à l’apogée.|月球在远地点距地球 {distance} 千米。
This may appear as a Supermoon if it coincides with a Full Moon.|Bei Vollmond kann dies als Supermond erscheinen.|Cela peut être une superlune si cela coïncide avec la pleine lune.|如果恰逢满月，可能呈现超级月亮。
Spring begins in the Northern Hemisphere. Day and night are approximately equal in length.|Auf der Nordhalbkugel beginnt der Frühling. Tag und Nacht sind etwa gleich lang.|Le printemps commence dans l’hémisphère Nord. Le jour et la nuit ont une durée similaire.|北半球春季开始，昼夜时长大致相等。
Summer begins in the Northern Hemisphere. Longest day of the year in the Northern Hemisphere.|Auf der Nordhalbkugel beginnt der Sommer mit dem längsten Tag des Jahres.|L’été commence dans l’hémisphère Nord, avec le jour le plus long de l’année.|北半球夏季开始，这是北半球一年中白昼最长的一天。
Autumn begins in the Northern Hemisphere. Day and night are approximately equal in length.|Auf der Nordhalbkugel beginnt der Herbst. Tag und Nacht sind etwa gleich lang.|L’automne commence dans l’hémisphère Nord. Le jour et la nuit ont une durée similaire.|北半球秋季开始，昼夜时长大致相等。
Winter begins in the Northern Hemisphere. Shortest day of the year in the Northern Hemisphere.|Auf der Nordhalbkugel beginnt der Winter mit dem kürzesten Tag des Jahres.|L’hiver commence dans l’hémisphère Nord, avec le jour le plus court de l’année.|北半球冬季开始，这是北半球一年中白昼最短的一天。
Moon–{planet} Conjunction|Mond–{planet}-Konjunktion|Conjonction Lune–{planet}|月球与{planet}合
The Moon and {planet} will appear close together in the sky.|Mond und {planet} erscheinen am Himmel nahe beieinander.|La Lune et {planet} apparaîtront proches dans le ciel.|月球与{planet}在天空中看起来彼此接近。
{planet} at Opposition|{planet} in Opposition|{planet} en opposition|{planet}冲日
{planet} will be at opposition, appearing at its brightest and best positioned for observation.|{planet} steht in Opposition, besonders hell und günstig für Beobachtungen.|{planet} sera en opposition, au maximum de son éclat et bien placée pour l’observation.|{planet}将处于冲日位置，最为明亮，适宜观测。
{planet} Greatest Elongation|Größte Elongation von {planet}|Élongation maximale de {planet}|{planet}大距
{planet} will reach greatest elongation ({degrees}° from the Sun). Best seen in the {sky} sky.|{planet} erreicht die größte Elongation ({degrees}° von der Sonne). Am besten am {sky}himmel sichtbar.|{planet} atteindra son élongation maximale ({degrees}° du Soleil). À observer dans le ciel du {sky}.|{planet}将达到大距（距太阳 {degrees}°），宜在{sky}的天空观测。
Penumbral Lunar Eclipse|Halbschatten-Mondfinsternis|Éclipse lunaire pénombrale|半影月食
Partial Lunar Eclipse|Partielle Mondfinsternis|Éclipse lunaire partielle|月偏食
Total Lunar Eclipse|Totale Mondfinsternis|Éclipse lunaire totale|月全食
Partial Solar Eclipse|Partielle Sonnenfinsternis|Éclipse solaire partielle|日偏食
Annular Solar Eclipse|Ringförmige Sonnenfinsternis|Éclipse solaire annulaire|日环食
Total Solar Eclipse|Totale Sonnenfinsternis|Éclipse solaire totale|日全食
Hybrid Solar Eclipse|Hybride Sonnenfinsternis|Éclipse solaire hybride|全环食
The Moon will pass through Earth’s penumbral shadow.|Der Mond durchquert den Halbschatten der Erde.|La Lune traversera la pénombre de la Terre.|月球将穿过地球的半影。
The Moon will be partially shadowed by Earth.|Der Mond wird teilweise vom Erdschatten bedeckt.|La Lune sera partiellement dans l’ombre de la Terre.|月球将部分进入地球本影。
The Moon will be completely shadowed by Earth.|Der Mond wird vollständig vom Erdschatten bedeckt.|La Lune sera entièrement dans l’ombre de la Terre.|月球将完全进入地球本影。
The Sun will be partially blocked by the Moon.|Die Sonne wird teilweise vom Mond verdeckt.|Le Soleil sera partiellement caché par la Lune.|太阳将被月球部分遮挡。
The Moon will appear smaller than the Sun, creating a ring of fire effect.|Der Mond erscheint kleiner als die Sonne und erzeugt einen Feuerring.|La Lune paraîtra plus petite que le Soleil, créant un anneau de feu.|月球视直径小于太阳，形成火环效果。
The Sun will be completely blocked by the Moon.|Die Sonne wird vollständig vom Mond verdeckt.|Le Soleil sera entièrement caché par la Lune.|太阳将被月球完全遮挡。
This rare eclipse will transition between annular and total along its path.|Diese seltene Finsternis wechselt entlang ihres Verlaufs zwischen ringförmig und total.|Cette rare éclipse passera d’annulaire à totale le long de sa trajectoire.|这种罕见的日食在路径上将在环食与全食之间转换。
{description} ({count} years ago)|{description} (vor {count} Jahren)|{description} (il y a {count} ans)|{description}（{count} 年前）
Distance: {distance} km|Entfernung: {distance} km|Distance : {distance} km|距离：{distance} 千米
Elongation: {degrees}°|Elongation: {degrees}°|Élongation : {degrees}°|距角：{degrees}°
Best seen: {sky} sky|Am besten sichtbar: {sky}himmel|À observer : ciel du {sky}|最佳观测：{sky}的天空
Involving: {bodies}|Beteiligte Himmelskörper: {bodies}|Corps concernés : {bodies}|涉及天体：{bodies}
About Astara|Über Astara|À propos d’Astara|关于 Astara
Our Contributions|Unsere Beiträge|Nos contributions|我们的贡献
Built on top of the Stellarium Web Engine, our team added:|Auf Grundlage der Stellarium Web Engine hat unser Team Folgendes ergänzt:|À partir de Stellarium Web Engine, notre équipe a ajouté :|基于 Stellarium Web Engine，我们的团队添加了：
Gyroscope-based sky tracking|Gyroskopbasierte Himmelsverfolgung|Suivi du ciel par gyroscope|基于陀螺仪的天空跟踪
AR Camera Overlay with live camera feed|AR-Kameraüberlagerung mit Livebild|Superposition AR avec caméra en direct|实时相机画面的 AR 叠加
Direction Tracking visual guides|Visuelle Richtungsführung|Guides visuels de direction|方向跟踪视觉指引
Multiple Sky Cultures (Indian, Chinese, Arabic, etc.)|Mehrere Himmelskulturen (indisch, chinesisch, arabisch usw.)|Plusieurs cultures célestes (indienne, chinoise, arabe, etc.)|多种星空文化（印度、中国、阿拉伯等）
Astronomical Calendar with moon phases, eclipses, conjunctions|Astronomischer Kalender mit Mondphasen, Finsternissen und Konjunktionen|Calendrier astronomique avec phases lunaires, éclipses et conjonctions|包含月相、日月食、合相的天文日历
Offline-first mobile app design|Für Offline-Nutzung konzipierte mobile App|Application mobile conçue pour fonctionner hors ligne|离线优先的移动应用设计
Android integration via Capacitor|Android-Integration über Capacitor|Intégration Android avec Capacitor|通过 Capacitor 集成 Android
Powered By|Technische Grundlage|Propulsé par|技术支持
Source Code|Quellcode|Code source|源代码
Download Mobile App|Mobile App herunterladen|Télécharger l’application mobile|下载移动应用
Download APK from GitHub|APK von GitHub herunterladen|Télécharger l’APK sur GitHub|从 GitHub 下载 APK
User Manual|Benutzerhandbuch|Manuel d’utilisation|用户手册
For detailed usage instructions, see the|Ausführliche Anleitungen findest du im|Pour des instructions détaillées, consultez le|详细使用说明请参阅
in the repository.|im Repository.|dans le dépôt.|（位于代码仓库中）。
View Data Credits|Datenquellen anzeigen|Voir les sources des données|查看数据来源
License|Lizenz|Licence|许可证
Astara is licensed under the|Astara steht unter der|Astara est sous la licence|Astara 使用以下许可证：
Background Image|Hintergrundbild|Image de fond|背景图像
Planets Image|Planetenbilder|Images des planètes|行星图像
Minor Planets|Kleinplaneten|Planètes mineures|小行星
Others|Sonstiges|Autres|其他
Combination of the following catalogues:|Kombination der folgenden Kataloge:|Combinaison des catalogues suivants :|组合以下星表：
All images from NASA & JPL under public domain license:|Alle Bilder von NASA und JPL sind gemeinfrei:|Toutes les images de la NASA et du JPL sont dans le domaine public :|所有图像来自 NASA 和 JPL，属公有领域：
All data comes from the IAU Minor Planet Center|Alle Daten stammen vom IAU Minor Planet Center|Toutes les données proviennent du Minor Planet Center de l’UAI|所有数据来自国际天文学联合会小行星中心
Landscape images by Fabien Chereau|Landschaftsbilder von Fabien Chereau|Images des paysages par Fabien Chereau|地景图像由 Fabien Chereau 提供
Constellation lines by Fabien Chereau|Sternbildlinien von Fabien Chereau|Lignes des constellations par Fabien Chereau|星座连线由 Fabien Chereau 提供
Descriptions and some data taken from wikipedia|Beschreibungen und einige Daten aus Wikipedia|Descriptions et certaines données issues de Wikipédia|描述及部分数据取自维基百科
from wikipedia|aus Wikipedia|de Wikipédia|来自维基百科
error|Fehler|erreur|错误
Astara Logo|Astara-Logo|Logo Astara|Astara 标志
`

export const uiMessages = { en: {}, de: {}, fr: {}, 'zh-Hans': {} }
rows.trim().split('\n').forEach(row => {
  const values = row.split('|')
  if (values.length !== 4 || values.some(value => !value)) throw new Error('Invalid localization row: ' + row)
  Object.keys(uiMessages).forEach((locale, index) => {
    uiMessages[locale][values[0]] = values[index]
  })
})
