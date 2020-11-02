/**
 *
 * ** 更新日志 | 2020.10.30更新:
 *  *  1.新增微信推送开关，默认开
 *  *  2.重新启动和登录密码函数
 *  *  3.新增结束后获取积分
 *  *  4.修改解锁是否成功的判断
 *  *  5.相关语句格式调整 
 * 
 * 说明：
 *
 *  1.支持多账号切换和微信推送，同时备份学习进度
 *  2.学习进度listX.db请复制list.db改名放在项目目录或备份目录，每次学习完成会自动备份
 *  3.微信推送采用pushplus，token可在pushplus网站中可以找到，http://pushplus.hxtrip.com/
 *  4.设置你的强国账号和密码，需要在强国APP上登录过（即设备已授权登录）
 *  5.复制到auto.js的项目目录，运行或编译即可享用，请授权无障碍和悬浮窗权限
 * 	
 * 		作者：Ivan_Huang
 *		日期：2020.9.14
 */
//
//自定义区开始 ================================================================================

var xxset = {
	"num" : 3,//账号数量
	//定义账号和密码对象集,修改或增加账号数量都可以,数量不大于num
    "1" :{
        "user":"12345678901",   //账号
        "passward":"123456", //密码
        "dbfile":"list1.db"     //学习记录文件，可复制list.db改名放在项目目录，后期会自动备份
    },
    "2" :{
        "user":"12345678902",
        "passward":"123456",
        "dbfile":"list2.db"
    },
    "3" :{
        "user":"12345678903",
        "passward":"123456",
        "dbfile":"list3.db"
    },
	"url" : "http://pushplus.hxtrip.com/send", //定义微信推送对象 url+"?token="+token+"&title="+title+"&content="+content
	"token" : "*****test*****test*****", //在pushplus网站登录可以找到自己的token
	"xxbackup" : 1,  //备份学习记录和题库，1为备份，0为不备份
    "floating" : 1,    //悬浮菜单，1为允许后打开，0为关闭
    "wxpost" : 1    //是否微信推送
}

var bakpath = "/sdcard/!goodstudy/";  //备份目录，配置文件也保存在该目录
var yjxx = "./!xxqg_v3.1.3(fixall).js";  //一键学习js

//自定义区结束 ================================================================================

//配置文件config
if (files.exists(bakpath+"config.json")) {
    //读取配置文件
    xxset = JSON.parse(files.read(bakpath+"config.json"));
    //新增属性wxpost
    if (xxset.wxpost == undefined) {
        //新增属性wxpost
        xxset.wxpost = 1;
        files.write(bakpath+"config.json", JSON.stringify(xxset));
    }
} else {
    //生成配置文件
	files.create(bakpath);//创建备份目录
    files.write(bakpath+"config.json",JSON.stringify(xxset));
}

//全局函数
//日志记录和弹出提示
function detailLog(str, log){
    var time = new java.text.SimpleDateFormat('HH:mm:ss').format(new Date());
    //str = str + "<br/>\n" + time + " " + log;
	str = str + "<br/>" + time + " " + log;
    console.log(log);
    toast(log);
    return str;
}

//登录帐号，10.25重写
function input_xxid(user,passward){
    var sign_in=textContains("登录").findOne();
    let err = false;
    while (!err) { //等待强国主页加载
         try {           
            id("et_phone_input").findOne().setText(user);
            id("et_pwd_login").findOne().setText(passward);
            sign_in=textContains("登录").findOne();
            if (sign_in.enabled()) {
                click("登录"); 
                err = true;
            }  
        } catch(e){
            console.log(e); 
            console.error("出现错误，请检查!");
            //console.log(currentActivity());
        }
    }
    //click("登录");  
    var tel = geTel(user); 
	while (!id("home_bottom_tab_button_work").exists())  {        
		sleep(2000);
		console.log("正在等待加载出主页");
    }
    DLog = detailLog(DLog, "已成功登录"+ tel + "账号"); 
    //back();  //返回，部分密码记录器弹出是否记录（如登录易）
}

//退出原帐号
function exit_xxid(){
    text("我的").findOne().click()
    //sleep(2000);
    while (!textContains("我的").exists());
    id("my_setting").findOne().click();
    //sleep(2000);
    //退出登录
    while (!textContains("退出登录").exists());
    click("退出登录"); 
    //sleep(500);
    while (!textContains("确认").exists());
    click("确认"); 
    //console.log("正在退出原帐号…");
	DLog = detailLog(DLog, "正在退出原帐号…");
    sleep(1000);
}

//启动学习强国并切换账号，10.25重写
function change_id(user,passward) {
   let err = false;
   let f;
     while (!err) { //等待强国主页加载
        try {           
            if (app.getAppName(currentPackage()) != "学习强国" ){//如果强国未启动
                console.log("启动学习强国");
                if (!launchApp("学习强国")){//启动学习强国app
                   console.error("找不到学习强国App!");
                   return;
                }               
            } else {
                //console.log(currentActivity());
                 if (currentActivity()!="com.alibaba.android.user.login.SignUpWithPwdActivity") {//如果强国界面不为密码登录页
                     if ( currentActivity()=="android.widget.FrameLayout") {//强国主界面
                        if (id("home_bottom_tab_button_work").exists()) {//如果发现"学习"按钮
                            //id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮
                            err = true;
                        }
                       
                    } else {
                        if (text("退出").exists()){//退出按钮
                            //console.log('退出');
                            var clickExit=text("退出").findOnce().click();
                            //console.log(clickExit);
                            if (!clickExit) {
                                if (className("Button").exists()) {//退出按钮
                                    className("Button").findOnce().click();
                                }
                            } 
                        }  
                        back();
                    }
                } else {
                    input_xxid(user,passward);
                    return;
                }
                if (f==3){
                        console.log("等待加载出主页");     
                        f==0;       
                }   
            }
            sleep(1000);
            f++;
         } catch (e) {//如果出错？
           //console.log(e);
           console.error("出现错误，请检查!");
        }
     }
   exit_xxid();
   input_xxid(user,passward);
}

//运行线程
function start_xx(ss) {
    threads.shutDownAll();//关闭所有线程
    let begin = require(ss);//运行线程
    begin();    //运行线程
}

//微信推送
function pushwx(title,content){
    //发送日志post
    var wxsend = http.post(xxset.url, {
        "token": xxset.token,
        "title": title,
        "content": content,
        headers: { "Content-Type": "application/json" }
    });
    return wxsend;
}

//手机号码中间4位*号处理
function geTel(tel){
    return tel.substring(0, 3)+"****"+tel.substr(tel.length-4);
}

//获取积分
function getXXScores(text) {
	//launchApp("学习强国");
	while (!id("home_bottom_tab_button_work").exists());//等待加载出主页
    id("home_bottom_tab_button_work").findOne().click();//点击主页正下方的"学习"按钮  
    console.log("正在获取积分...");
    while (!id("comm_head_xuexi_score").exists());
    id("comm_head_xuexi_score").findOnce().click();
    sleep(2000);
    let err = false;
    while (!err) {
        text = textContains("今日已累积").findOne().text();
        text = Number(text[6] + text[7]);
		sleep(500);
		if (!isNaN(text)){
			err = true;
		}
    }    
    while (!id("home_bottom_tab_button_work").exists())	{
	    back();
	    sleep(500);
	}
	return text;    
}

//是否解锁？
function isScreenLocked(){
    importClass(android.app.KeyguardManager)
    importClass(android.content.Context)
    var km = context.getSystemService(Context.KEYGUARD_SERVICE);
    //console.log("is keyguard locked:"+km.isKeyguardLocked());
    //console.log("is keyguard secure:"+km.isKeyguardSecure());
    //return km.isKeyguardLocked()&&km.isKeyguardSecure();; //屏幕是否锁？是否已启用密码等
	return km.isKeyguardLocked();
}

function wakeUpdevice(){
    //唤醒并解锁(用于定时任务)
    if (!device.isScreenOn()) {//需要解锁
        sleep(1500);
        device.wakeUpIfNeeded();
        device.wakeUp();//唤醒      
        if (device.device == "HLTE202N") {
            //海信A5，数字解锁，可参考修改，含下面的上滑解锁		
            desc(2).findOne().click();
            desc(5).findOne().click();
            desc(6).findOne().click();
            desc(9).findOne().click();
            desc(8).findOne().click();
            desc(0).findOne().click();
        }
        if (device.device == "markw"){
            //红米4高配版，魔趣，上滑解锁
            swipe(device.width/2, device.height-100, device.width/2, device.height/3, 300);
        }
        //解锁屏幕成功与否？
        sleep(1500);
        if (!isScreenLocked()) {
            DLog = detailLog(DLog, "屏幕解锁成功");
            return true;
        }else{       
            DLog = detailLog(DLog, "## 屏幕解锁不成功，请检查 ##");
            return false;            
        } 
    }
    return true;//处于屏幕激活状态，不需要解锁
}

//定义变量，推送信息的开始行
if (xxset.num>1){
    var titlemsg="多账号懒人学习";
    
} else {
    var titlemsg="一键懒人学习";
}

var DLog = "《"+new java.text.SimpleDateFormat('yyyy-MM-dd').format(new Date()) + " | " + titlemsg + "日志》";

function main() {	
    //等待无障碍权限
    auto.waitFor();
    //控制台显示
    console.setPosition(0, device.height / 2);//部分华为手机console有bug请注释本行
    console.show();//部分华为手机console有bug请注释本行

    //唤醒屏幕开始
    if (!wakeUpdevice()) {
        if(xxset.wxpost){
            //微信推送失败情况       
            var nowtime = new java.text.SimpleDateFormat('HH:mm:ss').format(new Date());
            var title=nowtime+" 自动启动懒人学习失败";
            var content=DLog;
            var wxsend=pushwx(title,content);           
        }
        //关闭悬浮窗
        console.clear();
        console.hide();
        //退出
        exit();
    }

    DLog = detailLog(DLog, "###   正在启动一键学习  ###");

    //循环完成多账户答题
    let i;   
    for (var i = 1; i <xxset.num+1; i++) {
        var dbpath = files.path(xxset[i].dbfile);
        if (xxset.xxbackup) {
            dbpath = bakpath + xxset[i].dbfile;
            if (!files.exists(dbpath)){
                files.copy(files.path(xxset[i].dbfile),dbpath);
            }
        }
        //DLog = detailLog(DLog, dbpath); //测试
        //手机号码*处理
        var tel = geTel(xxset[i].user); 
        if (files.exists(dbpath)){
            files.copy(dbpath, "./list.db");//导入学习记录
                DLog = detailLog(DLog, "导入"+tel+"的学习记录");
                sleep(1000);
            }
        if (xxset.num>1){
            change_id(xxset[i].user,xxset[i].passward);  //切换账号
        }
        start_xx(yjxx);  //一键答题
        //获取积分
        let Scores=getXXScores(Scores);
        DLog = detailLog(DLog, tel+"今日获得" + Scores+"积分");
        DLog = detailLog(DLog, "完成"+tel+"帐号的学习");       
        files.copy("./list.db",xxset[i].dbfile);  
        files.copy("./list.db",dbpath);  //备份学习记录 
        sleep(1000);
        DLog = detailLog(DLog, "备份"+tel+"的学习记录");        
    }

    //备份题库
    if (xxset.xxbackup) {
        files.copy("./tiku.db",bakpath+"tiku.db");
        DLog = detailLog(DLog, "备份学习记录到"+bakpath);
    }

    //获取电量
    var battery = device.getBattery();
    DLog = detailLog(DLog, "设备当前电量："+battery);
    if (battery < 30) {
        //发送需要充电通知
        DLog = detailLog(DLog, "需要充电了");
    }

    //推送信息的结束行     
    DLog = detailLog(DLog, "### 已完成" + titlemsg + " ###");

    //微信推送学习情况
    if (xxset.wxpost) {
        var nowtime = new java.text.SimpleDateFormat('HH:mm:ss').format(new Date());
        var title=nowtime+" 已完成" + titlemsg;
        var content=DLog;
        var wxsend=pushwx(title,content);
        //发送成功与否？
        if (wxsend.statusCode == 200) {
            DLog = detailLog(DLog, "--==  已成功推送到微信  ==--"); //成功发送日志
        }else{
            DLog = detailLog(DLog, "+++ 微信推送失败，请检查 +++");
        }
    }

    //返回桌面
    if (device.device == "HLTE202N") {//海信A5
        while (currentPackage() != "com.hmct.vision" && currentPackage() != "com.hmct.einklauncher") {
            back();
            DLog = detailLog(DLog, "返回");
            sleep(500);
        }
    }
    if (device.device == "markw"){//魔趣桌面,备用机型
        while (currentPackage() != "ch.deletescape.lawnchair.mokee" && currentPackage() != "ch.deletescape.lawnchair.LawnchairLauncher") {
            back();
            DLog = detailLog(DLog, "返回");
            sleep(500);
        }
    }

    //提示打开悬浮菜单
    if (xxset.floating) {
        DLog = detailLog(DLog, "***    30秒后打开悬浮菜单    ***");
    }else{
        DLog = detailLog(DLog, "***  30秒后关闭日志悬浮窗  ***");
    }

    //停止相关线程
    threads.shutDownAll();
    //等待30秒
    sleep(30*1000);
    //关闭悬浮窗
    console.clear();
    console.hide();

    if (xxset.floating) {
        //打开悬浮菜单
        toast("###  可手动运行 每日答题等 进行学习 ###");
        engines.execScriptFile("./!floating.js");  
    }
}
main();

