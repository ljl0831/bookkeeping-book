
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    userInfo: {
      nickname: '未授权',
      userImg: ''
    },

    listData: [
      {title: '我的记账', url: '../mybooking/mybooking'},
    ]

  },

  onShow: function () {

    //如果用户授权, 则获取用户信息
    if (app.globalData.isAuth) {

      wx.getUserInfo({
        success: res => {
          this.data.userInfo = {
            nickname: res.userInfo.nickName,
            userImg: res.userInfo.avatarUrl
          }

          this.setData({
            userInfo: this.data.userInfo
          })
        }
      })

    }

  },

  goPage: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  }
})