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

import * as React from 'react';
export default class EdgeArrowDef extends React.PureComponent {
  static getId(idBase) {
    return `${idBase}--edgeArrow`;
  }
  static getIriRef(idBase) {
    return `url(#${EdgeArrowDef.getId(idBase)})`;
  }
  render() {
    const {
      id,
      scaleDampener,
      zoomScale = null
    } = this.props;
    const scale = zoomScale != null ? Math.max(scaleDampener / zoomScale, 1) : 1;
    return /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("marker", {
      id: id,
      markerHeight: scale * 8,
      markerUnits: "strokeWidth",
      markerWidth: scale * 8,
      orient: "auto",
      refX: scale * 8,
      refY: scale * 3
    }, /*#__PURE__*/React.createElement("path", {
      d: `M0,0 L0,${scale * 6} L${scale * 9},${scale * 3} z`,
      fill: "#000"
    })));
  }
}
EdgeArrowDef.defaultProps = {
  zoomScale: null,
  scaleDampener: 0.6
};