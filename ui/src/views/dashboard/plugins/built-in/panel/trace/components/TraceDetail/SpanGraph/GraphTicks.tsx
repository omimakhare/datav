// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import customColors from 'src/theme/colors';


type GraphTicksProps = {
  numTicks: number;
};


export default function GraphTicks(props: GraphTicksProps) {
  const { numTicks } = props;
  const ticks = [];
  // i starts at 1, limit is `i < numTicks` so the first and last ticks aren't drawn
  for (let i = 1; i < numTicks; i++) {
    const x = `${(i / numTicks) * 100}%`;
    ticks.push(<line className="GraphTick" x1={x} y1="0%" x2={x} y2="100%" key={i / numTicks} style={{
      stroke: useColorModeValue(customColors.borderColor.light, customColors.borderColor.dark),
      strokeWidth: '1px'
    }}/>);
  }

  return (
    <g data-test="ticks" aria-hidden="true">
      {ticks}
    </g>
  );
}

