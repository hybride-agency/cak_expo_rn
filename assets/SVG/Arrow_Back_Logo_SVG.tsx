import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const SvgComponent = (props: SvgProps) => {
  return (
    <Svg
      width={14}
      height={19}
      viewBox="0 0 14 19"
      fill="none"
      {...props}
    >
      <Path
        fill="#fff"
        d="M13.227 1.69 11.875 0 0 9.5 11.875 19l1.352-1.69L3.464 9.5l9.763-7.81Z"
      />
    </Svg>
  );
};
export default SvgComponent;
