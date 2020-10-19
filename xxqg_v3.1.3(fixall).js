importClass(android.database.sqlite.SQLiteDatabase);

/**
 * @Description: Auto.js xxqg-helper (6+6)+(6+6)+(1+1+2)+6+6+1=41分
 * @version: 3.1.3
 * @Author: Ivan
 * @Date: 2020-6-10
 */

/**
 * 我要选读文章6+6：6篇，每篇学习1分钟
 * 视听学习6：360秒
 * 每日答题6：5道
 * 挑战答题6：5道以上
 * 分享2：2个
 * 发表观点1：1个
 * 收藏不再积分
 */
var aCount = 6;//文章默认学习篇数
var vCount = 6;//小视频默认学习个数
var cCount = 1;//评论次数
var sCount = 2;//分享次数

var aTime = 70;//有效阅读一分钟1分*6
var vTime = 15;//每个小视频学习-15秒
var rTime = 370;//广播收听6分 * 60 = 360秒

var commentText = ["支持党，支持国家！", "为实现中华民族伟大复兴而不懈奋斗！", "紧跟党走，毫不动摇！",
    "不忘初心，牢记使命", "努力奋斗，报效祖国！"];//评论内容，可自行修改，大于5个字便计分

var aCatlog = files.read("./article.txt");//文章学习类别，可自定义修改为“要闻”、“新思想”等

var asub = 2; //订阅数
var lCount = 1;//挑战答题轮数
var qCount = randomNum(5, 7);//挑战答题每轮答题数(5~7随机)
var myScores = {};//分数

var customize_flag = false;//自定义运行标志


var zCount = 2;//争上游答题轮数
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
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds + randomNum(0, 500));//sleep函数参数单位为毫秒所以乘1000
}

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
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    var listView = className("ListView");//获取文章ListView控件用于翻页
    if (x == 0) {
        id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
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
                delay(3);
                //获取当前正在阅读的文章标题
                let n = 0;
                while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
                {
                    delay(1);
                    console.warn("正在等待加载文章界面...");
                    if (n > 3)//等待超过3秒则认为进入了专题界面，退出进下一篇文章
                    {
                        console.warn("没找到评论框!该界面非文章界面!");
                        zt_flag = true;
                        break;
                    }
                    n++;
                }
                if (text("展开").exists())//如果存在“展开”则认为进入了文章栏中的视频界面需退出
                {
                    console.warn("进入了视频界面，退出并进入下一篇文章!");
                    t++;
                    back();
                    if (rTime != 0) {
                        while (!id("home_bottom_tab_button_work").exists());
                        console.info("因为广播被打断，重新收听广播...");
                        delay(0.5);
                        listenToRadio();//听电台广播
                        while (!id("home_bottom_tab_button_work").exists());
                        id("home_bottom_tab_button_work").findOne().click();
                    }
                    delay(1);
                    continue;
                }
                if (zt_flag == true)//进入专题页标志
                {
                    console.warn("进入了专题界面，退出并进下一篇文章!")
                    t++;
                    back();
                    delay(1);
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
                console.log("正在学习第" + (i + 1) + "篇文章...");
                fail = 0;//失败次数清0
                article_timing(i, aTime);
                if (sCount != 0)//分享2篇文章
                {
                    CollectAndShare(i);//分享 若运行到此报错请注释本行！
                    sCount--;
                }
                if (cCount != 0)//评论1次
                {
                    Comment(i);//评论
                    cCount--;
                }
                back();//返回主界面
                while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
                delay(1);
                i++;
                t++;//t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!}
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
 * @description: “百灵”小视频学习函数
 * @param: vCount,vTime
 * @return: null
 */
function videoStudy_bailing(vCount, vTime) {
    h = device.height;//屏幕高
    w = device.width;//屏幕宽
    x = (w / 3) * 2;//横坐标2分之3处
    h1 = (h / 6) * 5;//纵坐标6分之5处
    h2 = (h / 6);//纵坐标6分之1处

    click("百灵");
    delay(2);
    click("竖");
    delay(2);
    var a = className("FrameLayout").depth(23).findOnce(0);//根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
    a.click();
    //click((w/2)+random()*10,h/4);//坐标点击第一个视频
    delay(1);
    for (var i = 0; i < vCount; i++) {
        console.log("正在观看第" + (i + 1) + "个小视频");
        video_timing_bailing(i, vTime);//观看每个小视频
        if (i != vCount - 1) {
            swipe(x, h1, x, h2, 500);//往下翻（纵坐标从5/6处滑到1/6处）
        }
    }
    back();
    delay(2);
}

/**
 * @description:新闻联播小视频学习函数
 * @param: null
 * @return: null
 */
function videoStudy_news() {
    delay(1)
    id("home_bottom_tab_button_work").findOne().click();
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
            while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
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
 * @description: 收藏加分享函数  (收藏+分享)---1+1=2分
 * @param: i-文章标号
 * @return: null
 */
function CollectAndShare(i) {
    while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    console.log("正在进行第" + (i + 1) + "次分享...");

    var textOrder = text("欢迎发表你的观点").findOnce().drawingOrder();
    // var collectOrder = textOrder + 2;
    var shareOrder = textOrder + 3;
    // var collectIcon = className("ImageView").filter(function (iv) {
    //     return iv.drawingOrder() == collectOrder;
    // }).findOnce();

    var shareIcon = className("ImageView").filter(function (iv) {
        return iv.drawingOrder() == shareOrder;
    }).findOnce();

    //var collectIcon = classNameContains("ImageView").depth(10).findOnce(0);//右下角收藏按钮
    // collectIcon.click();//点击收藏
    // console.info("收藏成功!");
    // delay(1);

    //var shareIcon = classNameContains("ImageView").depth(10).findOnce(1);//右下角分享按钮
    shareIcon.click();//点击分享
    while (!textContains("分享到学习强").exists());//等待弹出分享选项界面
    delay(1);
    click("分享到学习强国");
    delay(2);
    console.info("分享成功!");
    back();//返回文章界面
    delay(1);

    // collectIcon.click();//再次点击，取消收藏
    // console.info("取消收藏!");
    // delay(1);
}

/**
 * @description: 评论函数---2分
 * @param: i-文章标号
 * @return: null
 */
function Comment(i) {
    while (!textContains("欢迎发表你的观点").exists())//如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    click("欢迎发表你的观点");//单击评论框
    console.log("正在进行第" + (i + 1) + "次评论...");
    delay(1);
    var num = random(0, commentText.length - 1)//随机数
    setText(commentText[num]);//输入评论内容
    delay(1);
    click("发布");//点击右上角发布按钮
    console.info("评论成功!");
    delay(2);
    click("删除");//删除该评论
    delay(2);
    click("确认");//确认删除
    console.info("评论删除成功!");
    delay(1);
}


/**
 * @description: 本地频道
 * @param: null
 * @return: null
 */
function localChannel() {
    delay(1)
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();
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
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
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
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app() {
     console.setPosition(0, device.height / 2);//部分华为手机console有bug请注释本行
    console.show();//部分华为手机console有bug请注释本行
    console.log("启动学习强国");
    if (!launchApp("学习强国")){//启动学习强国app
     console.error("找不到学习强国App!");
     return;
     }
    while (!id("home_bottom_tab_button_work").exists()) {//20201001 学习按钮文字属性由"学习"改为 "工作"，以下所有点击学习按钮加载主页均同步修改
     if(className("android.view.View").text("继续挑战").exists()){//双人对战 争上游结束页
      back(); delay(1); }
      if(className("android.view.View").text("开始对战").exists()){//双人对战开始页
      back(); delay(1); }
     if (className("android.widget.Button").text("退出").exists()){//双人对战退出房间
      className("android.widget.Button").text("退出").findOne().click();
      back(); delay(1); }                        
     if(className("android.view.View").text("开始比赛").exists()){//争上游答题开始页
      back(); delay(1); }   
     if(className("android.view.View").text("答题练习").exists()){//我要答题页
     back(); delay(1); }  
     if(id("more_text").exists()){//学习积分页
     back(); delay(1); }
     if(id("my_display_name").exists()){//我的主页
     back(); delay(1); }
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    console.log("等待加载出主页");
    delay(3);
    continue;/*break;exists(); back();*/
     }
    delay(1);
}


/*************************************************挑战答题部分******************************************************/
/**
 * @description: 判断题库是否存在
 * @param: null
 * @return: null
 */
function judge_tiku_existence() {
    var dbName = "tiku.db";//题库文件名
    var path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库！请将题库文件放置与js文件同一目录下再运行！");
        return false;
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOT EXISTS tikuNet(\
    question CHAR(253),\
    answer CHAR(100)\
    );";
    db.execSQL(createTable);
    return true;
}

/**
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question, table_name) {
    var dbName = "tiku.db";//题库文件名
    var path = files.path(dbName);

    var db = SQLiteDatabase.openOrCreateDatabase(path, null);

    sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '" + question + "%'"
    var cursor = db.rawQuery(sql, null);
    if (cursor.moveToFirst()) {
        var answer = cursor.getString(0);
        cursor.close();
        return answer;
    }
    else {
        console.error("题库中未找到答案");
        cursor.close();
        return '';
    }
}

/**
 * @description: 增加或更新数据库
 * @param: sql
 * @return: null
 */
function insertOrUpdate(sql) {
    var dbName = "tiku.db";
    var path = files.path(dbName);
    if (!files.exists(path)) {
        //files.createWithDirs(path);
        console.error("未找到题库!请将题库放置与js同一目录下");
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    db.execSQL(sql);
    db.close();
}

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 每次答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    if (conNum >= qCount)//答题次数足够退出
    {
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("今天答题次数已够，随机点击一个答案");
        listArray[i].child(0).click();//随意点击一个答案
        console.log("------------");
        return;
    }
    if (className("ListView").exists()) {
        var question = className("ListView").findOnce().parent().child(0).text();
        console.log((conNum + 1).toString() + ".题目：" + question);
    }
    else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击一个");
        listArray[i].child(0).click();//随意点击一个答案
        return;
    }

    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }

    question = question.replace(/\s/g, "");

    var options = [];//选项列表
    if (className("ListView").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    } else {
        console.error("答案获取失败!");
        return;
    }

    var answer = getAnswer(question, 'tiku');
    if (answer.length == 0) {//tiku表中没有则到tikuNet表中搜索答案
        answer = getAnswer(question, 'tikuNet');
    }

    console.info("答案：" + answer);

    if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        toastLog("answer from char=" + answer);
    }

    let hasClicked = false;
    let listArray = className("ListView").findOnce().children();//题目选项列表
    if (answer == "")//如果没找到答案
    {
        let i = random(0, listArray.length - 1);
        console.error("没有找到答案，随机点击一个");
        listArray[i].child(0).click();//随意点击一个答案
        hasClicked = true;
        console.log("------------");
    }
    else//如果找到了答案
    {
        listArray.forEach(item => {
            var listDescStr = item.child(0).child(1).text();
            if (listDescStr == answer) {
                item.child(0).click();//点击答案
                hasClicked = true;
                console.log("------------");
            }
        });
    }
    if (!hasClicked)//如果没有点击成功
    {
        console.error("未能成功点击，随机点击一个");
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
        console.log("------------");
    }
}


/**
 * @description: 挑战答题
 * @param: null
 * @return: null
 */
function challengeQuestion() {
    text("我的").click();
    while (!textContains("我要答题").exists());
    delay(1);
    click("我要答题");
    while (!text("每日答题").exists());
    delay(1);
    className("android.view.View").text("每日答题").findOne().parent().parent().child(10).click();
    console.log("开始挑战答题")
    delay(4);
    let conNum = 0;//连续答对的次数
    let lNum = 0;//轮数
    while (true) {
        delay(1)
        while (!className("RadioButton").exists()) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            delay(2);
        }
        challengeQuestionLoop(conNum);
        delay(randomNum(3, 6));
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {
            if (conNum >= qCount) {
                lNum++;
            }
            if (lNum >= lCount) {
                console.log("挑战答题结束！返回积分界面！");
                back(); delay(0.5);
                back(); delay(0.5);
                back(); delay(0.5);
                back(); delay(0.5);
                break;
            }
            else {
                console.log("出现错误，等5秒开始下一轮...")
                delay(3);//等待5秒才能开始下一轮
                back();
                //desc("结束本局").click();//有可能找不到结束本局字样所在页面控件，所以直接返回到上一层
                delay(2);
                text("再来一局").click()
                delay(4);
                if (conNum < 5) {
                    conNum = 0;
                }
            }
        }
        else//答对了
        {
            conNum++;
        }
    }
    conNum = 0;
}

/*************************************************每日答题部分***************************************************/

/**
 * @description: 获取填空题题目数组
 * @param: null
 * @return: questionArray
 */
function getFitbQuestion() {
    var questionCollections = className("EditText").findOnce().parent().parent();
    var questionArray = [];
    var findBlank = false;
    var blankCount = 0;
    var blankNumStr = "";
    var i = 0;
    questionCollections.children().forEach(item => {
        if (item.className() != "android.widget.EditText") {
            if (item.text() != "") {//题目段
                if (findBlank) {
                    blankNumStr = "|" + blankCount.toString();
                    questionArray.push(blankNumStr);
                    findBlank = false;
                }
                questionArray.push(item.text());
            }
            else {
                findBlank = true;
                blankCount = (className("EditText").findOnce(i).parent().childCount() - 1);
                i++;
            }
        }
    });
    return questionArray;
}


/**
 * @description: 获取选择题题目数组
 * @param: null
 * @return: questionArray
 */
function getChoiceQuestion() {
    var questionCollections = className("ListView").findOnce().parent().child(1);
    var questionArray = [];
    questionArray.push(questionCollections.text());
    return questionArray;
}


/**
 * @description: 获取提示字符串
 * @param: null
 * @return: tipsStr
 */
function getTipsStr() {
    var tipsStr = "";
    while (tipsStr == "") {
        if (text("查看提示").exists()) {
            var seeTips = text("查看提示").findOnce();
            seeTips.click();
            delay(1);
            click(device.width * 0.5, device.height * 0.41);
            delay(1);
            click(device.width * 0.5, device.height * 0.35);
        } else {
            console.error("未找到查看提示");
        }
        if (text("提示").exists()) {
            var tipsLine = text("提示").findOnce().parent();
            //获取提示内容
            var tipsView = tipsLine.parent().child(1).child(0);
            tipsStr = tipsView.text();
            //关闭提示
            tipsLine.child(1).click();
            break;
        }
        delay(1);
    }
    return tipsStr;
}


/**
 * @description: 从提示中获取填空题答案
 * @param: timu, tipsStr
 * @return: ansTips
 */
function getAnswerFromTips(timu, tipsStr) {
    var ansTips = "";
    for (var i = 1; i < timu.length - 1; i++) {
        if (timu[i].charAt(0) == "|") {
            var blankLen = timu[i].substring(1);
            var indexKey = tipsStr.indexOf(timu[i + 1]);
            var ansFind = tipsStr.substr(indexKey - blankLen, blankLen);
            ansTips += ansFind;
        }
    }
    return ansTips;
}

/**
 * @description: 根据提示点击选择题选项
 * @param: tipsStr
 * @return: clickStr
 */
function clickByTips(tipsStr) {
    var clickStr = "";
    var isFind = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOne().children();
        listArray.forEach(item => {
            var ansStr = item.child(0).child(2).text();
            if (tipsStr.indexOf(ansStr) >= 0) {
                item.child(0).click();
                clickStr += item.child(0).child(1).text().charAt(0);
                isFind = true;
            }
        });
        if (!isFind) { //没有找到 点击第一个
            listArray[0].child(0).click();
            clickStr += listArray[0].child(0).child(1).text().charAt(0);
        }
    }
    return clickStr;
}


/**
 * @description: 根据答案点击选择题选项
 * @param: answer
 * @return: null
 */
function clickByAnswer(answer) {
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOnce().children();
        listArray.forEach(item => {
            var listIndexStr = item.child(0).child(1).text().charAt(0);
            //单选答案为非ABCD
            var listDescStr = item.child(0).child(2).text();
            if (answer.indexOf(listIndexStr) >= 0 || answer == listDescStr) {
                item.child(0).click();
            }
        });
    }
}

/**
 * @description: 检查答案是否正确，并更新数据库
 * @param: question, ansTiku, answer
 * @return: null
 */
function checkAndUpdate(question, ansTiku, answer) {
    if (text("答案解析").exists()) {//答错了
        swipe(100, device.height - 100, 100, 100, 500);
        var nCout = 0
        while (nCout < 5) {
            if (textStartsWith("正确答案").exists()) {
                var correctAns = textStartsWith("正确答案").findOnce().text().substr(6);
                console.info("正确答案是：" + correctAns);
                if (ansTiku == "") { //题库为空则插入正确答案                
                    var sql = "INSERT INTO tiku VALUES ('" + question + "','" + correctAns + "','')";
                } else { //更新题库答案
                    var sql = "UPDATE tiku SET answer='" + correctAns + "' WHERE question LIKE '" + question + "'";
                }
                insertOrUpdate(sql);
                console.log("更新题库答案...");
                delay(1);
                break;
            } else {
                var clickPos = className("android.webkit.WebView").findOnce().child(2).child(0).child(1).bounds();
                click(clickPos.left + device.width * 0.13, clickPos.top + device.height * 0.1);
                console.error("未捕获正确答案，尝试修正");
            }
            nCout++;
        }
        if (className("Button").exists()) {
            className("Button").findOnce().click();
        } else {
            click(device.width * 0.85, device.height * 0.06);
        }
    } else { //正确后进入下一题，或者进入再来一局界面
        if (ansTiku == "" && answer != "") { //正确进入下一题，且题库答案为空              
            var sql = "INSERT INTO tiku VALUES ('" + question + "','" + answer + "','')";
            insertOrUpdate(sql);
            console.log("更新题库答案...");
        }
    }
}


/**
 * @description: 每日答题循环
 * @param: null
 * @return: null
 */
function dailyQuestionLoop() {
    if (textStartsWith("填空题").exists()) {
        var questionArray = getFitbQuestion();
    }
    else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        var questionArray = getChoiceQuestion();
    }

    var blankArray = [];
    var question = "";
    questionArray.forEach(item => {
        if (item != null && item.charAt(0) == "|") { //是空格数
            blankArray.push(item.substring(1));
        } else { //是题目段
            question += item;
        }
    });
    question = question.replace(/\s/g, "");
    console.log("题目：" + question);

    var ansTiku = getAnswer(question, 'tiku');

    if (ansTiku.length == 0) {//tiku表中没有则到tikuNet表中搜索答案
        ansTiku = getAnswer(question, 'tikuNet');
    }
    var answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");

    if (textStartsWith("填空题").exists()) {
        if (answer == "") {
            var tipsStr = getTipsStr();
            answer = getAnswerFromTips(questionArray, tipsStr);
            console.info("提示中的答案：" + answer);
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
        } else {
            console.info("答案：" + answer);
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            }
        }
    }
    else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        if (answer == "") {
            var tipsStr = getTipsStr();
            answer = clickByTips(tipsStr);
            console.info("提示中的答案：" + answer);
        } else {
            console.info("答案：" + ansTiku);
            clickByAnswer(answer);
        }
    }

    delay(0.5);

    if (text("确定").exists()) {
        text("确定").click();
        delay(0.5);
    } else if (text("下一题").exists()) {
        click("下一题");
        delay(0.5);
    } else if (text("完成").exists()) {
        text("完成").click();
        delay(0.5);
    } else {
        console.warn("未找到右上角确定按钮控件，根据坐标点击");
        click(device.width * 0.85, device.height * 0.06);//右上角确定按钮，根据自己手机实际修改
    }

    checkAndUpdate(question, ansTiku, answer);
    console.log("------------");
    delay(2);
}

/**
 * @description: 每日答题
 * @param: null
 * @return: null
 */
function dailyQuestion() {
    text("我的").click();
    while (!textContains("我要答题").exists());
    delay(1);
    click("我要答题");
    while (!text("每日答题").exists());
    delay(1);
    text("每日答题").click();
    console.log("开始每日答题")
    delay(2);
    let dlNum = 0;//每日答题轮数
    while (true) {
        delay(1)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            delay(2);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("每周答题结束！")
            text("返回").click(); delay(2);
            back();
            break;
        } else if (text("查看解析").exists()) {
            console.log("专项答题结束！")
            back(); delay(0.5);
            back(); delay(0.5);
            break;
        } else if (text("再来一组").exists()) {
            delay(2);
            dlNum++;
            if (!text("领取奖励已达今日上限").exists()) {
                text("再来一组").click();
                console.warn("第" + (dlNum + 1).toString() + "轮答题:");
                delay(1);
            }
            else {
                console.log("每日答题结束！")
                text("返回").click(); delay(2);
                back(); delay(1);
                back(); delay(1);
                break;
            }
        }
    }
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
    id("home_bottom_tab_button_work").findOne().click();
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

/*************************************************挑战 争上游 双人答题部分******************************************************/

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 争上游答题 20200928增加
 * @param: null
 * @return: null
 */
function zsyQuestion() {
    text("我的").click();
    if (!textContains("我要答题").exists()) {
      delay(1);
      click("我要答题");
    }else {
      (!text("我要答题").exists());
      delay(1);
      text("我要答题").click();
      }
    while (!text("答题练习").exists());//可用词：排行榜 答题竞赛
    delay(1);
    className("android.view.View").text("答题练习").findOne().parent().child(8).click();
    console.log("开始争上游答题")
    delay(2);
    if(className("android.view.View").text("开始比赛").exists()){
      className("android.view.View").text("开始比赛").findOne().click();
      }
     delay(10);     
    let zNum = 0;//轮数
    while (true) {
       if (textContains("距离答题结束").exists()){
        zsyQuestionLoop();
        }
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束        
        {console.info("争上游答题本局结束!");
         zNum++;
         //当天上限两次
         if (className("android.view.View").text("非积分奖励局").exists()){
         	console.info("今天已完成争上游答题!");
             zNum++;
         }//
          if (zNum >= zCount) {
            console.log("争上游答题结束，返回主页！");
                //回退4次返回主页 
            back(); delay(1);
            back(); delay(1);
            back(); delay(1);
            back(); delay(1);
            back();
            break;
            } else {
           console.log("即将开始下一轮...")
           delay(2);//等待2秒开始下一轮
           back();
          delay(1);
           back();
          while (!text("答题练习").exists());//排行榜 答题竞赛
          delay(1);
          className("android.view.View").text("答题练习").findOne().parent().child(8).click();
          console.log("开始争上游答题")
          delay(2);
          if(className("android.view.View").text("开始比赛").exists()){
            className("android.view.View").text("开始比赛").findOne().click();
            }                
           delay(10);
         } 
        console.warn("第" + zNum.toString() + "轮开始...")
        }
    }
}

/**
 * @description: 双人对战答题 20200928增加
 * @param: null
 * @return: null
 */
function SRQuestion() {
    text("我的").click();
    if (!textContains("我要答题").exists()) {
     delay(1);
     click("我要答题");
      } else {
     (!text("我要答题").exists());
    delay(1);
    text("我要答题").click();
     }
    while (!text("答题练习").exists());//可用词：排行榜 答题竞赛
    delay(1);
    className("android.view.View").text("答题练习").findOne().parent().child(9).click();
    console.log("开始双人对战")
    delay(2);
    if(className("android.view.View").text("邀请对手").exists()){
    className("android.view.View").text("邀请对手").findOne().parent().child(0).click();
      }
    delay(1);
    if(className("android.view.View").text("开始对战").exists()){
    className("android.view.View").text("开始对战").findOne().click();
      }     
     delay(10);     
    let zNum = 1;//轮数
    while (true) {
        zsyQuestionLoop();
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束
        { console.info("双人对战本局结束!");
          zNum++;
            if (zNum >= zCount) {
                console.log("双人对战结束！返回主页！");
                //回退4次返回主页 
                back(); delay(1);
                back(); delay(1);
                if (text("退出").exists()){
                className("android.widget.Button").text("退出").findOne().click();
                delay(1);
                }
                back(); delay(1);
                back(); delay(1);
                break;
            } else {
                console.log("即将开始下一轮...")
                back();
                delay(1);
                back();
                delay(1);
                if (textContains("退出").exists()){
                className("android.widget.Button").text("退出").findOne().click();
                delay(1);
                }
                while (!text("答题练习").exists());//排行榜 答题竞赛
                delay(1);
                console.log("开始双人对战")
                delay(2);
               if(className("android.view.View").text("邀请对手").exists()){
               className("android.view.View").text("邀请对手").findOne().parent().child(0).click();
                 }
               delay(1);
               if(className("android.view.View").text("开始对战").exists()){
               className("android.view.View").text("开始对战").findOne().click();
                }     
               delay(10);     
             } 
            console.warn("第" + zNum.toString() + "轮开始...")
        }
    }
}

/**
 * @description: 争上游答题 双人对战答题循环
 * @param: null
 * @return: null
 */
 var oldaquestion;//全局变量，定义旧题目，对比新题目用

function zsyQuestionLoop() {
   //delay(1);
  if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() || !textContains("距离答题结束").exists()){//不存在本局结束标志 继续挑战，则执行  
     console.info("答题结束!");
     return;
     } else {
          while(!className("RadioButton").exists());//@KB64ba建议使用while判断
          if (className("RadioButton").exists() || aquestion.length == 0) {
              var aquestion = className("ListView").findOnce().parent().child(0).text();
              var question = aquestion.substring(3); //争上游和对战题目前带1.2.3.需去除       
              //找题目，防出错      
             while (aquestion==oldaquestion || question==""){    
                 delay(0.8);                  
                 if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() || !textContains("距离答题结束").exists()){
                     console.info("答题结束!");
                     return;
                 }
             //找题目 
             aquestion = className("ListView").findOnce().parent().child(0).text();                         
             question = aquestion.substring(3);          
          }         
      //           
     }else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("随机点击");
        listArray[i].child(0).click();//随意点击一个答案
        return;
      } 
      var chutiIndex = question.lastIndexOf("出题单位");//@chongyadong添加
      if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
      }
      question = question.replace(/\s/g, "");
    var options = [];//选项列表
    if (className("RadioButton").exists()) {
        className("ListView").findOne().children().forEach(child => {
            var answer_q = child.child(0).child(1).text();
            options.push(answer_q);
        });
    } else {
        console.error("答案获取失败!");
        return;
    }
    //
    if (aquestion!=oldaquestion) {
        console.log(aquestion.substring(0,2) + "题目:" + question);
        var answer = getAnswer(question, 'tiku');
        if (answer.length == 0) {//tiku表中没有则到tikuNet表中搜索答案
            answer = getAnswer(question, 'tikuNet');
        }
        console.info("答案：" + answer);
        if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
            var indexAnsTiku = indexFromChar(answer.toUpperCase());
            answer = options[indexAnsTiku];
            toastLog("answer from char=" + answer);
        }
        let hasClicked = false;
        let listArray = className("ListView").findOnce().children();//题目选项列表
       /* if (answer == "")*/ //如果没找到答案
        if(answer.length ==0)
        {
            let i = random(0, listArray.length - 1);
            console.error("没有找到答案，随机点击");
            listArray[i].child(0).click();//随意点击一个答案
            hasClicked = true;
            console.log("---------------------------");
        }
        else//如果找到了答案
        {   //该部分问题: 选项带A.B.C.D.，题库返回答案不带，char返回答案带
            var answer_a = answer.substring(0,2);//定义answer_a，获取答案前两个字符对比A.B.C.D.应该不会出现E选项
            if(answer_a == "A." || answer_a == "B." || answer_a == "C." || answer_a =="D."){
                listArray.forEach(item => {
                var listDescStrb = item.child(0).child(1).text();
                if (listDescStrb == answer) {
                    item.child(0).click();//点击答案
                    hasClicked = true;
                    console.log("---------------------------");
                 }
               });
            }else{
            listArray.forEach(item => {
                var listDescStra = item.child(0).child(1).text();
                var listDescStrb = listDescStra.substring(3);//选项去除A.B.C.D.再与answer对比
                if (listDescStrb == answer) {
                    item.child(0).click();//点击答案
                    hasClicked = true;
                    console.log("---------------------------");
                 }
               });
            }
        }
        if (!hasClicked)//如果没有点击成功
        {
            console.error("未能成功点击，随机点击");
            let i = random(0, listArray.length - 1);
            listArray[i].child(0).click();//随意点击一个答案
            console.log("---------------------------");
        }
    }
    //旧题目
    oldaquestion=aquestion; 
    delay(1);	
  }
}
//争上游部分

function main() {
	if (!judge_tiku_existence()) {//题库不存在则退出
        return;
    }
	auto.waitFor();//等待获取无障碍辅助权限
    start_app();//启动app
    var path = files.path("list.db");
    var start = new Date().getTime();//程序开始时间

    getScores();//获取积分
    if (rTime != 0) {
        listenToRadio();//听电台广播
    }
    var r_start = new Date().getTime();//广播开始时间
    if (myScores['订阅'] != 2) {
        sub();//订阅
    }
    if (myScores['挑战答题'] != 6) {
        challengeQuestion();//挑战答题
    }
    if (myScores['每日答题'] != 5) {
        dailyQuestion();//每日答题
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
	//增加双人对战和争上游答题
	if (myScores["双人对战"] < 1) {
        SRQuestion();//双人对战
    }  
	if (myScores["争上游答题"] < 2) {
        zsyQuestion();//争上游答题
    }
	//增加双人对战和争上游答题
    end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    files.copy(path, "/sdcard/Download/list.db");
    console.warn("自动备份已学文章列表到/sdcard/Download!!!");
}
//main()
module.exports = main;