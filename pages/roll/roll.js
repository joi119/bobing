// pages/roll/roll.js
const getRewardResult = require("../../utils/util").getRewardResult
const formatTime = require("../../utils/util").formatTime
Page({
  /**
   * 页面的初始数据
   */
  data: {
    numberStr: '',
    result: [],
    nowResult: {},
    history: [],
    toView: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 摇骰子
   */
  roll() {
    this.getRandomNumber()
    this.getRewardResult()
    const time = formatTime(new Date())
    let obj = {}
    if (this.data.nowResult.class == null) {
      wx.showToast({
        title: '运气不好，再试一次吧',
        icon: "none",
        duration: 1000
      })
      obj = {
        time: time,
        result: "nothing"
      }
    } else {
      if (this.data.nowResult.class == "状元") {
        wx.showToast({
          title: '恭喜你摇中 状元' + this.data.nowResult.name,
          icon: "none",
          duration: 500
        })
        obj = {
          time: time,
          result: "状元" + this.data.nowResult.name
        }
      } else {
        wx.showToast({
          title: '恭喜你摇中' + this.data.nowResult.name,
          icon: "none",
          duration: 500
        })
        obj = {
          time: time,
          result: this.data.nowResult.name
        }
      }
    }
    let history = this.data.history
    history.push(obj)
    this.setData({
      history: history
    })
    setTimeout(() => {
      this.setData({
        toView: "msg-" + (history.length - 1),
      })
    }, 100)
  },
  /**
   * 生成长度为6的数字串（1~6）
   */
  getRandomNumber() {
    let num = ''
    for (let i = 0; i < 6; i++) {
      num += Math.floor(Math.random() * 6 + 1)
    }
    this.setData({
      numberStr: num
    })
    this.getRewardResult()
    // console.log(num)
  },
  /**
   * 根据生成的数字串对应获得的奖项
   */
  getRewardResult() {
    let res = getRewardResult(this.data.numberStr)
    let _res = this.data.result
    _res.push(res)
    this.setData({
      result: _res,
      nowResult: res
    })
  },
})