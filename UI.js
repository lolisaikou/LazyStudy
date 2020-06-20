"ui";
importClass(android.view.View);
var tikuCommon = require("./tikuCommon.js");
let deviceWidth = device.width;

let margin = parseInt(deviceWidth * 0.02);

//记录集数组 重要！！！
let qaArray = [];


ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="懒人学习" />
                <tabs id="tabs" />
            </appbar>
            <viewpager id="viewpager">
                <frame>
                    <button id="showFloating" text="打开悬浮窗" w="150" h="60" circle="true" layout_gravity="center" style="Widget.AppCompat.Button.Colored" />
                </frame>
                <frame>
                    <vertical>
                        <horizontal gravity="center">
                            <input margin={margin + "px"} id="keyword" hint=" 输入题目或答案关键字" h="auto" />
                            <radiogroup orientation="horizontal" >
                                <radio id="rbQuestion" text="题目" checked="true" />
                                <radio id="rbAnswer" text="答案" />
                            </radiogroup>
                            <button id="search" text=" 搜索 " />
                        </horizontal>
                        <horizontal gravity="center">
                            <button id="lastTen" text=" 最近十条 " />
                            <button id="prev" text=" 上一条 " />
                            <button id="next" text=" 下一条 " />
                            <button id="reset" text=" 重置 " />
                        </horizontal>
                        <horizontal gravity="center">
                            <button id="update" text=" 修改 " />
                            <button id="delete" text=" 删除 " />
                            <button id="insert" text=" 新增 " />
                            <button id="updateTikuNet" text=" 更新题库 " />
                        </horizontal>
                        <progressbar id="pbar" indeterminate="true" style="@style/Base.Widget.AppCompat.ProgressBar.Horizontal" />
                        <text id="resultLabel" text="" gravity="center" />
                        <horizontal>
                            <vertical>
                                <text id="questionLabel" text="题目" />
                                <horizontal>
                                    <text id="questionIndex" text="0" />
                                    <text id="slash" text="/" />
                                    <text id="questionCount" text="0" />
                                </horizontal>
                            </vertical>
                            <input margin={margin + "px"} id="question" w="*" h="auto" />
                        </horizontal>
                        <horizontal>
                            <text id="answerLabel" text="答案" />
                            <input id="answer" w="*" h="auto" />
                        </horizontal>
                        <horizontal gravity="center">
                            <button id="daochu" text="导出题库" />
                            <button id="daoru" text="导入题库" />
                        </horizontal>
                    </vertical>
                </frame>
                <frame>
                    <vertical>
                        <webview id="webview" h="*" w="auto" />
                    </vertical>
                </frame>
            </viewpager>
        </vertical>
    </drawer>
);

//标签名
ui.viewpager.setTitles(["功能", "题库", "帮助与更新"]);
//联动
ui.tabs.setupWithViewPager(ui.viewpager);

//帮助页加载
var src = "https://github.com/lolisaikou/LazyStudy/blob/master/README.md";
ui.webview.loadUrl(src);

//进度条不可见
ui.run(() => {
    ui.pbar.setVisibility(View.INVISIBLE);
});

//加载悬浮窗
ui.showFloating.click(() => {
    engines.execScriptFile("floating.js");
});

//查询
ui.search.click(() => {
    //预先初始化
    qaArray = [];
    threads.shutDownAll();
    ui.run(() => {
        ui.question.setText("");
        ui.answer.setText("");
        ui.questionIndex.setText("0");
        ui.questionCount.setText("0");
    });
    //查询开始
    threads.start(function () {
        if (ui.keyword.getText() != "") {
            var keyw = ui.keyword.getText();
            if (ui.rbQuestion.checked) {//按题目搜
                var sqlStr = util.format("SELECT question,answer FROM tiku WHERE %s LIKE '%%%s%'", "question", keyw);
            } else {//按答案搜
                var sqlStr = util.format("SELECT question,answer FROM tiku WHERE %s LIKE '%%%s%'", "answer", keyw);
            }
            qaArray = tikuCommon.searchDb(keyw, "tiku", sqlStr);
            var qCount = qaArray.length;
            if (qCount > 0) {
                ui.run(() => {
                    ui.question.setText(qaArray[0].question);
                    ui.answer.setText(qaArray[0].answer);
                    ui.questionIndex.setText("1");
                    ui.questionCount.setText(String(qCount));
                });
            } else {
                toastLog("未找到");
                ui.run(() => {
                    ui.question.setText("未找到");
                });
            }
        } else {
            toastLog("请输入关键字");
        }
    });
});

//最近十条
ui.lastTen.click(() => {
    threads.start(function () {
        var keyw = ui.keyword.getText();
        qaArray = tikuCommon.searchDb(keyw, "", "SELECT question,answer FROM tiku ORDER BY rowid DESC limit 10");
        var qCount = qaArray.length;
        if (qCount > 0) {
            //toastLog(qCount);
            ui.run(() => {
                ui.question.setText(qaArray[0].question);
                ui.answer.setText(qaArray[0].answer);
                ui.questionIndex.setText("1");
                ui.questionCount.setText(qCount.toString());
            });
        } else {
            toastLog("未找到");
            ui.run(() => {
                ui.question.setText("未找到");
            });
        }
    });
});

//上一条
ui.prev.click(() => {
    threads.start(function () {
        if (qaArray.length > 0) {
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            if (qIndex > 0) {
                ui.run(() => {
                    ui.question.setText(qaArray[qIndex - 1].question);
                    ui.answer.setText(qaArray[qIndex - 1].answer);
                    ui.questionIndex.setText(String(qIndex));
                });
            } else {
                toastLog("已经是第一条了！");
            }
        } else {
            toastLog("题目为空");
        }
    });
});

//下一条
ui.next.click(() => {
    threads.start(function () {
        if (qaArray.length > 0) {
            //toastLog(qaArray);
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            if (qIndex < qaArray.length - 1) {
                //toastLog(qIndex);
                //toastLog(qaArray[qIndex + 1].question);
                ui.run(() => {
                    ui.question.setText(qaArray[qIndex + 1].question);
                    ui.answer.setText(qaArray[qIndex + 1].answer);
                    ui.questionIndex.setText(String(qIndex + 2));
                });
            } else {
                toastLog("已经是最后一条了！");
            }
        } else {
            toastLog("题目为空");
        }
    });
});

//修改
ui.update.click(() => {
    threads.start(function () {
        if (ui.question.getText() && qaArray.length > 0 && parseInt(ui.questionIndex.getText()) > 0) {
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            var questionOld = qaArray[qIndex].question;
            var questionStr = ui.question.getText();
            var answerStr = ui.answer.getText();
            var sqlstr = "UPDATE tiku SET question = '" + questionStr + "' , answer = '" + answerStr + "' WHERE question=  '" + questionOld + "'";
            tikuCommon.executeSQL(sqlstr);
        } else {
            toastLog("请先查询");
        }
    });
});

//删除
ui.delete.click(() => {
    threads.start(function () {
        if (qaArray.length > 0 && parseInt(ui.questionIndex.getText()) > 0) {
            var qIndex = parseInt(ui.questionIndex.getText()) - 1;
            var questionOld = qaArray[qIndex].question;
            var sqlstr = "DELETE FROM tiku WHERE question = '" + questionOld + "'";
            tikuCommon.executeSQL(sqlstr);
        } else {
            toastLog("请先查询");
        }
    });
});

//新增
ui.insert.click(() => {
    threads.start(function () {
        if (ui.question.getText() != "" && ui.answer.getText() != "") {
            var questionStr = ui.question.getText();
            var answerStr = ui.answer.getText();
            var sqlstr = "INSERT INTO tiku VALUES ('" + questionStr + "','" + answerStr + "','')";
            tikuCommon.executeSQL(sqlstr);
        } else {
            toastLog("请先输入 问题 答案");
        }
    });
});

function reset() {

}
//重置
ui.reset.click(() => {
    threads.shutDownAll();
    threads.start(function () {
        qaArray = [];
        ui.run(() => {
            ui.keyword.setText("");
            ui.question.setText("");
            ui.answer.setText("");
            ui.questionIndex.setText("0");
            ui.questionCount.setText("0");
            ui.rbQuestion.setChecked(true);
        });
        toastLog("重置完毕!");
    });
});

//更新网络题库
ui.updateTikuNet.click(() => {
    dialogs.build({
        title: "更新网络题库",
        content: "确定更新？",
        positive: "确定",
        negative: "取消",
    })
        .on("positive", update)
        .show();

    function update() {
        threads.start(function () {
            ui.run(() => {
                ui.resultLabel.setText("正在更新网络题库...");
                ui.pbar.setVisibility(View.VISIBLE);
            });
            var ss = "./updateTikuNet.js";
            let begin = require(ss);
            var resultNum = begin();
            var resultStr = "更新" + resultNum + "道题！";
            ui.run(() => {
                ui.resultLabel.setText("");
                ui.pbar.setVisibility(View.INVISIBLE);
                ui.resultLabel.setVisibility(View.INVISIBLE);
            });
            alert(resultStr);
        });
    }
});

var path = files.path("tiku.db")
ui.daochu.click(() => {
    files.copy(path, "/sdcard/Download/tiku.db");
    toastLog("已将题库复制到/sdcard/Download文件夹下");
});

ui.daoru.click(() => {
    dialogs.build({
        title: "提示",
        content: "请确认文件已经放在\n/sdcard/Download文件夹下\n导入后会删除导出的题库",
        positive: "确定",
        negative: "取消",
    }).on("positive", copy)
        .show();
    function copy() {
        files.copy("/sdcard/Download/tiku.db", path);
        toastLog("导入成功！");
    }
});