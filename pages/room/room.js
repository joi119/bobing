// pages/room/room.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    identity: null, // 0：单人模式 1：普通玩家 2：房主
    roomNumber: null,
    roomId: null,
    userInfo: [],
    master: ''
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
  },
  /**
   * 获取当前页面用户身份，根据身份不同显示不同内容
   */
  getIdentity(options) {
    switch (options.mode) {
      case 'single':
        this.setData({
          identity: 0
        })
      case 'multiNormal':
        this.setData({
          identity: 1
        })
      case 'multiHost':
        this.setData({
          identity: 2
        })
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
        console.log(res)
        let userInfo = res.result.roomDetail.userInfo
        for(let i = 0; i < userInfo.length; i++) {
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

})