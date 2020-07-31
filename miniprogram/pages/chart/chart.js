import {
  utils
} from '../../js/utils'

let wxCharts = require('../../js/wxcharts.js')

Page({

  data: {

    //年月日查询
    dateType: {
      titles: ['年', '月', '日'],
      default: 1
    },

    //开始日期-结束日期
    date: {
      start: '',
      end: ''
    },

    //当前选择日期
    currentDate: '',

    //切换收入-支出统计
    titleData: [{
        title: '收入',
        total: 0,
        type: 'shouru',
        isActive: true
      },
      {
        title: '支出',
        total: 0,
        type: 'zhichu',
        isActive: false
      }
    ],

    //每月31号
    day31: ['01', '03', '05', '07', '08', '10', '12'],


    typesData: {
      //收入统计分类 (餐饮, 出行 ....)
      shouru: [],

      //支出统计分类 (餐饮, 出行 ....)
      zhichu: []
    },

    //当前选择的类型: 收入-支出
    currentType: 'shouru',

    //canvas宽度
    canvasWidth: 0

  },

  onShow: function () {
    //获取屏幕宽度
    const res = wx.getSystemInfoSync();

    this.setData({
      canvasWidth: res.screenWidth
    })

    


    //获取开始日期, 项目上线时间
    this.getOnlineDate();
  },

  //获取开始日期, 项目上线时间
  getOnlineDate: function () {

    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_date',
      success: res => {
        wx.hideLoading();
        
        if (res.result.data.length > 0) {
          this.data.date.start = res.result.data[0].onlineDate;
          let end = utils.formatDate(new Date(), 'yyyy-MM-dd');
          this.data.date.end = end;

          // 

          this.setData({
            date: this.data.date,
            currentDate: end
          })

          this.getBookingDataByDate();
        }
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  },

  //切换年月日查询
  toggleDateType: function () {
    let dateType = this.data.dateType;
    dateType.default = dateType.default == dateType.titles.length - 1 ? 0 : dateType.default+1;
    this.setData({
      dateType
    })

    this.getBookingDataByDate();
  },

  //选择日期
  selectDate: function (e) {
    this.setData({
      currentDate: e.detail.value
    })

    this.getBookingDataByDate();
  },

  //切换收入-支出
  toggleTitle: function (e) {
    if (e.currentTarget.dataset.active) {
      return;
    }

    for (let i = 0; i < this.data.titleData.length; i++) {
      if (this.data.titleData[i].isActive) {
        this.data.titleData[i].isActive = false;
        break;
      }
    }

    this.data.titleData[e.currentTarget.dataset.index].isActive = true;

    this.setData({
      titleData: this.data.titleData,
      currentType: this.data.titleData[e.currentTarget.dataset.index].type
    })

    //绘制饼图
    this.drawPie(this.data.typesData[this.data.currentType]);
  },

  //根据日期查询记账数据 （年月日）
  getBookingDataByDate: function () {

    //获取当前日期
    let current = utils.formatDate(new Date(), 'yyyy-MM-dd');

    let date = current.split('-');
    

    let currentDate = this.data.currentDate.split('-');
    

    //start
    //end
    //日期条件范围
    let dateCondition = {
      start: '',
      end: ''
    }

    //按日查询, 条件 date = yyyy-MM-dd
    if (this.data.dateType.default == 2) {

      dateCondition.start = this.data.currentDate;

    } else if (this.data.dateType.default == 1) {
      //按月查询, 条件 yyyy-MM-01 <= date <= yyyy-MM-dd

      dateCondition.start = currentDate[0] + '-' + currentDate[1] + '-01';

      //判断是否同年
      if (date[0] == currentDate[0]) {
        

        //同月
        if (date[1] == currentDate[1]) {
          dateCondition.end = current;
        } else {

          //不同月, 月的天数可能是 28, 29, 30, 31
          if (currentDate[1] == '02') {

            //判断年份是否为闰年
            if (currentDate[0] % 400 == 0 || (currentDate[0] % 4 == 0 && currentDate[0] % 100 != 0)) {
              dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-29';
            } else {
              dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-28';
            }
          } else {

            //不是2月份, 先判断是否为含有31号
            if (this.data.day31.indexOf(currentDate[1]) > -1) {
              dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-31';
            } else {
              dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-30';
            }


          }

        }

      } else {

        //不同年按月查询
        if (currentDate[1] == '02') {

          //判断年份是否为闰年
          if (currentDate[0] % 400 == 0 || (currentDate[0] % 4 == 0 && currentDate[0] % 100 != 0)) {
            dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-29';
          } else {
            dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-28';
          }
        } else {

          //不是2月份, 先判断是否为含有31号
          if (this.data.day31.indexOf(currentDate[1]) > -1) {
            dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-31';
          } else {
            dateCondition.end = currentDate[0] + '-' + currentDate[1] + '-30';
          }


        }


      }



    } else {
      //按年查询
      dateCondition.start = currentDate[0] + '-01-01';

      //判断是否同年
      if (date[0] == currentDate[0]) {
        //同年
        dateCondition.end = current;
      } else {
        //不同年
        dateCondition.end = currentDate[0] + '-12-31';
      }

    }

    

    //根据日期查询和收入-支出类型查询记账数据
    this.getBookingData(dateCondition);


  },

  //绘制饼图
  drawPie: function (data) {
    if (data.length == 0) {
      return;
    }
    new wxCharts({
      canvasId: 'pieCanvas',
      type: 'pie',

      //饼图数据
      series: data,
      width: this.data.canvasWidth,
      height: 300,
      dataLabel: true
    });
  },

  //根据日期查询记账数据
  getBookingData: function (date) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_booking_bydate',
      data: {
        start: date.start,
        end: date.end
      },
      success: res => {
        wx.hideLoading();
        

        //按照收入-支出分类

        let bookingData = {
          shouru: [],
          zhichu: []
        };

        res.result.data.forEach(v => {

          bookingData[v.costType.type].push(v);

        })

        

        //统计总收入-支出
        let totalMoney = {
          shouru: 0,
          zhichu: 0
        };
        this.data.titleData.forEach(v => {
          v.total = 0;
          bookingData[v.type].forEach(v1 => {
            v.total += Number(v1.userBooking.money);
            totalMoney[v.type] += Number(v1.userBooking.money);
          })
        })

        this.data.titleData.forEach(v => {
          v.total = utils.thousandthPlace(v.total.toFixed(2));
        })


        //收入-支出统计分类 (餐饮, 出行 ....)

        //获取餐饮、出行....类型
        let types = {

        };

        for (let key in bookingData) {

          //key: shouru 或者 zhichu

          types[key] = [];

          let data = bookingData[key];

          data.forEach(v => {
            if (types[key].indexOf(v.bookingType.type) === -1) {
              types[key].push(v.bookingType.type);
            }
          })

        }

        



        for (let key in types) {

          //key: shouru 或者 zhichu


          this.data.typesData[key] = [];


          types[key].forEach(v => {

            //随机生成颜色
            let rgb = [];
            for (let i = 0; i < 3; i++) {
              //在0-255之间生成随机数据
              let random = Math.ceil(Math.random() * 255);
              rgb.push(random);
            }

            rgb = 'rgb(' + rgb.join(',') + ')';

            //rgb(199, 100, 178);

            //v: canyin 、chuxing 、....
            let o = {
              [v]: [],

              //笔数
              count: 0,

              //当前类型总金额
              total: 0,

              //类型标题: 餐饮、出行、....
              title: '',

              //图标路径
              url: '',

              //收入-支出标题
              costTitle: '',

              //百分比
              percent: '',

              //记账的id集合
              ids: [],

              //饼图数据结构
              //总金额
              data: 0,

              //类型标题: 餐饮、出行、....
              name: '',

              //饼图块的颜色
              color: rgb,

              //格式化饼图文本内容
              format(value) {
                return ' ' + this.name + ' ' + (value * 100).toFixed(3) + '% ';
              }

            };

            let currentTypeData = bookingData[key];

            //根据canyin  、 chuxing .... 筛选数据
            currentTypeData.forEach(v1 => {

              if (v == v1.bookingType.type) {
                o[v].push(v1);
                o.count++;
                o.total += Number(v1.userBooking.money);
                o.data += Number(v1.userBooking.money);
                o.ids.push(v1._id);

                if (o[v].length == 1) {
                  o.title = v1.bookingType.title;
                  o.url = v1.bookingType.url;

                  o.name = v1.bookingType.title;
                  o.costTitle = v1.costType.title;
                }
              }
            })

            o.percent = (o.total / totalMoney[key] * 100).toFixed(2) + '%';

            o.total = utils.thousandthPlace(o.total.toFixed(2));

            o.ids = o.ids.join('-');

            this.data.typesData[key].push(o);

          })

        }

        this.setData({
          typesData: this.data.typesData,
          titleData: this.data.titleData
        })

        

        

        //绘制饼图
        this.drawPie(this.data.typesData[this.data.currentType]);


      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  },

  //查看记账详情
  viewDetail: function (e) {

    

    //参数序列化
    let params = '';
    let query = e.currentTarget.dataset;
    for (let key in query) {
      params += key + '=' + query[key] + '&';
    }

    params = params.slice(0, -1);

    //跳转到记账详情页面
    wx.navigateTo({
      url: '../detail/detail?' + params
    })

  }


})