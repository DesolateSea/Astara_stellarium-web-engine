// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

/**
 * Historical Astronomy Events Database
 * Contains famous discoveries, space missions, astronomer birthdays, and historical eclipses
 * Special emphasis on Indian astronomy heritage and ISRO missions
 */

export default {
  // Famous Astronomy Discoveries
  discoveries: [
    // Ancient India
    { month: 4, day: 1, year: 476, name: 'Aryabhata Birth Anniversary', description: 'Aryabhata, ancient Indian mathematician and astronomer, proposed Earth rotates on its axis and calculated π accurately. Author of Aryabhatiya.' },
    { month: 12, day: 25, year: 1114, name: 'Bhaskara II Birth Anniversary', description: 'Indian mathematician-astronomer who wrote Siddhanta Shiromani, calculated planetary positions, eclipses, and proposed heliocentric concepts centuries before Copernicus.' },

    // Modern Global Discoveries
    { month: 1, day: 1, year: 1801, name: 'Discovery of Ceres', description: 'Giuseppe Piazzi discovered Ceres, the first and largest asteroid in the asteroid belt between Mars and Jupiter.' },
    { month: 3, day: 13, year: 1781, name: 'Discovery of Uranus', description: 'William Herschel discovered Uranus, the first planet found with a telescope, doubling the known size of the solar system.' },
    { month: 9, day: 23, year: 1846, name: 'Discovery of Neptune', description: 'Neptune was discovered by Johann Galle using mathematical predictions by Urbain Le Verrier and John Couch Adams.' },
    { month: 2, day: 18, year: 1930, name: 'Discovery of Pluto', description: 'Clyde Tombaugh discovered Pluto at Lowell Observatory. Later reclassified as a dwarf planet in 2006.' },
    { month: 4, day: 25, year: 1953, name: 'DNA Structure Discovery', description: 'Watson and Crick published the double helix structure of DNA, crucial for understanding life and astrobiology.' },
    { month: 7, day: 4, year: 2012, name: 'Higgs Boson Discovery', description: 'CERN announced discovery of the Higgs boson particle, fundamental to understanding mass in the universe.' },
    { month: 2, day: 11, year: 2016, name: 'Gravitational Waves Detected', description: 'LIGO announced first direct detection of gravitational waves from merging black holes, confirming Einstein\'s prediction.' },
    { month: 4, day: 10, year: 2019, name: 'First Black Hole Image', description: 'Event Horizon Telescope revealed the first image of a black hole in M87 galaxy, 55 million light-years away.' },
    { month: 10, day: 4, year: 1957, name: 'Sputnik 1 Launch', description: 'Soviet Union launched Sputnik 1, the first artificial satellite, beginning the Space Age.' },
    { month: 11, day: 3, year: 1957, name: 'First Dog in Space', description: 'Laika became the first animal to orbit Earth aboard Sputnik 2.' }
  ],

  // Space Mission Milestones
  missions: [
    // ISRO Missions (India)
    { month: 4, day: 19, year: 1975, name: 'Aryabhata Satellite Launch', description: 'India\'s first satellite, named after the ancient astronomer Aryabhata, was launched marking India\'s entry into the space age.' },
    { month: 7, day: 18, year: 1980, name: 'Rohini Satellite Launch', description: 'India became the sixth country to launch a satellite from its own soil using the SLV-3 rocket.' },
    { month: 10, day: 22, year: 2008, name: 'Chandrayaan-1 Launch', description: 'India\'s first lunar mission discovered water molecules on the Moon\'s surface, a groundbreaking achievement.' },
    { month: 11, day: 5, year: 2013, name: 'Mars Orbiter Mission (Mangalyaan) Launch', description: 'ISRO launched Mangalyaan. India became the first nation to reach Mars orbit on its first attempt and at lowest cost.' },
    { month: 9, day: 24, year: 2014, name: 'India Reaches Mars', description: 'Mars Orbiter Mission successfully entered Mars orbit, making India the first Asian nation to reach Mars.' },
    { month: 7, day: 22, year: 2019, name: 'Chandrayaan-2 Launch', description: 'India\'s second lunar mission launched, aiming for the Moon\'s south pole with orbiter, lander, and rover.' },
    { month: 7, day: 14, year: 2023, name: 'Chandrayaan-3 Launch', description: 'India\'s third lunar mission launched, targeting a successful soft landing on the Moon\'s south pole.' },
    { month: 8, day: 23, year: 2023, name: 'Chandrayaan-3 Moon Landing', description: 'India became the 4th country to land on the Moon and first to land near the lunar south pole. Historic achievement for ISRO.' },
    { month: 9, day: 2, year: 2023, name: 'Aditya-L1 Launch', description: 'India\'s first solar mission launched to study the Sun from the L1 Lagrange point.' },

    // Global Missions
    { month: 4, day: 12, year: 1961, name: 'First Human in Space', description: 'Yuri Gagarin became the first human in space aboard Vostok 1, orbiting Earth once in 108 minutes.' },
    { month: 6, day: 16, year: 1963, name: 'First Woman in Space', description: 'Valentina Tereshkova became the first woman in space aboard Vostok 6.' },
    { month: 7, day: 20, year: 1969, name: 'Apollo 11 Moon Landing', description: 'Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon. "One small step for man, one giant leap for mankind."' },
    { month: 4, day: 12, year: 1981, name: 'First Space Shuttle Launch', description: 'Space Shuttle Columbia launched on STS-1, beginning the reusable spacecraft era.' },
    { month: 2, day: 20, year: 1986, name: 'Mir Space Station Launch', description: 'Soviet Union launched Mir, the first modular space station that operated for 15 years.' },
    { month: 4, day: 24, year: 1990, name: 'Hubble Space Telescope Launch', description: 'Hubble was launched, revolutionizing astronomy with stunning images and discoveries about the universe.' },
    { month: 11, day: 20, year: 1998, name: 'ISS First Module Launch', description: 'Zarya, the first module of the International Space Station, was launched beginning the largest space construction project.' },
    { month: 8, day: 6, year: 2012, name: 'Curiosity Lands on Mars', description: 'NASA\'s Curiosity rover successfully landed on Mars to explore Gale Crater and search for signs of past life.' },
    { month: 7, day: 14, year: 2015, name: 'New Horizons at Pluto', description: 'New Horizons spacecraft made the first close flyby of Pluto, revealing its heart-shaped Tombaugh Regio.' },
    { month: 2, day: 18, year: 2021, name: 'Perseverance Lands on Mars', description: 'NASA\'s Perseverance rover landed on Mars with Ingenuity helicopter, the first aircraft on another planet.' },
    { month: 12, day: 25, year: 2021, name: 'James Webb Space Telescope Launch', description: 'JWST launched, the most powerful space telescope ever built, to observe the earliest galaxies and exoplanets.' }
  ],

  // Astronomer and Scientist Birthdays
  birthdays: [
    // Ancient Indian Astronomers
    { month: 4, day: 1, year: 476, name: 'Aryabhata', description: 'Ancient Indian mathematician and astronomer who proposed Earth\'s rotation, calculated π, and authored Aryabhatiya. Pioneer of Indian astronomy.' },
    { month: 12, day: 25, year: 1114, name: 'Bhaskara II', description: 'Medieval Indian mathematician-astronomer, author of Siddhanta Shiromani. Described gravity centuries before Newton.' },
    { month: 6, day: 15, year: 598, name: 'Brahmagupta', description: 'Indian astronomer-mathematician who proposed rules for zero and negative numbers. Wrote Brahmasphutasiddhanta.' },
    { month: 10, day: 31, year: 1894, name: 'Meghnad Saha', description: 'Indian astrophysicist who developed the Saha ionization equation, fundamental to stellar spectroscopy and astrophysics.' },
    { month: 11, day: 7, year: 1888, name: 'C. V. Raman', description: 'Indian physicist who discovered the Raman Effect in light scattering. Nobel Prize winner 1930. Studied optical phenomena in atmosphere.' },
    { month: 8, day: 15, year: 1910, name: 'Vikram Sarabhai', description: 'Father of Indian Space Program. Founded ISRO and established India as a space-faring nation.' },
    { month: 10, day: 27, year: 1931, name: 'A. P. J. Abdul Kalam', description: 'Missile Man of India and architect of India\'s satellite launch vehicle program. Former President and space visionary.' },

    // Global Astronomers
    { month: 2, day: 15, year: 1564, name: 'Galileo Galilei', description: 'Italian astronomer who improved the telescope and discovered Jupiter\'s moons, Venus phases, and supported heliocentric model.' },
    { month: 1, day: 4, year: 1643, name: 'Isaac Newton', description: 'English mathematician and physicist who formulated laws of motion and universal gravitation, revolutionizing astronomy.' },
    { month: 3, day: 14, year: 1879, name: 'Albert Einstein', description: 'German physicist who developed theory of relativity, explaining gravity, spacetime, and revolutionizing cosmology.' },
    { month: 11, day: 20, year: 1889, name: 'Edwin Hubble', description: 'American astronomer who discovered the universe is expanding and galaxies exist beyond the Milky Way.' },
    { month: 11, day: 9, year: 1934, name: 'Carl Sagan', description: 'American astronomer, author of Cosmos. Pioneer in exobiology and advocate for space exploration and science education.' },
    { month: 1, day: 8, year: 1942, name: 'Stephen Hawking', description: 'British physicist who studied black holes and cosmology. Author of "A Brief History of Time." Proposed Hawking radiation.' },
    { month: 12, day: 27, year: 1571, name: 'Johannes Kepler', description: 'German astronomer who discovered laws of planetary motion, showing planets orbit in ellipses.' },
    { month: 2, day: 19, year: 1473, name: 'Nicolaus Copernicus', description: 'Polish astronomer who proposed heliocentric model, placing the Sun at the center of the solar system.' }
  ],

  // Notable Historical Eclipses
  historicalEclipses: [
    { month: 5, day: 29, year: 1919, name: 'Einstein\'s Eclipse', description: 'Solar eclipse observations by Arthur Eddington proved Einstein\'s General Relativity by showing starlight bends around the Sun.' },
    { month: 2, day: 26, year: 1998, name: 'India Total Solar Eclipse', description: 'Total solar eclipse visible across India from Gujarat to Orissa, one of the longest totalities of the 20th century.' },
    { month: 8, day: 11, year: 1999, name: 'India Total Solar Eclipse', description: 'Last total solar eclipse of the 20th century, visible from India. Thousands gathered to witness totality.' },
    { month: 10, day: 24, year: 1995, name: 'India Total Solar Eclipse', description: 'Total solar eclipse visible from northern India, studied extensively by Indian astronomers.' },
    { month: 8, day: 21, year: 2017, name: 'Great American Eclipse', description: 'Total solar eclipse crossing the entire United States from coast to coast, viewed by millions.' },
    { month: 7, day: 22, year: 2009, name: 'Longest Eclipse of Century', description: 'Total solar eclipse with longest duration of 21st century (6m 39s), visible from India, Nepal, China.' }
  ],

  // Indian Observatories and Institutions
  institutions: [
    { month: 4, day: 10, year: 1786, name: 'Madras Observatory Founded', description: 'One of the oldest observatories in India, established by the British East India Company for astronomical observations.' },
    { month: 11, day: 12, year: 1954, name: 'Aryabhatta Research Institute Founded', description: 'Premier research institute in Nainital for astronomy and atmospheric sciences.' },
    { month: 8, day: 15, year: 1969, name: 'ISRO Established', description: 'Indian Space Research Organisation officially formed, beginning India\'s journey to become a major space power.' },
    { month: 6, day: 1, year: 2000, name: 'Indian Astronomical Observatory', description: 'IAO at Hanle, Ladakh at 4,500m altitude began operations with India\'s largest optical telescope.' }
  ]
}
