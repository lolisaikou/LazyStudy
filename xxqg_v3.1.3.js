importClass(android.database.sqlite.SQLiteDatabase);
auto.waitFor(); //等待获取无障碍辅助权限

//检查截图权限
if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
}

/**
 * @Description: Auto.js xxqg-helper (6+6)+(6+6)+(1+1+2)+6+6+1=41分
 * @version: 3.1.3
 * @Author: Ivan
 * @Date: 2020-6-10
 */

var customize_flag = false; //自定义运行标志
var asub = 2; //订阅数
var aCount = 6; //文章默认学习篇数
var vCount = 6; //小视频默认学习个数
var sCount = 2; //分享次数
var cCount = 1; //评论次数

var aTime = 10; //每篇文章学习10秒
var pTime = 360; //文章时长
var vTime = 10 //每个小视频学习10秒
var rTime = 360; //视频时长

var commentText = ["支持党，支持国家！", "为实现中华民族伟大复兴而不懈奋斗！", "紧跟党走，毫不动摇！",
    "不忘初心，牢记使命", "努力奋斗，报效祖国！"
]; //评论内容，可自行修改，大于5个字便计分

var aCatlog = "推荐" //文章学习类别，可自定义修改为“要闻”、“新思想”等

var myScores = []; //分数数组及初始化

myScores['登录'] = 0;
myScores['阅读文章'] = 0;
myScores['文章时长'] = 0;
myScores['视听学习'] = 0;
myScores['视听学习时长'] = 0;
myScores['每日答题'] = 0;
myScores['每周答题'] = 0;
myScores['专项答题'] = 0;
myScores['挑战答题'] = 0;
myScores['订阅'] = 0;
myScores['分享'] = 0;
myScores['发表观点'] = 0;
myScores['本地频道'] = 0;

/**
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds + random(0, 1000)); //sleep函数参数单位为毫秒所以乘1000
}


/**
 * @description: 文章学习计时(弹窗)函数
 * @param: n-文章标号 seconds-学习秒数
 * @return: null
 */
function article_timing(n, seconds) {
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2;
    h1 = (h / 6) * 5;
    h2 = (h / 6);
    for (var i = 0; i < seconds; i++) {
        while (!textContains("欢迎发表你的观点").exists()) //如果离开了文章界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "文章界面，请重新返回文章页面...");
            delay(2);
        }
        if (i % 5 == 0) //每5秒打印一次学习情况
        {
            console.info("第" + (n + 1) + "篇文章已经学习" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        delay(1);
        if (i % 10 == 0) //每10秒滑动一次，如果android版本<7.0请将此滑动代码删除
        {
            toast("这是防息屏toast,请忽视-。-");
            if (i <= seconds / 2) {
                swipe(x, h1, x, h2, 500); //向下滑动
            } else {
                swipe(x, h2, x, h1, 500); //向上滑动
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
        while (!textContains("分享").exists()) //如果离开了百灵小视频界面则一直等待
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
        while (!textContains("欢迎发表你的观点").exists()) //如果离开了联播小视频界面则一直等待
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
        if (i % 5 == 0) //每5秒打印一次信息
        {
            console.info("广播已经收听" + (i + 1 + r_time) + "秒,剩余" + (seconds - i - 1) + "秒!");
        }
        if (i % 15 == 0) //每15秒弹一次窗防止息屏
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
    } else {
        var month = (m + 1).toString();
    }
    if (d < 10) {
        var day = "0" + d.toString();
    } else {
        var day = d.toString();
    }
    var s = year + "-" + month + "-" + day; //年-月-日
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

    var s = dateToString(y, m, d); //年-月-日
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
    var s = dateToString(y, m, d); //年-月-日
    return s
}

/**
 * @description: 文章学习函数  (阅读文章+文章学习时长)---6+6=12分
 * @param: null
 * @return: null
 */
function articleStudy() {
    while (!desc("学习").exists()); //等待加载出主页
    desc("学习").click(); //点击主页正下方的"学习"按钮
    delay(2);
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    click(aCatlog);
    delay(2);
    var currentNewsTitle = "";
    var fail = 0; //点击失败次数
    var date_string = getTodayDateString(); //获取当天日期字符串

    for (var i = 0, t = 0; i < aCount;) {
        var art_obj = text(date_string).findOnce(t);
        //console.info(art_obj);
        if ((art_obj != null) && (art_obj.parent().childCount() == 4)) {
            t++; //t为实际查找的文章控件在当前布局中的标号,和i不同,勿改动!
            if ((art_obj.parent().child(3).text() == "播报") && (art_obj.parent().child(0).text() != currentNewsTitle)) //如果播报存在就进入文章正文
            {
                currentNewsTitle = art_obj.parent().child(0).text();
                log(currentNewsTitle);
                art_obj.parent().click();
                delay(1);

                if (checkCol() != null) {
                    console.info("当前文章已收藏阅读过");
                    back();
                    continue;
                }

                console.log("正在学习第" + (i + 1) + "篇文章...");
                fail = 0; //失败次数清0
                article_timing(i, aTime);
                pTime = pTime - aTime;
                Collect(); //* 以收藏来标记文章已读，避免重复阅读
                //分享文章
                if (sCount != 0) {
                    Share(sCount); //分享
                    sCount = 0;

                }
                //评论文章
                if (cCount != 0) {
                    Comment(cCount); //评论
                    cCount = 0;
                }

                back(); //返回主界面
                while (!desc("学习").exists()); //等待加载出主页
                delay(1);
                i++;

            } else { //判断非目标文章
                if (t > 5) {
                    listView.scrollForward(); //向下滑动(翻页
                    log("……翻页……");
                    t = 0;
                    delay(1.5);
                }
            }
        } else {
            if (fail > 3) //连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
            {
                date_string = getYestardayDateString();
                fail = 0;
                console.warn("没有找到当天文章，即将学习昨日新闻!");
                continue;
            }
            if (!textContains(date_string).exists()) //当前页面当天新闻
            {
                fail++; //失败次数加一
            }
            listView.scrollForward(); //向下滑动(翻页
            log("……翻页……");
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
    h = device.height; //屏幕高
    w = device.width; //屏幕宽
    x = (w / 3) * 2; //横坐标2分之3处
    h1 = (h / 6) * 5; //纵坐标6分之5处
    h2 = (h / 6); //纵坐标6分之1处

    click("百灵");
    delay(2);
    click("竖");
    delay(2);
    var a = className("FrameLayout").depth(23).findOnce(0); //根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
    a.click();
    //click((w/2)+random()*10,h/4);//坐标点击第一个视频
    delay(1);
    for (var i = 0; i < vCount; i++) {
        console.log("正在观看第" + (i + 1) + "个小视频");
        video_timing_bailing(i, vTime); //观看每个小视频
        if (i != vCount - 1) {
            swipe(x, h1, x, h2, 500); //往下翻（纵坐标从5/6处滑到1/6处）
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
    while (!desc("学习").exists()); //等待加载出主页
    console.info("开始进入视频学习…");
    click("电视台");
    delay(1)
    click("联播频道");
    delay(2);
    var currentNewsTitle = "";
    var listView = className("ListView"); //获取listView视频列表控件用于翻页
    let s = "中央广播电视总台";
    if (!textContains("中央广播电视总台")) {
        s = "央视网";
    }
    for (var i = 0, t = 1; i < vCount;) {
        while (!desc("学习").exists());
        delay(0.5);
        var news_obj = text(s).findOnce(t);
        //console.info(art_obj);
        if (news_obj != null) {
            t++; //t为实际查找的文章控件在当前布局中的标号,和i不同,勿改动!
            if ((news_obj.parent().child(0).text() != currentNewsTitle) && (news_obj.parent().child(0).text() != s)) { //如果播报存在就进入文章正文

                currentNewsTitle = news_obj.parent().child(0).text();
                log(currentNewsTitle);
                news_obj.parent().click();
                delay(1);

                if (text("继续播放").exists()) {
                    click("继续播放");
                }

                if (!checkAndCollect()) {
                    back();
                    continue;
                }

                console.log("即将学习第" + (i + 1) + "个视频!");
                delay(1);
                video_timing_news(i, vTime); //学习每个新闻联播小片段
                rTime = rTime - vTime;
                i++;
                back(); //返回联播频道界面
                while (!desc("学习").exists()); //等待加载出主页
                delay(1);
            }
        } else {
            listView.scrollForward(); //翻页
            log("……翻页……");
            delay(2);
            t = 0;
        }
        if (text("你已经看到我的底线了").exists()) {
            log("主人，你已经看到我的底线了…");
            console.info("退出观看新闻联播视频!");
            vCount = vCount - i;
            return false;
        }
    }
    console.info("已完成视频学习任务!");
    return true;
}


/**
 * @description: 阅读文章函数  
 * @param: null
 * @return: null
 */
function readToPage() {
    while (!desc("学习").exists()); //等待加载出主页
    desc("学习").click(); //点击主页正下方的"学习"按钮
    delay(1);
    click("推荐");
    delay(1);
    var listView = className("ListView"); //获取文章ListView控件用于翻页
    while (!textContains("每日金句").exists()) {
        listView.scrollForward(); //翻页
        log("……翻页……");
        delay(2);
    }
    if (click("每日金句")) {
        console.log("开始进行阅读时长...");
        delay(1);
        article_timing(-1, pTime);

        back(); //返回主界面
    }
    console.log("阅读时长任务已完成...");
    return;
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
        back(); //返回电台界面
        return;
    }
    if (textContains("推荐收听").exists()) {
        click("推荐收听");
        console.log("正在收听广播...");
        delay(1);
        back(); //返回电台界面
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
        delay(1);
    }
    if (id("v_playing").exists()) {
        id("v_playing").findOnce(0).click();
        delay(1);
    }
}

/**
 * @description: 分享函数  (收藏+分享)---1+1=2分
 * @param: 分享次数
 * @return: null
 */
function Share(i) {
    while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    console.log("正在进行分享...");
    var textOrder = text("欢迎发表你的观点").findOnce().drawingOrder();
    var shareOrder = textOrder + 3;
    var shareIcon = className("ImageView").filter(function(iv) {
        return iv.drawingOrder() == shareOrder;
    }).findOnce();

    for (; i > 0; i--) {
        shareIcon.click(); //点击分享
        while (!textContains("分享到学习强").exists()); //等待弹出分享选项界面
        delay(1);
        click("分享到学习强国");
        delay(2);
        console.info("分享成功!");
        back(); //返回文章界面
        delay(1);
    }
}

/**
 * @description: 收藏函数  (收藏+分享)---1+1=2分
 * @param: 
 * @return: null
 */
function Collect() {
    while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    var textOrder = text("欢迎发表你的观点").findOnce().drawingOrder();
    var collectOrder = textOrder + 2;
    var collectIcon = className("ImageView").filter(function(iv) {
        return iv.drawingOrder() == collectOrder;
    }).findOnce();

    collectIcon.click(); //点击收藏
    console.info("收藏成功!");
    delay(1);

}

/**
 * @description: 评论函数---2分
 * @param: i-文章标号
 * @return: null
 */
function Comment(i) {
    while (!textContains("欢迎发表你的观点").exists()) //如果没有找到评论框则认为没有进入文章界面，一直等待
    {
        delay(1);
        console.log("等待进入文章界面")
    }
    for (; i > 0; i--) {
        click("欢迎发表你的观点"); //单击评论框
        console.log("正在进行评论...");
        delay(1);
        var num = random(0, commentText.length - 1) //随机数
        setText(commentText[num]); //输入评论内容
        delay(1);
        click("发布"); //点击右上角发布按钮
        console.info("评论（" + commentText[num] + "）成功!");
        delay(1);
        click("删除"); //删除该评论
        delay(1);
        click("确认"); //确认删除
        console.info("评论删除成功!");
        if (i > 0) {
            delay(5); //评论之间有时间间隔要求
            log("等待继续进行评论…");
        }
        delay(1);
    }
}


/**
 * @description: 检测文章是否收藏
 * @param: 
 * @return: point，坐标值，为null时表示未收藏
 */
function checkCol() {
    let color = "#FFFFC63F";
    let point;
    let img = captureScreen(); //截取当前屏幕
    point = findColorInRegion(img, color, device.width / 2, device.height / 8);
    return point;
}

/**
 * @description: 本地频道
 * @param: null
 * @return: null
 */
function localChannel() {
    while (!desc("学习").exists()); //等待加载出主页
    console.info("点击本地频道");
    if (text("新思想").exists()) {
        text("新思想").findOne().parent().parent().child(14).click();
        delay(2);
        className("android.support.v7.widget.RecyclerView").findOne().child(0).click();
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
    while (!desc("学习").exists()); //等待加载出主页
    console.info("正在获取积分...");
    while (!text("积分明细").exists()) {
        if (id("comm_head_xuexi_score").exists()) {
            id("comm_head_xuexi_score").findOnce().click();
        } else if (text("积分").exists()) {
            text("积分").findOnce().parent().child(1).click();
        }
        delay(1);
        text("积分明细").findOne().parent().click();
    }
    delay(1);
    let item = textContains("当日积分").findOne().parent().child(4).child(0);

    for (var i = 1; i < item.childCount(); i++) {
        let name = item.child(i).child(2).text();
        let str = item.child(i).child(3).text();
        let score = parseInt(str.match(/[0-9][0-9]*/g));
        if (name.search("订阅") != -1) {
            name = "订阅";
        }
        myScores[name] += score;
    }

    //console.log(myScores);

    if (customize_flag == false) {
        aCount = 6 - myScores["阅读文章"]; //文章个数
        pTime = (6 - myScores["文章时长"]) * 60;
        vCount = 6 - myScores["视听学习"];
        rTime = (6 - myScores["视听学习时长"]) * 60;
        asub = 2 - myScores["订阅"];
        sCount = 2 - myScores["分享"] * 2;
        cCount = 1 - myScores["发表观点"];
    }
    console.log('评论：' + cCount.toString() + '个');
    console.log('分享：' + sCount.toString() + '个');
    console.log('订阅：' + asub.toString() + '个');
    console.log('剩余文章：' + aCount.toString() + '篇');
    console.log('剩余文章学习时长：' + pTime.toString() + '秒');
    console.log('剩余视频：' + vCount.toString() + '个');
    console.log('剩视听学习时长：' + rTime.toString() + '秒');
    console.info("当日已获得积分：" + textContains("当日积分").findOne().parent().child(2).text());
    back();
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
            object.forEach(function(currentValue) {
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
                    object.forEach(function(currentValue) {
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

/**
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app() {
    console.setPosition(0, device.height / 2); //部分华为手机console有bug请注释本行
    console.show(); //部分华为手机console有bug请注释本行
    console.log("正在启动app...");
    if (!launchApp("学习强国")) //启动学习强国app
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
 * @description: 检测分数并学习
 * @param: null
 * @return: null
 */

function checkedToStudy() {
    getScores(); //获取积分

    if (myScores['本地频道'] != 1) {
        localChannel(); //本地频道
    }

    if (rTime != 0) {
        listenToRadio(); //听电台广播
    }
    var r_start = new Date().getTime(); //广播开始时间
    
    if (myScores['订阅'] != 2) {
        sub(); //订阅
    }
    
    if (aCount != 0) {
        articleStudy(); //学习文章，包含点赞、分享和评论
    }

    if (pTime > 0) {
        readToPage(); //文章挂时长
    }

    if (vCount != 0) {
        videoStudy_news(); //看视频
    }
    var end = new Date().getTime(); //广播结束时间
    var radio_time = (parseInt((end - r_start) / 1000)); //广播已经收听的时间
    radio_timing(parseInt((end - r_start) / 1000), rTime - radio_time); //广播剩余需收听时间
    if (rTime != 0) {
        stopRadio();
    }
}

//主函数
function main() {
    start_app(); //启动app
    var start = new Date().getTime(); //程序开始时间
    checkedToStudy();
    end = new Date().getTime();
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
}

//main();

module.exports = main;
