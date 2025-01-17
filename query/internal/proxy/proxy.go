// Copyright 2023 Datav.io Team
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
package proxy

import (

	// "time"

	"bytes"
	"io"
	"net"
	"net/http"
	"time"

	"github.com/DataObserve/datav/query/pkg/colorlog"
	"github.com/DataObserve/datav/query/pkg/common"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

var logger = colorlog.RootLogger.New("logger", "datasource")

func Proxy(c *gin.Context) {
	targetURL := c.Query("proxy_url")

	client := &http.Client{
		Transport: otelhttp.NewTransport(
			&http.Transport{
				DialContext: (&net.Dialer{
					Timeout:   time.Duration(time.Minute * 1),
					KeepAlive: time.Duration(time.Minute * 2),
				}).DialContext,
			},
		),
	}
	// read request json body and write to new request body
	jsonData, _ := c.GetRawData()
	reqBody := bytes.NewBuffer(jsonData)

	outReq, err := http.NewRequestWithContext(c.Request.Context(), c.Request.Method, targetURL, reqBody)
	if err != nil {
		logger.Warn("build datasource proxy req error", "url", targetURL, "error", err.Error())
		c.JSON(502, common.RespError(err.Error()))
		return
	}

	// step 3
	for key, value := range c.Request.Header {
		for _, v := range value {
			// 这个暂时不能加，会乱码，后面看看怎么解决
			if key == "Accept-Encoding" {
				continue
			}
			outReq.Header.Add(key, v)
		}
	}

	res, err := client.Do(outReq)
	if err != nil {
		logger.Warn("request to datasource error", "url", targetURL, "error", err.Error())
		c.JSON(502, common.RespError(err.Error()))
		return
	}
	defer res.Body.Close()
	buffer := bytes.NewBuffer(nil)
	io.Copy(buffer, res.Body)
	c.String(res.StatusCode, buffer.String())
}
