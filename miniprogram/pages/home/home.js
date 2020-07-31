
//导入utils
import {utils} from '../../js/utils'

Page({

  /**
   * 页面的初始数据
   */
  data: {

    currentDate: '',

    dateRange: {
      start: '',
      end: ''
    },

    bookingData: [],

    //当天收入-支出统计
    currentDayBookingData: {
      shouru: 0,
      zhichu: 0
    },

    //当月收入-支出的统计
    currentMonthBookingData: {
      shouru: 0,
      zhichu: 0
    }

  },


  //当小程序页面显示，触发该钩子
  onShow: function () {

    //控制日期范围，本月 01 - 当前
    let date = new Date();

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = month >= 10 ? month : '0' + month;

    let day = date.getDate();
    day = day >= 10 ? day : '0' + day;

    this.data.dateRange.start = year + '-' + month + '-01'
    this.data.dateRange.end = year + '-' + month + '-' + day

    this.setData({
      dateRange: this.data.dateRange,
      currentDate: month + '月' + day + '日'
    })

    

    this.getCurrentBookingData(this.data.dateRange.end);

    this.getMonthBookingData();
  },

  //选择日期
  selectDate: function (e) {
    

    let date = e.detail.value.split('-');

    this.setData({
      currentDate: date[1] + '月' + date[2] + '日'
    })

    this.getCurrentBookingData(e.detail.value);
  },

  //查询当天记账数据
  getCurrentBookingData: function(date) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_booking',
      data: {
        date
      },
      success: res => {
        wx.hideLoading();
        

        this.data.currentDayBookingData = {
          shouru: 0,
          zhichu: 0
        }

        res.result.data.forEach(v => {
          this.data.currentDayBookingData[v.costType.type] += Number(v.userBooking.money);
        })

        for (let key in this.data.currentDayBookingData) {
          this.data.currentDayBookingData[key] = utils.thousandthPlace(this.data.currentDayBookingData[key].toFixed(2));
        }

        res.result.data.forEach(v => {
          v.userBooking.money = utils.thousandthPlace(Number(v.userBooking.money).toFixed(2));
        })

        this.setData({
          bookingData: res.result.data,
          currentDayBookingData: this.data.currentDayBookingData
        })
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  },

  //获取本月的记账数据
  getMonthBookingData: function () {
    //查询条件
    //xxxx-xx-01 <= month <= xxxx-xx-今天

    

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_month_booking',
      data: this.data.dateRange,
      success: res => {
        wx.hideLoading();
        
        this.data.currentMonthBookingData = {
          shouru: 0,
          zhichu: 0,
          jieyu: []
        }

        //统计当月收入-支出
        res.result.data.forEach(v => {
          this.data.currentMonthBookingData[v.costType.type] += Number(v.userBooking.money);
        })

        

        this.data.currentMonthBookingData.jieyu = (this.data.currentMonthBookingData.shouru - this.data.currentMonthBookingData.zhichu).toFixed(2).split('.');

        this.data.currentMonthBookingData.jieyu[0] = utils.thousandthPlace(this.data.currentMonthBookingData.jieyu[0]);

        this.data.currentMonthBookingData.shouru = utils.thousandthPlace(this.data.currentMonthBookingData.shouru.toFixed(2));

        this.data.currentMonthBookingData.zhichu = utils.thousandthPlace(this.data.currentMonthBookingData.zhichu.toFixed(2));

        this.setData({
          currentMonthBookingData: this.data.currentMonthBookingData
        })



      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  }

  
})