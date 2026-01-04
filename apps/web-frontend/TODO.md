# TODO / Future Features

## Gyroscope Mode Enhancements
- [ ] **Constellation Proximity Detection**: Show constellation lines/labels/images only when pointing within 15° of a constellation center. Requires proper coordinate conversion from observed (alt/az) to equatorial (RA/Dec) frame.

## Notes
- Initial implementation attempted but coordinate conversion was not working correctly
- May need to investigate stel engine's coordinate conversion API more thoroughly
- Consider using stel.observer to get view center in different coordinate frames


## Fix search for constellations
bug: if a different sky culture is searched other than the set in settings,
search does not work

## Fix UI
settings bar ui improvements
compass ui improvements
improvements in time changing

## location change
fix: while changing longitude the time correction auto calculate the time

## Add zoom button support 
feature request: add zoom button support through volume button

## Add map for location selection/picker
feature request: add map for location selection/picker
and name of location through some method
and also allow to use the correct time for that selected object based on the time of the present location's timezone

## Add more deep sky object images
feature request: add more deep sky object images
partial request: to add support of coordinate based photo mapping support with hips as already supported

## Add calendar for special events and time
feature request: add calendar for special events and time

## Orbital path
feature request: add orbital path shown if asked

## Instrument support
feature request: add instrument support (quite complex)