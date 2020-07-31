// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

//获取查询指令引用
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {

  //查询条件: xxxx-xx-01 <= date <= xxxx-xx-今天

  try {

    return await db.collection('booking').where({
      userInfo: event.userInfo,
      userBooking: {
        date: _.gte(event.start).and(_.lte(event.end))
      } 
    }).get();

  } catch (err) {
    console.log('err ==> ', err);
  }
  
}