const Feed = require('rss-to-json');

const getKUNews = () => {

    return new Promise((resolve, reject) => {

        const url = 'http://www.ku.edu.np/news/rss.php?blogId=1&profile=rss20';
        Feed.load(url, (error, rss) => {
            if (error) 
                reject("Couldn't connect to the server.\nPlease try again later");

            /* {
                title,
                description,
                url,
                created
            } */
                
            
            let body = rss.items.map((res) => {
                let date = new Date(res.created);
                res.created = date.toString("MMM dd").substring(0, 15);
                return res;
            }).splice(0, 4);


            let payload = [];
            body.forEach((news) => {
                payload.push({
                    title: news.title,
                    subtitle: news.created,
                    url: news.url,
                    img_url: "https://imgur.com/R5WKv1E"
                })
            });

            resolve(body);            
            
        });
    });
}

module.exports = {
    getKUNews
}

if (require.main == module) {
    getKUNews()
    .then((data) => {
        console.log(JSON.stringify(data, null, 4));
    })
}