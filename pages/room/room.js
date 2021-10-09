
// pages/room/room.js
const db = wx.cloud.database()
let flag = 0
let time = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    identity: null, // 0：单人模式 1：普通玩家 2：房主
    roomNumber: null,
    roomId: null,
    userInfo: [],
    master: '',
    avatarArray: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      roomNumber: options.roomNumber,
      roomId: options.roomId
    })
    this.getIdentity(options)
    this.getAllUser()
    this.getUserOpenid()
    db.collection('room').doc(this.data.roomId).watch({
      onChange: snapshot => {
        console.log("watchrunnig!")
        //监控数据发生变化时触发
        // console.log('docs\'s changed events', snapshot.docChanges)
        // console.log('query result snapshot after the event', snapshot.docs)
        // console.log('init data', snapshot.docChanges[0].dataType)
        // console.log("--------------------------------------------")
        let array = []
        console.log(snapshot)
        console.log(snapshot.docs[0])
        for (let i = 0; i < snapshot.docs[0].userInfo.length; i++) {
          array.push(JSON.parse(snapshot.docs[0].userInfo[i]).avatarUrl)
        }
        this.setData({
          avatarArray: array
        })
        //console.log(snapshot.docs[0].status == 1)
        if (snapshot.docs[0].status == 1 && !flag && this.data.identity == 1) {
          flag = 1
          wx.navigateTo({
            url: '../roll/roll?identity=' + this.data.identity + '&roomId=' + this.data.roomId
          })
        }
      },
      onError: err => {
        console.error('the watch closed because of error', err)
      }
    })

  },
  onUnload: function () {
    this.listenBack()
  },
  /**
   * 获取当前页面用户身份，根据身份不同显示不同内容
   */
  getIdentity(options) {
    // console.log(options.mode)
    switch (options.mode) {
      case 'single':
        this.setData({
          identity: 0
        })
        break
      case 'multiNormal':
        this.setData({
          identity: 1
        })
        break
      case 'multiHost':
        this.setData({
          identity: 2
        })
        break
    }
  },
  /**
   * 获取房间内所有信息
   */
  getAllUser() {
    wx.showLoading({
      title: '房间加载中...',
    })
    wx.cloud.callFunction({
      name: 'aboutRoom',
      data: {
        request: "selectRoomByRoomId",
        roomId: this.data.roomId
      },
      success: res => {
        // console.log(res)
        let userInfo = res.result.roomDetail.userInfo
        for (let i = 0; i < userInfo.length; i++) {
          userInfo[i] = JSON.parse(userInfo[i])
        }
        this.setData({
          userInfo: userInfo,
          master: res.result.roomDetail.master
        })
        wx.showToast({
          title: '加载完成',
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  /**
   * 根据身份携带参数跳转到 roll 页面
   */
  toRoll() {
    wx.cloud.callFunction({
      name: 'aboutRoom',
      data: {
        request: "updateRoomStatus",
        roomId: this.data.roomId,
        status: 1
      },
      success: res => {
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
    wx.navigateTo({
      url: '../roll/roll?identity=' + this.data.identity + '&roomId=' + this.data.roomId
    })
  },
  /**
   * 1. 选择 excel 文件
   * 2. 上传 excel 文件到云存储
   * 3. 调用云函数解析 excel 文件
   * 4. 把解析后的内容存到云数据库的 room 集合里
   */
  chooseExcel() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: res => {
        // console.log(res.tempFiles[0].path)
        this.uploadExcel(res.tempFiles[0].path)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  uploadExcel(url) {
    wx.showLoading({
      title: '奖品上传中...',
    })
    wx.cloud.uploadFile({
      cloudPath: new Date().getTime() + '.xlsx',
      filePath: url,
      success: res => {
        // console.log(res)
        wx.showToast({
          title: '上传成功',
        })
        this.analyzeExcel(res.fileID)
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          title: '上传失败！请再试',
        })
      },
      complete: res => {
        wx.hideLoading()
      }
    })
  },
  analyzeExcel(url) {
    wx.cloud.callFunction({
      name: 'opExcel',
      data: {
        fileID: url,
        roomId: this.data.roomId
      },
      success: res => {
        // console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  /**
   * 普通用户加入房间后离开房间
   */
  leaveRoom() {
    wx.cloud.callFunction({
      name: 'aboutRoom',
      data: {
        request: 'leaveRoom',
        roomId: this.data.roomId,
        userInfo: wx.getStorageSync('userInfo')
      }
    })
    wx.navigateTo({
      url: '../index/index'
    })
  },
  /**
   *  获取用户的 openid
   *
   */
  getUserOpenid() {
    wx.cloud.callFunction({
      name: "aboutUser",
      data: {
        request: "getOpenid"
      }
    }).then(res => {
      wx.setStorageSync('openid', res.result.openid)
    })
  },
  /**
   * 删除房间
   */
  deleteRoom() {
    wx.cloud.callFunction({
      name: "aboutRoom",
      data: {
        request: "deleteRoom",
        roomId: this.data.roomId
      },
      success: res => {
        console.log(res)
      },
      fail: res => {
        console.log(res)
      }
    })
  },
  /**
   * 监听返回键
   */
  listenBack() {
    let msg = "确定要离开吗？"
    let isMaster = 0
    if (wx.getStorageSync('openid') == this.data.master) {
      isMaster = 1
      msg = "房主离开后房间将被解散" + msg
    }
    if (isMaster == 1) {
      this.deleteRoom()
      wx.showToast({
        title: '您已解散房间',
        icon: "none"
      })
    }
    else {
      this.leaveRoom()
      wx.showToast({
        title: '您已离开房间',
        icon: "none"
      })
    } 
    wx.removeStorageSync('openid')
  },
  // 提供文件模板
  downloadExcel() {
    wx.showLoading({
      title: '文件下载中...',
    })
    wx.cloud.downloadFile({
      fileID: 'cloud://cloud1-6gcr9vzj5471eb00.636c-cloud1-6gcr9vzj5471eb00-1307696975/奖品名单.xlsx', // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath)
        wx.hideLoading()
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: res => {
            wx.openDocument({
              filePath: res.savedFilePath,
              success: res => {
                console.log(res)
              }
            })
          }
        })
      },
      fail: console.error
    })
  }
  
})