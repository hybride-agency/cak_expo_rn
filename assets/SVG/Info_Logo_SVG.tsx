import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
const Info_Logo_SVG = (props: SvgProps) => {
  return (
    <Svg
      viewBox="0 0 12 12"
      width={12}
      height={12}
      fill="none"
      {...props}
    >
      <Path
        fill="#fff"
        d="M6 .8c2.867 0 5.2 2.333 5.2 5.2S8.867 11.2 6 11.2A5.207 5.207 0 0 1 .8 6C.8 3.133 3.133.8 6 .8ZM6 0C2.68 0 0 2.68 0 6s2.68 6 6 6 6-2.68 6-6-2.68-6-6-6Zm.4 8.693V5.387c0-.227-.173-.4-.4-.4-.227 0-.4.173-.4.4v3.306c0 .227.173.4.4.4.227 0 .4-.186.4-.4ZM6 2.96a.535.535 0 0 0-.533.533c0 .294.24.534.533.534A.535.535 0 0 0 6 2.96Z"
      />
    </Svg>
  );
};
export default Info_Logo_SVG;
