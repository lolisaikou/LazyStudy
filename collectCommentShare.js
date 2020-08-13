/**
 * @description: 延时函数
 * @param: seconds-延迟秒数
 * @return: null
 */
function delay(seconds)
{
    sleep(1000*seconds);//sleep函数参数单位为毫秒所以乘1000
}

var commentText = ["支持党，支持国家！", "为实现中华民族伟大复兴而不懈奋斗！", "紧跟党走，毫不动摇！", "不忘初心，牢记使命", "努力奋斗，回报祖国！"];//评论内容，可自行修改，大于5个字便计分

function main()
{
    var textOrder=text("欢迎发表你的观点").findOnce().drawingOrder();
    //toastLog("textOrder = "+textOrder);
    // var shouOrder=textOrder+2;
    var zhuanOrder=textOrder+3;
    /*className("ImageView").find().forEach(item=>{
        log(item.drawingOrder());
        if(item.drawingOrder()==shouOrder) var collectIcon=item;   
        if(item.drawingOrder()==zhuanOrder) var shareIcon=item;     
    });*/
    // var collectIcon=className("ImageView").filter(function(iv){
    //     return iv.drawingOrder()==shouOrder;
    //     }).findOnce();
        
    var shareIcon=className("ImageView").filter(function(iv){
        return iv.drawingOrder()==zhuanOrder;
        }).findOnce();
    
    //toastLog("正在进行收藏分享评论...");
    //收藏
    //var collectIcon = className("com.uc.webview.export.WebView").findOnce().parent().child(7);//右下角收藏按钮
    // collectIcon.click();//点击收藏
    // delay(2);
        //var shareIcon = className("com.uc.webview.export.WebView").findOnce().parent().child(8);//右下角分享按钮
    shareIcon.click();//点击分享
    while(!textContains("分享到学习强").exists());//等待弹出分享选项界面
    delay(2);
    click("分享到学习强国");
    delay(1);
    //toastLog("分享成功!");
    delay(1);
    back();//返回文章界面
    delay(2);
    //评论
    
    var num=random(0,commentText.length-1)//随机数
    click("欢迎发表你的观点");
    delay(1);
    setText(commentText[num]);//输入评论内容
    delay(1);
    click("发布");//点击右上角发布按钮
    //toastLog("评论成功!");
    delay(2);
    click("删除");//删除该评论
    delay(2);
    click("确认");//确认删除
    //toastLog("评论删除成功!");
    delay(2);
    // collectIcon.click();//取消收藏
    // delay(1);
    toastLog("运行结束");
    
    //toastLog("收藏成功!");
    //分享

}

module.exports=main;