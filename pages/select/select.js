// pages/select/select.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputRoomIsShow: false,
    roomNumber: 0
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
      inputRoomIsShow: false,
    })
  },
  /**
   * 点击确定之后
   */
  accept() {
    this.setData({
      inputRoomIsShow: false,
    })

  },
  /**
   * 加入房间 -> 输入房间号 -> 成为普通玩家
   *    判断当前房间是否存在 -> 进入等待页面
   */
  joinRoom() {
    this.setData({
      inputRoomIsShow: true,
    })
  },
  /**
   * 创建房间 -> 成为房主
   *    获取房间号 -> 进入等待页面
   */
  createRoom() {

  }
})