import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const Close_Logo_SVG = (props: SvgProps) => {
  return (
    <Svg
      width={14}
      height={14}
      fill="none"
      {...props}
    >
      <Path fill="#fff" d="M13.161 0 0 13.161l.839.84L14 .838 13.161 0Z" />
      <Path fill="#fff" d="M14 13.161.84 0 0 .839 13.161 14l.84-.839Z" />
    </Svg>
  );
};
export default Close_Logo_SVG;
