// pages/select/select.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputRoomIsShow: false,
    roomIsShow: false,
    roomNumber: null,
    roomId: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 获取输入的房间号 
   */
  inputRoomNum(e) {
    this.setData({
      roomNumber: e.detail.value
    })
  },
  /**
   * 取消
   */
  cancel() {
    this.setData({
      inputRoomIsShow: false
    })
  },
  cancelNumber() {
    console.log("cancleNumber!!")
    this.setData({
      roomIsShow: false
    })
    wx.cloud.callFunction({
      name: "aboutRoom",
      request: "deleteRoom",
      roomId: this.data.roomId
    })
  },
  /**
   * 点击确定之后
   */
  accept() {
    this.setData({
      inputRoomIsShow: false
    })
    wx.showLoading({
      title: '房间查询中...',
    })
    wx.cloud.callFunction({
      name: "aboutRoom",
      data: {
        request: "selectRoomByRoomNumber",
        roomNumber: this.data.roomNumber
      },
      success: res => {
        console.log(res)
        if (res.result.msg == "房间存在") {
          wx.hideLoading({
            success: (res) => {},
          })
          this.setData({
            roomId: res.result.roomId
          })
          const _res = this.addMember(res.result.roomId, 0)
          wx.navigateTo({
            url: '../room/room?roomNumber=' + this.data.roomNumber + '&roomId=' +
              this.data.roomId + '&mode=multiNormal'
          })
        } else {
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showModal({
            title: '错误提示',
            content: res.result.msg,
            showCancel: false //是否显示取消按钮
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  /**
   * 成为房主 -> 把房主加入 member 字段 -> 进入等待页面(携带房间号、房间_id)
   */
  acceptNumber() {
    this.setData({
      roomIsShow: false
    })
    const res = this.addMember(this.data.roomId, 1)
    wx.navigateTo({
      url: '../room/room?roomNumber=' + this.data.roomNumber + '&roomId=' +
        this.data.roomId + '&mode=multiHost'
    })
  },
  /**
   * 把房间号复制到剪贴板
   */
  copy() {
    wx.setClipboardData({
      data: this.data.roomNumber,
      success(res) {
        wx.getClipboardData({
          success(res) {
            // console.log(res.data) // data
          }
        })
      }
    })
  },
  /**
   * 加入房间 -> 输入房间号 -> 成为普通玩家 -> 把普通玩家加入 member 字段
   *    判断当前房间是否存在 -> 进入等待页面
   */
  joinRoom() {
    this.setData({
      inputRoomIsShow: true,
    })
  },
  /**
   * 创建房间 -> 
   *    获取房间号 
   */
  createRoom() {
    wx.showLoading({
      title: '房间创建中'
    })
    wx.cloud.callFunction({
      name: "aboutRoom",
      data: {
        request: "createRoom"
      },
      success: res => {
        // console.log(res)
        if (res.result.msg == "创建成功") {
          wx.hideLoading({
            success: (res) => {},
          })
          this.setData({
            roomIsShow: true,
            roomNumber: res.result.roomNumber,
            roomId: res.result.res._id
          })
        } else {
          wx.showToast({
            title: '创建房间失败',
            icon: "error"
          })
        }
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          title: '创建房间失败'
        })
      }
    })
  },
  /**
   * 把玩家信息加入集合 room 的 member 字段中
   */
  addMember(roomId, identity) {
    console.log(identity)
    const promise = new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'aboutRoom',
        data: {
          request: "addMember",
          userInfo: wx.getStorageSync('userInfo'),
          roomId: roomId,
          identity: identity // 1 代表添加房主 0 代表添加普通玩家
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
    return promise
  }
})