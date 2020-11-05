importClass(android.database.sqlite.SQLiteDatabase);
var lCount = 1;//挑战答题轮数
var qCount = randomNum(5, 7);//挑战答题每轮答题数(5~7随机),5次为最高分
var zCount = 2;//争上游答题轮数
var ziXingTi = "选择词语的正确词形。"; //字形题，已定义为全局变量
var zsyDelay = 100; //定义争上游答题延时时间，示例为0-100的随机值，参考某些学习工具的延时时间为100ms，即0.1秒
var localTiku = true; ////是否启用本地题库的搜索和更新(true:1启用，false:0不启用)，网络搜题或随机点击到正确答案时会同时更新本地题库

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
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds) {
    sleep(1000 * seconds);//sleep函数参数单位为毫秒所以乘1000
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
 * @description: 从数据库中搜索答案,没有答案就添加(存在即更新),或删除题库中的问题列
 * @param: upOrdel,question,answer;upOrdel:'up'=1,'del'=0
 * @return: null
 */
function UpdateOrDeleteTK(upOrdel, question, answer) {//只针对tiku表，添加/更新或删除相应的列
    let dbName = "tiku.db";//题库文件名
    let path = files.path(dbName);
    if (!files.exists(path)) {
        console.log("题库不存在，返回！");
        return;
    }
    if (question == undefined) {
        console.log("题目为空，返回！");
        return;
    }
    if (upOrdel == "up" || upOrdel == 1) {//更新题库
        let db = SQLiteDatabase.openOrCreateDatabase(path, null);
        if (answer == undefined) {
            console.log("答案为空，返回！");
            return;
        }
        let sql1 = "SELECT answer FROM tiku WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
        let cursor = db.rawQuery(sql1, null);//查找是否存在
        if (!cursor.moveToFirst()) { //不存在，添加到题库                                  
            sql1 = "INSERT INTO tiku VALUES ('" + question + "','" + answer + "','')";
            console.log("更新答案到本地题库...");
            db.execSQL(sql1);
        } else { //修正题库答案                                     
            if (cursor.getString(0) != answer) {   //题库答案和目的答案不一致   
                //console.log('题库答案：'+cursor.getString(0)); //调试用                         	
                sql1 = "UPDATE tiku SET answer='" + answer + "' WHERE question LIKE '" + question + "'";
                console.log("修正本地题库答案...");
                db.execSQL(sql1);
            }
        }
        cursor.close();
        db.close();   //关闭数据库 
        delay(1);
    } else if (upOrdel == "del" || upOrdel == 0) {
        let db = SQLiteDatabase.openOrCreateDatabase(path, null);
        let sql2 = "SELECT answer FROM tiku WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
        let cursor = db.rawQuery(sql2, null);//查找是否存在
        if (cursor.moveToFirst()) { //题库存在，删除该列                                  
            sql2 = "DELETE FROM tiku WHERE question LIKE '" + question + "'";//删库语句
            console.log("删除本地题库的相关题目列...");
            db.execSQL(sql2);
        } else {
            console.log("本地题库找不到对应的题目，删除失败。");
        }
        cursor.close();
        db.close(); //关闭数据库 
        delay(1);
    }
}

/**
 * @description: 从数据库中搜索答案,10.25改写，table_name=NET时启用在线搜索
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question, table_name) {//11.3取得时光在线题库的授权
	if (table_name == "NET") {//网络搜题  
		let netTiku = "http://sg89.cn/api/tk1.php"; //在线题库
		let netziXingTi = "选择词语的正确词形%。"; //字形题网络原题，含空格+第一选项，改为通配%
		let netquestion = question.replace(ziXingTi, netziXingTi);//还原字形题的原题目（含空格）+第一个选项
		//发送日志post
		try {
			let zxda = http.post(netTiku, {//在线答案
				"t": "da",
				"q": netquestion
			});
			//判断发送是否成功
			// (zxda.statusCode = 200) {//post成功info
			let zxanswer = zxda.body.json();
			if (zxanswer.code == -1) { //未找到答案
				console.error("在线题库未找到答案");
				return '';
			} else {//找到答案 (0||1)
				let answer = zxanswer.as;//在线答案
				//console.log("网络题目:"+netquestion);//调试用
				//console.info("题库题目:" + question);//调试用   
				//console.log("------------------------");  //调试用  
				//添加或更新本地题库答案
				if (localTiku) {
					UpdateOrDeleteTK('up', question, answer);//添加或更新到本地题库
				}
				return answer;//返回答案
			}
		} catch (e) {
			console.log(e);//调试用
			console.error("搜索在线题库出错，请检查!");
			//toastLog("搜索在线题库出错，请检查");
			return '';
			
		} else {//搜本地题库
        let dbName = "tiku.db";//题库文件名
        let path = files.path(dbName);
        let db = SQLiteDatabase.openOrCreateDatabase(path, null);
        let sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
        //log(sql)
        let cursor = db.rawQuery(sql, null);
        if (cursor.moveToFirst()) {
            let answer = cursor.getString(0);
            cursor.close();
            db.close();
            return answer;
        } else {
            console.error("本地题库中未找到答案");
            cursor.close();
            db.close();
            return '';
        }
    }
}

function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
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
    /*
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
    */
    if (className("android.view.View").text("开始比赛").exists()) {
        className("android.view.View").text("开始比赛").findOne().click();
    }
    delay(5);
    let zNum = 1;//轮数
    console.warn("第" + zNum.toString() + "轮争上游答题开始...")
    while (true) {
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束
        {
            console.info("争上游答题本局结束!");
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
                //back(); delay(1);
                //back(); delay(1); 
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
        } else if (textContains("距离答题结束").exists() && !text("继续挑战").exists()) {
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
    /*
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
    */
    if (className("android.view.View").text("邀请对手").exists()) {
        className("android.view.View").text("邀请对手").findOne().parent().child(0).click();
    }
    delay(1);
    if (className("android.view.View").text("开始对战").exists()) {
        className("android.view.View").text("开始对战").findOne().click();
    }
    delay(5);
    let zNum = 1;//轮数
    //console.warn("第" + zNum.toString() + "轮开始...") //双人对战只一局得分
    while (true) {
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() || textContains("请明日再来").exists() || className("android.view.View").text("非积分奖励局").exists()) {//遇到继续挑战，则本局结束
            console.info("双人对战本局结束!");
            zNum++;
            if (zNum >= zCount) {
                console.log("双人对战结束！返回主页！");
                if (textContains("知道了").exists()) {//今日次数已超过
                    className("android.widget.Button").text("知道了").findOne().click();
                    delay(1);
                    //back(); delay(1);
                    //back(); delay(1);                
                    break;
                }
                //回退返回主页
                back(); delay(1);
                back(); delay(1);
                if (text("退出").exists()) {
                    className("android.widget.Button").text("退出").findOne().click();
                    delay(1);
                }
                //back(); delay(1);
                //back(); delay(1);
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
        } else if (textContains("距离答题结束").exists() && !text("继续挑战").exists()) {
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
            if (aquestion != oldaquestion && question != "") {
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

                if (question == ziXingTi.replace(/\s/g, "")) {
                    question = question + options[0].substring(3); //字形题在题目后面添加第一选项               
                }

                //网络搜题和本地搜题
                var answer = getAnswer(question, "NET");//在线搜题               
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
                if (answer.length != 0) {//如果找到了答案 该部分问题: 选项带A.B.C.D.，题库返回答案不带，char返回答案带
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
                            var listDescStrc = listDescStrb.replace(/\s/g, "");
                            if (listDescStrb == answer || listDescStrc == answer) {
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
                if (!hasClicked || answer.length == 0) {//如果没有点击成功，或找不到题目
                    if (!hasClicked) {
                        console.error("未能成功点击，随机点击");
                    }
                    if (answer.length == 0) {
                        console.error("未找到答案，随机点击");
                    }
                    let i = random(0, listArray.length - 1);
                    listArray[i].child(0).click();//随意点击一个答案
                    hasClicked = true;
                    ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
                    console.log("随机点击:" + ClickAnswer);
                    console.log("------------------------");
                }

                var oldaquestion = aquestion; //对比新旧题目
                sleep(randomNum(0, zsyDelay));
                //完成一道题目作答
            }
        } catch (e) {
            console.log(e); //输出错误信息，调试用
            console.error("出现错误，请检查!");
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
            delay(0.3);
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
    let hasClicked = false;
    if (className("ListView").exists()) {
        var listArray = className("ListView").findOnce().children();
        listArray.forEach(item => {
            var listIndexStr = item.child(0).child(1).text().charAt(0);
            //单选答案为非ABCD
            var listDescStr = item.child(0).child(2).text();
            var listDescStrc = listDescStr.replace(/\s/g, "");
            if (answer.indexOf(listIndexStr) >= 0 || answer == listDescStr || listDescStrc == answer) {
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
                hasClicked = true;

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
                    UpdateOrDeleteTK('up', question, correctAns);//添加或更新到本地题库
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
        var clickNextOk = false;
        if (text("下一题").exists()) {
            //console.log('点击下一题');
            clickNextOk = text("下一题").findOnce().click();
            //console.log(clickNextOk);
            delay(0.5);
        } else if (text("确定").exists()) {
            //console.log('点击确定');
            clickNextOk = text("确定").findOnce().click();
            //console.log(clickNextOk);
            delay(0.5);
        } else if (text("完成").exists()) {
            //console.log('点击完成');
            clickNextOk = text("完成").findOnce().click();
            //console.log(clickNextOk);
            delay(0.5);
        }

        if (!clickNextOk) { //按钮点击不成功，坐标点击 
            console.warn("未找到右上角确定按钮控件，根据坐标点击");
            click(device.width * 0.85, device.height * 0.06);//右上角确定按钮，根据自己手机实际修改
            delay(0.5);
        }

    } else { //正确后进入下一题，或者进入再来一局界面
        if (localTiku) {
            if (ansTiku == "" && answer != "") {
                UpdateOrDeleteTK('up', question, answer);//添加或更新到本地题库
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

    if (question == ziXingTi.replace(/\s/g, "")) {
        question = question + options[0]; //字形题在题目后面添加第一选项               
    }

    //网络搜题和本地搜题
    var answer = getAnswer(question, "NET");//在线搜题     
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
            var answerinput = className("EditText").findOnce().parent().child(0);//10.28修改填空题的输入方法
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
            var answerinput = className("EditText").findOnce().parent().child(0);//10.28修改填空题的输入方法
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
            var clickAnswerOK = clickByAnswer(answer);
            if (!clickAnswerOK) {//题库答案有误，选项无法点击，进行提示作答
                ansTiku = '';//为checkAndUpdate准备，更新本地题库答案
                var tipsStr = getTipsStr(); //根据提示找答案
                answer = clickByTips(tipsStr);
                console.info("重新选择提示的答案：" + answer);
                delay(0.5);
            }
        }
    }

    //按钮点击
    var clickNextOk = false;
    if (text("下一题").exists()) {
        //console.log('点击下一题');
        clickNextOk = text("下一题").findOnce().click();
        //console.log(clickNextOk);
        delay(0.5);
    } else if (text("确定").exists()) {
        //console.log('点击确定');
        clickNextOk = text("确定").findOnce().click();
        //console.log(clickNextOk);
        delay(0.5);
    } else if (text("完成").exists()) {
        //console.log('点击完成');
        clickNextOk = text("完成").findOnce().click();
        //console.log(clickNextOk);
        delay(0.5);
    }

    if (!clickNextOk) { //按钮点击不成功，坐标点击 
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
                //back(); delay(1);
                //back(); delay(1);
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
    let conNum = 0;//连续答对的次数
    let lNum = 0;//轮数
    while (true) {
        delay(2);
        if (!className("RadioButton").exists()) {
            toastLog("没有找到题目！请检查是否进入答题界面！");
            console.error("没有找到题目！请检查是否进入答题界面！");
            console.log("停止");
            break;
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
                //back(); delay(0.5);
                //back(); delay(0.5);
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

    if (className("ListView").exists()) {
        var question = className("ListView").findOnce().parent().child(0).text();
        console.log((conNum + 1).toString() + ".题目：" + question);
        console.log("------------------------");
    } else {
        console.error("提取题目失败!");
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:" + ClickAnswer);
        console.log("------------------------");
        return;
    }

    var chutiIndex = question.lastIndexOf("出题单位");
    if (chutiIndex != -1) {
        question = question.substring(0, chutiIndex - 2);
    }

    if (conNum >= qCount)//答题次数足够退出，每轮5次
    {
        let listArray = className("ListView").findOnce().children();//题目选项列表
        let i = random(0, listArray.length - 1);
        console.log("今天答题次数已够，随机点击一个答案");
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:" + ClickAnswer);
        console.log("------------------------");
        //随机点击答案正确，更新到本地题库tiku表
        delay(0.5);//等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists()) {
            if (localTiku) {
                console.log("随机点击答案正确，正在准备更新本地题库");
                UpdateOrDeleteTK('up', question, ClickAnswer);//添加或更新到本地题库                   
            }
        }
        return;
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

    if (question == ziXingTi.replace(/\s/g, "")) {
        question = question + options[0]; //字形题在题目后面添加第一选项               
    }

    //网络搜题和本地搜题
    var answer = getAnswer(question, "NET");//在线搜题  

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
            var listDescStrc = listDescStr.replace(/\s/g, "");
            if (listDescStr == answer || listDescStrc == answer) {
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
    if (!hasClicked || answer.length == 0) {//如果没有点击成功，或找不到题目
        console.error("未找到答案或未能成功点击，准备随机点击");
        delay(0.3);
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
        ClickAnswer = listArray[i].child(0).child(1).text();;//记录已点击答案
        console.log("随机点击:" + ClickAnswer);
        //随机点击答案正确，更新到本地题库tiku表
        delay(0.5);//等待0.5秒，是否出现X
        if (!text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists()) {
            if (localTiku) {
                console.log("随机点击答案正确，正在准备更新本地题库");
                UpdateOrDeleteTK('up', question, ClickAnswer);//添加或更新到本地题库
            }
        }
    } else {//从题库中找到答案，点击成功，但如果错误
        //点击答案错误，从本地题库tiku表删除
        //console.log('Test')
        delay(0.5);//等待0.5秒，是否出现X
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists()) {
            if (localTiku) {
                console.log("题库答案点击错误，删除本地题库的错误答案");
                UpdateOrDeleteTK('del', question, answer);//删除本地题库的错误答案
            }
        }
    }
    console.log("------------------------");
}
/***************************挑战答题部分 结束***************************/

function main() {
    console.setPosition(0, device.height / 2);
    console.show();
    delay(1);

    if (className("android.view.View").text("开始比赛").exists()) {//争上游答题开始页
        console.log("开始争上游答题");
        zsyQuestion();
    } else if (className("android.view.View").text("开始对战").exists()) {//双人对战开始页
        console.log("开始双人对战答题");
        SRQuestion();
    } else if ((textStartsWith("填空题").exists() || textStartsWith("多选题").exists() || textStartsWith("单选题").exists())) {//每日答题等有单选或多选题
        console.log("开始 每日/每周/专项 答题");
        dailyQuestion();
    } else if (className("ListView").exists()) {//答题界面
        var questionNum = className("ListView").findOnce().parent().child(0).text().substring(0, 2); //争上游和对战题目前带序号1.
        if (questionNum != "1.") {
            //不含序号“1.”，且不提示单选或多选题，则判断为挑战答题界面
            console.log("开始挑战答题");
            challengeQuestion();
        }
    } else {
        toastLog("没有找到(每日/每周/专项) (挑战答题/争上游答题/双人对战)的开始页！");
        console.error("没有找到(每日/每周/专项) (挑战答题/争上游答题/双人对战)的开始页！");
        console.log("");
        //打开我要答题界面
        console.log("! 请手动打开答题界面再重试 !");
        console.log("争上游和双人挑战在等待页即可（即在 开始挑战/对战 的界面）");
    }
    console.hide();
}

//main();
module.exports = main;
