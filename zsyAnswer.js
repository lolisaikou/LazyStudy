var zCount = 2;//争上游答题轮数

importClass(android.database.sqlite.SQLiteDatabase);
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
        toastLog("未找到题库!请将题库放置与js同一目录下");
    }
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    db.execSQL(sql);
    db.close();
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
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds);//sleep函数参数单位为毫秒所以乘1000
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
    /*
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
	*/
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
    /*
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
	*/
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
    console.setPosition(0, device.height / 2);
    console.show();
    delay(1);
    if (className("android.view.View").text("开始比赛").exists()) {//争上游答题开始页
	    console.log("开始争上游答题");
        zsyQuestion();
	}else{
	    if(className("android.view.View").text("开始对战").exists()){//双人对战开始页
	        console.log("开始双人对战答题");
			SRQuestion();
	    }else{
			toastLog("没有找到 #争上游答题#或#双人对战# 的开始页！请检查是否进入相关界面！");
            console.error("没有找到 #争上游答题#或#双人对战#  开始页！请检查是否进入相关界面！");
            console.log("停止");
            exit();
		}
	}
	console.hide();
}
 	
//main() // 调试完记得注释掉
module.exports = main;
