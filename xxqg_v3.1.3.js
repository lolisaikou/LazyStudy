importClass(android.database.sqlite.SQLiteDatabase);
/**
 * @Description: Auto.js xxqg-helper https://github.com/ivanwhaf/xxqg-helper
 * @version: 3.1.3
 * @Author: Ivan
 * @Date: 2020-6-10
 */

/********************************************数据库控制函数开始***********************************************/
/**
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswerFromDB(question) {
    var dbName = "tiku.db";
    var path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
        return '';
    }

    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    sql = "SELECT answer FROM tiku WHERE question LIKE '" + question + "%'"
    var cursor = db.rawQuery(sql, null);
    if (cursor.moveToFirst()) {
        var answer = cursor.getString(0);
        cursor.close();
        return answer;
    } else {
        // console.error("题库中未找到答案");
        //    cursor.close();
        //    return '';
        console.error("题库中未找到答案,从tikuNet获取");
        cursor.close();
        var c1 = db.rawQuery("SELECT answer FROM tikuNet WHERE question LIKE '" + question + "%'", null);
        if (c1.moveToFirst()) {
            var a = c1.getString(0);
            c1.close();
            console.log("tikuNet答案：", a);
            return a;
        } else {
            console.log("tikuNet中未获取到答案");
            return '';
        }
    }
}

/**
 * @description: 增加或更新数据库
 * @param: title,date
 * @return: res
 */
function getLearnedArticle(title, date) {
    var dbName = "tiku.db";
    //文件路径
    var path = files.path(dbName);
    //确保文件存在
    if (!files.exists(path)) {
        // files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    //创建或打开数据库
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(500),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    // db.execSQL(cleanTable);
    var sql = "SELECT * FROM  learnedArticles WHERE title = '" + title + "' AND date = '" + date + "'";
    var cursor = db.rawQuery(sql, null);
    var res = cursor.moveToFirst();
    cursor.close();
    db.close();
    return res;
}

function insertLearnedArticle(title, date) {
    var dbName = "tiku.db";
    var path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(253),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    var sql = "INSERT INTO learnedArticles VALUES ('" + title + "','" + date + "')";
    db.execSQL(sql);
    db.close();
}

/********************************************数据库控制函数结束***********************************************/


var aCount = 6;//文章默认学习篇数
var vCount = 6;//小视频默认学习个数
var cCount = 2;//收藏+分享+评论次数

var aTime = 103;//每篇文章学习-103秒 103*7≈720秒=12分钟
var vTime = 15;//每个小视频学习-15秒
var rTime = 1080;//广播收听-18分钟

var aCatlog = "推荐"//文章学习类别，可自定义修改为“要闻”、“新思想”等

var myScores = {};//分数


/**
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds);//sleep函数参数单位为毫秒所以乘1000
}


/**
 * @description: 文章学习计时(弹窗)函数
 * @param: n-文章标号 seconds-学习秒数
 * @return: null
 */
function article_timing(n, seconds) {
    h = device.height;//屏幕高
    w = device.width;//屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    for (var i = 0; i < seconds; i++) {
        while (!textContains("欢迎发表你的观点").exists())//如果离开了文章界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "文章界面，请重新返回文章页面...");
            delay(2);
        }
        if (i % 5 == 0)//每5秒打印一次学习情况
        {
            console.info("第" + (n + 1) + "篇文章已经学习" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        delay(1);
        if (i % 10 == 0)//每10秒滑动一次，如果android版本<7.0请将此滑动代码删除
        {
            toast("这是防息屏toast,请忽视-。-");
            if (i <= seconds / 2) {
                swipe(x, h1, x, h2, 500);//向下滑动
            }
            else {
                swipe(x, h2, x, h1, 500);//向上滑动
            }
        }
    }
}

/**
 * @description: 视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_bailing(n, seconds) {
    for (var i = 0; i < seconds; i++) {
        while (!textContains("分享").exists())//如果离开了百灵小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个百灵小视频界面，请重新返回视频");
            delay(2);
        }
        delay(1);
        console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description: 新闻联播小视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_news(n, seconds) {
    for (var i = 0; i < seconds; i++) {
        delay(0.5)
        while (!textContains("欢迎发表你的观点").exists())//如果离开了联播小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个新闻小视频界面，请重新返回视频");
            delay(2);
        }
        delay(1);
        console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description: 广播学习计时(弹窗)函数
 * @param: r_time-已经收听的时间 seconds-学习秒数
 * @return: null
 */
function radio_timing(r_time, seconds) {
    for (var i = 0; i < seconds; i++) {
        delay(1);
        if (i % 5 == 0)//每5秒打印一次信息
        {
            console.info("广播已经收听" + (i + 1 + r_time) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        if (i % 15 == 0)//每15秒弹一次窗防止息屏
        {
            toast("这是防息屏弹窗，可忽略-. -");
        }
    }
}

/**
 * @description: 日期转字符串函数
 * @param: y,m,d 日期数字 2019 1 1
 * @return: s 日期字符串 "2019-xx-xx"
 */
function dateToString(y, m, d) {
    var year = y.toString();
    if ((m + 1) < 10) {
        var month = "0" + (m + 1).toString();
    }
    else {
        var month = (m + 1).toString();
    }
    if (d < 10) {
        var day = "0" + d.toString();
    }
    else {
        var day = d.toString();
    }
    var s = year + "-" + month + "-" + day;//年-月-日
    return s;
}

/**
 * @description: 获取当天日期字符串函数
 * @param: null
 * @return: s 日期字符串 "2019-xx-xx"
 */
function getTodayDateString() {
    var date = new Date();
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();

    var s = dateToString(y, m, d);//年-月-日
    return s
}

/**
 * @description: 获取昨天日期字符串函数
 * @param: null
 * @return: s 日期字符串 "2019-xx-xx"
 */
function getYestardayDateString() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var y = date.getFullYear();
    var m = date.getMonth();
    var d = date.getDate();
    var s = dateToString(y, m, d);//年-月-日
    return s
}

/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function articleStudy() {
    while (!desc("学习").exists());//等待加载出主页
    desc("学习").click();//点击主页正下方的"学习"按钮
    delay(2);
    var listView = className("ListView");//获取文章ListView控件用于翻页
    click(aCatlog);
    delay(2);
    var zt_flag = false;//判断进入专题界面标志
    var fail = 0;//点击失败次数
    var date_string = getTodayDateString();//获取当天日期字符串
    for (var i = 0, t = 0; i < aCount;) {
        if (click(date_string, t) == true) {//如果点击成功则进入文章页面,不成功意味着本页已经到底,要翻页
            delay(5);
            // // delay(10); //等待加载出文章页面，后面判断是否进入了视频文章播放要用到
            //获取当前正在阅读的文章标题
            var currentNewsTitle = ""
            if (textContains("来源").exists()) { // 有时无法获取到 来源
                currentNewsTitle = textContains("来源").findOne().parent().children()[0].text();
            } else if (textContains("作者").exists()) {
                currentNewsTitle = textContains("作者").findOne().parent().children()[0].text();
            } else if (descContains("来源").exists()) {
                currentNewsTitle = descContains("来源").findOne().parent().children()[0].desc();
            } else if (descContains("作者").exists()) {
                currentNewsTitle = descContains("作者").findOne().parent().children()[0].desc();
            } else {
                console.log("无法定位文章标题,即将退出并阅读下一篇")
                t++;
                back();
                delay(2);
                continue;
            }
            if (currentNewsTitle == "") {
                console.log("标题为空,即将退出并阅读下一篇")
                t++;
                back();
                delay(2);
                continue;
            }
            var flag = getLearnedArticle(currentNewsTitle, date_string);
            if (flag) {
                //已经存在，表明阅读过了
                console.info("该文章已经阅读过，即将退出并阅读下一篇");
                t++;
                back();
                delay(2);
                continue;
            } else {
                //没阅读过，添加到数据库
                insertLearnedArticle(currentNewsTitle, date_string);
            }
            let n = 0;
            while (!textContains("欢迎发表你的观点").exists()) {//如果没有找到评论框则认为没有进入文章界面，一直等待
                delay(2);
                console.warn("正在等待加载文章界面...");
                if (n > 3) {//等待超过3秒则认为进入了专题界面，退出进下一篇文章
                    console.warn("没找到评论框!该界面非文章界面!");
                    zt_flag = true;
                    break;
                }
                n++;
            }
            if (desc("展开").exists()) {//如果存在“展开”则认为进入了文章栏中的视频界面需退出
                console.warn("进入了视频界面，即将退出并进下一篇文章!");
                t++;
                back();
                delay(2);
                if (myScores['视听学习时长'] != 6) {
                    click("电台");
                    delay(1);
                    click("最近收听");
                    console.log("因为广播被打断，正在重新收听广播...");
                    delay(2);
                    back();
                }
                while (!desc("学习").exists());
                desc("学习").click();
                delay(2);
                continue;
            }
            if (zt_flag == true) {//进入专题页标志
                console.warn("进入了专题界面，即将退出并进下一篇文章!");
                t++;
                back();
                delay(2);
                zt_flag = false;
                continue;
            }
            console.log("正在学习第" + (i + 1) + "篇文章,标题：", currentNewsTitle);
            fail = 0;//失败次数清0
            //开始循环进行文章学习
            article_timing(i, aTime);
            delay(2);
            back();//返回主界面
            while (!desc("学习").exists());//等待加载出主页
            delay(2);
            i++;
            t++;//t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
        } else {
            // if (i == 0){//如果第一次点击就没点击成功则认为首页无当天文章
            //     date_string = getYestardayDateString();
            //     console.warn("首页没有找到当天文章，即将学习昨日新闻!");
            //     continue;
            // }
            if (fail >= aCount) {//连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
                date_string = getYestardayDateString();
                console.warn("没有找到当天文章，即将学习昨日新闻!");
                continue;
            }
            if (!textContains(date_string).exists()) {//当前页面当天新闻
                fail++;//失败次数加一
            }
            listView.scrollForward();//向下滑动(翻页)
            t = 0;
            delay(2);
        }
    }

}

/**
 * @description:新闻联播小视频学习函数
 * @param: null
 * @return: null
 */
function videoStudy_news() {
    delay(1)
    desc("学习").click();
    delay(2)
    click("电视台");
    delay(1)
    click("联播频道");
    delay(2);
    var listView = className("ListView");//获取listView视频列表控件用于翻页
    let s = "中央广播电视总台";
    if (!textContains("中央广播电视总台")) {
        s = "央视网";
    }
    for (var i = 0, t = 1; i < vCount;) {
        if (click(s, t) == true) {
            console.log("即将学习第" + (i + 1) + "个视频!");
            video_timing_news(i, vTime);//学习每个新闻联播小片段
            back();//返回联播频道界面
            while (!desc("学习").exists());//等待加载出主页
            delay(1);
            i++;
            t++;
            if (i == 3) {//如果是平板等设备，请尝试修改i为合适值！
                listView.scrollForward();//翻页
                delay(2);
                t = 2;
            }
        }
        else {
            listView.scrollForward();//翻页
            delay(2);
            t = 3;
        }
    }
}


/**
 * @description: 听“电台”新闻广播函数  (视听学习+视听学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function listenToRadio() {
    click("电台");
    delay(1);
    click("听新闻广播");
    delay(2);
    if (textContains("最近收听").exists()) {
        click("最近收听");
        console.log("正在收听广播...");
        delay(1);
        back();//返回电台界面
        return;
    }
    if (textContains("推荐收听").exists()) {
        click("推荐收听");
        console.log("正在收听广播...");
        delay(1);
        back();//返回电台界面
    }
}



/**
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app() {
    console.setPosition(0, device.height / 2);//部分华为手机console有bug请注释本行
    console.show();//部分华为手机console有bug请注释本行
    console.log("正在启动app...");
    if (!launchApp("学习强国"))//启动学习强国app
    {
        console.error("找不到学习强国App!");
        return;
    }
    while (!desc("学习").exists()) {
        console.log("正在等待加载出主页");
        delay(1);
    }
    delay(1);
}


/**
 * @description: 本地频道
 * @param: null
 * @return: null
 */
function localChannel() {
    delay(1)
    desc("学习").click();
    while (!desc("学习").exists());//等待加载出主页
    console.log("点击本地频道");
    if (text("新思想").exists()) {
        text("新思想").findOne().parent().parent().child(3).click();
        delay(3);
        className("android.support.v7.widget.RecyclerView").findOne().child(2).click();
        delay(2);
        console.log("返回主界面");
        back();
        text("新思想").findOne().parent().parent().child(0).click();
    } else {
        console.log("请手动点击本地频道！");
    }
}

/**
 * @description: 获取积分
 * @param: null
 * @return: null
 */
function getScores() {
    while (!desc("学习").exists());//等待加载出主页
    console.log("正在获取积分...");
    while (!text("积分明细").exists()) {
        if (id("comm_head_xuexi_score").exists()) {
            id("comm_head_xuexi_score").findOnce().click();
        } else if (text("积分").exists()) {
            text("积分").findOnce().parent().child(1).click();
        }
        delay(2);
    }

    let err = false;
    while (!err) {
        try {
            className("android.widget.ListView").findOnce().children().forEach(item => {
                let name = item.child(0).child(0).text();
                let str = item.child(2).text().split("/");
                let score = str[0].match(/[0-9][0-9]*/g);
                myScores[name] = score;
            });
            err = true;
        } catch (e) {
            console.log(e);
        }
    }
    console.log(myScores);

    aCount = 6 - myScores["阅读文章"];
    aTime = parseInt((6 - myScores["文章学习时长"]) * 120 / aCount) + 10;
    vCount = 6 - myScores["视听学习"];
    rTime = (6 - myScores["视听学习时长"]) * 180;
    asub = 2 - myScores["订阅"];

    console.log('订阅：' + asub.toString() + '个')
    console.log('剩余文章：' + aCount.toString() + '篇')
    console.log('剩余每篇文章学习时长：' + aTime.toString() + '秒')
    console.log('剩余视频：' + vCount.toString() + '个')
    console.log('剩视听学习时长：' + rTime.toString() + '秒')

    delay(1);
    back();
    delay(1);
}

/**
@description: 学习平台订阅
@param: null
@return: null
*/
function sub() {
    desc("学习").click();
    delay(2);
    h = device.height;//屏幕高
    w = device.width;//屏幕宽
    x = (w / 3) * 2;//横坐标2分之3处
    h1 = (h / 6) * 5;//纵坐标6分之5处
    h2 = (h / 6);//纵坐标6分之1处
    click("订阅");
    delay(2);
    click("添加");
    delay(2);
    var i = 0;
    while (i < 2) {
        var object = desc("订阅").find();
        if (!object.empty()) {
            // 遍历点赞图标
            object.forEach(function (currentValue, index) {
                // currentValue:点赞按钮           
                if (currentValue && i < 2) {
                    var like = currentValue.parent()
                    if (like.click()) {
                        console.log("订阅成功");
                        i++;
                        delay(2);
                    } else {
                        console.error("订阅失败");
                    }
                }
            })
        } else if (text("你已经看到我的底线了").exists()) {
            click("学习平台", 0)
            console.log("没有可订阅的强国号了，尝试订阅学习平台。");
            delay(2);
            if (!object.empty()) {
                // 遍历点赞图标
                object.forEach(function (currentValue) {
                    // currentValue:点赞按钮           
                    if (currentValue && i < 2) {
                        var like = currentValue.parent()
                        if (like.click()) {
                            console.log("订阅成功");
                            i++;
                            delay(2);
                        } else {
                            console.error("订阅失败");
                        }
                    }
                })
            } else if (text("你已经看到我的底线了").exists()) {
                console.log("没有可订阅的强国号了,退出!!!")
                break;
            } else {
                swipe(x, h1, x, h2, 500);
                delay(0.5);
            }
        }
        else {
            swipe(x, h1, x, h2, 500);
            delay(0.5);
        }
    }
    back();
    delay(2);
}

//主函数
function main() {
    start_app();//启动app
    var path = files.path("tiku.db");
    var start = new Date().getTime();//程序开始时间
    getScores();//获取积分
    if (myScores['订阅'] != 2) {
        sub();//订阅
    }
    if (myScores['本地频道'] != 1) {
        localChannel();//本地频道
    }
    if (rTime != 0) {
        listenToRadio();//听电台广播
    }
    if (vCount != 0) {
        videoStudy_news();//看视频
    }
    var r_start = new Date().getTime();//广播开始时间
    articleStudy();//学习文章，包含点赞、分享和评论
    if (rTime != 0) {
        listenToRadio();//继续听电台
    }
    var end = new Date().getTime();//广播结束时间
    var radio_time = (parseInt((end - r_start) / 1000));//广播已经收听的时间
    radio_timing(parseInt((end - r_start) / 1000), rTime - radio_time);//广播剩余需收听时间
    end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    files.copy(path, "/sdcard/Download/tiku.db");
    console.warn("自动备份题库到/sdcard/Download!!!");
}

module.exports = main;

