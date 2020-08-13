importClass(android.database.sqlite.SQLiteDatabase);
var lCount = 1;//挑战答题轮数
var qCount = 5;//挑战答题每轮答题数

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
    sql = "SELECT answer FROM " + table_name + " WHERE question LIKE '" + question + "%'"
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
 * @description: 每次答题循环
 * @param: conNum 连续答对的次数
 * @return: null
 */
function challengeQuestionLoop(conNum) {
    if (conNum >= qCount)//答题次数足够退出，每轮5次
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
        delay(randomNum(0.5, 1));
        listArray[i].child(0).click();//随意点击一个答案
        hasClicked = true;
        console.log("------------");
    }
    else//如果找到了答案
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
                delay(randomNum(0.5, 1.5));
                //点击
                item.child(0).click();
                hasClicked = true;
                sleep(300);
                //消失 对号
                tipsWindow.close();
            }
        });
    }
    if (!hasClicked)//如果没有点击成功
    {
        console.error("未能成功点击，随机点击一个");
        delay(randomNum(0.5, 1));
        let i = random(0, listArray.length - 1);
        listArray[i].child(0).click();//随意点击一个答案
        console.log("------------");
    }
}

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
        delay(1);
        if (text("v5IOXn6lQWYTJeqX2eHuNcrPesmSud2JdogYyGnRNxujMT8RS7y43zxY4coWepspQkvw" +
            "RDTJtCTsZ5JW+8sGvTRDzFnDeO+BcOEpP0Rte6f+HwcGxeN2dglWfgH8P0C7HkCMJOAAAAAElFTkSuQmCC").exists())//遇到❌号，则答错了,不再通过结束本局字样判断
        {
            if (conNum >= qCount) {
                lNum++;
            }
            if (lNum >= lCount) {
                console.log("挑战答题结束！返回积分界面！");
                back();
                delay(1);
                back();
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

function main() {
    console.setPosition(0, device.height / 2);//部分华为手机console有bug请注释本行
    console.show();
    delay(1);
    challengeQuestion();
    console.hide()
}

module.exports = main;


