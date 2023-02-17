const https = require('https');
const webhooks = require('./webhook');

openNews(
	(list) => {
		if (list.length > 0) {
      const formatData = format(list);
			sendNews(formatData, (res) => {
				if (res.errcode === 0) {
					console.log('发送成功', res);
				} else {
					console.log('发送失败', res);
				}
			})
		} else {
      console.log(list.length)
			console.log('暂无资讯');
		}
	}
);


// temp
function format(arr) {
	const	postData = {
		msgtype: "markdown",
		markdown: {
			content: `<font color='#1e80ff'>微博热搜</font>\n`
		}
	}
	arr.slice(0,20).forEach((article, index) => {
    console.log(article.note, article.raw_hot);
		postData.markdown.content += `[${index + 1}. ${article.note}](https://s.weibo.com/weibo?q=${article.note}&topic_ad=)   <font color='red'>热度 ${formatHotNum(article.num)}</font>\n`;
	});
	return JSON.stringify(postData);
}

function formatHotNum (number) {
  if (!number) {
    return '无数据';
  }
  if (number > 100000000) {
    return (number / 100000000).toFixed(1) + '亿';
  }
  if (number > 10000) {
    return (number / 10000).toFixed(1) + '万';
  }
  return number.toString();
}

// send
function sendNews(data, cb) {
  return;
  webhooks.forEach(v => {
    let req = https.request(
      v,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      },
      (data) => {
        var str="";
        data.on("data", (chunk) => {
            str += chunk;
        })
        data.on("end", () => {
            cb(JSON.parse(str));
        })
    })
    req.write(data);
    req.end();
  })
	
}


// open
function openNews(cb) {
  https.get({
    protocol: 'https:',
    hostname: 'weibo.com',
    path: '/ajax/side/hotSearch',
    port: ' 443',
    rejectUnauthorized: false,
    headers:  {
      'accept': 'application/json, text/plain, */*',
      'accept-encoding': 'deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'Content-Type': 'application/json',
      "referer": "https://juejin.cn/frontend?sort=newest",
      "origin": "https://juejin.cn",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.46",
      'x-xsrf-token': 'JBGZQP9SEc2ojnkBN40uBj3-'
    },
  }, (res) => {
      let str="";
      res.on('data', (chunk) => {
          str += chunk;
      });
      res.on('end', () => {
        try {
					const res = JSON.parse(str);
					if (res.ok === 1) {
						cb(res.data.realtime);
					} else {
						cb([]);
					}
				} catch (error) {
					// cb([]);
          console.log(error);
				}
      });
  }).on("error", (err) => {
      console.log("Error: ", err.message);
  });
}
