// pages/roll/roll.js
const getRewardResult = require("../../utils/util").getRewardResult
const formatTime = require("../../utils/util").formatTime
const db = wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    numberStr: '', // 生成的随机长度为6的字串
    result: [], // 所有历史匹配结果
    nowResult: {}, // 当前匹配结果
    history: [], // 历史记录
    toView: '', // 控制 scroll-view 总是滑动到最后一项
    yue: false, // 控制骰子容器显示与隐藏
    identity: 0, // 0：单人模式 1：普通玩家 2：房主
    roomId: null,
    award: {},
    awardList: [], // 奖品列表
    playerList: [], // 玩家列表
    showPlayerList: false,
    showAwardList: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    if (options.roomId != null) {
      this.setData({
        roomId: options.roomId,
        identity: options.identity
      })
      this.getRoomDetail(options.roomId)
      db.collection('room').doc(options.roomId).watch({
        onChange: snapshot => {
          //监控数据发生变化时触发
          // console.log('docs\'s changed events', snapshot.docChanges)
          // console.log('query result snapshot after the event', snapshot.docs)
          // console.log('init data', snapshot.docChanges[0].dataType)
          // console.log("--------------------------------------------")
          let array = []
          for (let i = 0; i < snapshot.docs[0].userInfo.length; i++) {
            array.push(JSON.parse(snapshot.docs[0].userInfo[i]))
          }
          if (snapshot.docs[0].history != undefined) {
            this.setData({
              playerList: array,
              history: snapshot.docs[0].history
            })
          } else {
            this.setData({
              playerList: array
            })
          }
        },
        onError: err => {
          console.error('the watch closed because of error', err)
        }
      })
    }

    this.onAccelerometer()
  },
  onUnload: function () {
    wx.offAccelerometerChange()
  },
  /**
   * 根据 roomId 获取所有房间信息
   */
  getRoomDetail(roomId) {
    wx.showLoading({
      title: '房间请求中...',
    })
    wx.cloud.callFunction({
      name: 'aboutRoom',
      data: {
        request: "selectRoomByRoomId",
        roomId: roomId
      },
      success: res => {
        wx.showToast({
          title: '请求成功',
        })
        // console.log(res.result.roomDetail)
        let playerList = []
        for (let i = 0; i < res.result.roomDetail.userInfo.length; i++) {
          playerList.push(JSON.parse(res.result.roomDetail.userInfo[i]))
        }
        this.setData({
          award: res.result.roomDetail.award,
          playerList: playerList
        })
        let arr = []
        for (let item in this.data.award) {
          let _arr = []
          for (let i = 0; i < this.data.award[item].length; i++) {
            // console.log(this.data.award[item][i])
            for (let childItem in this.data.award[item][i]) {
              // console.log(childItem, this.data.award[item][i][childItem])
              _arr.push({
                name: childItem,
                number: this.data.award[item][i][childItem]
              })
            }
          }
          arr.push({
            name: item,
            content: _arr
          })
        }
        this.setData({
          awardList: arr
        })
        // console.log(this.data.awardList)
        // console.log(this.data.playerList)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  /**
   * 震动触发摇骰子
   */
  onAccelerometer() {
    let startTime = new Date().getTime()
    let flag = 1
    wx.onAccelerometerChange(res => {
      if ((Math.abs(res.x) > 1.25 || Math.abs(res.y) > 1.25 || Math.abs(res.z) > 1.25) && flag == 1) {
        this.roll()
        setTimeout(() => {
          wx.vibrateShort({
            type: 'heavy',
            success: res => {
              console.log(res)
            }
          })
        }, 400)
        flag = 0
      }
      let endTime = new Date().getTime()
      if (endTime - startTime >= 2000) {
        flag = 1
        startTime = endTime
      }
    })
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
    if (this.data.identity != 0) {
      obj.nickName = JSON.parse(wx.getStorageSync('userInfo')).nickName
      wx.cloud.callFunction({
        name: 'aboutRoom',
        data: {
          request: "updateHistory",
          roomId: this.data.roomId,
          history: obj
        },
        success: res => {
          console.log(res)
        },
        fail: err => {
          console.log(err)
        }
      })
    }
    let history = this.data.history
    history.push(obj)
    this.setData({
      history: history
    })
    setTimeout(() => {
      this.setData({
        toView: "msg-" + (history.length - 1),
        yue: true
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
  /**
   * 显示\隐藏成员\奖品列表的弹出框
   */
  showAwardList() {
    this.setData({
      showAwardList: true
    })
  },
  showPlayerList() {
    this.setData({
      showPlayerList: true
    })
  },
  hidePlayerList() {
    this.setData({
      showPlayerList: false
    })
  },
  hideAwardList() {
    this.setData({
      showAwardList: false
    })
  }
})