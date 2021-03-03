
importClass(android.database.sqlite.SQLiteDatabase);
var zCount =2;//四人赛轮数

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
 * @description: 从数据库中搜索答案
 * @param: question 问题
 * @return: answer 答案
 */
function getAnswer(question, table_name) {
    var dbName = "tiku.db";//题库文件名
    var path = files.path(dbName);
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '%" + question + "%'"// 关键词前后都加%，增加搜索准确率
    //log(sql)
    var cursor = db.rawQuery(sql, null);
    if (cursor.moveToFirst()) {
        var answer = cursor.getString(0);
        cursor.close();
        return answer;
    }
    else {
        console.log("题库中未找到答案");
        cursor.close();
        return '';
    }
}


function indexFromChar(str) {
    return str.charCodeAt(0) - "A".charCodeAt(0);
}

/**
 * @description: 四人赛循环
 * @param: null
 * @return: null
 */
var oldaquestion;//全局变量，定义旧题目，对比新题目用

function zsyQuestionLoop() {
    //delay(1);
    if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() || !className("RadioButton").exists()) {//不存在本局结束标志 继续挑战，则执行  
        console.info("答题结束!");
        return;
    } else {
        while (!className("RadioButton").exists());//@KB64ba建议使用while判断
        if (className("RadioButton").exists() || aquestion.length == 0) {
            var aquestion = className("ListView").findOnce().parent().child(0).text();
            var question = aquestion.substring(4); //争上游和对战题目前带1.2.3.需去除
            //找题目，防出错      
            while (aquestion == oldaquestion || question == "") {
                delay(0.8);
                if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists() || !className("RadioButton").exists()) {
                    console.info("答题结束!");
                    return;
                }
                //找题目 
                aquestion = className("ListView").findOnce().parent().child(0).text();
                question = aquestion.substring(3);
            }
            //           
        } else {
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
        if (aquestion != oldaquestion) {
            console.log(aquestion.substring(0, 2) + "题目:" + question);
            reg = /.*择词语的正确.*/g // 正则判断是否为字形
            if (reg.test(question)) {
                //log(options)
                var optionStr = options;
                for (i in optionStr) {//替换搜索用的数组
                    optionStr[i] = options[i].substring(3);
                }
                var optionStr = options.join("");
                question = question + optionStr;
                question = question.substr(1);//开头删除一个字
                question = question.substr(0, question.length - 1);//结尾删除一个字，增加搜索的准确率
            } else {
                question = question.substr(1);//开头删除一个字
                question = question.substr(0, question.length - 1);//结尾删除一个字，增加搜索的准确率
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
            /* if (answer == "")*/ //如果没找到答案
            if (answer.length == 0) {
                let i = random(0, listArray.length - 1);
                console.error("没有找到答案，随机点击");
                listArray[i].child(0).click();//随意点击一个答案
                hasClicked = true;
                console.log("---------------------------");
            }
            else//如果找到了答案
            {   //该部分问题: 选项带A.B.C.D.，题库返回答案不带，char返回答案带
                var answer_a = answer.substring(0, 2);//定义answer_a，获取答案前两个字符对比A.B.C.D.应该不会出现E选项
                if (answer_a == "A." || answer_a == "B." || answer_a == "C." || answer_a == "D.") {
                    listArray.forEach(item => {
                        var listDescStrb = item.child(0).child(1).text();
                        if (listDescStrb == answer) {
                            item.child(0).click();//点击答案
                            hasClicked = true;
                            console.log("---------------------------");
                        }
                    });
                } else {
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
        oldaquestion = aquestion;
        delay(1);
    }
}


/**
 * @description: 四人赛答题 20200928增加
 * @param: null
 * @return: null
 */
function zsyQuestion() {

    if (className("android.view.View").text("开始比赛").exists()) {
        className("android.view.View").text("开始比赛").findOne().click();
    }
    delay(10);
    let zNum = 0;//轮数
    while (true) {
        if (className("RadioButton").exists()) {
            zsyQuestionLoop();
        }
        if (className("android.view.View").text("继续挑战").exists() || textContains("继续挑战").exists())//遇到继续挑战，则本局结束        
        {
            console.info("争上游答题本局结束!");
            zNum++;
            //当天上限两次
            if (className("android.view.View").text("非积分奖励局").exists()) {
                console.info("今天已完成争上游答题!");
                zNum++;
            }//
            if (zNum >= zCount) {
                console.log("争上游答题结束");
                //回退4次返回主页 
                delay(1);
                back();
                break;
            } else {
                console.log("即将开始下一轮...")
                console.info("2秒后开始下一轮")
                delay(2);//等待2秒开始下一轮
                back();
                text("开始比赛").click();
                delay(10);
            }
            console.warn("第" + zNum.toString() + "轮开始...")
        }
    }
}


//

// function main() {
//     console.setPosition(0, device.height / 2);
//     console.show();
//     delay(1);
//     if (className("android.view.View").text("开始比赛").exists() || className("android.view.View").text("区配成功").exists() || className("RadioButton").exists()) {//争上游答题开始页
//         console.log("开始争上游答题");
//         zsyQuestion();
//     } else {
//         // toastLog("没有找到 “争上游答题”或“双人对战” 的开始页！请检查是否进入相关界面！");
//         console.error("没有找到 “争上游答题”或“双人对战”  开始页！请检查是否进入相关界面！");
//         console.log("停止");
//         console.hide();
//     }

// }
function main() {
    console.setPosition(0, device.height / 2);//部分华为手机console有bug请注释本行
    console.show();
    delay(1);
    console.log("进入四人赛...");
    zsyQuestion();
    console.hide()
}
//main()
module.exports = main;