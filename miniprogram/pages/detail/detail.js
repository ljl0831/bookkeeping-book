// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookingData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    

    //截取查询参数
    let ids = options.ids;
    

    wx.setNavigationBarTitle({
      title: options.costtitle + '-' + options.title + '-' + '记账详情'
    })

    this.getBooingDataById(ids);
  },

  //根据id查询记账数据
  getBooingDataById: function (ids) {

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_booking_byid',
      data: {
        ids
      },
      success: res => {
        wx.hideLoading();
        

        this.setData({
          bookingData: res.result.data
        })
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })

  }

  
})