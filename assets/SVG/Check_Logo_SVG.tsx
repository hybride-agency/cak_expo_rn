import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const SvgComponent = (props: SvgProps) => {
  return (
    <Svg
      width={21}
      height={15}
      viewBox="0 0 21 15"
      fill="none"
      {...props}
    >
      <Path
        fill="#68FE00"
        d="M18.566.419a1.423 1.423 0 0 1 2.016 0 1.434 1.434 0 0 1 0 2.023L8.484 14.581a1.424 1.424 0 0 1-2.017 0l-6.05-6.07-.025-.026a1.434 1.434 0 0 1 .026-1.997 1.423 1.423 0 0 1 1.99-.025l.026.025 5.042 5.058L18.566.42Z"
      />
    </Svg>
  );
};
export default SvgComponent;
