const getKUNews = () => {

    return new Promise((resolve, reject) => {

        const url = 'http://www.ku.edu.np/news/rss.php?blogId=1&profile=rss20';
        Feed.load(url, (error, rss) => {
            if (error) 
                reject("Couldn't connect to the server.\nPlease try again later");

            // Ya samma news aayo
            // Aba news ko data lai modify garne halka

            // news aauda chei esto hunchha
            // [{}, {}, {}, {}]
            // News object haru ko array


            let body = rss.items.map((res) => {
                let date = new Date(res.created);
                res.created = date.toString("MMM dd").substring(0, 15);
                delete res.link;
                return res;
            }).splice(0, 4);

            // Ya dekhi chei generic message ko lagi milaune

            let payload = [];
            body.forEach((news) => {
                payload.push({
                    title: news.title,
                    subtitle: news.created,
                    url: news.url,
                    img_url: "https://imgur.com/R5WKv1E"
                })
            });
            
            resolve(body)
        });
    });
}

module.exports = {
    getKUNews
}