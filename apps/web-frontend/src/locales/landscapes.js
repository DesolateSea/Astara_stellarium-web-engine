// ID | English title/description | German title/description | French | Simplified Chinese.
const rows = `
champagne_castle|Champagne Castle|View from the Giants Castle Game Reserve, South Africa|Champagne Castle|Blick vom Giants Castle Game Reserve in Südafrika.|Champagne Castle|Vue depuis la réserve de Giants Castle, en Afrique du Sud.|香槟堡|从南非巨人堡野生动物保护区眺望。
garching|Garching|A view from the ESO headquarters in Garching bei Munchen, Germany.|Garching|Blick vom ESO-Hauptsitz in Garching bei München, Deutschland.|Garching|Vue depuis le siège de l’ESO à Garching près de Munich, en Allemagne.|加兴|从德国慕尼黑附近加兴的欧洲南方天文台总部眺望。
guereins|Guéreins|Guéreins is a small French village in the Valley of the Saône river, 50 km North of Lyon. In the west stand the small mountains of the "Beaujolais" where the famous wine is produced. It is also the town where Stellarium was born :)|Guéreins|Guéreins ist ein kleines französisches Dorf im Tal der Saône, 50 km nördlich von Lyon. Im Westen liegen die kleinen Berge des Beaujolais, wo der berühmte Wein hergestellt wird. Hier wurde auch Stellarium geboren :)|Guéreins|Guéreins est un petit village français dans la vallée de la Saône, à 50 km au nord de Lyon. À l’ouest se trouvent les petites montagnes du Beaujolais, où l’on produit le célèbre vin. C’est aussi le village où Stellarium est né :)|盖兰|盖兰是法国索恩河谷中的一个小村庄，位于里昂以北 50 千米。西侧是出产著名葡萄酒的博若莱山地。这里也是 Stellarium 诞生的地方 :)
hurricane|Hurricane|An edited view from Hurricane Ridge in Olympic National Park, Washington. In reality there is an expansive view of the rest of the Olympic range to the South but lighting conditions were poor.|Hurricane|Bearbeiteter Blick vom Hurricane Ridge im Olympic-Nationalpark, Washington. Tatsächlich bietet sich nach Süden ein weiter Blick auf das übrige Olympic-Gebirge, doch die Lichtverhältnisse waren schlecht.|Hurricane|Vue retouchée depuis Hurricane Ridge dans le parc national Olympic, dans l’État de Washington. En réalité, la vue s’étend au sud sur le reste du massif Olympic, mais les conditions d’éclairage étaient mauvaises.|飓风岭|来自美国华盛顿州奥林匹克国家公园飓风岭的编辑图景。实际上向南可广览奥林匹克山脉的其他部分，但当时光照条件不佳。
kloppenheim|Kloppenheim|View from Kloppenheim, South Africa.|Kloppenheim|Blick von Kloppenheim, Südafrika.|Kloppenheim|Vue depuis Kloppenheim, en Afrique du Sud.|克洛彭海姆|从南非克洛彭海姆眺望。
ocean|Ocean|A serene ocean horizon view, perfect for observing celestial objects rising and setting over the water. The unobstructed horizon provides an ideal setting for astronomical observation.|Ozean|Ein ruhiger Meereshorizont, ideal zur Beobachtung von Himmelskörpern beim Auf- und Untergang über dem Wasser. Der freie Horizont bietet optimale Bedingungen für astronomische Beobachtungen.|Océan|Un horizon marin paisible, idéal pour observer le lever et le coucher des astres au-dessus de l’eau. L’horizon dégagé offre un cadre parfait pour l’observation astronomique.|海洋|宁静的海洋地平线，适合观测天体在水面上升起和落下。无遮挡的地平线为天文观测提供理想环境。
winterfield|Winter Field|An outdoor view from Bavaria, Germany.|Winterfeld|Eine Außenansicht aus Bayern, Deutschland.|Champ en hiver|Vue en plein air depuis la Bavière, en Allemagne.|冬日田野|来自德国巴伐利亚的户外图景。
zero|Zero Horizon|A simple polygonal landscape that just covers the area below the horizon.|Nullhorizont|Eine einfache polygonale Landschaft, die nur den Bereich unterhalb des Horizonts abdeckt.|Horizon zéro|Un paysage polygonal simple couvrant uniquement la zone sous l’horizon.|零地平线|仅覆盖地平线以下区域的简单多边形地景。
`

export const landscapeMessages = { en: {}, de: {}, fr: {}, 'zh-Hans': {} }
rows.trim().split('\n').forEach(row => {
  const values = row.split('|')
  if (values.length !== 9 || values.some(value => !value)) throw new Error('Invalid landscape translation: ' + row)
  Object.keys(landscapeMessages).forEach((locale, index) => {
    landscapeMessages[locale][values[0]] = { title: values[index * 2 + 1], description: values[index * 2 + 2] }
  })
})
