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
    for (var li = 0, len = liArray.length; li < len; li++) {
        //log("题目："+li.text());
        var tiMu = liArray[li].content;
        var daAn = liArray[li].answer;
        var xuanXiang = liArray[li].options;
        tiMu = tiMu + xuanXiang;
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
    var htmlArray = http.get("https://cdn.jsdelivr.net/gh/lolisaikou/tiku-autoupdate/questions.json");
    var liArray = htmlArray.body.json();
    log(util.format("题库下载完毕，题目总数:%s"), liArray.length);
    //执行更新
    log("开始更新数据库...");
    if (CreateAndInsert(liArray)) {
        log("数据库更新完毕！");
        return liArray.length;
    } else {
        return -1;
    }
}
//updateTikunet();
module.exports = updateTikunet;

