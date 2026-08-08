import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const Small_Close_Logo_SVG = (props: SvgProps) => {
  return (
    <Svg
      width={5}
      viewBox="0 0 5 5"
      height={5}
      fill="none"
      {...props}
    >
      <Path fill="#C5C5C5" d="M4.7 0 0 4.7l.3.3L5 .3 4.7 0Z" />
      <Path fill="#C5C5C5" d="M5 4.7.3 0 0 .3 4.7 5l.3-.3Z" />
    </Svg>
  );
};
export default Small_Close_Logo_SVG;
