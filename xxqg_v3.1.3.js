importClass(android.database.sqlite.SQLiteDatabase);
/**
 * @Description: Auto.js xxqg-helper https://github.com/ivanwhaf/xxqg-helper
 * @version: 3.1.3
 * @Author: Ivan
 * @Date: 2020-6-10
 */

/********************************************数据库控制函数开始***********************************************/
/**
 * @description: 读取文章数据库
 * @param: title,date
 * @return: res
 */
function getLearnedArticle(title, date) {
    rtitle = title.replace("'", "''");
    var dbName = "list.db";
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
    var sql = "SELECT * FROM  learnedArticles WHERE title = '" + rtitle + "' AND date = '" + date + "'";
    var cursor = db.rawQuery(sql, null);
    var res = cursor.moveToFirst();
    cursor.close();
    db.close();
    return res;
}

/**
 * @description: 获取的文章题目写入数据库
 * @param: title,date
 * @return: res
 */
function insertLearnedArticle(title, date) {
    rtitle = title.replace("'", "''");
    var dbName = "list.db";
    var path = files.path(dbName);
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOt EXISTS learnedArticles(\
    title CHAR(253),\
    date CHAR(100)\
    );";
    // var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    var sql = "INSERT INTO learnedArticles VALUES ('" + rtitle + "','" + date + "')";
    db.execSQL(sql);
    db.close();
}

/********************************************数据库控制函数结束***********************************************/

var asub = 2; //订阅数
var aCount = 6;//文章默认学习篇数
var vCount = 6;//小视频默认学习个数
var cCount = 2;//收藏+分享+评论次数

var aTime = 70;//有效阅读一分钟1分*6
var vTime = 15;//每个小视频学习-15秒
var rTime = 370;//广播收听6分 * 60 = 360秒

var aCatlog = files.read("./article.txt");//文章学习类别，可自定义修改为“要闻”、“新思想”等

var myScores = {};//分数


/**
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds + randomNum(0, 500));//sleep函数参数单位为毫秒所以乘1000
}

/**
 * @description: 生成从minNum到maxNum的随机数
 * @param: minNum-较小的数
 * @param: maxNum-较大的数
 * @return: null
 */
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
} 

/**
 * @description: 文章学习计时(弹窗)函数
 * @param: n-文章标号 seconds-学习秒数
 * @return: null
 */
function article_timing(n, seconds) {
    seconds = seconds + randomNum(0, 10)
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
        sleep(1000);
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
        sleep(1000);
        console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
    }
}

/**
 * @description: 新闻联播小视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_news(n, seconds) {
    seconds = seconds + randomNum(0, 10)
    for (var i = 0; i < seconds; i++) {
        sleep(1000);
        while (!textContains("欢迎发表你的观点").exists())//如果离开了联播小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个新闻小视频界面，请重新返回视频");
            delay(2);
        }
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
        sleep(1000);
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
function articleStudy(x) {
    while (!desc("学习").exists());//等待加载出主页
    var listView = className("ListView");//获取文章ListView控件用于翻页
    if (x == 0) {
        desc("学习").click();//点击主页正下方的"学习"按钮
        delay(2);
        click(aCatlog);
    }
    delay(2);
    var zt_flag = false;//判断进入专题界面标志
    var fail = 0;//点击失败次数
    var date_string = getTodayDateString();//获取当天日期字符串
    for (var i = 0, t = 0; i < aCount;) {
        try {
            if ((id("general_card_title_id").findOnce(t).parent().parent().click() || id("general_card_title_id").findOnce(t).parent().parent().parent().click()) == true) {
                delay(5);
                // // delay(10); //等待加载出文章页面，后面判断是否进入了视频文章播放要用到
                //获取当前正在阅读的文章标题
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
                if (text("展开").exists()) {//如果存在“展开”则认为进入了文章栏中的视频界面需退出
                    console.warn("进入了视频界面，退出并进入下一篇文章!");
                    t++;
                    back();
                    if (rTime != 0) {
                        while (!desc("学习").exists());
                        console.info("因为广播被打断，重新收听广播...");
                        delay(0.5);
                        listenToRadio();//听电台广播
                        while (!desc("学习").exists());
                        desc("学习").click();
                    }
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
                var currentNewsTitle = ""
                if (id("xxqg-article-header").exists()) {
                    currentNewsTitle = id("xxqg-article-header").findOne().child(0).text(); // 最终解决办法
                } else if (textContains("来源").exists()) {
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
                t++;
            }
        } catch (e) {
            listView.scrollForward();
            t = 0;
            delay(1.5);
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
    for (var i = 0, t = 0; i < vCount;) {
        if ((click("中央广播电视总台", t) || click("央视网", t)) == true) {
            console.log("即将学习第" + (i + 1) + "个视频!");
            video_timing_news(i, vTime);//学习每个新闻联播小片段
            back();//返回联播频道界面
            while (!desc("学习").exists());//等待加载出主页
            delay(1);
            i++;
            t++;
            if (t >= 2) {//如果是平板等设备，请尝试修改i为合适值！
                listView.scrollForward();//翻页
                delay(2);
                t = 0;
            }
        }
        else {
            listView.scrollForward();//翻页
            delay(2);
            t = 0;
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
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        delay(1);
    }
    if (click("最近收听") == 0) {
        if (click("推荐收听") == 0) {
            click("正在收听");
        }
    }
    delay(2);
    if (id("btn_back").findOne().click() == 0) {
        delay(2);
        back();//返回电台界面
    }
    delay(2);
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
    while (!desc("学习").exists());//等待加载出主页
    desc("学习").click();
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
function getScores(i) {
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

    aCount = Math.ceil((12 - myScores["我要选读文章"]) / 2); //文章个数
    if (i == 1) {
        console.info("检查阅读文章是否满分！")
        aCount = 12 - myScores["我要选读文章"];
        if (aCount != 0) {
            console.log("还需要阅读：" + aCount.toString() + "篇！");
        } else {
            console.info("已满分！");
        }
        delay(1);
        back();
        delay(1);
        return;
    }
    if (aCount != 0) {
        aCount = aCount + randomNum(0, 1)
    }
    vCount = 6 - myScores["视听学习"];
    rTime = (6 - myScores["视听学习时长"]) * 60;
    asub = 2 - myScores["订阅"];
    sCount = 2 - myScores["分享"] * 2
    cCount = 1 - myScores["发表观点"]

    console.log('评论：' + cCount.toString() + '个')
    console.log('分享：' + sCount.toString() + '个')
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
@description: 停止广播
@param: null
@return: null
*/
function stopRadio() {
    console.log("停止收听广播！");
    click("电台");
    delay(1);
    click("听新闻广播");
    delay(2);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        delay(2)
    }
    if (click("正在收听") == 0) {
        click("最近收听");
    }
    delay(3);
    id("v_play").findOnce(0).click();
    delay(2)
    if (id("btn_back").findOne().click() == 0) {
        delay(2);
        back();
    }
}

/**
@description: 学习平台订阅
@param: null
@return: null
*/
function sub() {
    desc("学习").click();
    delay(2);
    click("订阅");
    delay(2);
    click("添加");
    delay(2);
    click("学习平台", 0); // text("学习平台").findOne().click() == click("学习平台", 0) 解决订阅问题
    delay(0.5)
    click("强国号", 0)
    let sublist = className("ListView").findOnce(0);
    var i = 0;
    while (i < asub) {
        let object = desc("订阅").find();
        if (!object.empty()) {
            object.forEach(function (currentValue) {
                if (currentValue && i < asub) {
                    let like = currentValue.parent()
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
            console.log("尝试订阅学习平台")
            back();
            delay(1);
            click("添加");
            delay(1);
            click("学习平台", 0);
            delay(2);
            let sublist = className("ListView").findOnce(1);
            while (i < asub) {
                let object = desc("订阅").find();
                if (!object.empty()) {
                    object.forEach(function (currentValue) {
                        if (currentValue && i < asub) {
                            let like = currentValue.parent()
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
                    back();
                    delay(2);
                    return;
                } else {
                    delay(1);
                    sublist.scrollForward();
                }
            }
        } else {
            delay(1);
            sublist.scrollForward();
        }
    }
    back();
    delay(2);
}

function main() {
    start_app();//启动app
    var path = files.path("list.db");
    var start = new Date().getTime();//程序开始时间
    getScores(0);//获取积分
    if (rTime != 0) {
        listenToRadio();//听电台广播
    }
    var r_start = new Date().getTime();//广播开始时间
    if (myScores['订阅'] != 2) {
        sub();//订阅
    }
    while (aCount != 0) {
        var x = 0;
        articleStudy(x);//学习文章，包含点赞、分享和评论
        console.info("等待十秒，然后确认文章是否已满分。");
        delay(10);
        getScores(1);
        x++;
        if (x > 2) {//尝试三次
            console.info("尝试3次未满分，暂时跳过。");
            break;
        }
    }
    var end = new Date().getTime();//广播结束时间
    var radio_time = (parseInt((end - r_start) / 1000));//广播已经收听的时间
    radio_timing(parseInt((end - r_start) / 1000), rTime - radio_time);//广播剩余需收听时间
    if (rTime != 0) {
        stopRadio();
    }
    if (myScores['本地频道'] != 1) {
        localChannel();//本地频道
    }
    if (vCount != 0) {
        videoStudy_news();//看视频
    }
    end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    files.copy(path, "/sdcard/Download/list.db");
    console.warn("自动备份已学文章列表到/sdcard/Download!!!");
}

module.exports = main;

