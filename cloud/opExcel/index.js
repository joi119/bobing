const cloud = require('wx-server-sdk')

cloud.init()
let xlsx = require('node-xlsx');
const db = cloud.database()
const room = db.collection('room')
exports.main = async (event, context) => {
  let {
    fileID
  } = event
  console.log(event)
  let roomId = event.roomId
  //1. 通过fileID下载云存储里的excel文件
  const res = await cloud.downloadFile({
    fileID: fileID
  })
  const buffer = res.fileContent
  let tasks = [] // 用来存储所有的添加数据操作
  //2. 解析excel文件里的数据
  let sheets = xlsx.parse(buffer) // 获取到所有sheets
  let sheet1 = sheets[0].data
  let awardClass = []
  let datas = {}
  for (let i = 0; i < 12; i += 2) awardClass.push(sheet1[0][i])
  for (let j = 0; j < 12; j += 2) {
    let awardType = awardClass[Math.floor(j / 2)]
    let awards = []
    for (let i = 2;; i++) {
      try {
        award = {
          [sheet1[i][j]]: sheet1[i][j + 1]
        }
        if (Boolean(award[sheet1[i][j]]) === false)
          break
        awards.push(award)
      } catch (error) {
        break
      }
    }
    datas[awardType] = awards
  }
  console.log(datas)
  room.doc(roomId).update({
    data: {
      award: datas
    }
  })
}