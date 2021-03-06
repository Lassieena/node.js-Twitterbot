'use strict';

const Twitter = require('twitter');
const cron = require('cron').CronJob;
require('date-utils');

const client = new Twitter({
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_API_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});



let checkedTweets = [];

function getHomeTimeLine() {
    client.get('statuses/home_timeline', {}, function (error, tweets, response) {
        if (error) console.log(error);

        // 初回起動時は取得するだけで終了
        if (checkedTweets.length === 0) {
            tweets.forEach(function (homeTimeLineTweet, key) {
                checkedTweets.push(homeTimeLineTweet); // 配列に追加
            });

            return;
        }

        const newTweets = [];
        tweets.forEach(function (homeTimeLineTweet, key) {
            if (isCheckedTweet(homeTimeLineTweet) === false) {
                responseHomeTimeLine(homeTimeLineTweet);
                newTweets.push(homeTimeLineTweet); // 新しいツイートを追加
            }
        });

        // 調査済みリストに追加と、千個を超えていたら削除
        checkedTweets = newTweets.concat(checkedTweets); // 配列の連結
        if (checkedTweets.length > 1000) checkedTweets.length = 1000; // 古い要素を消して要素数を1000個にする。
    });
}

function isCheckedTweet(homeTimeLineTweet) {
    // ボット自身のツイートは無視する。
    if (homeTimeLineTweet.user.screen_name === '@bot87143630') {
        return true;
    }

    for (let checkedTweet of checkedTweets) {
        // 同内容を連続投稿をするアカウントがあるため、一度でも返信した内容は返信しない仕様にしています。
        if (checkedTweet.id_str === homeTimeLineTweet.id_str || checkedTweet.text === homeTimeLineTweet.text) {
            return true;
        }
    }

    return false;
}


const responses = ['何言ってんだ？', '頭大丈夫？', '人として終わってるよ？', 'そうだよ！', 'マ、マジかよ…'];

function responseHomeTimeLine(homeTimeLineTweet) {
    if (homeTimeLineTweet.user.screen_name === 'Lassieina') {
        const tweetMessage = '@' + homeTimeLineTweet.user.screen_name + '「' + homeTimeLineTweet.text + '」 ' + responses[Math.floor(Math.random() * responses.length)];
        client.post('statuses/update', {
                status: tweetMessage,
                in_reply_to_status_id: homeTimeLineTweet.id_str
            })
            .then((tweet) => {
                console.log('tweetOK');
            })
            .catch((error) => {
                throw error;
            });
    }
}

const randa = Math.floor(Math.random() * 50);
var date = require('fs').readFileSync('picture/img'+ randa + '.jpg');
function newtweettext() {
    client.post('media/upload', {
        media: date
    }, 
    function(error, media, response) {
        console.log(media);
    
    const dateStr = new Date().toFormat("YYYY/MM/DD/ HH24:MI");
    var status = {
        status: dateStr,
        media_ids: media.media_id_string 
      }
        client.post('statuses/update', status, 
        function(error, tweet, response) {
            if (!error) {
              console.log(tweet);
            }
          });
        });
    }
const CronJob = new cron({
    cronTime: '00 00 21 * * 0-6',
    start: true,
    onTick: function () {
        newtweettext();
    }
});
newtweettext();

const stream = client.stream('statuses/filter', {
    track: '@bot87143630'
});
stream.on('data', function (tweet) {
    console.log(tweet.text);
    const tweetMessage = '@' + tweet.user.screen_name + 'クソリプ乙';
    client.post('statuses/update', {
            status: tweetMessage,
            in_reply_to_status_id: tweet.id_str
        })
        .then((tweet) => {
            console.log(tweet);
        })
        .catch((error) => {
            throw error;
        });

});
    stream.on('error', function (error) {
        throw error;
    });
