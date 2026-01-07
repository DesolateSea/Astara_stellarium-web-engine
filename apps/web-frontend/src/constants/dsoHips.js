// DSO HiPS Constants - All Downloaded Objects (100 total)
// Beautiful and prominent Deep Sky Objects distributed across the entire sky

export const DSO_HIPS_CATALOG = [
  // RA 0h-2h - Andromeda, Triangulum, Sculptor
  { id: 'm31', name: 'Andromeda Galaxy', ra: 10.7, dec: 41.3, fov: 5.0, showAtFov: 50 },
  { id: 'm32', name: 'M32 Satellite', ra: 10.7, dec: 40.9, fov: 0.5, showAtFov: 8 },
  { id: 'm110', name: 'M110 Galaxy', ra: 10.1, dec: 41.7, fov: 0.8, showAtFov: 12 },
  { id: 'm33', name: 'Triangulum Galaxy', ra: 23.4, dec: 30.6, fov: 2.0, showAtFov: 25 },
  { id: 'ngc253', name: 'Sculptor Galaxy', ra: 11.9, dec: -25.3, fov: 1.5, showAtFov: 20 },
  { id: 'ngc246', name: 'Skull Nebula', ra: 11.8, dec: -11.9, fov: 0.4, showAtFov: 6 },
  { id: 'ngc288', name: 'NGC 288 Cluster', ra: 13.2, dec: -26.6, fov: 0.5, showAtFov: 8 },
  { id: 'ngc55', name: 'NGC 55 Galaxy', ra: 3.7, dec: -39.2, fov: 1.5, showAtFov: 20 },
  { id: 'smc', name: 'Small Magellanic Cloud', ra: 13.2, dec: -72.8, fov: 5.0, showAtFov: 50 },
  { id: 'ngc346', name: 'NGC 346 in SMC', ra: 14.8, dec: -72.2, fov: 0.5, showAtFov: 10 },
  { id: 'ngc362', name: 'NGC 362 Cluster', ra: 15.8, dec: -70.8, fov: 0.5, showAtFov: 8 },
  { id: '47tuc', name: '47 Tucanae', ra: 6.0, dec: -72.1, fov: 0.8, showAtFov: 12 },
  { id: 'ngc281', name: 'Pacman Nebula', ra: 13.5, dec: 56.6, fov: 1.5, showAtFov: 20 },
  { id: 'm74', name: 'Phantom Galaxy', ra: 24.2, dec: 15.8, fov: 0.6, showAtFov: 10 },

  // RA 2h-4h - Perseus, Heart/Soul
  { id: 'ngc869', name: 'Double Cluster h', ra: 34.8, dec: 57.1, fov: 1.0, showAtFov: 15 },
  { id: 'ngc884', name: 'Double Cluster Chi', ra: 35.1, dec: 57.1, fov: 1.0, showAtFov: 15 },
  { id: 'ngc1275', name: 'Perseus A', ra: 49.9, dec: 41.5, fov: 0.3, showAtFov: 5 },
  { id: 'ic1805', name: 'Heart Nebula', ra: 38.2, dec: 61.5, fov: 3.5, showAtFov: 40 },
  { id: 'ic1848', name: 'Soul Nebula', ra: 43.0, dec: 60.4, fov: 3.0, showAtFov: 35 },
  { id: 'ngc1499', name: 'California Nebula', ra: 60.2, dec: 36.4, fov: 4.0, showAtFov: 45 },
  { id: 'ngc1333', name: 'NGC 1333 Nebula', ra: 52.3, dec: 31.3, fov: 0.8, showAtFov: 12 },
  { id: 'm76', name: 'Little Dumbbell', ra: 25.6, dec: 51.6, fov: 0.3, showAtFov: 5 },
  { id: 'arp273', name: 'Rose Galaxies', ra: 39.2, dec: 39.4, fov: 0.3, showAtFov: 5 },
  { id: 'ngc1097', name: 'NGC 1097 Galaxy', ra: 41.6, dec: -30.3, fov: 0.8, showAtFov: 12 },
  { id: 'fornax_cluster', name: 'Fornax Cluster', ra: 54.6, dec: -35.5, fov: 3.0, showAtFov: 35 },
  { id: 'ngc1365', name: 'Great Barred Spiral', ra: 53.4, dec: -36.1, fov: 0.8, showAtFov: 12 },

  // RA 4h-6h - Orion Belt Region
  { id: 'm45', name: 'Pleiades', ra: 56.7, dec: 24.1, fov: 3.0, showAtFov: 35 },
  { id: 'm1', name: 'Crab Nebula', ra: 83.6, dec: 22.0, fov: 0.3, showAtFov: 6 },
  { id: 'm42', name: 'Orion Nebula', ra: 83.8, dec: -5.4, fov: 2.0, showAtFov: 45 },
  { id: 'ic434', name: 'Horsehead Nebula', ra: 85.2, dec: -2.5, fov: 1.5, showAtFov: 20 },
  { id: 'ngc2024', name: 'Flame Nebula', ra: 85.4, dec: -1.9, fov: 1.0, showAtFov: 15 },
  { id: 'ic2118', name: 'Witch Head Nebula', ra: 81.0, dec: -7.2, fov: 4.0, showAtFov: 45 },
  { id: 'ic405', name: 'Flaming Star Nebula', ra: 81.5, dec: 34.3, fov: 1.5, showAtFov: 20 },
  { id: 'lmc', name: 'Large Magellanic Cloud', ra: 80.9, dec: -69.8, fov: 10.0, showAtFov: 70 },
  { id: 'ngc2070', name: 'Tarantula Nebula', ra: 84.7, dec: -69.1, fov: 1.5, showAtFov: 20 },
  { id: 'sim147', name: 'Simeis 147 SNR', ra: 84.0, dec: 28.0, fov: 4.0, showAtFov: 45 },

  // RA 6h-8h - Monoceros, Puppis
  { id: 'rosette', name: 'Rosette Nebula', ra: 98.0, dec: 5.0, fov: 3.0, showAtFov: 35 },
  { id: 'ngc2264', name: 'Cone Nebula', ra: 100.2, dec: 9.9, fov: 1.5, showAtFov: 20 },
  { id: 'ic443', name: 'Jellyfish Nebula', ra: 94.2, dec: 22.7, fov: 1.5, showAtFov: 20 },
  { id: 'ngc2359', name: 'Thors Helmet', ra: 109.6, dec: -13.2, fov: 0.5, showAtFov: 10 },
  { id: 'm35', name: 'M35 Cluster', ra: 92.2, dec: 24.3, fov: 0.8, showAtFov: 12 },
  { id: 'gum12', name: 'Gum 12 Nebula', ra: 121.2, dec: -44.6, fov: 3.0, showAtFov: 35 },
  { id: 'puppisa', name: 'Puppis A SNR', ra: 125.5, dec: -43.0, fov: 1.5, showAtFov: 20 },

  // RA 8h-10h - Vela, Cancer
  { id: 'vela_snr', name: 'Vela SNR', ra: 128.8, dec: -45.2, fov: 8.0, showAtFov: 60 },
  { id: 'ngc2736', name: 'Pencil Nebula', ra: 136.4, dec: -45.9, fov: 0.8, showAtFov: 12 },
  { id: 'm44', name: 'Beehive Cluster', ra: 130.1, dec: 19.7, fov: 2.0, showAtFov: 25 },
  { id: 'm81', name: 'Bodes Galaxy', ra: 148.9, dec: 69.1, fov: 1.5, showAtFov: 20 },
  { id: 'm82', name: 'Cigar Galaxy', ra: 148.9, dec: 69.7, fov: 0.8, showAtFov: 12 },
  { id: 'ngc2903', name: 'NGC 2903 Galaxy', ra: 143.0, dec: 21.5, fov: 0.8, showAtFov: 12 },

  // RA 10h-12h - Leo, Carina
  { id: 'm65', name: 'Leo Triplet M65', ra: 169.7, dec: 13.1, fov: 0.6, showAtFov: 10 },
  { id: 'm66', name: 'Leo Triplet M66', ra: 170.1, dec: 12.9, fov: 0.6, showAtFov: 10 },
  { id: 'ngc3628', name: 'Hamburger Galaxy', ra: 170.1, dec: 13.6, fov: 0.8, showAtFov: 12 },
  { id: 'ngc3372', name: 'Eta Carinae Nebula', ra: 161.2, dec: -59.7, fov: 3.0, showAtFov: 35 },
  { id: 'ngc3576', name: 'Statue of Liberty', ra: 168.1, dec: -61.3, fov: 1.0, showAtFov: 15 },
  { id: 'ic2944', name: 'Running Chicken', ra: 176.0, dec: -63.0, fov: 2.0, showAtFov: 25 },
  { id: 'ngc3132', name: 'Eight-Burst Nebula', ra: 151.8, dec: -40.4, fov: 0.3, showAtFov: 5 },

  // RA 12h-14h - Virgo, Centaurus
  { id: 'ngc4038', name: 'Antennae Galaxies', ra: 180.5, dec: -18.9, fov: 0.5, showAtFov: 8 },
  { id: 'm104', name: 'Sombrero Galaxy', ra: 190.0, dec: -11.6, fov: 0.6, showAtFov: 10 },
  { id: 'ngc4565', name: 'Needle Galaxy', ra: 189.1, dec: 25.9, fov: 1.0, showAtFov: 15 },
  { id: 'm64', name: 'Black Eye Galaxy', ra: 194.2, dec: 21.7, fov: 0.6, showAtFov: 10 },
  { id: 'm51', name: 'Whirlpool Galaxy', ra: 202.5, dec: 47.2, fov: 0.8, showAtFov: 12 },
  { id: 'ngc5139', name: 'Omega Centauri', ra: 201.7, dec: -47.5, fov: 1.0, showAtFov: 15 },
  { id: 'ngc5128', name: 'Centaurus A', ra: 201.4, dec: -43.0, fov: 1.0, showAtFov: 15 },
  { id: 'coalsack', name: 'Coalsack Nebula', ra: 192.0, dec: -64.0, fov: 7.0, showAtFov: 60 },

  // RA 14h-16h - Bootes, Lupus
  { id: 'm101', name: 'Pinwheel Galaxy', ra: 210.8, dec: 54.3, fov: 1.5, showAtFov: 20 },
  { id: 'm3', name: 'M3 Cluster', ra: 205.5, dec: 28.4, fov: 0.5, showAtFov: 8 },
  { id: 'm5', name: 'M5 Cluster', ra: 229.6, dec: 2.1, fov: 0.5, showAtFov: 8 },
  { id: 'm106', name: 'M106 Galaxy', ra: 184.7, dec: 47.3, fov: 1.0, showAtFov: 15 },
  { id: 'ngc5822', name: 'NGC 5822 Cluster', ra: 226.0, dec: -54.3, fov: 0.5, showAtFov: 8 },

  // RA 16h-18h - Scorpius, Ophiuchus
  { id: 'ngc6334', name: 'Cats Paw Nebula', ra: 260.8, dec: -36.0, fov: 1.5, showAtFov: 20 },
  { id: 'ngc6357', name: 'Lobster Nebula', ra: 262.0, dec: -34.2, fov: 2.0, showAtFov: 25 },
  { id: 'ic4628', name: 'Prawn Nebula', ra: 254.0, dec: -40.4, fov: 2.0, showAtFov: 25 },
  { id: 'ngc6188', name: 'Fighting Dragons', ra: 250.5, dec: -48.8, fov: 2.0, showAtFov: 25 },
  { id: 'm13', name: 'Hercules Cluster', ra: 250.4, dec: 36.5, fov: 0.5, showAtFov: 10 },
  { id: 'ngc6543', name: 'Cats Eye Nebula', ra: 269.6, dec: 66.6, fov: 0.2, showAtFov: 4 },
  { id: 'rho_oph', name: 'Rho Ophiuchi Cloud', ra: 247.0, dec: -24.0, fov: 5.0, showAtFov: 50 },
  { id: 'm4', name: 'M4 Cluster', ra: 245.9, dec: -26.5, fov: 0.5, showAtFov: 8 },

  // RA 18h-20h - Sagittarius, Aquila
  { id: 'm8', name: 'Lagoon Nebula', ra: 271.1, dec: -24.4, fov: 2.5, showAtFov: 40 },
  { id: 'm20', name: 'Trifid Nebula', ra: 270.6, dec: -23.0, fov: 1.5, showAtFov: 20 },
  { id: 'm16', name: 'Eagle Nebula', ra: 274.7, dec: -13.8, fov: 2.0, showAtFov: 25 },
  { id: 'm17', name: 'Omega Nebula', ra: 275.2, dec: -16.1, fov: 2.0, showAtFov: 25 },
  { id: 'm57', name: 'Ring Nebula', ra: 283.4, dec: 33.0, fov: 0.3, showAtFov: 5 },
  { id: 'm27', name: 'Dumbbell Nebula', ra: 299.9, dec: 22.7, fov: 0.5, showAtFov: 8 },
  { id: 'ngc6726', name: 'Corona Australis', ra: 285.3, dec: -36.9, fov: 1.5, showAtFov: 20 },
  { id: 'm22', name: 'M22 Cluster', ra: 279.1, dec: -23.9, fov: 0.5, showAtFov: 8 },

  // RA 20h-22h - Cygnus Region
  { id: 'ngc7000', name: 'North America Nebula', ra: 314.8, dec: 44.3, fov: 4.0, showAtFov: 45 },
  { id: 'ic5070', name: 'Pelican Nebula', ra: 312.8, dec: 44.4, fov: 2.5, showAtFov: 30 },
  { id: 'ngc6960', name: 'Western Veil Nebula', ra: 311.4, dec: 30.7, fov: 4.0, showAtFov: 45 },
  { id: 'ngc6992', name: 'Eastern Veil Nebula', ra: 314.5, dec: 31.7, fov: 3.0, showAtFov: 35 },
  { id: 'ngc6888', name: 'Crescent Nebula', ra: 303.1, dec: 38.4, fov: 0.5, showAtFov: 10 },
  { id: 'ic1318', name: 'Gamma Cygni Nebula', ra: 305.3, dec: 40.2, fov: 4.0, showAtFov: 45 },
  { id: 'ic1396', name: 'Elephant Trunk', ra: 324.7, dec: 57.5, fov: 4.0, showAtFov: 45 },
  { id: 'sh2_129', name: 'Flying Bat Nebula', ra: 315.5, dec: 60.5, fov: 4.0, showAtFov: 45 },
  { id: 'ngc7023', name: 'Iris Nebula', ra: 315.6, dec: 68.2, fov: 0.5, showAtFov: 10 },
  { id: 'ngc6946', name: 'Fireworks Galaxy', ra: 308.7, dec: 60.2, fov: 0.8, showAtFov: 12 },

  // RA 22h-24h - Cepheus, Pegasus
  { id: 'ngc7293', name: 'Helix Nebula', ra: 337.4, dec: -20.8, fov: 1.0, showAtFov: 15 },
  { id: 'ngc7635', name: 'Bubble Nebula', ra: 350.2, dec: 61.2, fov: 0.5, showAtFov: 10 },
  { id: 'ngc7380', name: 'Wizard Nebula', ra: 341.8, dec: 58.1, fov: 1.0, showAtFov: 15 },
  { id: 'sh2_155', name: 'Cave Nebula', ra: 343.0, dec: 62.6, fov: 1.5, showAtFov: 20 },
  { id: 'ngc7331', name: 'NGC 7331 Galaxy', ra: 339.3, dec: 34.4, fov: 0.7, showAtFov: 10 },
  { id: 'stephans_quintet', name: 'Stephans Quintet', ra: 339.0, dec: 33.9, fov: 0.3, showAtFov: 5 }
]

// Helper function to get DSO by ID
export function getDsoById (id) {
  return DSO_HIPS_CATALOG.find(function (dso) { return dso.id === id })
}

// Get all DSOs for download script (without showAtFov)
export function getDownloadList () {
  return DSO_HIPS_CATALOG.map(function (dso) {
    return { id: dso.id, name: dso.name, ra: dso.ra, dec: dso.dec, fov: dso.fov }
  })
}

// Get all DSOs for overlay (with showAtFov)
export function getOverlayList () {
  return DSO_HIPS_CATALOG.map(function (dso) {
    return {
      id: dso.id,
      name: dso.name,
      path: 'hips/' + dso.id + '/',
      showAtFov: dso.showAtFov
    }
  })
}

export default DSO_HIPS_CATALOG
