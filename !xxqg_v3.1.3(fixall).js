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
var zCount = 2;//争上游答题轮数

var aTime = 30 + random(5, 15);//每篇文章学习-30秒 30*12≈360秒=6分钟
var vTime = 15 + random(5, 15);//每个小视频学习-15秒
var rTime = 360 + random(5, 15);//广播收听6分 * 60 = 360秒
//随机加5-15秒学习时长

var commentText = ["支持党，支持国家！", "为实现中华民族伟大复兴而不懈奋斗！", "不忘初心，牢记使命"];//评论内容，可自行修改，大于5个字便计分
var num = random(0, commentText.length - 1) ;//随机数  

//var aCatlog = files.read("./article.txt");//文章学习类别，可自定义修改为“要闻”、“新思想”等
var aCat = ["推荐","要闻","综合"];  
var aCatlog = aCat[num] ;//文章学习类别，随机取"推荐","要闻","综合","实践"

var asub = 2; //订阅数
var lCount = 1;//挑战答题轮数
var qCount = randomNum(5, 7);//挑战答题每轮答题数(5~7随机)
var myScores = {};//分数
var customize_flag = true;//自定义运行标志,true:1/false:0

var vCat = ["第一频道", "学习视频", "联播频道"]; 
var vCatlog = vCat[num] ; //视频学习类别，随机取 "第一频道"、"学习视频"、"联播频道"

var xxScores; //累计学习积分
var date_string = getTodayDateString();//获取当天日期字符串，定义为全局变量，方便其他函数调用
var ziXingTi = "选择词语的正确词形。"; //字形题，已定义为全局变量
var zsyDelay = 100; //单位为ms毫秒，示例为0-100的随机值，定义争上游答题延时时间，参考某些学习工具的延时时间为100ms，即0.1秒，默认的delay为随机500ms以上
var localTiku = true; ////是否启用本地题库的搜索和更新(true:1启用，false:0不启用)，网络搜题或随机点击到正确答案时会同时更新本地题库


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
    let h = device.height;//屏幕高
    let w = device.width;//屏幕宽
    let x = (w / 3) * 2;
    let h1 = (h / 6) * 5;
    let h2 = (h / 6);
    for (var i = 0; i < seconds; i++) {
        while (!textContains("欢迎发表你的观点").exists())//如果离开了文章界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "文章界面，请重新返回文章页面...");
            delay(2);           
            if (textContains("欢迎发表你的观点").exists()){
                break;//防止通知/下拉菜单等不改变阅读界面但误判为离开
            }
            console.log("重新返回到学习主页，如果一直失败，请手动返回！");
            delay(0.5); 
            console.log("阅读失败");
            return false;       //返回阅读失败
            //back();
            /*
            start_app(1);
            while (!id("home_bottom_tab_button_work").exists());
            id("home_bottom_tab_button_work").findOne().click();
            num = random(0, commentText.length - 1) ;//随机数
            aCatlog = aCat[num] ;
            //s = "“学习强国”学习平台";
            click(aCatlog);
            //console.log('文章类别：' + aCatlog + '；关键词：'+ s)
            console.log('文章类别：' + aCatlog );
            delay(1);
            click(s);
            delay(2);
            break;   
            */
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
    //console.log("193阅读成功");
    return true;       //返回阅读成功
}

/**
 * @description: 视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_bailing(n, seconds) {
    let h = device.height;//屏幕高
    let w = device.width;//屏幕宽
    let x = (w / 3) * 2;//横坐标2分之3处
    let h1 = (h / 6) * 5;//纵坐标6分之5处
    let h2 = (h / 6);//纵坐标6分之1处
     for (var i = 0; i < seconds; i++) {
        if (desc("继续播放")){
        click("继续播放");
        }
        while (!textContains("分享").exists()|| id("home_bottom_tab_button_work").exists())//如果离开了百灵小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个小视频界面，请重新返回视频");
            delay(2);
            if (textContains("/ 00").exists()){
                break;//防止通知/下拉菜单等不改变阅读界面但误判为离开
                console.log("已返回小视频播放界面");
            }
            console.log("重新返回到学习主页，如果一直失败，请手动返回！");
            delay(0.5); 
            console.log("百灵视频观看失败");
            return false;       //返回阅读失败
            /*
             console.log("返回到学习主页，如果一直失败，请手动返回！");
             start_app(1);
             while (!id("home_bottom_tab_button_work").exists());
             id("home_bottom_tab_button_work").findOne().click();
             delay(1);
             click("百灵");
             delay(2);
             click("竖");
             delay(2);
             //a = className("FrameLayout").depth(23).findOnce(0);//根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
			 click((w/2)+random()*10,h/4);//坐标点击第一个视频
             //a.click();
             delay(2);
             break;
             */
        }
        if (textContains("即将播放").exists()){
                i=seconds-2;
                //console.log("即将播放下一个小视频"+i);
        }       

        //持续学习    
        delay(1);
        if (i % 10 == 0)//每10秒打印一次学习情况
        {            
            console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
            toast("防息屏弹窗,请无视");
        }
    } 
    delay(1);
    //console.log("247阅读成功");
    return true;       //返回阅读成功
}

/**
 * @description: 新闻联播小视频学习计时(弹窗)函数
 * @param: n-视频标号 seconds-学习秒数
 * @return: null
 */
function video_timing_news(n, seconds) {
	seconds = seconds + randomNum(0, 10);//加随机时间
    for (var i = 0; i < seconds; i++) {
        if (desc("继续播放")){
        click("继续播放");
        }
        delay(1);
        var f=0;//记录返回次数
        while (!textContains("欢迎发表你的观点").exists())//如果离开了联播小视频界面则一直等待
        {
            console.error("当前已离开第" + (n + 1) + "个新闻小视频界面，请重新返回视频");
            delay(2);
            if (textContains("欢迎发表你的观点").exists() || textContains("展开").exists()){
                break;//防止通知/下拉菜单等不改变阅读界面但误判为离开
            }
            console.log("重新返回到学习主页，如果一直失败，请手动返回！");
            delay(0.5); 
            console.log("视频学习失败");
            return false;       //返回阅读失败

        }
        if (i % 10 == 0)//每10秒打印一次学习情况
        {
          console.info("第" + (n + 1) + "个小视频已经观看" + (i + 1) + "秒,剩余" + (seconds - i - 1) + "秒!");
          toast("防息屏弹窗,请无视");
        }
    }
    //console.log("305阅读成功");
    return true;       //返回阅读成功
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
function articleStudy(x) {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    var listView = className("ListView");//获取文章ListView控件用于翻页
    let s = "学习平台";//获取当天日期字符串
    if (x == 0) {
        id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
        delay(2);                
    }
    click(aCatlog);
    delay(2);
    var zt_flag = false;//判断进入专题界面标志
    var fail = 0;//点击失败次数
  //  console.log('文章类别：' + aCatlog + '关键词：'+ s)
    for (var i = 0, t = 0; i < aCount;) {
    	console.log('文章类别：' + aCatlog);
        if (click(s, t) == true)//如果点击成功则进入文章页面,不成功意味着本页已经到底,要翻页
        {
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
            if (textContains("展开").exists() )//如果存在“央视网、中央广播电视总台、播放、展开”则认为进入了视频需退出。关键词测试
            {
                console.warn("进入视频界面，退出并进下一篇文章!");
                t++;
                back();
                /* while (!id("home_bottom_tab_button_work").exists());
                delay(0.5);
                click("电台");
                delay(1);
                click("最近收听");
                console.log("因广播被打断，重新收听广播...");
                delay(1);
                back();
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();*/
                delay(1);
                num = random(0, commentText.length - 1) ; //重取随机数
                aCatlog = aCat[num] ;
                //s = "“学习强国”学习平台";
                console.log('文章类别：' + aCatlog + '关键词：'+ s)
                click(aCatlog);
                delay(1);
                continue;
            }
            
           if (id("v_play").exists() || id("bg_play").exists())//进入电台页面2020.09.28
           {
            console.warn("进入电台界面，退出并进下一篇文章!");
            t++;
            if (id("btn_back").exists()){
             id("btn_back").findOnce().click();//返回 2020.09.28需关闭电台收听
             }else{
                 back; }//返回 2020.09.28需关闭电台收听
            /*while (!id("home_bottom_tab_button_work").exists());
            id("home_bottom_tab_button_work").findOne().click();*/
            delay(1);
            num = random(0, commentText.length - 1) ; //重取随机数
            aCatlog = aCat[num] ;
            //s = "“学习强国”学习平台";
            console.log('文章类别：' + aCatlog + '关键词：'+ s)
            click(aCatlog);
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
           delay(1);
            //记录已学习的文章
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
               /* num = random(0, commentText.length - 1) ;//随机数
                aCatlog = aCat[num] ;
                console.log('文章类别：' + aCatlog );     */                           
                delay(1.5);                
                continue;
            }
            if (currentNewsTitle == "") {
                console.log("标题为空,即将退出并阅读下一篇")
                t++;
                back();
              /*  num = random(0, commentText.length - 1) ;//随机数
                aCatlog = aCat[num] ;
                console.log('文章类别：' + aCatlog );
                click(aCatlog);                 */   
                delay(1.5);
                continue;
            }
            var flag = getLearnedArticle(currentNewsTitle, date_string);
            if (flag) {
                //已经存在，表明阅读过了
                console.info("该文章已经阅读过，即将退出并阅读下一篇");
                t++;
                back();
                num = random(0, commentText.length - 1) ;//随机数
                aCatlog = aCat[num] ;
                console.log('文章类别：' + aCatlog );
                click(aCatlog);                  
                delay(2);
                continue;
            } else {
                //没阅读过，添加到数据库
                //insertLearnedArticle(currentNewsTitle, date_string);
            }

            console.log("正在学习第" + (i + 1) + "篇文章...");
            fail = 0;//失败次数清0
            
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

            if (article_timing(i, aTime)) { //如果阅读成功              
                //添加标题到数据库
                console.log("文章阅读成功，记录文章标题");
                console.log('文章名称：'+currentNewsTitle);
                insertLearnedArticle(currentNewsTitle, date_string);  
                delay(1);  
            }else {
                if (!id("home_bottom_tab_button_work").exists()){
                    start_app(1);          
                    delay(0.5);
                    id("home_bottom_tab_button_work").findOne().click();        
                }//等待加载出主页
                delay(1);
                num = random(0, commentText.length - 1) ;//随机数
                aCatlog = aCat[num] ;
                console.log('文章类别：' + aCatlog );
                click(aCatlog); //重新进入文章页面
                delay(2);
            }
            if (textContains("欢迎发表你的观点").exists() && !id("home_bottom_tab_button_work").exists()) {
                back();//返回主界面
                delay(0.5);
            }
            if (!id("home_bottom_tab_button_work").exists()){
                start_app(1);       
                delay(0.5);
                id("home_bottom_tab_button_work").findOne().click();    
                delay(1);           
                click(aCatlog); //重新进入文章页面
            }//等待加载出主页           
            delay(1);
            i++;
            t++;//t为实际点击的文章控件在当前布局中的标号,和i不同,勿改动!
        } else {
            if (id("v_play").exists() || id("bg_play").exists())//进入电台页面2020.09.28
            {
                console.warn("进入电台界面，退出并进下一篇文章!");
                t++;
                if (id("btn_back").exists()){
                    id("btn_back").findOnce().click();//返回 2020.09.28需关闭电台收听
                } else{
                    back;
                }
                if (!id("home_bottom_tab_button_work").exists()){
                    start_app(1);       
                    delay(0.5);
                    id("home_bottom_tab_button_work").findOne().click();    
                    delay(1);           
                    click(aCatlog); //重新进入文章页面
                }//等待加载出主页           
                /*
                while (!id("home_bottom_tab_button_work").exists());
                id("home_bottom_tab_button_work").findOne().click();
                delay(1);
                num = random(0, commentText.length - 1) ; //重取随机数
                aCatlog = aCat[num] ;
                //s = "“学习强国”学习平台";
                console.log('文章类别：' + aCatlog + '关键词：'+ s)
                click(aCatlog);
                */
                delay(1);
                continue;
           } 
           /*
           if (i == 0)//如果第一次点击就没点击成功则认为首页无当天文章
            {
                //date_string = getYestardayDateString();
                //s = date_string;
                //s = "“学习强国”学习平台";
                num = random(0, commentText.length - 1) ; //重取随机数
                aCatlog = aCat[num] ;
                click(aCatlog);
                console.warn("首页没有找到当天文章，即将学习昨日新闻!"+aCatlog + s);
                continue;
            }
            */
            if (fail > 3)//连续翻几页没有点击成功则认为今天的新闻还没出来，学习昨天的
            {
                /*date_string = getYestardayDateString();
                 s = date_string;*/
                //s = "学习平台";
                num = random(0, commentText.length - 1) ; //重取随机数
                aCatlog = aCat[num] ;
                click(aCatlog);
                console.warn("重新随机阅读!"+aCatlog + s);
                fail = 0;//失败次数清0
                continue;
            }
            
            if (!textContains(s).exists())//当前页面当天新闻
            {
                fail++;//失败次数加一
            }
            listView.scrollForward();//向下滑动(翻页)
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
    let h = device.height;//屏幕高
    let w = device.width;//屏幕宽
    let x = (w / 3) * 2;//横坐标2分之3处
    let h1 = (h / 6) * 5;//纵坐标6分之5处
    let h2 = (h / 6);//纵坐标6分之1处
    //
        while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
        id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
        delay(2);
        click("百灵");
        delay(2);
        click("竖");
        delay(2);
        //var a = className("FrameLayout").depth(23).findOnce(0);//根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
        //a.click();
        click((w/2)+random()*10,h/4);//坐标点击第一个视频
        delay(1);

    for (var i = 0; i < vCount;) {  
            console.log("正在观看第" + (i + 1) + "个小视频");
            let nextVideo=false;
            var currentNewsTitle = ""
            while (true){
                try {
                    if (textContains("分享").exists ) {//百灵视频
                        currentNewsTitle = textContains("分享").findOne().parent().parent().parent().children()[1].text(); //10.29测试，央视网/中央广播电视总台 视频标题
                        //console.log('视频名称1：'+currentNewsTitle);   
                    } else {
                        console.log("无法定位视频标题,即将退出并观看下一个")
                        nextVideo=true;       
                    }
                    if (currentNewsTitle == "") {
                        console.log("标题为空,即将退出并观看下一个")
                        nextVideo=true; 
                    }else {
                        var flag = getLearnedArticle(currentNewsTitle, date_string);
                        if (flag) {
                            //已经存在，表明阅读过了
                            console.info("该视频已观看过，即将退出并阅读下一篇");
                            nextVideo=true;
                        } else {
                            console.log('视频名称：'+currentNewsTitle);
                            //观看的视频  
                            nextVideo=false;
                            delay(0.5);
                            break;
                        }
                    }               
                    if (nextVideo) {//滑动下一个视频
                        if(textContains("竖").exists && textContains("炫").exists){
                            delay(2);
                            click("竖");
                            delay(2);
                            click((w/2)+random()*10,h/4);//坐标点击第一个视频
                        }                       
                        delay(1);
                        swipe(x, h1, x, h2, 500);//往下翻（纵坐标从5/6处滑到1/6处）
                    }
                }catch(e){
                    console.log(e);
                    console.error("出现错误，请检查！");
                    break;
                }              
            }
        
        if (video_timing_bailing(i, vTime)){//观看百灵小视频成功
            ////观看成功，记录已观看的视频
            insertLearnedArticle(currentNewsTitle, date_string);   
            //console.log('623记录视频名称：'+currentNewsTitle);   
            i++;
            delay(1); 
            if (i != vCount - 1) {
                swipe(x, h1, x, h2, 500);//往下翻（纵坐标从5/6处滑到1/6处）
            }
        } else {            
           //观看失败
        	console.info("566已离开阅读界面，将退出并阅读下一篇");
            start_app(1);
            //while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
            //id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
            delay(2);
            click("百灵");
            delay(2);
            click("竖");
            delay(2);
            //var a = className("FrameLayout").depth(23).findOnce(0);//根据控件搜索视频框，但部分手机不适配，改用下面坐标点击
            //a.click();
            click((w/2)+random()*10,h/4);//坐标点击第一个视频
            delay(1);  
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
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);
    click("电视台");
    vCatlog = vCat[num] ; //视频学习类别，随机取 "第一频道"、"学习视频"、"联播频道"
    if (num == 0){
             var s = "央视网";
             }else if (num == 1){
             var s = "央视新闻";
             }else {
             var s = "中央广播电视总台";
             }
    delay(1);
    click(aCatlog);
    delay(2);
    var listView = className("ListView");//获取listView视频列表控件用于翻页
    var fail = 0;//点击失败次数
    delay(1);
    
    for (var i = 0, t = 1; i < vCount;) {
    	console.log('视频类别：' + vCatlog + '关键词：'+ s )
        if (click(s, t) == true) {
            fail = 0;//失败次数清0
            //记录已学习的视频
            var currentNewsTitle = ""
            if (textContains("展开").exists) {
                if (s == "央视网" || s =="中央广播电视总台"){
                    currentNewsTitle = textContains("展开").findOne().parent().parent().parent().children()[1].text(); //10.29测试，央视网/中央广播电视总台 视频标题
                   // console.log('视频名称1：'+currentNewsTitle);
                } 
            
                if (s == "央视新闻") {
                    currentNewsTitle = textContains("展开").findOne().parent().parent().parent().children()[2].text(); //10.29测试，央视新闻 视频标题
                    //console.log('视频名称2：'+currentNewsTitle);
                    let currentNewsTitle1=currentNewsTitle.substr(0,4);
                    //console.log('视频名称2：'+currentNewsTitle1);
                    if  (currentNewsTitle1=="央视新闻") {
                        currentNewsTitle = textContains("展开").findOne().parent().parent().parent().children()[1].text(); 
                       // console.log('视频名称2：'+currentNewsTitle);
                    }
                } 
            } else {
                console.log("无法定位视频标题,即将退出并观看下一个")
                t++;
                back();
                delay(1);
                continue;        
            }
            
            if (currentNewsTitle == "") {
                console.log("标题为空,即将退出并阅读下一篇")
                t++;
                back();
                num = random(0, commentText.length - 1) ;//随机数
                if (num == 0){
                    var s = "央视网";
                }else if (num == 1){
                    var s = "央视新闻";
                }else {
                    var s = "中央广播电视总台";
                }
                vCatlog = vCat[num] ;
                console.log('视频频道：' + vCatlog + '；关键词：'+ s) ;
                click(vCatlog);                    
                delay(1.5);
                continue;
            }

            console.log("正在观看第" + (i + 1) + "个视频...");
            console.log('视频名称：'+currentNewsTitle);
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
            if (video_timing_news(i, vTime)){
                //如果阅读成功
                //没阅读过，添加到数据库
                console.log("观看视频成功，记录视频标题");
                console.log('视频名称：'+currentNewsTitle);
                insertLearnedArticle(currentNewsTitle, date_string);  
                delay(1);  
            }else {
                start_app(1);
                delay(1.5);
                click("电视台");
                delay(1.5);                
                num = random(0, commentText.length - 1) ;//随机数
                if (num == 0){
                    var s = "央视网";
                }else if (num == 1){
                    var s = "央视新闻";
                }else {
                    var s = "中央广播电视总台";
                }
                vCatlog = vCat[num] ;
                console.log('视频频道：' + vCatlog + '；关键词：'+ s) ;
                click(vCatlog); //重新进入文章页面
            }
            if (textContains("展开").exists && !id("home_bottom_tab_button_work").exists()) {
                back();//返回主界面
                delay(0.5);
            }
            if (!id("home_bottom_tab_button_work").exists()){
                start_app(1);
                delay(1.5);
                click("电视台");
                delay(1.5);
                click(vCatlog);                                
            }//等待加载出主页
            delay(1);                                                  
            i++;
            t++;
            if (i == 3) {//如果是平板等设备，请尝试修改i为合适值！
                listView.scrollForward();//翻页
                delay(2);
                t = 0;
            }
        }
        else {
        if (fail > 3)//连续翻几页没有点击成功则改换频道
            {
                num = random(0, commentText.length - 1) ; //重取随机数
                vCatlog = vCat[num] ;
                click(vCatlog);
                delay(2);
                if (num == 0){
                    var s = "央视网";
                }else if (num == 1){
                    var s = "央视新闻";
                }else {
                   var s = "中央广播电视总台";
                }
                delay(1);
                console.warn("改换："+ vCatlog + '关键词：'+ s);
                fail = 0;//失败次数清0
                continue;
            }
            if (!textContains(s).exists())//未找到关键词
            {
                fail++;//失败次数加一
            }
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
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);  
    click("电台");
    delay(1);
    click("听新闻广播");
    delay(2);
    if (textContains("最近收听").exists()) {
        click("最近收听");
        console.log("896正在收听广播...");
        delay(1);
    } else if (textContains("推荐收听").exists()) {
        click("推荐收听");
        console.log("900正在收听广播...");
        delay(1);

    }else if (textContains("正在收听").exists()) {
        //click("正在收听");
        console.log("905正在收听广播...");
        delay(1);
    }
    if (!id("home_bottom_tab_button_work").exists()){
        start_app(1);
    }
    delay(1);
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
    while (!id("comm_head_xuexi_score").exists());
    id("comm_head_xuexi_score").findOnce().click();
    delay(2);

    let err = false;
    while (!err) {
        try {
            className("android.widget.ListView").findOnce().children().forEach(item => {
                let name = item.child(0).child(0).text();
                let str = item.child(2).text().split("/");
                let score = str[0].match(/[0-9][0-9]*/g);
                myScores[name] = score;
				xxScores= Number(textStartsWith("今日已累积").findOnce().text().substr(6,2));//累计学习积分
            });
            err = true;
        } catch (e) {
            //console.log(e);
            console.log("正在重试获取积分...");       
        }
        delay(1.5);
    }
    //console.log(myScores);

    aCount = Math.ceil((12 - myScores["我要选读文章"]) / 2); //文章个数
    if (i == 1) {
        aCount = 12 - myScores["我要选读文章"];
        if (aCount != 0) {
            console.log("还需要阅读：" + aCount.toString() + "篇文章！");
        } else {
            console.info("文章阅读已满分！");
        }
        delay(1);
        back();
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

    if (i == 2) {//视频是否满分
        if (vCount != 0) {
            console.log('还需要观看：' + vCount.toString() + '个视频！');
        } else {
            console.info("观看视频已满分！");
        }
        delay(1);
        back();
        return;
    }
    console.log('今日已获得：'+xxScores+'分');
  
    if  (myScores['每日答题'] != 5 || myScores['挑战答题'] != 6  || myScores['订阅'] != 2 ||
    myScores['本地频道'] != 1 || myScores["争上游答题"] < 2 || myScores["双人对战"] < 1 || 
    myScores['每周答题'] == 0 || myScores['专项答题'] == 0  || vCount != 0 || aCount != 0) {

        console.log('即将进行以下学习：');
       
    }
        
    if (cCount!=0) {    	
        console.log('评论：' + cCount.toString() + '个');
    }
    if (sCount!=0) {    	
        console.log('分享：' + sCount.toString() + '个');
    }
    if (asub!=0) {        
        console.log('订阅：' + asub.toString() + '个');
    }
    if (aCount!=0) {    	
        console.log('浏览文章：' + aCount.toString() + '篇');
    }    
   // console.log('每篇文章学习时长：' + aTime.toString() + '秒');
    if (vCount!=0) {    	
        console.log('观看视频：' + vCount.toString() + '个');
    }
    if (rTime!=0) {    
        console.log('视听学习：' + rTime.toString() + '秒');
    }  
    if (myScores['每日答题'] != 5) {
        console.log("每日答题学习");    
    }   
    if (myScores['挑战答题'] != 6) {
         console.log("挑战答题学习");    
    }
    if (myScores["争上游答题"] < 2) {
        console.log("争上游答题学习");
    }  
    if (myScores["双人对战"] < 1) {
        console.log("双人对战学习");
    }          
    if (myScores['每周答题'] == 0) {//无分值即尝试答题
        console.log("每周答题学习");    
    }         
    if (myScores['专项答题'] == 0) {//无分值即尝试答题
        console.log("专项答题学习");  
    }
    
    delay(0.5);
    back();
    delay(0.5);
}

/**
 * @description: 启动app
 * @param: null
 * @return: null
 */
function start_app(x) { 
    //重写start_app函数，使其适合多个场景
    //启动强国主页,回退到主页并点击正下方的"学习"按钮
    let err = false;
    let f=0
    while (!err) { //等待强国主页加载
        try {
            if (app.getAppName(currentPackage()) != "学习强国" ){//如果强国未启动
                if (x ==undefined) {//不带参数时输出信息
                    console.log("启动学习强国");
                }

                if (!launchApp("学习强国")){//启动学习强国app
                    console.error("找不到学习强国App!");
                    return;
                }

            } else {
                if (currentActivity()!="com.alibaba.android.user.login.SignUpWithPwdActivity") {//如果强国界面不为密码登录页
                    if ( currentActivity()=="android.widget.FrameLayout") {//强国主界面
                        if (id("home_bottom_tab_button_work").exists()) {//如果发现"学习"按钮
                            if (x ==undefined) {//不带参数时
                                id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
                            }
                            err = true;
                        }                      
                    } else {     
                        if (text("退出").exists()){//退出按钮
                            //console.log('退出');
                            let clickExit=text("退出").findOnce().click();
                            //console.log(clickExit);
                            if (!clickExit) {
                                if (className("Button").exists()) {//退出按钮
                                    className("Button").findOnce().click();
                                }
                            } 
                        }                                          
                        back();
                    }
                    //delay(0.5);
                } else {
                    console.error("未登录学习强国账号，请登录后重试!");
                    return;
                }
                if (x ==undefined) {//不带参数时输出信息
                    if (f==3){
                        console.log("等待加载出主页");     
                        f==0;       
                    }   
                }
			}
			delay(1);
			f++;
        } catch (e) {//如果出错？
            if (x ==undefined) {//不带参数时输出信息
                console.log(e);
            }
            console.error("出现错误，请检查!");
            return;
        }
    }
    
    /*有误触发的情况
    if (x ==undefined) {//不带参数时开启线程
        //停止线程和脚本
        //threads.shutDownAll();
        //开启新线程检测学习强国是否在前台
        var thread = threads.start(function(){
            while(true){
                if (app.getAppName(currentPackage()) != "学习强国" ){//如果强国不在前台运行
                    if (!className("ListView").exists() || !textContains("欢迎发表你的观点").exists()) {//好像答题界面有时会误触发，故判断非
                        console.log("学习强国不在前台，准备切换到前台！");
                        toast("学习强国不在前台，准备切换到前台！");
                        launchApp("学习强国");
                        delay(2);   
                    }                
                }
            delay(10);//每10秒检测一次       
            }
        });
    }
 */   
}

/**
 * @description: 从数据库中搜索答案,没有答案就添加(存在即更新),或删除题库中的问题列
 * @param: upOrdel,question,answer;upOrdel:'up'=1,'del'=0
 * @return: null
 */
function UpdateOrDeleteTK(upOrdel,question,answer) {//只针对tiku表，添加/更新或删除相应的列
    let dbName = "tiku.db";//题库文件名
    let path = files.path(dbName);
    let db = SQLiteDatabase.openOrCreateDatabase(path, null);
    if (upOrdel=="up" || upOrdel==1) {//更新题库
        let sql1 = "SELECT answer FROM tiku WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
        let cursor = db.rawQuery(sql1, null);//查找是否存在
        if (!cursor.moveToFirst()) { //不存在，添加到题库                                  
            sql1 = "INSERT INTO tiku VALUES ('" + question + "','" + answer + "','')";
            console.log("更新答案到本地题库...");  
            insertOrUpdate(sql1);     
        } else { //修正题库答案                                     
            if (cursor.getString(0)!=answer) {   //题库答案和目的答案不一致   
                //console.log('题库答案：'+cursor.getString(0)); //调试用                         	
                sql1 = "UPDATE tiku SET answer='" + answer + "' WHERE question LIKE '" + question + "'";
                console.log("修正本地题库答案...");  
                insertOrUpdate(sql1);     
            }
        }                      
        delay(0.5);
        cursor.close();  //关闭数据库     
    } else if (upOrdel=="del" || upOrdel==0) {     
        let sql2 = "SELECT answer FROM tiku WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
        let cursor = db.rawQuery(sql2, null);//查找是否存在
        if (cursor.moveToFirst()) { //题库存在，删除该列                                  
            sql2 = "DELETE FROM tiku WHERE question LIKE '" + question + "'";//删库语句
            console.log("删除本地题库的相关题目列...");  
            insertOrUpdate(sql2);     
        } else {                                                
            console.log("本地题库找不到对应的题目，删除失败。");  
        }
        delay(0.5);
        cursor.close(); //关闭数据库 
    }          
}

/**
 * @description: 从数据库中搜索答案,10.25改写，table_name=NET时启用在线搜索
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question, table_name) {
    let dbName = "tiku.db";//题库文件名
    let path = files.path(dbName);
    let db = SQLiteDatabase.openOrCreateDatabase(path, null);
       
    if ( table_name=="NET" ) {//网络搜题
        
            console.error("搜索在线题库出错");//遗留网络搜题模块
            return '';
       
    } else {
        //搜本地题库       
        let sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
        //log(sql)
        let cursor = db.rawQuery(sql, null);
        if (cursor.moveToFirst()) {
            let answer = cursor.getString(0);
            cursor.close();
            return answer;
        } else {
            console.error("本地题库中未找到答案");
            cursor.close();
            return '';
        }
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
@description: 停止广播
@param: null
@return: null
*/
function stopRadio() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);
    console.log("停止收听广播！");
    click("电台");
    delay(1);
    click("听新闻广播");
    delay(2);
    while (!(textContains("正在收听").exists() || textContains("最近收听").exists() || textContains("推荐收听").exists())) {
        log("等待加载");
        delay(2);
    }
    if (textContains("正在收听").exists()) {
        click("正在收听");
        console.log("正在停止广播...");
        delay(2);
        id("v_play").findOnce(0).click();//点击暂停播放按钮
        delay(2);
        if (id("btn_back").findOne().click() == 0) {//后退
            delay(2);
            back();
        }
    } 
    console.log("广播已停止播放...");
    delay(1);
    if (!id("home_bottom_tab_button_work").exists()){
        start_app(1);
    }
    delay(1);
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

/**
 * @description: 每周答题
 * @param: null
 * @return: null
 */
function weeklyQuestion() {
    let h = device.height;//屏幕高
    let w = device.width;//屏幕宽
    let x = (w / 3) * 2;//横坐标2分之3处
    let h1 = (h / 6) * 5;//纵坐标6分之5处
    let h2 = (h / 6);//纵坐标6分之1处
    text("我的").click();
    while (!textContains("我要答题").exists());
    delay(1);
    click("我要答题");
    while (!text("每周答题").exists());
    delay(1);
    text("每周答题").click();
    console.log("开始每周答题")
     //delay(2);
     //text("未作答").click();
    
    //翻页点击每周作答
    //let sublist = className("ListView").findOnce(0);//控件错误，用swipe划，7.0以下可能错误
    let i = 0;//参考订阅的翻页，只进行一次点击
    while (i < 1) {
        if (text("未作答").exists()){
            text("未作答").click();
            i++;
        } else if (text("您已经看到了我的底线").exists()) {
            console.log("没有可作答的每周答题了,退出!!!")
            back();delay(1);
            back();delay(1);
            back();delay(1);
            return;          
        } else {
            delay(1);
            swipe(x, h1, x, h2, 500);//往下翻（纵坐标从5/6处滑到1/6处）
            //console.log("滑动查找未作答的每周答题")
        }
    }
    ////翻页点击每周作答

    let dlNum = 0;//每日答题轮数
    while (true) {
        delay(1)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            delay(2);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("每周答题结束，返回！")
            text("返回").click(); delay(2);
            back(); delay(1);
            back();delay(1);            
			while (!textContains("我要答题").exists()){
				back();  delay(1);
            }
            break;
        } else if (text("查看解析").exists()) {
            console.log("每周答题结束！")
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
                console.log("每周答题结束，返回！")
                text("返回").click(); delay(2);
				while (!textContains("我要答题").exists()){
					console.log("专项答题结束，返回！")
					back(); delay(1);
                }
                  back(); delay(1);
                break;
            }
        }
    }
	//回退返回主页 
    while (!id("home_bottom_tab_button_work").exists())	{
	    back();
	    delay(0.5);
	}
}

/**
 * @description: 专项答题
 * @param: null
 * @return: null
 */
function specialQuestion() {
    let h = device.height;//屏幕高
    let w = device.width;//屏幕宽
    let x = (w / 3) * 2;//横坐标2分之3处
    let h1 = (h / 6) * 5;//纵坐标6分之5处
    let h2 = (h / 6);//纵坐标6分之1处
    text("我的").click();
    while (!textContains("我要答题").exists());
    delay(1);
    click("我要答题");
    while (!text("专项答题").exists());
    delay(1);
    text("专项答题").click();
    console.log("开始专项答题")
    delay(2);
    /*
       if(text("继续答题").exists())
       {
             text("继续答题").click();
       }else{
             text("开始答题").click();
       }
    */

    //翻页点击专项答题
    let i=0;
    while (i < 1) {
        if(text("继续答题").exists())  {
            text("继续答题").click();
            i++;
            //console.log("1471")
        }else if (text("开始答题").exists()){
            text("开始答题").click();    
            i++;  
            //console.log("1474")
        } else if (text("您已经看到了我的底线").exists()) {
            console.log("没有可作答的专项答题了,退出!!!")
            back();delay(1);
            back();delay(1);
            back();delay(1);
            return; 
        } else if (text("已过期").exists()) {
            console.log("存在已过期的专项答题,无法作答，退出!!!")
            back();
            delay(2);
            back();delay(1);
            back();delay(1);
            return; 
        }else {
            delay(1);
            swipe(x, h1, x, h2, 500);//往下翻（纵坐标从5/6处滑到1/6处）
            delay(1);
            console.log("滑动查找未作答的专项答题")
        }
    }
    ////翻页点击专项答题

    let dlNum = 0;//每日答题轮数
    while (true) {
        delay(1)
        while (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            console.error("没有找到题目！请检查是否进入答题界面！");
            delay(2);
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("专项答题结束！")
            text("返回").click(); delay(2);
            back();
            break;
        } else if (text("查看解析").exists()) {
            console.log("专项答题结束，返回！")
            back(); delay(0.5);
            back(); delay(0.5);
            back(); delay(1);            
			while (!textContains("我要答题").exists()){
				back();  delay(1);
            }
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
                console.log("专项答题结束，返回！")
                 delay(2);
                while (!textContains("专项答题").exists()){
                console.log("专项答题结束，返回！")
                back(); delay(1);
                }
                back(); delay(1);
                break;
            }
        }
    }
	//回退返回主页 
    while (!id("home_bottom_tab_button_work").exists())	{
	    back();
	    delay(0.5);
	}
}

/**
 * @description: 在答题选项画✔，用于各项答题部分
 * @param: x,y 坐标
 * @return: null
 */
function drawfloaty(x, y) {
    //floaty.closeAll();
    var window = floaty.window(
        <frame gravity="center">
            <text id="text" text="✔" textColor="red" />
        </frame>
    );
    window.setPosition(x, y - 45);
    return window;
}

/***************************争上游、双人对战答题部分 开始***************************/
/**
 * @description: 争上游答题 20200928增加
 * @param: null
 * @return: null
 */
function zsyQuestion() {
    
	while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);
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
    delay(5);     
    let zNum = 1;//轮数
    console.warn("第" + zNum.toString() + "轮争上游答题开始...")
    while (true) {
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束
        {console.info("争上游答题本局结束!");
         zNum++;
            //当天上限两次
            if (className("android.view.View").text("非积分奖励局").exists()) {
                console.info("今天已完成争上游答题!");
                zNum++;
            }//
            if (zNum > zCount) {
                console.log("争上游答题结束");
                 //回退返回主页
                back(); delay(0.5);
                back(); delay(0.5);
                back(); delay(1);
                back(); delay(1); 
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
                if (className("android.view.View").text("开始比赛").exists()) {
                    className("android.view.View").text("开始比赛").findOne().click();
                }
            delay(6);
            }
            console.warn("第" + zNum.toString() + "轮开始...")
        } else if (textContains("距离答题结束").exists() && !text("继续挑战").exists()){            
            zsyQuestionLoop();
        }
    }
}

/**
 * @description: 双人对战答题 20200928增加
 * @param: null
 * @return: null
 */
function SRQuestion() {
    
	while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);
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
    delay(5);     
    let zNum = 1;//轮数
    //console.warn("第" + zNum.toString() + "轮开始...") //双人对战只一局得分
    while (true) {    	 
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() || textContains("请明日再来").exists()|| className("android.view.View").text("非积分奖励局").exists()) {//遇到继续挑战，则本局结束
            console.info("双人对战本局结束!");
            zNum++;
            if (zNum >= zCount) {
                console.log("双人对战结束！返回主页！");
                if(textContains("知道了").exists()){//今日次数已超过
                    className("android.widget.Button").text("知道了").findOne().click();
                    delay(1);  
                    //back(); delay(1);
                    //back(); delay(1);                
                    break;
                }
                //回退返回主页
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
                if (textContains("退出").exists()) {
                    className("android.widget.Button").text("退出").findOne().click();
                    delay(1);
                }
                while (!text("答题练习").exists());//排行榜 答题竞赛
                delay(1);
                console.log("开始双人对战")
                delay(2);
                if (className("android.view.View").text("邀请对手").exists()) {
                    className("android.view.View").text("邀请对手").findOne().parent().child(0).click();
                }
                delay(1);
                if (className("android.view.View").text("开始对战").exists()) {
                    className("android.view.View").text("开始对战").findOne().click();
                }
                delay(5);     
            } 
            //console.warn("第" + zNum.toString() + "轮开始...")
        } else if (textContains("距离答题结束").exists() && !text("继续挑战").exists()){     
            zsyQuestionLoop();
        }
    }
}

/**
 * @description: 争上游答题 双人对战答题循环
 * @param: null
 * @return: null
 */

function zsyQuestionLoop() {   
    let ClickAnswer;   
    while (className("ListView").exists() && textContains("距离答题结束").exists() && !text("继续挑战").exists()) {                      
        try {
        	if (className("ListView").exists() && !text("继续挑战").exists()) {
                var aquestion = className("ListView").findOnce().parent().child(0).text();
                var question = aquestion.substring(3); //争上游和对战题目前带1.2.3.需去除
            }   
            if ( aquestion != oldaquestion && question!="") {
                console.log("题目：" + question);
                console.log("------------------------");
                //
                var chutiIndex = question.lastIndexOf("出题单位");
                if (chutiIndex != -1) {
                    question = question.substring(0, chutiIndex - 2);
                }
                            
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
        
                // 判断是否为字形题，网络搜题和本地搜题
                question = question.replace(/\s/g, "");

                if (question==ziXingTi.replace(/\s/g, "")) {    
                    question = question + options[0].substring(3); //字形题在题目后面添加第一选项               
                }          
                
                //网络搜题和本地搜题
                var answer = getAnswer(question,"NET");//在线搜题               
                //本地搜题
                if (localTiku) {
                    if (answer.length == 0) {//在线没有找到答案,本地数据库查找
                        console.log("在线没有找到答案，尝试本地数据库查找");
                        answer = getAnswer(question, 'tiku');
                        if (answer.length == 0) {//tiku表中没有则到tikuNet表中搜索答案
                            answer = getAnswer(question, 'tikuNet');
                        }
                    }
                }                
                //搜题结束
                

                if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
                    var indexAnsTiku = indexFromChar(answer.toUpperCase());
                    answer = options[indexAnsTiku];
                    //toastLog("answer from char=" + answer);
                }
    
                let hasClicked = false;
                let listArray = className("ListView").findOnce().children();//题目选项列表
                                      
                console.info("答案：" + answer);
                console.log("------------------------");
                //如果找到答案
                if (answer.length != 0)  {//如果找到了答案 该部分问题: 选项带A.B.C.D.，题库返回答案不带，char返回答案带
                    var answer_a = answer.substring(0, 2);//定义answer_a，获取答案前两个字符对比A.B.C.D.应该不会出现E选项
                    if (answer_a == "A." || answer_a == "B." || answer_a == "C." || answer_a == "D.") {
                        listArray.forEach(item => {
                        var listDescStrb = item.child(0).child(1).text();
                            if (listDescStrb == answer) {
                                //显示 对号
                                //var b = item.child(0).bounds();
                                //var tipsWindow = drawfloaty(b.left, b.top);
                                item.child(0).click();//点击答案
                                //sleep(randomNum(0, zsyDelay)/2);
                                hasClicked = true;                                
                                //消失 对号
                                //sleep(randomNum(0, zsyDelay)/2);
                                //tipsWindow.close();
                            }
                        });
                    } else {
                        listArray.forEach(item => {
                            var listDescStra = item.child(0).child(1).text();
                            var listDescStrb = listDescStra.substring(3);//选项去除A.B.C.D.再与answer对比
                            if (listDescStrb == answer) {
                                //显示 对号
                                //var b = item.child(0).bounds();
                                //var tipsWindow = drawfloaty(b.left, b.top);
                                item.child(0).click();//点击答案
                                //sleep(randomNum(0, zsyDelay)/2);
                                hasClicked = true;
                                //消失 对号
                                //sleep(randomNum(0, zsyDelay)/2);
                                //tipsWindow.close();
                            }
                        });
                    }
                }
                if (!hasClicked || answer.length == 0){//如果没有点击成功，或找不到题目
                    if (!hasClicked){
                        console.error("未能成功点击，随机点击");
                    }
                    if (answer.length == 0) {
                        console.error("未找到答案，随机点击");
                    }
                    let i = random(0, listArray.length - 1);
                    listArray[i].child(0).click();//随意点击一个答案
                    hasClicked = true;
                    ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
                    console.log("随机点击:"+ClickAnswer);
                    console.log("------------------------");                   
                }

                var oldaquestion = aquestion; //对比新旧题目
                sleep(randomNum(0, zsyDelay));
                //完成一道题目作答
            }                  
        }catch (e) {
            //console.log(e); //输出错误信息，调试用
            //console.error("出现错误，请检查!");
            return;                            
        }           				
    }    
}
/***************************争上游、双人对战答题部分 结束***************************/

/***************************每日、每周、专项答题部分 开始***************************/
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
    
    /*
    var questionArray = [];
    let questionCollections = className("EditText").findOnce().parent().parent();
    if (questionCollections.childCount() == 1) {//法1
        questionCollections = className("EditText").findOnce().parent();
        let findBlank = false;
        let blankCount = 0;
        let blankNumStr = "";
        questionCollections.children().forEach(item => {
            if (item.className() != "android.widget.EditText") {
                if (item.text() != "") { //题目段
                    if (findBlank) {
                        blankNumStr = "|" + blankCount.toString();
                        //log(blankNumStr);
                        questionArray.push(blankNumStr);
                        findBlank = false;
                        blankCount=0;
                    }
                    //log(item.desc());
                    questionArray.push(item.text());
                } else {
                    findBlank = true;
                    blankCount += 1;
                }
            }
        });
    console.log("法1" + questionArray);
    } else {//法2   
        questionCollections.children().forEach(item => {
            if (item.childCount() == 0) { //题目段
                questionArray.push(item.text());
            } else {
                let blankNumStr = "|" + (item.childCount() - 1).toString();
                questionArray.push(blankNumStr);
            }
        });
    console.log("法2" + questionArray);
    }
    return questionArray;
    */
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
                //显示 对号
                var b = item.child(0).bounds();
                var tipsWindow = drawfloaty(b.left, b.top);
                //时长点击
                sleep(300);
                //点击
                item.child(0).click();           
                sleep(300);
                //消失 对号
                tipsWindow.close();                
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
 * @description: 根据答案点击选择题选项,10.29修改返回点击成功与否
 * @param: answer
 * @return: null
 */
function clickByAnswer(answer) {
    let hasClicked=false;  
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOnce().children();
        listArray.forEach(item => {
            var listIndexStr = item.child(0).child(1).text().charAt(0);
            //单选答案为非ABCD
            var listDescStr = item.child(0).child(2).text();
            if (answer.indexOf(listIndexStr) >= 0 || answer == listDescStr) {
                //显示 对号
                var b = item.child(0).bounds();
                var tipsWindow = drawfloaty(b.left, b.top);
                //随机时长点击
                sleep(300);
                //点击
                item.child(0).click();           
                sleep(300);
                //消失 对号
                tipsWindow.close();   
                hasClicked=true;      
                      
            }              
        });
        return hasClicked;    
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
                if (localTiku) {
                    UpdateOrDeleteTK('up',question,correctAns);//添加或更新到本地题库
                    /*
                    if (ansTiku == "") { //题库为空则插入正确答案                
                        var sql = "INSERT INTO tiku VALUES ('" + question + "','" + correctAns + "','')";
                    } else { //更新题库答案
                        var sql = "UPDATE tiku SET answer='" + correctAns + "' WHERE question LIKE '" + question + "'";
                    }
                    insertOrUpdate(sql);
                    console.log("更新题库答案...");
                    delay(1);
                    */    
                    break;
                }
                
            } else {
                var clickPos = className("android.webkit.WebView").findOnce().child(2).child(0).child(1).bounds();
                click(clickPos.left + device.width * 0.13, clickPos.top + device.height * 0.1);
                console.error("未捕获正确答案，尝试修正");
            }
            nCout++;
        }
        //按钮点击
        var clickNextOk=false;
        if (text("下一题").exists()){
            //console.log('点击下一题');
            clickNextOk=text("下一题").findOnce().click();
            //console.log(clickNextOk);
            delay(0.5);
        } else if (text("确定").exists()) {
            //console.log('点击确定');
            clickNextOk=text("确定").findOnce().click();
            //console.log(clickNextOk);
            delay(0.5);
        } else if (text("完成").exists()) {
            //console.log('点击完成');
            clickNextOk=text("完成").findOnce().click();
            //console.log(clickNextOk);
            delay(0.5);
        } 
        
        if (!clickNextOk){ //按钮点击不成功，坐标点击 
            console.warn("未找到右上角确定按钮控件，根据坐标点击");
            click(device.width * 0.85, device.height * 0.06);//右上角确定按钮，根据自己手机实际修改
            delay(0.5);
        }
        
    } else { //正确后进入下一题，或者进入再来一局界面
        if (localTiku) {
            if (ansTiku == "" && answer != "") { 
                UpdateOrDeleteTK('up',question,answer);//添加或更新到本地题库
            }
            /*
            if (ansTiku == "" && answer != "") { //正确进入下一题，且题库答案为空              
                var sql = "INSERT INTO tiku VALUES ('" + question + "','" + answer + "','')";
                insertOrUpdate(sql);
                console.log("更新题库答案...");
            }   
            */ 
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
    console.log("题目：" + question);
    console.log("------------------------");

    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }
                
    var options = [];//选项列表
    if (!textStartsWith("填空题").exists()) {//选择题提取答案，为字形题准备
        if (className("ListView").exists()) {
            className("ListView").findOne().children().forEach(child => {
                var answer_q = child.child(0).child(2).text();
                options.push(answer_q);
            });
        } else {
            console.error("答案获取失败!");
            return;
        }
    }

    // 判断是否为字形题，网络搜题和本地搜题
    question = question.replace(/\s/g, "");

    if (question==ziXingTi.replace(/\s/g, "")) {
        question = question + options[0]; //字形题在题目后面添加第一选项               
    }

    //网络搜题和本地搜题
    var answer = getAnswer(question,"NET");//在线搜题     
    //本地搜题
    if (localTiku) {
        if (answer.length == 0) {//在线没有找到答案,本地数据库查找
            console.log("在线没有找到答案，尝试本地数据库查找");
            var ansTiku = getAnswer(question, 'tiku');
            if (ansTiku.length == 0) {//tiku表中没有则到tikuNet表中搜索答案
                 ansTiku = getAnswer(question, 'tikuNet');
            }
            var answer = ansTiku.replace(/(^\s*)|(\s*$)/g, "");
        }
    }                
    //搜题结束

    if (textStartsWith("填空题").exists()) {
        if (answer == "") { //答案空，前面题库未找到答案,找提示
            var tipsStr = getTipsStr();
            answer = getAnswerFromTips(questionArray, tipsStr);
            console.info("提示答案：" + answer);
            var answerinput=className("EditText").findOnce().parent().child(0);//10.28修改填空题的输入方法
            answerinput.setText(answer);//10.28修改填空题的输入方法
            delay(0.1);
            /*
            setText(0, answer.substr(0, blankArray[0]));
            if (blankArray.length > 1) {
                for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                }
            } 
            */                       
        } else { //答案非空，题库中已找到答案
                console.info("答案：" + answer);
                var answerinput=className("EditText").findOnce().parent().child(0);//10.28修改填空题的输入方法
                answerinput.setText(answer);//10.28修改填空题的输入方法
                delay(0.1);
                /*
                setText(0, answer.substr(0, blankArray[0]));
                if (blankArray.length > 1) {
                    for (var i = 1; i < blankArray.length; i++) {
                    setText(i, answer.substr(blankArray[i - 1], blankArray[i]));
                    }       
                }
                */
         }
    }
    else if (textStartsWith("多选题").exists() || textStartsWith("单选题").exists()) {
        if (answer == "") {
            var tipsStr = getTipsStr();
            answer = clickByTips(tipsStr);
            console.info("提示中的答案：" + answer);
        } else {
            //console.info("答案1：" + ansTiku);
            console.info("答案：" + answer);
            var clickAnswerOK=clickByAnswer(answer);   
            if (!clickAnswerOK) {//题库答案有误，选项无法点击，进行提示作答
                ansTiku='';//为checkAndUpdate准备，更新本地题库答案
                var tipsStr = getTipsStr(); //根据提示找答案
                answer = clickByTips(tipsStr);
                console.info("重新选择提示的答案：" + answer);
                delay(0.5);
            }  
        }
    }

    //按钮点击
    var clickNextOk=false;
    if (text("下一题").exists()){
        //console.log('点击下一题');
        clickNextOk=text("下一题").findOnce().click();
        //console.log(clickNextOk);
        delay(0.5);
    } else if (text("确定").exists()) {
        //console.log('点击确定');
        clickNextOk=text("确定").findOnce().click();
        //console.log(clickNextOk);
        delay(0.5);
    } else if (text("完成").exists()) {
        //console.log('点击完成');
        clickNextOk=text("完成").findOnce().click();
        //console.log(clickNextOk);
        delay(0.5);
    } 
    
    if (!clickNextOk){ //按钮点击不成功，坐标点击 
        console.warn("未找到右上角确定按钮控件，根据坐标点击");
        click(device.width * 0.85, device.height * 0.06);//右上角确定按钮，根据自己手机实际修改
        delay(0.5);
    }

    checkAndUpdate(question, ansTiku, answer);//检查提示答案，更新本地题库
    console.log("------------------------");
    delay(2);
}

/**
 * @description: 每日答题
 * @param: null
 * @return: null
 */
function dailyQuestion() {
    while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);
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
    text("每日答题").click();
    console.log("开始每日答题")
    delay(2);
    let dlNum = 0;//每日答题轮数
    while (true) {
        delay(1)
        if (!(textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {
            toastLog("没有找到题目！请检查是否进入答题界面！");
            console.error("没有找到题目！请检查是否进入答题界面！");
            console.log("停止");
            break;
        }
        dailyQuestionLoop();
        if (text("再练一次").exists()) {
            console.log("每周答题结束！")
            text("返回").click(); delay(2);
            back();
            break;
        } else if (text("查看解析").exists()) {
            console.log("专项答题结束！")
            back();delay(0.5);
            back();delay(0.5);          
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
/***************************每日、每周、专项答题部分 结束***************************/

/***************************挑战答题部分 开始***************************/
/**
 * @description: 挑战答题
 * @param: null
 * @return: null
 */
function challengeQuestion() {
	while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
    delay(2);
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
        delay(0.5);
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {
            if (conNum >= qCount) {
                lNum++;
            }
            if (lNum >= lCount) {
                console.log("挑战答题结束！返回积分界面！");
                delay(2);
                back(); delay(1);
                back(); delay(1);
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

/**
 * @description: 每次答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    let ClickAnswer;   
    if (conNum >= qCount)//答题次数足够退出，每轮5次
    {
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("今天答题次数已够，随机点击一个答案");
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        console.log("------------------------");
        //随机点击答案正确，更新到本地题库tiku表
        delay(0.5);//等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" + 
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists()) {        
            if (localTiku)   {
                console.log("随机点击答案正确，正在准备更新本地题库");
                UpdateOrDeleteTK('up',question,ClickAnswer);//添加或更新到本地题库                   
            }               
        }      
        return;
    }
    if (className("ListView").exists()) {
        var question = className("ListView").findOnce().parent().child(0).text();
        console.log((conNum + 1).toString() + ".题目：" + question);
        console.log("------------------------");
    }
    else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        console.log("------------------------");
        return;
    }

    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }

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
    
    // 判断是否为字形题，网络搜题和本地搜题
    question = question.replace(/\s/g, "");

    if (question==ziXingTi.replace(/\s/g, "")) {
        question = question + options[0]; //字形题在题目后面添加第一选项               
    }            
    
    //网络搜题和本地搜题
    var answer = getAnswer(question,"NET");//在线搜题  
             
    //本地搜题
    if (localTiku) {
        if (answer.length == 0) {//在线没有找到答案,本地数据库查找
            console.log("在线没有找到答案，尝试本地数据库查找");
            answer = getAnswer(question, 'tiku');
            if (answer.length == 0) {//tiku表中没有则到tikuNet表中搜索答案
                answer = getAnswer(question, 'tikuNet');
            }
        }
    }   
    //搜题结束
 
    if (/^[a-zA-Z]{1}$/.test(answer)) {//如果为ABCD形式
        var indexAnsTiku = indexFromChar(answer.toUpperCase());
        answer = options[indexAnsTiku];
        //toastLog("answer from char=" + answer);
    }

    let hasClicked = false;
    let listArray = className("ListView").findOnce().children();//题目选项列表
                          
    console.info("答案：" + answer);
    //如果找到答案
    
    if (answer.length != 0)//如果到答案
    {
        var clickAns = "";
        listArray.forEach(item => {
            var listDescStr = item.child(0).child(1).text();
            if (listDescStr == answer) {
                clickAns = answer;
                //显示 对号
                var b = item.child(0).bounds();
                var tipsWindow = drawfloaty(b.left, b.top);
                //随机时长点击
                delay(0.1);
                //点击
                item.child(0).click();
                hasClicked = true;
                delay(0.1);
                //消失 对号
                tipsWindow.close();
            }
        });
    }
    if (!hasClicked || answer.length == 0){//如果没有点击成功，或找不到题目
        console.error("未找到答案或未能成功点击，准备随机点击"); 
        delay(0.3);
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
		ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:"+ClickAnswer);
        //随机点击答案正确，更新到本地题库tiku表
        delay(0.5);//等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" + 
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists()) {        
            if (localTiku)   {
                console.log("随机点击答案正确，正在准备更新本地题库");
                UpdateOrDeleteTK('up',question,ClickAnswer);//添加或更新到本地题库
            }               
        }           
    } else {//从题库中找到答案，点击成功，但如果错误
        //点击答案错误，从本地题库tiku表删除
        //console.log('Test')
        delay(0.5);//等待0.5秒，是否出现X
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" + 
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists()) {        
            if (localTiku)   {
                console.log("题库答案点击错误，删除本地题库的错误答案");
                UpdateOrDeleteTK('del',question,answer);//删除本地题库的错误答案
            }
        }
    } 
    console.log("------------------------");     		
}
/***************************挑战答题部分 结束***************************/

//各个学习模块，除广播电台先开始听,其他各个学习模块随机顺序执行
function xx1(){
    console.log("正在准备每日答题");
    if (myScores['每日答题'] != 5) {
        dailyQuestion();//每日答题
    }
}

function xx2(){ 
    console.log("正在准备挑战答题");
    if (myScores['挑战答题'] != 6) {
        challengeQuestion();//挑战答题
    }
}

function xx3(){
    console.log("正在准备进行订阅");
    if (myScores['订阅'] != 2) {
        sub();//订阅
    }
}

function xx4(){
    console.log("正在准备本地频道");
    if (myScores['本地频道'] != 1) {
        localChannel();//本地频道
    }
}
  
function xx5(){
    console.log("正在准备争上游答题");
	if (myScores["争上游答题"] < 2) {
        zsyQuestion();//争上游答题
    }
}

function xx6(){
    console.log("正在准备双人对战");
    if (myScores["双人对战"] < 1) {
        SRQuestion();//双人对战
    }  
}

function xx7(){
    console.log("正在准备每周答题");
    if (myScores['每周答题'] == 0) {//无分值即尝试答题
        weeklyQuestion();//每周答题
	}
}

function xx8(){
    console.log("正在准备专项答题");
    if (myScores['专项答题'] == 0) {//无分值即尝试答题
      specialQuestion();//专项答题
  }
}

function xx9(){
    console.log("正在准备视频学习");
    let x = 0;
    while (vCount != 0) {                 
        if (customize_flag && x==1) {//自定义学习和第二次补充看视频才看百灵
             videoStudy_bailing(vCount, vTime);//百灵视频
        }else {
            videoStudy_news();//看视频 
        }                     
        console.info("等待5秒，然后确认视频是否已满分。");
        delay(5);
        getScores(2);
        x++;
        if (x > 2) {//尝试三次
            console.info("尝试3次未满分，暂时跳过。");
            break;v
        }
        delay(1);  
        num = random(0, commentText.length - 1) ;//随机数
        vCatlog = vCat[num] ;                                 
    }
}

function xx10(){
    console.log("正在准备文章学习");
    let x = 0;
	while (aCount != 0) {
        articleStudy(x);//学习文章，包含点赞、分享和评论
        console.info("等待5秒，然后确认文章是否已满分。");
        delay(5);
        getScores(1);
        x++;
        if (x > 2) {//尝试三次
            console.info("尝试3次未满分，暂时跳过。");
            break;
        }
        delay(1);
        num = random(0, commentText.length - 1) ;//随机数
        aCatlog = aCat[num] ;               
    }
}

function main() {	
    auto.waitFor();//等待获取无障碍辅助权限
    
    //开启悬浮窗口
    console.setPosition(0, device.height / 2);//部分华为手机console有bug请注释本行
    console.show();//部分华为手机console有bug请注释本行

    start_app();//启动强国app
    //articleStudy();
    //videoStudy_news();
    //exit();
    
    var path = files.path("list.db");
    var start = new Date().getTime();//程序开始时间

    getScores();//获取积分
    
    //听电台广播
    var needRadio =true;
    if (myScores['视听学习时长'] != 6){
        console.log("正在准备电台广播");
        listenToRadio();//听电台广播
    }else {
        var needRadio=false;//如果电台广播已完成
    }
    
    
    //原来学习文章，包含点赞、分享和评论改为随机顺序学习
    if (customize_flag) {//自定义
        var funArr = [xx1,xx2,xx3,xx4,xx5,xx6,xx7,xx8,xx9,xx10],func;//随机学习所有模块，即含每周答题和专项答题
    } else {
        var funArr = [xx1,xx2,xx3,xx4,xx5,xx6,xx9,xx10],func;//随机学习各模块，不含每周答题和专项答题
    }
    
    while(funArr.length != 0){//随机学习各模块
        func = funArr.splice(random(0,funArr.length-1),1)[0];
        if (!id("home_bottom_tab_button_work").exists()){
            start_app(1);
        }
        func();
    }

    var end = new Date().getTime();//重新开始广播时间
    if ( needRadio ) {
        if (rTime != 0){
            console.log("重新开始电台广播");
            listenToRadio();//听电台广播
            //var end = new Date().getTime();//重新开始广播时间
            var radio_time = (parseInt((end) / 1000));//广播已经收听的时间
            radio_timing(parseInt((end ) / 1000), rTime - radio_time);//广播剩余需收听时间
            if (rTime == 0) {//停止播放广播
                console.log("正在准备停止广播");
                stopRadio();
            }
        }
    }
    
    end = new Date().getTime();//结束时间
	console.info("您今日学习获得"+xxScores+"分");
    console.log("运行结束,共耗时" + (parseInt(end - start)) / 1000 + "秒");
    files.copy(path, "/sdcard/Download/list.db");
    console.warn("自动备份已学文章列表到/sdcard/Download!!!");

    //停止线程和脚本
    threads.shutDownAll();
    
}

//main();
module.exports = main;