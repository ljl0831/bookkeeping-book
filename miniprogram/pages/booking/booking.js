
//获取小程序注册实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    //图标数据
    icons: [],

    tagData: [
      {
        title: '收入',
        type: 'shouru',
        isActive: true
      },
      {
        title: '支出',
        type: 'zhichu',
        isActive: false
      }
    ],

    //账户选择数据
    accountData: [
      {
        title: '现金',
        isActive: true
      },
      {
        title: '支付宝',
        isActive: false
      },
      {
        title: '微信',
        isActive: false
      },
      {
        title: '信用卡',
        isActive: false
      },
      {
        title: '储蓄卡',
        isActive: false
      }
    ],

    bookingInfo: {
      date: '选择日期',
      money: '',
      comment: ''
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //获取图标数据
    this.getIconsData();

  },

  //切换标签
  toggleTag: function(e) {
    //事件对象
    // 
    //如果当前已经激活,则拦截
    if (e.currentTarget.dataset.active) {
      
      return;
    }

    //去除之前激活的标签
    let data = this.data[e.currentTarget.dataset.key];
    for (let i = 0; i < data.length; i++) {
      if (data[i].isActive) {
        data[i].isActive = false;
        break;
      }
    }

    //激活当前点击的标签
    data[e.currentTarget.dataset.index].isActive = true;

    //设置页面响应数据
    this.setData({
      [e.currentTarget.dataset.key]: data
    })
  },

  //获取图标数据
  getIconsData: function () {

    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    //调用云函数【get_icons】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_icons',
      
      //成功执行的回调函数
      success: res => {
        wx.hideLoading();
        // 
        res.result.data.forEach(v => {
          v.isActive = false;
        })
        this.setData({
          icons: res.result.data
        })
      },

      fail: err => {
        wx.hideLoading();
        
      }
    })
  },

  //选择日期, 输入金额, 输入备注
  userBookingInfo: function (e) {

    

    let bookingInfo = this.data.bookingInfo;
    bookingInfo[e.currentTarget.dataset.key] = e.detail.value;
    this.setData({
      bookingInfo
    })
  },

  //保存
  save: function () {

    //判断用户是否授权认证
    if (!app.globalData.isAuth) {
      wx.showModal({
        title: '提示',
        content: '请先授权认证',
        success (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../auth/auth'
            })
          }
        }
      })

      return;
    }


    let bookingData = {};

    //验证用户是否选择 记账类型（餐饮, 购物....）
    for (let i = 0; i < this.data.icons.length; i++) {
      if (this.data.icons[i].isActive) {
        bookingData.bookingType = {
          title: this.data.icons[i].title,
          type: this.data.icons[i].type,
          url: this.data.icons[i].url
        };
        break;
      }
    }

    if (!bookingData.bookingType) {
      wx.showToast({
        title: '请选择记账类型',
        icon: 'none',
        duration: 2000
      })

      return;
    }

    //验证日期和金额是否填写
    if (this.data.bookingInfo.date == '选择日期') {
      wx.showToast({
        title: '选择日期',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (this.data.bookingInfo.money == '') {
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    //获取记账数据

    //收入-支出
    for (let i = 0; i < this.data.tagData.length; i++) {
      if (this.data.tagData[i].isActive) {
        bookingData.costType = {
          title: this.data.tagData[i].title,
          type: this.data.tagData[i].type
        };
        break;
      }
    }

    //账户选择
    for (let i = 0; i < this.data.accountData.length; i++) {
      if (this.data.accountData[i].isActive) {
        bookingData.accountType = this.data.accountData[i].title;
        break;
      }
    }

    bookingData.userBooking = Object.assign({}, this.data.bookingInfo);

    // 
    
    //写入记账数据
    this.addBooking(bookingData);
  },

  //写入记账数据
  addBooking: function (data) {
    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'add_booking_byuser',
      data,
      success: res => {
        wx.hideLoading();
        
      },

      fail: err => {
        wx.hideLoading();
        
      }
    })
  }

})