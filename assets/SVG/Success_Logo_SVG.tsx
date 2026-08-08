import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const Success_Logo_SVG = (props: SvgProps) => {
  return (
    <Svg
      viewBox="0 0 105 106"
      width={105}
      height={106}
      fill="none"
      {...props}
    >
      <Path
        fill="#68FE00"
        d="M52.267 0C23.445 0 0 23.613 0 52.64s23.445 52.64 52.267 52.64c28.821 0 52.266-23.613 52.266-52.64S81.088 0 52.267 0ZM81.04 36.498l-37.334 37.6a3.71 3.71 0 0 1-5.279 0l-14.933-15.04a3.775 3.775 0 0 1 0-5.316 3.71 3.71 0 0 1 5.279 0l12.294 12.381L75.76 31.182a3.71 3.71 0 0 1 5.28 0 3.775 3.775 0 0 1 0 5.316Z"
      />
    </Svg>
  );
};
export default Success_Logo_SVG;
