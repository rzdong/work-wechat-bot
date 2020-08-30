const https = require('https');
const webhook = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=4241b946-f0cb-41e1-a51d-237d74c091bb";

openNews(
	JSON.stringify({
		cate_id: "6809637767543259144",
		cursor: "0",
		id_type: 2,
		limit: 7,
		sort_type: 300
	}),
	(list) => {
		if (list.length > 0) {
			sendNews(format(list), (res) => {
				if (res.errcode === 0) {
					console.log('发送成功', res);
				} else {
					console.log('发送失败', res);
				}
			})
			console.log(list);
		} else {
			console.log('暂无资讯');
		}
	}
);


// temp
function format(arr) {
	const	postData = {
		msgtype: "markdown",
		markdown: {
			content: `掘金-前端热门文章\n`
		}
	}
	arr.forEach(article => {
		postData.markdown.content = postData.markdown.content + `[${article.article_info.title}](https://juejin.im/post/${article.article_id})\n`;
	});
	return JSON.stringify(postData);
}

// send
function sendNews(data, cb) {
	const req = https.request(
		webhook,
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
					cb(JSON.stringify(str));
			})
	})
	req.write(data);
	req.end();
}


// open
function openNews(data, cb) {
	const req = https.request(
		"https://apinew.juejin.im/recommend_api/v1/article/recommend_cate_feed",
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				"referer": "https://juejin.im/frontend?sort=newest",
				"origin": "https://juejin.im",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.41"
			},
		},
		(data) => {
			var str="";
			data.on("data", (chunk) => {
					str += chunk;
			})
			data.on("end", () => {
				try {
					const res = JSON.parse(str);
					if (res.err_msg === "success") {
						cb(res.data);
					} else {
						cb([]);
					}
				} catch (error) {
					cb([]);
					console.log(error)
				}
			})
	})
	req.write(data);
	req.end();
}