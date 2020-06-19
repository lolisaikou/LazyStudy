/**
@description: 学习平台订阅
@param: null
@return: null
*/
function main() {
    h = device.height;//屏幕高
    w = device.width;//屏幕宽
    x = (w / 3) * 2;//横坐标2分之3处
    h1 = (h / 6) * 5;//纵坐标6分之5处
    h2 = (h / 6);//纵坐标6分之1处
    click("订阅");
    sleep(random(1000, 2000));
    click("添加");
    sleep(random(1000, 2000));
    var i = 0;
    var sub = 0
    while (i < 2) {
        var object = desc("订阅").find();
        if (!object.empty()) {
            // 遍历点赞图标
            object.forEach(function (currentValue, index) {
                // currentValue:点赞按钮           
                if (currentValue && i < 2) {
                    var like = currentValue.parent()
                    if (like.click()) {
                        console.log("订阅成功");
                        i++;
                        sleep(random(1000, 2000)); //随机延时
                    } else {
                        console.error("订阅失败");
                    }
                }
            })
        } else if (text("你已经看到我的底线了").exists()) {
            if (sub == 0) {
                sub++;
                click("学习平台", 0)
                console.log("没有可订阅的强国号了，尝试订阅学习平台。");
                sleep(2000);
                continue;
            } else {
                console.error("没有可以订阅的平台了!");
                break;
            }
        }
        else {
            swipe(x, h1, x, h2, 500);
        }
    }
    back();
    sleep(random(1000, 2000));
}
main();
// module.exports = main;