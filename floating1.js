
//toastLog(" 请在无障碍中选择本 APP");
auto.waitFor();

let window = floaty.window(
    <vertical>
        <button id="move" text=" 移    动 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
        <button id="switchXX" text=" 切到 强国 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
        <button id="startLL" text=" 一键学习 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
        <button id="startDT" text=" 挑战答题 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
        <button id="startMR" text=" 每日答题等 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
       //button id="updateTK" text=" 更新题库 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
	    <button id="startZSY" text=" 上游答题等 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
        <button id="stop" text=" 停    止 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
        <button id="exit" text=" 退出悬浮窗 " w="90" h="35" bg="#77ffffff" textSize="10sp" />
    </vertical>
);

let deviceWidth = device.width;
let deviceHeight = device.height;
window.setPosition(deviceWidth * 0.55, deviceHeight * 0.54);
setInterval(() => {
}, 1000);


let wx, wy, downTime, windowX, windowY;
// 这个函数是对应悬浮窗的移动
window.move.setOnTouchListener(function (view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            wx = event.getRawX();
            wy = event.getRawY();
            windowX = window.getX();
            windowY = window.getY();
            downTime = new Date().getTime();
            return true;
        case event.ACTION_MOVE:
            // 如果按下的时间超过 xx 秒判断为长按，调整悬浮窗位置
            if (new Date().getTime() - downTime > 300) {
                window.setPosition(windowX + (event.getRawX() - wx), windowY + (event.getRawY() - wy));
            }
            return true;
        case event.ACTION_UP:
            // 手指弹起时如果偏移很小则判断为点击
            if (Math.abs(event.getRawY() - wy) < 30 && Math.abs(event.getRawX() - wx) < 30) {
                toastLog(" 长按调整位置 ")
            }
            return true;
    }
    return true;
});

window.switchXX.click(() => {
    toastLog(" 切换到学习强国APP...");
    if (!launchApp("学习强国"))//启动学习强国app
    {
        console.error("找不到学习强国App!");
        return;
    }
});

// 这个函数是对应悬浮窗的退出
window.exit.click(() => {
    toastLog(" 退出！");
    exit();
});

let th = null;

//一键学习
window.startLL.click(() => {
    let ss = "./xxqg_v3.1.3(fixall).js";
    startTh(ss);
});
//挑战答题
window.startDT.click(() => {
    let ss = "./challengeAnswer.js";  //新挑战答题
    startTh(ss);
});
//每日答题
window.startMR.click(() => {
    let ss = "./dailyAnswer.js";
    startTh(ss);
});

window.startZSY.click(() => {
    let ss = "./zsyAnswer.js";
    startTh(ss);
});
/*
//更新题库
window.updateTK.click(() => {
     dialogs.build({
        title: "更新网络题库",
        content: "更新约耗时几分钟，确定更新？",
        positive: "确定",
        negative: "取消",
    })
        .on("positive", update)
        .show();

	function update() {
        threads.start(function () {
        	//悬浮提示等待
            var w = floaty.rawWindow(
                <frame gravity="center" bg="#ffffffff" >
                    <text id="text" textSize="30sp"> 
                    ------------
                    正在更新题库…
                    ------------
                    ###请勿退出###
                    ------------
                    </text>
                </frame>
            );
            w.setPosition(deviceWidth*0.2, deviceHeight*0.4);
            w.setSize(deviceWidth*0.8, deviceHeight*0.24);
           
            //更新题库
            var ss = "./updateTikuNet.js"; 
            //toastLog("正在更新题库，请勿退出…");
		    let begin = require(ss);
            var resultNum = begin();
            var resultStr = "更新了" + resultNum + "道题！";
            w.close();//关闭悬浮提示
             //toastLog(resultStr);
            alert(resultStr);//弹出更新结果
        });
	}
});
*/

//停止
window.stop.click(() => {
    if (th == null) {
        toastLog(" 没有进行中的脚本 ");
    } else {
        if (th.isAlive()) {
            threads.shutDownAll();
            toastLog(" 停止！");
        } else {
            toastLog(" 没有进行中的脚本 ");
        }
    }
});

function startTh(fileStr) {
    var ss = fileStr;
    if (th == null) {
        th = threads.start(function () {
            toastLog(" 开启线程");
            let begin = require(ss);
            begin();
        });
    } else {
        if (th.isAlive()) {
            toastLog(" 脚本都在运行了你还点！？");
        } else {
            th = threads.start(function () {
                let begin = require(ss);
                begin();
            });
        }
    }
}