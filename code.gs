/**
 *【 title 】    
 *        ～～更新情報～～
 *【Ver.1.0】    2023/06/22 運用開始
 *【Ver.1.3】    表示データ追加＆例外処理の追加
 *【Ver.1.4】    全コース対応
 *【Ver.2.0】    対応データ型拡大＆例外処理の改善
 *【Ver.2.1】    バグ修正＆処理高速化
 *【Ver.2.2】    バグ修正
 *【Ver.2.3】    バグ修正
 *【Ver.2.4】    稼働三か月記念
 *【Ver.X.X】    2024/03/17 サービス終了
 */

/**Google Classroom API呼び出し*/
function getClasses(){
  var optionalArgs = {
    pageSize: 10 // 取得最大数
  };
  var status = 'お知らせ';//この変数で投稿されたデータ型を判別する

//コースリスト取得
var response = Classroom.Courses.list();
var courseArr = response.courses;
var className;
//コース登録処理
for(var  i = 0; i <= courseArr.length - 1; i++){
  var classId = courseArr[i]['id'];
  switch(classId){
    case '':
    className='';
    break;
    
    default:
    className='非登録コース';
    //例外のコースは処理しない
  }
  console.log(`${className}を参照中 ID : ${classId}`);//ログ確認


  /**お知らせ型専用 */
  var posts = Classroom.Courses.Announcements.list(classId,optionalArgs)['announcements'];
  if(posts == undefined){
    console.log(`${className}にはお知らせがしばらく投稿されていません`);
  }else{
    var status='お知らせ';
    var createTime = Date.parse(posts[0]["creationTime"]);
    //送信
    judge(status,createTime,className);
  }

  /**資料型専用 */
  var date = Classroom.Courses.CourseWorkMaterials.list(classId)['courseWorkMaterial'];
  if(date == undefined){
    console.log(`${className}には資料がしばらく投稿されていません`);
  }else{
    var status='資料';
    var createTime = Date.parse(date[0]['creationTime']);
    //送信
    judge(status,createTime,className);
  }

  /**課題型専用 */
  var mission = Classroom.Courses.CourseWork.StudentSubmissions.list(classId,'-')['studentSubmissions'];
  //console.log(mission);
  if(mission == undefined){
    console.log(`${className}には課題がしばらく投稿されていません`);
  }else{
    var status='課題';
    var createTime = Date.parse(mission[0]['creationTime']);
    //送信
    judge(status,createTime,className);
  }
}
}

function judge(status,createTime,className){
// 投稿時間が6時間（21600000ミリ秒）以内かどうか確認
    if (Date.parse(new Date()) - createTime <= 21600000) {
      //トリガー追加
      var newTime = Date.parse(new Date()) - createTime;
          newTime = Date.parse(new Date()) - newTime;
      //送信リスト
      var messageArr={
      
      "stream": 'https://classroom.google.com/',
      "createTime": new Date(newTime),
      "love":  Math.floor( Math.random() * (99999 - 0) )

      }
// 投稿するチャット内容と設定
// discord側で作成したボットのウェブフックURL
var WEBHOOK_URL = '';
    const payload = {
 
  "username": "",
  "avatar_url": "",
  "content": "ストリームが更新されました",
  "embeds": [
    {
      "title": `My クラスルームへGo`,
      "description": `${status}が投稿されました。`,
      "url": messageArr['stream'],
      "timestamp":messageArr['createTime'],
      "color": 0x00ff00,
      "footer": {
        "text": "develop by G-goma",
        "icon_url": ""
      },
      "thumbnail": {
        "url": ""
      },
      "author": {
        "name": `${className}より`,
        "icon_url": ""
      },
      "fields": [
        {
          "name": ":thumbsup:いいね",
          "value": messageArr['love'],
          "inline":true
        },
      ]
    }
  ]
    }
    const param = {
    "method": "POST",
    "headers": { 'Content-type': "application/json" },
    "payload": JSON.stringify(payload),
  }
  UrlFetchApp.fetch(WEBHOOK_URL, param);
      console.log('Send To Server');
      console.log(`${status}から新規投稿を確認しました`);
      } else {
        //timeout
      console.log(`${status}は直近６時間以内の投稿は確認できませんでした`);
      }
}
