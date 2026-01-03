# TODO / Future Features

## Gyroscope Mode Enhancements
- [ ] **Constellation Proximity Detection**: Show constellation lines/labels/images only when pointing within 15° of a constellation center. Requires proper coordinate conversion from observed (alt/az) to equatorial (RA/Dec) frame.

## Notes
- Initial implementation attempted but coordinate conversion was not working correctly
- May need to investigate stel engine's coordinate conversion API more thoroughly
- Consider using stel.observer to get view center in different coordinate frames
