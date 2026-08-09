import React, {useId} from 'react';
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg';

// Glass artwork is authored on a 31 x 51 canvas.
const VIEW_WIDTH = 31;
const VIEW_HEIGHT = 51;

// Silhouette of the tumbler. Doubles as the clip for the water, so the
// liquid follows the taper of the glass instead of sitting in a box.
const GLASS_BODY =
  'M15.0828 0.404785C6.97909 0.404785 0.405273 1.85374 0.405273 3.64108C0.405273 3.67289 0.405279 3.70471 0.411063 3.73363L3.12099 44.7267L3.27716 47.0549C3.27716 47.0549 3.42467 48.5009 4.11878 48.9463C4.16216 48.9781 4.21132 49.0013 4.26049 49.0215C4.6972 49.1979 10.5595 49.8949 15.0828 49.8053C19.6061 49.8949 25.4714 49.1979 25.9052 49.0215C26.0238 48.9752 26.1279 48.9 26.2204 48.8046C26.7671 48.2522 26.8914 47.052 26.8914 47.052L27.0331 44.906L29.7546 3.73363C29.7604 3.70181 29.7604 3.67 29.7604 3.64108C29.7604 1.85374 23.1895 0.404785 15.0857 0.404785H15.0828Z';

// The open mouth of the glass.
const GLASS_RIM =
  'M29.7605 3.64108C29.7605 3.67289 29.7605 3.70471 29.7547 3.73363C29.532 5.47758 23.0507 6.88027 15.0858 6.88027C7.12087 6.88027 0.639599 5.48048 0.416905 3.73363C0.411121 3.70182 0.411133 3.67 0.411133 3.64108C0.411133 1.85374 6.98205 0.404785 15.0887 0.404785C23.1953 0.404785 29.7634 1.85374 29.7634 3.64108H29.7605Z';

// Specular highlights down the left and right walls.
const HIGHLIGHT_RIGHT =
  'M28.3485 5.02633L26.1476 44.663C25.8005 45.1894 25.2799 45.5971 24.6552 45.8025C23.5707 46.1611 22.5006 46.4474 21.4565 46.6672L23.322 6.31911C27.5561 6.18318 28.3485 5.02344 28.3485 5.02344V5.02633Z';
const HIGHLIGHT_LEFT =
  'M8.67906 46.5747C7.87794 46.3954 7.14913 46.2016 6.4984 46.0049C6.19472 45.9124 5.90552 45.8227 5.63655 45.7302C5.51797 45.6897 5.40806 45.6434 5.29816 45.5885L2.35107 5.24902L3.88102 5.62211L6.53889 6.27284L8.68195 46.5747H8.67906Z';

// Inner surface of the liquid: just below the rim when full, resting on the
// base when empty.
const WATER_TOP = 6.9;
const WATER_BOTTOM = 48.4;

const WATER = '#68CEFF';
const WATER_EDGE = '#3291D9';

const WaterGlass = ({level, width = 46}: {level: number; width?: number}) => {
  // useId returns ids containing colons, which url(#...) cannot reference.
  const clipId = `glass${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const clamped = Math.min(Math.max(level, 0), 1);
  const surfaceY = WATER_BOTTOM - (WATER_BOTTOM - WATER_TOP) * clamped;
  const height = width * (VIEW_HEIGHT / VIEW_WIDTH);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Path d={GLASS_BODY} />
        </ClipPath>
      </Defs>

      {/* Empty glass reads as glass, not a hole. */}
      <Path d={GLASS_BODY} fill="#FFFFFF" fillOpacity={0.08} />

      {clamped > 0 ? (
        <G clipPath={`url(#${clipId})`}>
          <Rect
            x={0}
            y={surfaceY}
            width={VIEW_WIDTH}
            height={WATER_BOTTOM - surfaceY}
            fill={WATER}
          />
          {/* Darker band along the surface, as in the artwork. */}
          <Rect
            x={0}
            y={surfaceY}
            width={VIEW_WIDTH}
            height={1.4}
            fill={WATER_EDGE}
          />
        </G>
      ) : null}

      <Path d={HIGHLIGHT_RIGHT} fill="#D7FFFF" fillOpacity={0.19} />
      <Path d={HIGHLIGHT_LEFT} fill="#D7FFFF" fillOpacity={0.19} />

      <Path
        d={GLASS_BODY}
        stroke="#FFFFFF"
        strokeWidth={0.81}
        strokeMiterlimit={10}
        fill="none"
      />
      <Path
        d={GLASS_RIM}
        stroke="#FFFFFF"
        strokeWidth={0.81}
        strokeMiterlimit={10}
        fill="none"
      />
    </Svg>
  );
};

export default WaterGlass;
