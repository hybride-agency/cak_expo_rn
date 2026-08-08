import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const Danger_Logo_SVG = (props: SvgProps) => {
  return (
    <Svg
      viewBox="0 0 13 12"
      width={13}
      height={12}
      fill="none"
      {...props}
    >
      <Path
        fill="#fff"
        d="M5.653 1.22.83 10.025c-.439.802-.155 1.283.76 1.283h9.447c.92 0 1.2-.477.76-1.283L6.974 1.22c-.43-.785-.89-.785-1.321 0ZM5.1.916c.67-1.224 1.758-1.221 2.427 0l4.823 8.806c.67 1.224.087 2.216-1.313 2.216H1.59c-1.394 0-1.98-.995-1.312-2.216L5.1.917Zm.898 3.457v4.413h.63V4.374h-.63Zm0 5.044v.63h.63v-.63h-.63Z"
      />
    </Svg>
  );
};
export default Danger_Logo_SVG;
