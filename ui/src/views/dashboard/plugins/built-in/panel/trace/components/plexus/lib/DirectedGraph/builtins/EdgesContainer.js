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
export default function EdgesContainer(props) {
  const {
    children,
    height,
    width,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("svg", Object.assign({
    height: height,
    width: width,
    xmlns: "http://www.w3.org/2000/svg"
  }, rest), children);
}