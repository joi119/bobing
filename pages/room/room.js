// pages/room/room.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    identity: -1 // 0：单人模式 1：普通玩家 2：房主
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIdentity(options)
  },
  /**
   * 获取当前页面用户身份
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
  
})