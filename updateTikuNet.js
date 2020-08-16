// 加载jsoup.jar
runtime.loadJar("./jsoup-1.12.1.jar");
// 使用jsoup解析html
importClass(org.jsoup.Jsoup);
importClass(org.jsoup.nodes.Document);
//importClass(org.jsoup.nodes.Element);
importClass(org.jsoup.select.Elements);

importClass(android.database.sqlite.SQLiteDatabase);
/**
 * @description: 更新数据库tikuNet表
 * @param  {} liArray li列表，包含题目和答案
 */
function CreateAndInsert(liArray){

    var dbName = "tiku.db";
    //文件路径
    var path = files.path(dbName);
    //确保文件存在
    if (!files.exists(path)) {
        files.createWithDirs(path);
    }
    //创建或打开数据库
    var db = SQLiteDatabase.openOrCreateDatabase(path, null);
    var createTable = "\
    CREATE TABLE IF NOT EXISTS tikuNet(\
    question CHAR(253),\
    answer CHAR(100)\
    );";
    var cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    db.execSQL(cleanTable);
    log("创建打开清空表tikuNet!");

    var sql = "INSERT INTO tikuNet (question, answer) VALUES (?, ?)";
    db.beginTransaction();
    var stmt = db.compileStatement(sql);
    for (var li = 0, len = liArray.size(); li < len; li++) {
        //log("题目："+li.text());
        var liText = liArray.get(li).text();
        var timuPos=liText.indexOf("】")+1;
        var tiMu=liText.substring(timuPos).replace(/_/g, "");
        var daAn = liArray.get(li).select("b").first().text();
        log(util.format("题目:%s\n答案:%s"),tiMu,daAn);
        stmt.bindString(1, tiMu);
        stmt.bindString(2, daAn);
        stmt.executeInsert();
        stmt.clearBindings();
    }
    db.setTransactionSuccessful();
    db.endTransaction();
    db.close();
    return true;
}


/**
 */
function updateTikunet() {
    log("开始下载题库json数据...");
    var htmlString = Jsoup.connect("http://49.235.90.76:5000").maxBodySize(0).timeout(10000).get();
    var htmlArray = Jsoup.parse(htmlString);
    var liArray = htmlArray.select("li:has(b)");
    log('题库下载完毕，', util.format("题目总数：%s"), liArray.size());
    //执行更新
    log("开始更新数据库...");
    if (CreateAndInsert(liArray)) {
        log("数据库更新完毕！");
        return liArray.size();
    } else {
        return -1;
    }
}
//updateTikunet();
module.exports = updateTikunet;

