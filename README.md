<h1 align="center" >mobileWindow.js</h1>

因为公司的新项目需要在手机端实现类似APP的操作，为了快速的开发当然希望找一个现成的第三方类库来实现相关的功能，但是找了几天，依然没有找个特别合适的，于是就自己动手开始写一套简单的框架来实现该项目众多的需求。

此函数库的主要作用为了让用户打开手机端页面，也像是在使用APP一样。源码借鉴了mobileSelect.js这个第三方工具类，框架的思想借鉴了Vue。

## 功能

- 滑动选择框
- 手动输入框，支持内容验证
- 标签切换不同选框

## 特性

- 原生js移动端选择控件，不依赖任何库
- 可传入普通数组或者json数组
- 可根据传入的参数长度，自动渲染出对应的列数，支持单项到多项选择
- 自动识别是否级联
- 选择成功后，提供自定义回调函数callback()  返回当前选择索引位置、以及选择的数据（数组/json）
- 每次手势滑动结束后，也提供一个回调函数transitionEnd()  返回当前选择索引位置、以及选择的数据（数组/json）
- 能够在已经实例化控件后，提供update函数再次渲染，可用于异步获取数据或点击交互后需要改变所选数据的场景
- 提供重定位函数
- 可以回显（第二次进入页面时，可以显示历史选择的位置）

## 演示

#### 手机页面预览：

真实项目体验，手机端请打开：[链接](http://www.xinlizhiyouni.com/mobile/house/add.html)

可能因为账号问题，某些同学无法看全功能，可以在本代码库的[demo](https://github.com/wohuifude123/mobileWindow/blob/master/demo)目录中查看所有的功能

## 引入

#### 方式一 标签引入：
```html
<link rel="stylesheet" type="text/css" href="assets/styles/mobileWindow.css">
<script src="assets/scripts/mobileWindow.js" type="text/javascript"></script>
```

#### 方式二 npm：

```
npm install mobile-window -D
```

在你的js文件中import：
```javascript
import MobileWindow from 'mobile-window'
```

## 选择框（无标签）-快速使用

#### ①普通数组格式-非联动
```html
<div id="trigger1"></div> <!--页面中别漏了这个trigger-->

<script type="text/javascript">
var mobileSelect1 = new MobileSelect({
    trigger: '#trigger1',
    title: '单项选择',
    wheels: [
                {data:['周日','周一','周二','周三','周四','周五','周六']}
            ],
    position:[2] //初始化定位
});
</script>
```



#### ②json格式-非联动
```html
<div id="trigger2"></div>

<script type="text/javascript">
var mobileSelect2 = new MobileSelect({
    trigger: '#trigger2',
    title: '地区选择',
    wheels: [
                {data:[
                    {id:'1',value:'附近'},
                    {id:'2',value:'上城区'},
                    {id:'3',value:'下城区'},
                    {id:'4',value:'江干区'},
                    {id:'5',value:'拱墅区'},
                    {id:'6',value:'西湖区'}
                ]},
                {data:[
                    {id:'1',value:'1000米'},
                    {id:'2',value:'2000米'},
                    {id:'3',value:'3000米'},
                    {id:'4',value:'5000米'},
                    {id:'5',value:'10000米'}
                ]}
            ],
    callback:function(indexArr, data){
        console.log(data); //返回选中的json数据
    }
});
</script>
```
##### 效果图：


#### ③json格式-联动
```html
<div id="trigger3"></div>

<script type="text/javascript">
  var mobileSelect3 = new MobileSelect({
      trigger: '#trigger3',
      title: '地区选择-联动',
      wheels: [
                  {data:[
                      {
                          id:'1',
                          value:'附近',
                          childs:[
                              {id:'1',value:'1000米'},
                              {id:'2',value:'2000米'},
                              {id:'3',value:'3000米'},
                              {id:'4',value:'5000米'},
                              {id:'5',value:'10000米'}
                          ]
                      },
                      {id:'2',value:'上城区'},
                      {id:'3',value:'下城区'},
                      {id:'4',value:'江干区'},
                      {id:'5',value:'拱墅区'},
                      {id:'6',value:'西湖区'}
                  ]}
              ],
      position:[0,1],
      callback:function(indexArr, data){
          console.log(data); //返回选中的json数据
      }
  });
  </script>
```
##### 效果图：


#### ④在vue-cli中如何使用

```
npm install mobile-select -D
```

```html
<template>
    <div>
        <div id="trigger4">单项选择</div>
    </div>
</template>

<script>
    import MobileSelect from 'mobile-select'

    export default {
        mounted() {
            var mobileSelect4 = new MobileSelect({
                trigger: "#trigger4",
                title: "单项选择",
                wheels: [
                    {data: ["周日","周一","周二","周三","周四","周五","周六"]}
                ],
                callback:function(indexArr, data){
                    console.log(data);
                }
            });
        }
    }
</script>
```


#### ⑤数据字段名映射
```html
<div id="trigger5"></div>

<script type="text/javascript">
    //假如你的数据的字段名为id,title,children
    //与mobileSelect的id,value,childs字段名不匹配
    //可以用keyMap属性进行字段名映射
    var mobileSelect5 = new MobileSelect({
        trigger: '#trigger5',
        title: '数据字段名映射',
        wheels: [
                    {data:[
                        {
                            id:'1',
                            title:'A',
                            children:[
                                {id:'A1',title:'A-a'},
                                {id:'A2',title:'A-b'},
                                {id:'A3',title:'A-c'}
                            ]
                        },
                        {
                            id:'1',
                            title:'B',
                            children:[
                                {id:'B1',title:'B-a'},
                                {id:'B2',title:'B-b'},
                                {id:'B3',title:'B-c'}
                            ]
                        },
                    ]}
                ],
        keyMap: {
            id:'id',
            value: 'title',
            childs :'children'
        },
        callback:function(indexArr, data){
            console.log(data);
        }
    });
</script>
```

## 输入框（无标签）- 快速使用

#### 输入内容
```html
<div id="trigger-input"></div>

var mobileWindowInput = new MobileWindow({
    // trigger: '#lease-type-trigger',
    // title: '租房类型选项',
    trigger: {
        type: 'input',
        element: '#trigger-input',
    },
    title: '请输入内容',
    transitionEnd:function(indexArr, data){
        //console.log(data);
    },
    callback:function(data){
        console.log(data);
        // mobileWindowRental.validateRegex(123);
        // if(regInt.test(data.valueInput)) {
        document.getElementById('trigger-input').innerHTML = data['valueInput']

    }
});

```

#### 输入内容 - 验证内容格式
```html
<div id="month-amount-wrapper"></div>

var mobileWindowRental = new MobileWindow({
    // trigger: '#lease-type-trigger',
    // title: '租房类型选项',
    trigger: {
        type: 'input',
        element: '#month-amount-wrapper',
    },
    title: '请输入金额',
    inputTrim: true,
    inputCheckType: ['number'],
    transitionEnd:function(indexArr, data){
        //console.log(data);
    },
    callback:function(data){
        console.log(data);
        // mobileWindowRental.validateRegex(123);
        // if(regInt.test(data.valueInput)) {
        if(data['checkType'][0]) {
            document.getElementById('month-amount-wrapper').style.color = '#000000';
            document.getElementById('month-amount-wrapper').innerHTML = data.valueInput;
        } else {
            var strPrompt = '请填写整数';
            document.getElementById('month-amount-wrapper').style.color = '#000000';
            document.getElementById('month-amount-wrapper').innerHTML = strPrompt;
        }

    }
});
```

## 选择框（有标签）-快速使用
```html
<div id="trigger6" class="trigger-tag-selector">
    <div id="house-floor-container">楼层</div>
    <div id="house-elevator-container">电梯</div>
</div>
```

```js
var floorArr = [];
var floorTotalArr = [];

var floorNeed = 53; // 共50层
for(var iFloor = 0; iFloor<floorNeed; iFloor++) {
    floorArr[iFloor] = iFloor-2 + '层';
}

for(var iFloor = 0; iFloor<floorNeed-3; iFloor++) {
    floorTotalArr[iFloor] = '共' + (iFloor+1) +'层';
}

var arrHouseFloor = [
    floorArr,
    floorTotalArr,
];

var arrHouseElevator = ['有电梯', '无电梯'];

var arrTypes = [arrHouseFloor, arrHouseElevator];
var mobileSelectFloorElevator = new MobileWindow({
    // trigger: '#lease-type-trigger',
    // title: '租房类型选项',
    trigger: {
        type: ['select', 'select'],
        element: ['#house-floor-container', '#house-elevator-container'],
        tags:['楼层', '电梯'],
    },
    title: ['请选择楼层', '请选择电梯'],
    wheels: [
        {
            data: arrTypes,
        },
    ],
    position:[0, 0], //初始化定位 打开时默认选中的哪个 如果不填默认为0
    transitionEnd:function(indexArr, data){
        //console.log(data);
    },
    beforeCreate: function() {

    },
    created: function () {
        // `this` 指向 vm 实例
        console.log('a is: ' + this.a)
    },
    beforeMount: function() {

    },
    callback: function(tagIndex, indexArr, data){
        console.log(tagIndex, '/', indexArr, '/', data);

    }
});
```


## 参数

|选项|默认值|类型|描述 |
| ------ |------|-----|-----|
|trigger|必填参数 无默认值|String| 触发对象的id/class/tag|
|wheels|必填参数 无默认值|Array|数据源,需要显示的数据|
|callback|function(indexArr, data){}|function | 选择成功后触发的回调函数，返回indexArr、data|
|transitionEnd|function(indexArr, data){}|function|每一次手势滑动结束后触发的回调函数,返回indexArr、data|
|cancel|function(indexArr, data){}|function|返回的是indexArr和data是上一次点击确认按钮时的值|
|onShow|function(e){}|function | 显示控件后触发的回调函数, 返回参数为对象本身 |
|onHide|function(e){}|function | 隐藏控件后触发的回调函数, 返回参数为对象本身 |
|title|`''`|String|控件标题|
|position|[0,0,0,…]|Array|初始化定位|
|connector|`' '`|String| 多个轮子时，多个值中间的连接符，默认是空格 |
|ensureBtnText|`'确认'`|String| 确认按钮的文本内容 |
|cancelBtnText|`'取消'`|String| 取消按钮的文本内容 |
|ensureBtnColor|`'#1e83d3'`|String| 确认按钮的文本颜色|
|cancelBtnColor|`'#666666'`|String| 取消按钮的文本颜色|
|titleColor|`'#000000'`|String| 控件标题的文本颜色|
|titleBgColor|`'#ffffff'`|String| 控件标题的背景颜色|
|textColor|`'#000000'`|String| 轮子内文本的颜色 |
|bgColor|`'#ffffff'`|String| 轮子背景颜色 |
|maskOpacity|`0.7`| Number | 遮罩透明度 |
|keyMap|`{id:'id', value:'value', childs:'childs'`}|Object| 字段名映射，适用于字段名不匹配id,value,childs的数据格式 |
|triggerDisplayData|`true`|Boolean| 在点击确认时，trigger的innerHtml是否变为选择的数据。<br>（如果trigger里面还有其他元素，则可以设置为false；如果需要在别的地方显示数据，则可用callback返回的数据自行拼接）|



#### 注：回调函数中返回的参数含义如下
 - indexArr是当前选中的索引数组 如[0,0,1] 代表有三个轮子 选中的数据是第一个轮子的第0个数据、第二个轮子的第0个数据、第三个轮子的第1个数据
 - data是当前选中的json数据 如[{id:'1',value:'hello'},{id:'2',value:'world'}]

## 功能函数：
|函数名|参数| 描述|
| ------ |------| -----|
|show()| 无参 | 手动显示弹窗组件 |
|hide()| 无参 | 手动隐藏弹窗组件 |
|setTitle()| string |设置控件的标题|
|locatePosition()|sliderIndex, posIndex| 传入位置数组，重新定位轮子选中的位置 |
|updateWheel()| sliderIndex, data | 重新渲染指定的轮子 |
|updateWheels()| data | 重新渲染所有轮子(仅限级联数据格式使用) |
|getValue()| 无参 | 获取组件选择的值 |

#### 注：功能函数中需要传递的参数含义如下
 - sliderIndex 代表的是要修改的轮子的索引
 - posIndex 代表位置索引

#### ①功能函数demo：
```html
<div id="day"></div>

var mySelect = new MobileSelect({
    trigger: '#day',
    wheels: [
                {data:['周日','周一','周二','周三','周四','周五','周六']},
                {data:['08:00','09:00','10:00','11:00','12:00','13:00','14:00']}
            ],
    position:[1,1] //初始化定位 两个轮子都选中在索引1的选项
});

//----------------------------------------------
//进行基础的实例化之后，对实例用功能函数操作

// mySelect.setTitle('啦啦啦(๑•̀ㅁ•́ฅ)');
// 设置控件的标题

// mySelect.updateWheel(0,['sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']);
// 更新第0个轮子的数据，数据变为英文的星期几

// mySelect.locatePosition(1,0);
// 重新定位第1个轮子的位置，将第1个轮子的第0个数据改为当前选中。
// (第1个轮子是指右边的轮子，左边的轮子是第0个)
```
基础实例 → 功能函数操作后

#### ②ajax异步填充数据demo

```html

<!-- ************ 非级联格式 ************ -->

<div id="trigger6"></div>

<script type="text/javascript">
    var mobileSelect6 = new MobileSelect({
        trigger: '#trigger6',
        title: 'ajax填充数据-非级联',
        wheels: [
                    {data:[
                        {id:'1',value:'请选择地区'},
                    ]},
                    {data:[
                        {id:'1',value:'请选择距离'},
                    ]}
                ],
        callback:function(indexArr, data){
            console.log(data);
        }
    });

    $.ajax({
        type: "POST",
        url: "xxxx",
        data: {},
        dataType: "json",
        success: function(res){
            //这里假设获取到的res.data.area为：
            // [
            //     {id:'1',value:'附近'},
            //     {id:'2',value:'福田区'},
            //     {id:'3',value:'罗湖区'},
            //     {id:'4',value:'南山区'}
            // ]

            //这里假设获取到的res.data.distance为：
            // [
            //     {id:'1',value:'200米'},
            //     {id:'2',value:'300米'},
            //     {id:'3',value:'400米'}
            // ]

            mobileSelect6.updateWheel(0, res.data.area); //更改第0个轮子
            mobileSelect6.updateWheel(1, res.data.distance); //更改第1个轮子
        }
    });
</script>
</script>

<!-- ************ 级联格式 ************ -->

<div id="trigger7"></div>

<script type="text/javascript">
    var mobileSelect7 = new MobileSelect({
        trigger: '#trigger7',
        title: 'ajax填充数据-级联',
        wheels: [
                    {data:[
                        {
                            id:'1',
                            value:'',
                            childs:[
                                {id:'A1',value:''},
                            ]
                        }
                    ]}
                ],
        callback:function(indexArr, data){
            console.log(data);
        }
    });

    $.ajax({
        type: "POST",
        url: "xxxx",
        data: {},
        dataType: "json",
        success: function(res){
            //这里假设获取到的res.data为：
            // [{
            //     id:'1',
            //     value:'更新后数据',
            //     childs:[
            //         {id:'A1',value:'apple'},
            //         {id:'A2',value:'banana'},
            //         {id:'A3',value:'orange'}
            //     ]
            // }]
            mobileSelect7.updateWheels(res.data);
        }
    });
</script>
```

### 如何回显选择的位置
callback回调函数里有一个indexArr参数，它是一个数组，记录着当前选中的位置：    
把这个数组转化为字符串之后，可以用<input type="hidden" value="">隐藏域或者别的其他方式保存下来，传给后台。    
下次打开页面时，    
MobileWindow实例化的时候，读取这个字符串，再转成数组，传给position，完成初始化定位即可。


## 项目demo：
使用transitionEnd()、callback()、updateWheel()、locatePosition()函数实现如下功能：

- 选择当天日期时，不得超过今天已过时辰。
- 选择取车时间后，还车时间不得超过取车时间（包括日期和时间）。


## 更新日志
### 2020-07-03[更新]
- 增加使用标签切换不同滑动框功能
- 去除点击某选项后，自动改变div的内容，改为返回点选的结果  

### 2020-07-05[更新+修正]    
- 修复标签切换后，多级联显示错误的问题
- 增加弹出输入框功能

### 2020-07-08[更新+修正]
- 增加输入框内容验证

### 2020-07-10[修正]
- 调整项目结构

### 2020-07-11[修正]
- 优化例子代码
- 编写例子说明

## 许可证

Copyright (c) 2020-present, Abbott Liu



