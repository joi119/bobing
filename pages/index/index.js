// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 跳转单机模式 -> 直接进入摇骰子页面
   */
  goSingleMode() {
    wx.navigateTo({
      url: '/pages/room/room?mode=' + 'single',
    })
  },
  /**
   * 跳转联机模式 -> 进入选择房间页面
   */
  goMultiMode() {
    wx.navigateTo({
      url: '/pages/select/select',
    })
  }
})