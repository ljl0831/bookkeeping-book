// miniprogram/pages/mybooking/mybooking.js
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
    this.getAllBookingDataByUser();
  },

  //获取用户的记账数据
  getAllBookingDataByUser: function () {

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_booking_byuser',
      success: res => {
        wx.hideLoading();

        //按照日期降序排序
        res.result.data.sort((a, b) => {
          return new Date(b.userBooking.date).getTime() - new Date(a.userBooking.date).getTime();
        })

        

        this.setData({
          bookingData: res.result.data
        })
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })

  },

  //删除记账数据
  removeBookingData: function (e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'remove_booking_byid',
      data: {
        id: e.currentTarget.dataset.id
      },
      success: res => {
        wx.hideLoading();
      
        // 

        if (res.result.stats.removed == 1) {
          this.data.bookingData.splice(e.currentTarget.dataset.index, 1);

          this.setData({
            bookingData: this.data.bookingData
          })
        }

      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  }

})