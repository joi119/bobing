// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let roomNumber = Math.floor(Math.random() * (9999 - 1000)) + 1000
  roomNumber = roomNumber.toString()
  // 创建房间，获取房主 openid，返回房间号（四位）
  if (event.request == "createRoom") {
    const res = await db.collection('room').add({
      data: {
        master: wxContext.OPENID,
        roomNumber: roomNumber,
        status: 0,
        userInfo: []
      }
    })
    if (res.errMsg == "collection.add:ok") {
      return {
        msg: "创建成功",
        res,
        roomNumber
      }
    } else {
      return {
        msg: "创建失败"
      }
    }
  }
  // 修改房间状态
  else if(event.request == "updateRoomStatus") {
    console.log(event.status)
    const res = await db.collection('room').doc(event.roomId).update({
      data: {
        status: event.status
      }
    })
    console.log(res)
  }
  // 往指定房间里加入新玩家
  else if (event.request == "addMember") {
    let userInfoArr = []
    if (event.identity == 1 ) {
      userInfoArr.push(event.userInfo)
      const res = await db.collection('room').doc(event.roomId).update({
        data: {
          userInfo: userInfoArr
        }
      })
      if (res.stats.updated == 1) return {
        msg: "加入成功"
      }
     // console.log(res)
    } else {
      const __res = await db.collection('room').doc(event.roomId).get()
      userInfoArr = __res.data.userInfo
      userInfoArr.push(event.userInfo)
      const _res = await db.collection('room').doc(event.roomId).update({
        data: {
          userInfo: userInfoArr
        }
      })
      if (_res.stats.updated == 1) return {
        msg: "加入成功"
      }
      //console.log(_res)
    }
  }
  // 根据 roomNumber 查询房间是否存在，存在则返回
  else if (event.request == "selectRoomByRoomNumber") {
    const res = await db.collection('room').where({
      roomNumber: event.roomNumber
    }).get()
    console.log(res)
    if (res.data.length == 1) { //2573
      const status = res.data[0].status
      if(status == 1) {
        return {
          msg: "博饼已开始，房间无法加入"
        }
      }
      else {
      return {
        roomId: res.data[0]._id,
        msg: "房间存在"
      }
    }
    } else if (res.data.length == 0) {
      return {
        msg: "房间不存在"
      }
    } 
  }
  // 根据 roomId 查询房间，返回所有用户信息
  else if(event.request == "selectRoomByRoomId") {
    const res = await db.collection('room').doc(event.roomId).get()
    return {
      roomDetail: res.data
    }
  }
    // 根据 roomId 更新获奖历史记录
    else if (event.request == "updateHistory") {
      let res = await db.collection('room').doc(event.roomId).get()
      res = res.data.history
      // console.log(res)
      let _res = null
      if (res == undefined) {
        let history = []
        history.push(event.history)
        _res = await db.collection('room').doc(event.roomId).update({
          data: {
            history: history
          }
        })
      } else {
        res.push(event.history)
        _res = await db.collection('room').doc(event.roomId).update({
          data: {
            history: res
          }
        })
      }
      // console.log(_res)
    }
  // 用户离开房间，删除库里相关信息
  else if(event.request == "leaveRoom") {
    const  userInfo = event.userInfo
    let res = await db.collection('room').doc(event.roomId).get()
    let list = res.data.userInfo
    for (let i = 0; i < list.length; i++){
      if(list[i] == userInfo) {
        list.splice(i,1)
        break
      }
    }
    let flag = 0
    await db.collection('room').doc(event.roomId).update({
      data: {
        userInfo: list
      },
      success: res => {
        flag = 1
      }
    }
    )
    if(flag == 0) {
      return {
        status: 1
      }
    }
    else {
      return {
        status: 0
      }
    }
 }
//根据请求销毁房间
  else if(event.request == "deleteRoom") {
  const res =await db.collection('room').doc(event.roomId).remove({
    success: flag =1,
    fali: flag = 0
  })
  if(flag == 0) {
    return {
      status: 1
    }
  }
  else {
    return {
      status: 0
    }
  }
  }
}