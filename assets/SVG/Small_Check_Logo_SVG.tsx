import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const Small_Check_Logo_SVG = (props: SvgProps) => {
  const { color = '#68FE00', ...svgProps } = props;

  return (
    <Svg
      viewBox="0 0 16 12"
      width={16}
      height={12}
      fill="none"
      {...svgProps}
    >
      <Path
        fill={color}
        fillRule="evenodd"
        d="M5.45 9.361 14.696 0 16 1.32 5.45 12 0 6.483l1.304-1.32L5.45 9.36Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
export default Small_Check_Logo_SVG;
