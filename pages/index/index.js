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
      url: '/pages/roll/roll?mode=' + 'single',
    })
  },
  /**
   * 跳转联机模式 -> 获取用户信息 -> 进入选择房间页面 
   */
  goMultiMode() {
    if (wx.getStorageSync('userInfo').length == 0) {
      this.getUserProfile().then(res => {
        // console.log(res.rawData)
        const app = getApp()
        app.globalData.userInfo = res.rawData
        wx.setStorageSync('userInfo', res.rawData)
        wx.navigateTo({
          url: '/pages/select/select',
        })
      }).catch(err => {
        console.log(err)
      })
    } else {
      wx.navigateTo({
        url: '/pages/select/select',
      })
    }
  },
  /**
   * 获取用户数据
   */
  getUserProfile(e) {
    const promise = new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '获取用户信息',
        success: (res) => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
    return promise
  },
})