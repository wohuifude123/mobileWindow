/*!
 * mobileWindow.js 0.0.1
 * Copyright (c) 2020/07/03 Abbott Liu <http://www.xinlizhiyouni.com/myself>
 * Released under the MIT License.
 */

(function() {
	function getClass(dom,string) {
		return dom.getElementsByClassName(string);
	}
	//构造器
	// function MobileSelect(config) {
    function MobileWindow(config) {
        this.mobileSelect;
        this.mobileWindow;
		this.wheelsData = config.wheels;
		this.jsonType =  false;
        this.dataTypeInit = '';
		this.cascadeJsonData = [];
		this.displayJson = [];
		this.curValue = null;
		this.curIndexArr = [];
		this.cascade = false;
		this.startY;
		this.moveEndY;
		this.moveY;
		this.oldMoveY;
		this.offset = 0;
		this.offsetSum = 0;
		this.oversizeBorder;
		this.curDistance = [];
		this.clickStatus = false;
		this.isPC = true;
		this.mobileWindowSetting;
		this.objMsgInput = {};
		this.inputTrim = true;
        // this.tagsChange;
		this.init(config);
	}
	// MobileSelect.prototype = {
    MobileWindow.prototype = {
		// constructor: MobileSelect,
        constructor: MobileWindow,
		init: function(config){
			var _this = this;

            /**
			 * input/select/input-select
             */
			var typeRender = 'select';
			_this.keyMap = config.keyMap ? config.keyMap : {id:'id', value:'value', childs:'childs'};

			// console.log('config.trigger === ', config.trigger);
            if(config.trigger instanceof Object) {
            	if(config.trigger.type instanceof Array) {
            		// console.log('trigger.type ==', config.trigger.type);
                    // console.log(config.trigger.type.indexOf('select'));
                    // if('select'.indexOf(config.trigger.type) === -1) {
                    if(config.trigger.type.indexOf('select') === -1 ){
                        typeRender = 'input'
					}
				} else if(config.trigger.type === 'input') {
                    typeRender = 'input'
				}
            }

            if(typeRender === 'select') {
                if(config.trigger instanceof Object) {
                    // console.log('trigger Object');
                    _this.mobileWindowSetting = {
                        type: 'selectTag',
                        tags: config.trigger.tags,
                        titles: config.title,
                        tagIndexSelected: 0
                    };
                    _this.renderWheels(_this.wheelsData, config.cancelBtnText, config.ensureBtnText);
                    // _this.trigger = document.querySelector(config.trigger.element);
                    _this.trigger = [];
                    for(var eIndex = 0; eIndex<config.trigger.element.length; eIndex++) {
                        _this.trigger[eIndex] = document.querySelector(config.trigger.element[eIndex]);
                    }

                } else {
                    _this.renderWheels(_this.wheelsData, config.cancelBtnText, config.ensureBtnText);
                    _this.trigger = document.querySelector(config.trigger);
                }

                if(!_this.trigger){
                    console.error('mobileSelect has been successfully installed, but no trigger found on your page.');
                    return false;
                }

                _this.checkDataType(_this.wheelsData[0].data[0]);

                // console.log('config.trigger === ', config.trigger);

                _this.wheel = getClass(_this.mobileSelect,'wheel');
                _this.slider = getClass(_this.mobileSelect,'selectContainer');

                _this.tagItems = getClass(_this.mobileSelect, 'mobileWindow-tag-item');

                _this.tagIndexInit = 0;
                _this.wheels = _this.mobileSelect.querySelector('.wheels');
                _this.liHeight = _this.mobileSelect.querySelector('li').offsetHeight;
                _this.ensureBtn = _this.mobileSelect.querySelector('.ensure');
                _this.cancelBtn = _this.mobileSelect.querySelector('.cancel');
                _this.grayLayer = _this.mobileSelect.querySelector('.grayLayer');
                _this.popUp = _this.mobileSelect.querySelector('.content');
                _this.callback = config.callback || function(){};
                _this.transitionEnd = config.transitionEnd || function(){};
                _this.onShow = config.onShow || function(){};
                _this.onHide = config.onHide || function(){};
                _this.initPosition = config.position || [];
                _this.titleText = config.title || '';
                _this.connector = config.connector || ' ';
                _this.triggerDisplayData = !(typeof(config.triggerDisplayData)=='undefined') ? config.triggerDisplayData : true;



                if(_this.trigger instanceof Array) {
                    // console.log('_this.trigger == ', _this.trigger);
                    for(var tIndex = 0; tIndex< _this.trigger.length; tIndex++) {
                        _this.trigger[tIndex].style.cursor='pointer';
                    }
                } else {
                    _this.trigger.style.cursor = 'pointer';
                }

                _this.setStyle(config);

                if( _this.mobileWindowSetting !== undefined ) {
                    if(_this.mobileWindowSetting.type === "selectTag") {
                        _this.setTitle(_this.mobileSelect, _this.titleText[0]);
                    }
                } else {
                    _this.setTitle(_this.mobileSelect, _this.titleText);
                }

                _this.checkIsPC();
                _this.checkCascade();
                _this.addListenerAll();

                if (_this.cascade) {
                    _this.initCascade();
                }
                //定位 初始位置

                // console.log('_this.slider.length === ', _this.slider.length);
                if(_this.initPosition.length < _this.slider.length){
                    var diff = _this.slider.length - _this.initPosition.length;
                    for(var i=0; i<diff; i++){
                        _this.initPosition.push(0);
                    }
                }

                _this.setCurDistance(_this.initPosition);

                //按钮监听

                // console.log('按钮监听 mobileWindowSetting === ', _this.mobileWindowSetting);

                if(_this.mobileWindowSetting !== undefined) {
                    if( _this.mobileWindowSetting.type === "selectTag" ) {
                        // console.log('_this.tagItems === ', _this.tagItems);
                        for(var bTagIndex = 0; bTagIndex<_this.tagItems.length; bTagIndex++) {
                            (function(index){
                                _this.tagItems[bTagIndex].addEventListener('click',function(){
                                    var objTag = {
                                        index: index,
                                        element: _this.mobileSelect
                                    };
                                    _this.showTag(objTag);
                                    // console.log('bTagIndex === ', index);
                                    _this.changeTag(_this.wheelsData, index)
                                })
                            })(bTagIndex)
                        }

                    }
                }

                _this.cancelBtn.addEventListener('click',function(){
                    _this.hide(_this.mobileSelect);
                });

                _this.ensureBtn.addEventListener('click',function(){
                    _this.hide(_this.mobileSelect);
                    if(!_this.liHeight) {
                        _this.liHeight =  _this.mobileSelect.querySelector('li').offsetHeight;
                    }
                    var tempValue ='';
                    for(var i=0; i<_this.wheel.length; i++){
                        i==_this.wheel.length-1 ? tempValue += _this.getInnerHtml(i) : tempValue += _this.getInnerHtml(i) + _this.connector;
                    }
                    if(_this.triggerDisplayData){
                        // _this.trigger.innerHTML = tempValue + 'changePage';
                        // console.log('change data');
                        // _this.callback()
                    }
                    _this.curIndexArr = _this.getIndexArr();
                    _this.curValue = _this.getCurValue();

                    if(_this.mobileWindowSetting !== undefined) {
                        _this.callback(_this.mobileWindowSetting['tagIndexSelected'],
                            _this.curIndexArr, _this.curValue);
                    } else {
                        _this.callback(_this.curIndexArr, _this.curValue);
                    }

                });


                if(_this.trigger instanceof Array) {
                    // console.log('_this.trigger == ', _this.trigger);
                    for(var tIndex = 0; tIndex< _this.trigger.length; tIndex++) {
                        (function(tagIndex){
                            _this.trigger[tIndex].addEventListener('click',function(){
                                // console.log('tagIndex == ', tagIndex);

                                // console.log(_this.tagIndexInit);


                                if(_this.mobileWindowSetting['tagIndexSelected'] === tagIndex) {

                                } else {
                                    var objTag = {
                                        index: tagIndex,
                                        element: _this.mobileSelect
                                    };
                                    _this.showTag(objTag);
                                    _this.changeTag(_this.wheelsData, tagIndex)
                                }

                                _this.show(_this.mobileSelect);


                            })
                        })(tIndex)
                    }
                } else {
                    _this.trigger.addEventListener('click',function(){
                        _this.show(_this.mobileSelect);
                    });
                }


                _this.grayLayer.addEventListener('click',function(){
                    // _this.hide();
                    _this.hide(_this.mobileSelect);
                });
                _this.popUp.addEventListener('click',function(){
                    event.stopPropagation();
                });

                _this.fixRowStyle(); //修正列数

            }
            /**
			 * input
             */
            else if(typeRender === 'input') {
            	// console.log('全部是输入框');
                // console.log('trigger Object');
				// console.log(_this.trigger);



                if(config.trigger.type instanceof Array) {
                    _this.mobileWindowSetting = {
                        type: 'input',
                        tags: config.trigger.tags,
                        titles: config.title,
                        tagIndexSelected: 0
                    };
				} else {
                    _this.mobileWindowSetting = {
                        type: 'input',
                        titles: config.title,
						tags: null
                    };
				}


                _this.renderInput(config.cancelBtnText, config.ensureBtnText);


                _this.callback = config.callback || function(){};

                // console.log('config.inputTrim ===' , config.inputTrim);

                _this.inputTrim = config.inputTrim || true;
                if(config.inputTrim === false) {
                    _this.inputTrim = config.inputTrim
                }

                _this.inputCheckType = config.inputCheckType || [];

                // console.log('_this.inputTrim ===' , _this.inputTrim);

                _this.textArea = getClass(_this.mobileWindow,'mobileWindow-textArea');

                // _this.ensureBtn = _this.mobileWindow.querySelector('.ensure');
                _this.ensureBtn = _this.mobileWindow.querySelector('.mobileWindow-button-save');

                _this.cancelBtn = _this.mobileWindow.querySelector('.cancel');

                _this.addListenerAll();

                // _this.trigger = document.querySelector(config.trigger.element);


                if(config.trigger.type instanceof Array) {
                    _this.trigger = [];
                    for(var eIndex = 0; eIndex<config.trigger.element.length; eIndex++) {
                        _this.trigger[eIndex] = document.querySelector(config.trigger.element[eIndex]);
                    }
                } else {
                    _this.trigger = document.querySelector(config.trigger.element);
				}

                // console.log('_this.trigger == ', _this.trigger);

                _this.cancelBtn.addEventListener('click',function(){
                    _this.hide(_this.mobileWindow);
                });

                _this.ensureBtn.addEventListener('click',function() {
                    _this.hide(_this.mobileWindow);

                    // console.log('tagIndexSelected === ', _this.mobileWindowSetting.tagIndexSelected);

                    var tagIndexSelected = null;
                    if(_this.mobileWindowSetting.tagIndexSelected === 0) {
                        tagIndexSelected = 0
					} else if(_this.mobileWindowSetting.tagIndexSelected === undefined) {
                        // tagIndexSelected = null
					} else {
                        tagIndexSelected = _this.mobileWindowSetting.tagIndexSelected
					}


                    // console.log('_this.inputTrim === ', _this.inputTrim);

                    var valueInput = _this.mobileWindow.querySelector('.mobileWindow-textArea').value;

                    if(_this.inputTrim) {
                        valueInput = _this.strTrim(valueInput)
                    }


                    if(_this.inputCheckType.length !== 0) {
                        var arrResultCheckType = [];
                        var objCheck = {};
                        for(var indexCheck = 0; indexCheck<_this.inputCheckType.length; indexCheck++){
                            objCheck['type'] = _this.inputCheckType[indexCheck];
                            objCheck['value'] = _this.strTrim(valueInput);
                            arrResultCheckType[indexCheck] = _this.validateRegex(objCheck);
                        }
                    }

                    console.log('arrResultCheckType === ', arrResultCheckType);

                    var objMesTag = {};

                    objMesTag['tagIndex'] = tagIndexSelected;
                    objMesTag['valueInput'] = valueInput;
                    objMesTag['checkType'] = arrResultCheckType;

                    _this.callback(objMesTag);
                    document.querySelector('.mobileWindow-textArea').value = '';
					// console.log(_this.mobileWindow.querySelector('.mobileWindow-textArea').value);

                });

                if(_this.trigger instanceof Array) {
                    // console.log('_this.trigger == ', _this.trigger);
                    for(var tIndex = 0; tIndex< _this.trigger.length; tIndex++) {

						(function(tagIndex) {
                            _this.trigger[tIndex].addEventListener('click',function(){

                                // console.log('tIndex === ', tagIndex);
                                // _this.show(_this.mobileWindow);
                                var objTag = {
                                    index: tagIndex,
                                    element: _this.mobileWindow
                                };
                                _this.showTag(objTag);
                                _this.show(_this.mobileWindow);
                            })
						})(tIndex);

                    }
                } else {
                    _this.trigger.addEventListener('click',function(){
                        // _this.show(_this.mobileWindow);
                        _this.titleText = config.title || '';
                        _this.setTitle(_this.mobileWindow, _this.titleText);
                        _this.show(_this.mobileWindow);
                    });
                }
            }
		},

		setTitle: function(elem, string){
			var _this = this;
			_this.titleText = string;
            // _this.mobileSelect.querySelector('.title').innerHTML = _this.titleText;
			// console.log('elem === ', elem);
            elem.querySelector('.title').innerHTML = _this.titleText;
		},

		setStyle: function(config){
			var _this = this;
			if(config.ensureBtnColor){
				_this.ensureBtn.style.color = config.ensureBtnColor;
			}
			if(config.cancelBtnColor){
				_this.cancelBtn.style.color = config.cancelBtnColor;
			}
			if(config.titleColor){
				_this.title = _this.mobileSelect.querySelector('.title');
				_this.title.style.color = config.titleColor;
			}
			if(config.textColor){
				_this.panel = _this.mobileSelect.querySelector('.panel');
				_this.panel.style.color = config.textColor;
			}
			if(config.titleBgColor){
				_this.btnBar = _this.mobileSelect.querySelector('.btnBar');
				_this.btnBar.style.backgroundColor = config.titleBgColor;
			}
			if(config.bgColor){
				_this.panel = _this.mobileSelect.querySelector('.panel');
				_this.shadowMask = _this.mobileSelect.querySelector('.shadowMask');
				_this.panel.style.backgroundColor = config.bgColor;
				_this.shadowMask.style.background = 'linear-gradient(to bottom, '+ config.bgColor + ', rgba(255, 255, 255, 0), '+ config.bgColor + ')';
			}
			if(!isNaN(config.maskOpacity)){
				_this.grayMask = _this.mobileSelect.querySelector('.grayLayer');
				_this.grayMask.style.background = 'rgba(0, 0, 0, '+ config.maskOpacity +')';
			}
		},

		checkIsPC: function(){
			var _this = this;
			var sUserAgent = navigator.userAgent.toLowerCase();
			var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
			var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
			var bIsMidp = sUserAgent.match(/midp/i) == "midp";
			var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
			var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
			var bIsAndroid = sUserAgent.match(/android/i) == "android";
			var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
			var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
			if ((bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
			    _this.isPC = false;
			}
		},

 		show: function(elem){
            var _this = this;
            // _this.mobileSelect.classList.add('mobileSelect-show');
			// console.log('点击显示按钮');
            elem.classList.add('mobileSelect-show');
			if (typeof _this.onShow === 'function') {
                _this.onShow(_this);
			}
  		},

        showTag: function(elem){
            var _this = this;
            // console.log('showTag == ', elem.element);

            var mobileWindowTagItems = elem.element.querySelectorAll('.mobileWindow-tag-item');

            // console.log('mobileWindowTagItems === ', mobileWindowTagItems);
            // _this.mobileSelect.classList.add('mobileSelect-show');
            // console.log('点击显示按钮');
            // elem.classList.add('mobileSelect-show');

            _this.mobileWindowSetting.tagIndexSelected = elem.index;

			for(var i =0; i<mobileWindowTagItems.length; i++) {
                mobileWindowTagItems[i].classList.remove('mobileWindow-tag-item-selected');
                if(elem.index === i) {
                    mobileWindowTagItems[i].classList.add('mobileWindow-tag-item-selected');
				}
			}
        },

	    hide: function(elem) {
			// this.mobileSelect.classList.remove('mobileSelect-show');
            var _this = this;
            elem.classList.remove('mobileSelect-show');
			if (typeof _this.onHide === 'function') {
                _this.onHide(_this);
			}
	    },

		renderWheels: function(wheelsData, cancelBtnText, ensureBtnText){
			var _this = this;
			var cancelText = cancelBtnText ? cancelBtnText : '取消';
			var ensureText = ensureBtnText ? ensureBtnText : '确认';
            var tempHTML='';
			_this.mobileSelect = document.createElement("div");
			_this.mobileSelect.className = "mobileSelect";

			if(_this.mobileWindowSetting !== undefined) {

                if(_this.mobileWindowSetting.type === "selectTag") {
                    var tagsInnerHTML = '';

                    // for(var iTag = 0; iTag<wheelsData[0].data.length; iTag++) {
                    //     tagsInnerHTML += '<div class="mobileWindow-tag-item">' + _this.mobileWindowSetting.tags[iTag] + '</div>'
                    // }

                    for(var iTag = 0; iTag<_this.mobileWindowSetting.tags.length; iTag++) {
                        if(iTag === _this.mobileWindowSetting.tagIndexSelected) {
                            tagsInnerHTML += '<div class="mobileWindow-tag-item mobileWindow-tag-item-selected">' + _this.mobileWindowSetting.tags[iTag] + '</div>'
                        } else {
                            tagsInnerHTML += '<div class="mobileWindow-tag-item">' + _this.mobileWindowSetting.tags[iTag] + '</div>'
                        }

                    }

                    _this.mobileSelect.innerHTML =
                        '<div class="grayLayer"></div>'+
						'<div class="content">'+
							'<div class="mobileWindow-tags-container">'+
								tagsInnerHTML +
							'</div>'+
							'<div class="btnBar">'+
								'<div class="fixWidth">'+
									'<div class="cancel">'+ cancelText +'</div>'+
									'<div class="title"></div>'+
									'<div class="ensure">'+ ensureText +'</div>'+
								'</div>'+
							'</div>'+
							'<div class="panel">'+
								'<div class="fixWidth">'+
									'<div class="wheels">'+
									'</div>'+
									'<div class="selectLine"></div>'+
									'<div class="shadowMask"></div>'+
								'</div>'+
							'</div>'+
                        '</div>';

                    // console.log('标签渲染 wheelsData[0].data[0] === ', wheelsData[0].data[0]);
                    // console.log('标签渲染 wheelsData[0].data[0][0] === ', wheelsData[0].data[0][0]);

                    var ulAccout = 0;

                    var arrOptions = wheelsData[0].data[0];
                    if(arrOptions[0] instanceof Array) {
                        ulAccout = arrOptions.length;
                        for(var i=0; i<ulAccout; i++){
                            // for(var i=0; i<wheelsData.length; i++){
                            //列
                            tempHTML += '<div class="wheel"><ul class="selectContainer">';
                            // console.log(_this.jsonType);

                            // console.log('循环遍历', wheelsData[i].data[0][0]);

                            // if(wheelsData[i].data[0][0] instanceof Array) {
                            //
                            // } else {



                            if(_this.jsonType && _this.dataTypeInit === 'object'){
                                // for(var j=0; j<wheelsData[i].data[0].length; j++){
                                for(var j=0; j<wheelsData[i].data[0].length; j++){
                                    //行

                                    console.log(wheelsData[i].data[0][j]);
                                    tempHTML += '<li data-id="'+wheelsData[i].data[0][j][_this.keyMap.id]+'">'+wheelsData[i].data[0][j][_this.keyMap.value]+'</li>';
                                }
                            }
                            else {

                                // for(var j=0; j<wheelsData[i].data[0].length; j++){

                                for(var j=0; j<arrOptions[i].length; j++){
                                    //行
                                    // tempHTML += '<li>'+wheelsData[i].data[0][0][j]+'</li>';


                                    tempHTML += '<li>'+arrOptions[i][j]+'</li>';
                                }
                            }
                            // }



                            tempHTML += '</ul></div>';
                        }
					} else {
                        ulAccout = wheelsData.length;
                        for(var i=0; i<ulAccout; i++){
                            // for(var i=0; i<wheelsData.length; i++){
                            //列
                            tempHTML += '<div class="wheel"><ul class="selectContainer">';
                            // console.log(_this.jsonType);

                            // console.log('循环遍历', wheelsData[i].data[0][0]);

                            // if(wheelsData[i].data[0][0] instanceof Array) {
                            //
                            // } else {
                            if(_this.jsonType){
                                for(var j=0; j<wheelsData[i].data[0].length; j++){
                                    //行

                                    console.log(wheelsData[i].data[0][j]);
                                    tempHTML += '<li data-id="'+wheelsData[i].data[0][j][_this.keyMap.id]+'">'+wheelsData[i].data[0][j][_this.keyMap.value]+'</li>';
                                }
                            }
                            else {

                                for(var j=0; j<wheelsData[i].data[0].length; j++){
                                    //行
                                    tempHTML += '<li>'+wheelsData[i].data[0][j]+'</li>';
                                }
                            }
                            // }
                            tempHTML += '</ul></div>';
                        }
					}

				}


			} else {


                // console.log('非标签切换 == ', wheelsData);
                // console.log('_this.jsonType == ', _this.jsonType);


                // wheelsDataTemp = wheelsData;

                _this.mobileSelect.innerHTML =
                    '<div class="grayLayer"></div>'+
                    '<div class="content">'+
                    	'<div class="btnBar">'+
                    		'<div class="fixWidth">'+
                    			'<div class="cancel">'+ cancelText +'</div>'+
                    			'<div class="title"></div>'+
                    			'<div class="ensure">'+ ensureText +'</div>'+
                    		'</div>'+
                    	'</div>'+
                    	'<div class="panel">'+
                    		'<div class="fixWidth">'+
                   				'<div class="wheels">'+
                    			'</div>'+
                    			'<div class="selectLine"></div>'+
                    			'<div class="shadowMask"></div>'+
                    		'</div>'+
                    	'</div>'+
                    '</div>';


                for(var i=0; i<wheelsData.length; i++){

                    // for(var i=0; i<wheelsData.length; i++){
                    //列
                    tempHTML += '<div class="wheel"><ul class="selectContainer">';
                    if(_this.jsonType){
                        for(var j=0; j<wheelsData[i].data.length; j++){
                            //行
                            tempHTML += '<li data-id="'+wheelsData[i].data[j][_this.keyMap.id]+'">'+wheelsData[i].data[j][_this.keyMap.value]+'</li>';
                        }
                    }else{
                        for(var j=0; j<wheelsData[i].data.length; j++){
                            //行
                            tempHTML += '<li>'+wheelsData[i].data[j]+'</li>';
                        }
                    }
                    tempHTML += '</ul></div>';
                }
			}


			// _this.mobileSelect.innerHTML =
		    // 	'<div class="grayLayer"></div>'+
		    //     '<div class="content">'+
		    //         '<div class="btnBar">'+
		    //             '<div class="fixWidth">'+
		    //                 '<div class="cancel">'+ cancelText +'</div>'+
		    //                 '<div class="title"></div>'+
		    //                 '<div class="ensure">'+ ensureText +'</div>'+
		    //             '</div>'+
		    //         '</div>'+
		    //         '<div class="panel">'+
		    //             '<div class="fixWidth">'+
		    //             	'<div class="wheels">'+
			//                 '</div>'+
		    //                 '<div class="selectLine"></div>'+
		    //                 '<div class="shadowMask"></div>'+
		    //             '</div>'+
		    //         '</div>'+
		    //     '</div>';
		    document.body.appendChild(_this.mobileSelect);

			//根据数据长度来渲染

			_this.mobileSelect.querySelector('.wheels').innerHTML = tempHTML;
		},

		renderInput: function(cancelBtnText, ensureBtnText){
            var _this = this;

            // var cancelText = cancelBtnText ? cancelBtnText : '取消';
            // var ensureText = ensureBtnText ? ensureBtnText : '确认';

            // var tempHTML='';
            _this.mobileWindow = document.createElement("div");
            _this.mobileWindow.className = "mobileSelect";


            var cancelText = cancelBtnText ? cancelBtnText : '取消';
            // var ensureText = ensureBtnText ? ensureBtnText : '确认';
            var ensureText = ensureBtnText ? ensureBtnText : '暂存';
            var tempHTML = '';

            // _this.mobileSelect = document.createElement("div");
            // _this.mobileSelect.className = "mobileSelect";

            // console.log('_this.mobileWindowSetting == ', _this.mobileWindowSetting);

            if(_this.mobileWindowSetting !== undefined) {

                if(_this.mobileWindowSetting.type === "input") {


                    var tagsInnerHTML = '';


                    // console.log('mobileWindowSetting input === ', _this.mobileWindowSetting);

                    var tagsInnerHtmlContainer = '';

                    if(_this.mobileWindowSetting.tags !== null) {
                        for(var iTag = 0; iTag<_this.mobileWindowSetting.tags.length; iTag++) {
                            if(iTag === _this.mobileWindowSetting.tagIndexSelected) {
                                tagsInnerHTML += '<div class="mobileWindow-tag-item mobileWindow-tag-item-selected">' + _this.mobileWindowSetting.tags[iTag] + '</div>'
                            } else {
                                tagsInnerHTML += '<div class="mobileWindow-tag-item">' + _this.mobileWindowSetting.tags[iTag] + '</div>'
                            }

                        }

                        tagsInnerHtmlContainer +=
							'<div class="mobileWindow-tags-container">'+
                            	tagsInnerHTML +
                            '</div>'
					}



                    _this.mobileWindow.innerHTML =
                        '<div class="grayLayer"></div>'+
							'<div class="content">'+
                        		tagsInnerHtmlContainer+
								'<div class="btnBar">'+
									'<div class="fixWidth">'+
										'<div class="cancel">'+ cancelText +'</div>'+
										'<div class="title"></div>'+
										'<div class="ensure">'+ ensureText +'</div>'+
									'</div>'+
								'</div>'+
								// '<div class="panel">'+
								// 	'<div class="fixWidth">'+
								// 		'<div class="wheels">'+
								// 		'</div>'+
								// 	'<div class="selectLine"></div>'+
								// 	'<div class="shadowMask"></div>'+
								// '</div>'+
								'<div class="mobileWindow-input-container">'+
                        			'<div class="mobileWindow-input-wrapper">'+
                        				'<textarea class="mobileWindow-textArea">'+
                        				'</textarea>'+
                        				'<div class="mobileWindow-button-save">'+'确认'+'</div>'+
                        			'</div>'+
                        		'</div>'+

							'</div>'+
                        '</div>';

                }


            } else {


                console.log('_this.jsonType == ', _this.jsonType);


                // wheelsDataTemp = wheelsData;

                _this.mobileWindow.innerHTML =
                    '<div class="grayLayer"></div>' +
                    '<div class="content">' +
                    '<div class="btnBar">' +
                    '<div class="fixWidth">' +
                    '<div class="cancel">' + cancelText + '</div>' +
                    '<div class="title"></div>' +
                    '<div class="ensure">' + ensureText + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="panel">' +
                    '<div class="fixWidth">' +
                    '<div class="wheels">' +
                    '</div>' +
                    '<div class="selectLine"></div>' +
                    '<div class="shadowMask"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

            }
            document.body.appendChild(_this.mobileWindow);

            //根据数据长度来渲染

			// console.log('渲染输入页面');

            // _this.mobileWindow.querySelector('.wheels').innerHTML = '123';

        },
        addListenerAll: function(){
			var _this = this;

			// console.log('_this.mobileWindowSetting === ', _this.mobileWindowSetting)

			if(_this.mobileWindowSetting !== undefined) {

				if(_this.mobileWindowSetting.type === 'input') {
                    _this.addListenerTextArea(_this.textArea[0]);
				} else if(_this.mobileWindowSetting.type === 'selectTag') {
                    for(var i=0; i<_this.slider.length; i++){
                        //手势监听
                        (function (i) {
                            _this.addListenerWheel(_this.wheel[i], i);
                        })(i);
                    }
				}

			} else {
                for(var i=0; i<_this.slider.length; i++){
                    //手势监听
                    (function (i) {
                        _this.addListenerWheel(_this.wheel[i], i);
                    })(i);
                }
            }
		},

		addListenerWheel: function(theWheel, index){
			var _this = this;
			theWheel.addEventListener('touchstart', function () {
				_this.touch(event, this.firstChild, index);
			},false);
			theWheel.addEventListener('touchend', function () {
				_this.touch(event, this.firstChild, index);
			},false);
			theWheel.addEventListener('touchmove', function () {
				_this.touch(event, this.firstChild, index);
			},false);

			if(_this.isPC){
				//如果是PC端则再增加拖拽监听 方便调试
				theWheel.addEventListener('mousedown', function () {
					_this.dragClick(event, this.firstChild, index);
				},false);
				theWheel.addEventListener('mousemove', function () {
					_this.dragClick(event, this.firstChild, index);
				},false);
				theWheel.addEventListener('mouseup', function () {
					_this.dragClick(event, this.firstChild, index);
				},true);
			}
		},

        addListenerTextArea: function(textArea){
            var _this = this;
            // console.log('textArea === ', textArea);
            textArea.addEventListener('input', function (ev) {
                // console.log('ev === ', ev);
                ev.stopPropagation();
            });
        },
        checkDataType: function(data){
			var _this = this;
            // if(typeof(_this.wheelsData[0].data[0])=='object'){
            // 	_this.jsonType = true;
            // }

            // console.log('checkDataType == ', _this.wheelsData[0].data[0]);
            // console.log(_this.wheelsData[0].data[0] instanceof Array);

            if(data instanceof Object){
                _this.jsonType = true;
            	if(data instanceof Array) {
                    _this.dataTypeInit = 'array';
				} else {
                    _this.dataTypeInit = 'object';
				}
            }
		},

		checkCascade: function(){
			var _this = this;
			if(_this.jsonType){
				var node = _this.wheelsData[0].data;
				for(var i=0; i<node.length; i++){
					if(_this.keyMap.childs in node[i] && node[i][_this.keyMap.childs].length > 0){
						_this.cascade = true;
						_this.cascadeJsonData = _this.wheelsData[0].data;
						break;
					}
				}
			}else{
				_this.cascade = false;
			}
		},

		generateArrData: function (targetArr) {
			var tempArr = [];
			var keyMap_id = this.keyMap.id;
			var keyMap_value = this.keyMap.value;
			for(var i=0; i<targetArr.length; i++){
				var tempObj = {};
				tempObj[keyMap_id] = targetArr[i][this.keyMap.id];
				tempObj[keyMap_value] = targetArr[i][this.keyMap.value];
				tempArr.push(tempObj);
			}
			return tempArr;
		},

		initCascade: function(){
			var _this = this;
			_this.displayJson.push(_this.generateArrData(_this.cascadeJsonData));
			if(_this.initPosition.length>0){
				_this.initDeepCount = 0;
				_this.initCheckArrDeep(_this.cascadeJsonData[_this.initPosition[0]]);
			}else{
				_this.checkArrDeep(_this.cascadeJsonData[0]);
			}
			_this.reRenderWheels();
		},

		initCheckArrDeep: function (parent) {
			var _this = this;
			if(parent){
				if (_this.keyMap.childs in parent && parent[_this.keyMap.childs].length > 0) {
					_this.displayJson.push(_this.generateArrData(parent[_this.keyMap.childs]));
					_this.initDeepCount++;
					var nextNode = parent[_this.keyMap.childs][_this.initPosition[_this.initDeepCount]];
					if(nextNode){
						_this.initCheckArrDeep(nextNode);
					}else{
						_this.checkArrDeep(parent[_this.keyMap.childs][0]);
					}
				}
			}
		},

		checkArrDeep: function (parent) {
			//检测子节点深度  修改 displayJson
			var _this = this;
			if(parent){
				if (_this.keyMap.childs in parent && parent[_this.keyMap.childs].length > 0) {
					_this.displayJson.push(_this.generateArrData(parent[_this.keyMap.childs])); //生成子节点数组
					_this.checkArrDeep(parent[_this.keyMap.childs][0]);//检测下一个子节点
				}
			}
		},

		checkRange: function(index, posIndexArr){
			var _this = this;
			var deleteNum = _this.displayJson.length-1-index;
			for(var i=0; i<deleteNum; i++){
				_this.displayJson.pop(); //修改 displayJson
			}
			var resultNode;
			for (var i = 0; i <= index; i++){
				if (i == 0)
					resultNode = _this.cascadeJsonData[posIndexArr[0]];
				else {
					resultNode = resultNode[_this.keyMap.childs][posIndexArr[i]];
				}
			}
			_this.checkArrDeep(resultNode);
			//console.log(_this.displayJson);
			_this.reRenderWheels();
			_this.fixRowStyle();
			_this.setCurDistance(_this.resetPosition(index, posIndexArr));
		},

		resetPosition: function(index, posIndexArr){
			var _this = this;
			var tempPosArr = posIndexArr;
			var tempCount;
			if(_this.slider.length > posIndexArr.length){
				tempCount = _this.slider.length - posIndexArr.length;
				for(var i=0; i<tempCount; i++){
					tempPosArr.push(0);
				}
			}else if(_this.slider.length < posIndexArr.length){
				tempCount = posIndexArr.length - _this.slider.length;
				for(var i=0; i<tempCount; i++){
					tempPosArr.pop();
				}
			}
			for(var i=index+1; i< tempPosArr.length; i++){
				tempPosArr[i] = 0;
			}
			return tempPosArr;
		},

		reRenderWheels: function(){
			var _this = this;
			//删除多余的wheel
			if(_this.wheel.length > _this.displayJson.length){
				var count = _this.wheel.length - _this.displayJson.length;
				for(var i=0; i<count; i++){
					_this.wheels.removeChild(_this.wheel[_this.wheel.length-1]);
				}
			}
			for(var i=0; i<_this.displayJson.length; i++){
			//列
				(function (i) {
					var tempHTML='';
					if(_this.wheel[i]){
						//console.log('插入Li');
						for(var j=0; j<_this.displayJson[i].length; j++){
						//行
							tempHTML += '<li data-id="'+_this.displayJson[i][j][_this.keyMap.id]+'">'+_this.displayJson[i][j][_this.keyMap.value]+'</li>';
						}
						_this.slider[i].innerHTML = tempHTML;

					}else{
						var tempWheel = document.createElement("div");
						tempWheel.className = "wheel";
						tempHTML = '<ul class="selectContainer">';
						for(var j=0; j<_this.displayJson[i].length; j++){
						//行
							tempHTML += '<li data-id="'+_this.displayJson[i][j][_this.keyMap.id]+'">'+_this.displayJson[i][j][_this.keyMap.value]+'</li>';
						}
						tempHTML += '</ul>';
						tempWheel.innerHTML = tempHTML;

						_this.addListenerWheel(tempWheel, i);
				    	_this.wheels.appendChild(tempWheel);
					}
					//_this.·(i);
				})(i);
			}
		},

		updateWheels:function(data){
			var _this = this;
			if(_this.cascade){
				_this.cascadeJsonData = data;
				_this.displayJson = [];
				_this.initCascade();
				if(_this.initPosition.length < _this.slider.length){
					var diff = _this.slider.length - _this.initPosition.length;
					for(var i=0; i<diff; i++){
						_this.initPosition.push(0);
					}
				}
				_this.setCurDistance(_this.initPosition);
				_this.fixRowStyle();
			}
		},

		updateWheel: function(sliderIndex, data){
			var _this = this;
			var tempHTML='';
	    	if(_this.cascade){
	    		console.error('级联格式不支持updateWheel(),请使用updateWheels()更新整个数据源');
				return false;
	    	}
	    	else if(_this.jsonType){
				for(var j=0; j<data.length; j++){
					tempHTML += '<li data-id="'+data[j][_this.keyMap.id]+'">'+data[j][_this.keyMap.value]+'</li>';
				}
				_this.wheelsData[sliderIndex] = {data: data};
	    	}else{
				for(var j=0; j<data.length; j++){
					tempHTML += '<li>'+data[j]+'</li>';
				}
				_this.wheelsData[sliderIndex] = data;
	    	}
			_this.slider[sliderIndex].innerHTML = tempHTML;
		},

		fixRowStyle: function(){
			var _this = this;
			var width = (100/_this.wheel.length).toFixed(2);
			for(var i=0; i<_this.wheel.length; i++){
				_this.wheel[i].style.width = width+'%';
			}
		},

	    getIndex: function(distance){
	        return Math.round((2*this.liHeight-distance)/this.liHeight);
	    },

	    getIndexArr: function(){
	    	var _this = this;
	    	var temp = [];
	    	for(var i=0; i<_this.curDistance.length; i++){
	    		temp.push(_this.getIndex(_this.curDistance[i]));
	    	}
	    	return temp;
	    },

	    getCurValue: function(){
	    	var _this = this;
	    	var temp = [];
	    	var positionArr = _this.getIndexArr();

	    	// console.log('positionArr === ', positionArr);
	    	if(_this.cascade){
		    	for(var i=0; i<_this.wheel.length; i++){
		    		temp.push(_this.displayJson[i][positionArr[i]]);
		    	}
	    	}
            // else if(_this.jsonType){
            //     for(var i=0; i<_this.curDistance.length; i++){
            //         temp.push(_this.wheelsData[i].data[_this.getIndex(_this.curDistance[i])]);
            //     }
            // }

            else if(_this.jsonType && _this.dataTypeInit === 'object'){
                for(var i=0; i<_this.curDistance.length; i++){
                    temp.push(_this.wheelsData[i].data[_this.getIndex(_this.curDistance[i])]);
                }
            }
	    	else{
		    	for(var i=0; i<_this.curDistance.length; i++){
		    		temp.push(_this.getInnerHtml(i));
		    	}
	    	}
	    	return temp;
	    },

	    getValue: function(){
	    	return this.curValue;
	    },

	    calcDistance: function(index){
			return 2*this.liHeight-index*this.liHeight;
	    },

	    setCurDistance: function(indexArr){
	    	var _this = this;
	    	var temp = [];
	    	for(var i=0; i<_this.slider.length; i++){
	    		temp.push(_this.calcDistance(indexArr[i]));
	    		_this.movePosition(_this.slider[i],temp[i]);
	    	}
	    	_this.curDistance = temp;
	    },

	    fixPosition: function(distance){
	        return -(this.getIndex(distance)-2)*this.liHeight;
	    },

	    movePosition: function(theSlider, distance){
	        theSlider.style.webkitTransform = 'translate3d(0,' + distance + 'px, 0)';
	        theSlider.style.transform = 'translate3d(0,' + distance + 'px, 0)';
	    },

	    locatePosition: function(index, posIndex){
	    	var _this = this;
  	    	this.curDistance[index] = this.calcDistance(posIndex);
  	    	this.movePosition(this.slider[index],this.curDistance[index]);
	        if(_this.cascade){
		    	_this.checkRange(index, _this.getIndexArr());
			}
	    },

	    updateCurDistance: function(theSlider, index){
	        if(theSlider.style.transform){
				this.curDistance[index] = parseInt(theSlider.style.transform.split(',')[1]);
	        }else{
				this.curDistance[index] = parseInt(theSlider.style.webkitTransform.split(',')[1]);
	        }
	    },

	    getDistance:function(theSlider){
	    	if(theSlider.style.transform){
	    		return parseInt(theSlider.style.transform.split(',')[1]);
	    	}else{
	    		return parseInt(theSlider.style.webkitTransform.split(',')[1]);
	    	}
	    },

	    getInnerHtml: function(sliderIndex){
	    	var _this = this;
	    	var index = _this.getIndex(_this.curDistance[sliderIndex]);
	    	return _this.slider[sliderIndex].getElementsByTagName('li')[index].innerHTML;
	    },

	    touch: function(event, theSlider, index){

			// console.log('触发 touch 事件');


	    	var _this = this;
	    	event = event || window.event;
	    	switch(event.type){
	    		case "touchstart":
			        _this.startY = event.touches[0].clientY;
			        _this.startY = parseInt(_this.startY);
			        _this.oldMoveY = _this.startY;
	    			break;

	    		case "touchend":

	    			// console.log('触发touchend');
			        _this.moveEndY = parseInt(event.changedTouches[0].clientY);
			        _this.offsetSum = _this.moveEndY - _this.startY;
					_this.oversizeBorder = -(theSlider.getElementsByTagName('li').length-3)*_this.liHeight;

					if(_this.offsetSum == 0){
						//offsetSum为0,相当于点击事件
						// 0 1 [2] 3 4
						var clickOffetNum = parseInt((document.documentElement.clientHeight - _this.moveEndY)/40);
						if(clickOffetNum!=2){
							var offset = clickOffetNum - 2;
							var newDistance = _this.curDistance[index] + (offset*_this.liHeight);
							if((newDistance <= 2*_this.liHeight) && (newDistance >= _this.oversizeBorder) ){
								_this.curDistance[index] = newDistance;
								_this.movePosition(theSlider, _this.curDistance[index]);
								_this.transitionEnd(_this.getIndexArr(),_this.getCurValue());
							}
						}
					}else{
						//修正位置
						_this.updateCurDistance(theSlider, index);
						_this.curDistance[index] = _this.fixPosition(_this.curDistance[index]);
						_this.movePosition(theSlider, _this.curDistance[index]);

				        //反弹
				        if(_this.curDistance[index] + _this.offsetSum > 2*_this.liHeight){
				            _this.curDistance[index] = 2*_this.liHeight;
				            setTimeout(function(){
				                _this.movePosition(theSlider, _this.curDistance[index]);
				            }, 100);

				        }else if(_this.curDistance[index] + _this.offsetSum < _this.oversizeBorder){
				            _this.curDistance[index] = _this.oversizeBorder;
				            setTimeout(function(){
				                _this.movePosition(theSlider, _this.curDistance[index]);
				            }, 100);
				        }
						_this.transitionEnd(_this.getIndexArr(),_this.getCurValue());
					}

 			        if(_this.cascade){
				        _this.checkRange(index, _this.getIndexArr());
				    }

	    			break;

	    		case "touchmove":
			        event.preventDefault();
			        _this.moveY = event.touches[0].clientY;
			        _this.offset = _this.moveY - _this.oldMoveY;

			        _this.updateCurDistance(theSlider, index);
			        _this.curDistance[index] = _this.curDistance[index] + _this.offset;
			        _this.movePosition(theSlider, _this.curDistance[index]);
			        _this.oldMoveY = _this.moveY;
	    			break;
	    	}
	    },

	    dragClick: function(event, theSlider, index){
	    	var _this = this;
	    	event = event || window.event;
	    	switch(event.type){
	    		case "mousedown":
			        _this.startY = event.clientY;
			        _this.oldMoveY = _this.startY;
			        _this.clickStatus = true;
	    			break;

	    		case "mouseup":

			        _this.moveEndY = event.clientY;
			        _this.offsetSum = _this.moveEndY - _this.startY;
					_this.oversizeBorder = -(theSlider.getElementsByTagName('li').length-3)*_this.liHeight;

					if(_this.offsetSum == 0){
						var clickOffetNum = parseInt((document.documentElement.clientHeight - _this.moveEndY)/40);
						if(clickOffetNum!=2){
							var offset = clickOffetNum - 2;
							var newDistance = _this.curDistance[index] + (offset*_this.liHeight);
							if((newDistance <= 2*_this.liHeight) && (newDistance >= _this.oversizeBorder) ){
								_this.curDistance[index] = newDistance;
								_this.movePosition(theSlider, _this.curDistance[index]);
								_this.transitionEnd(_this.getIndexArr(),_this.getCurValue());
							}
						}
					}else{
						//修正位置
						_this.updateCurDistance(theSlider, index);
						_this.curDistance[index] = _this.fixPosition(_this.curDistance[index]);
						_this.movePosition(theSlider, _this.curDistance[index]);

						//反弹
						if(_this.curDistance[index] + _this.offsetSum > 2*_this.liHeight){
						    _this.curDistance[index] = 2*_this.liHeight;
						    setTimeout(function(){
						        _this.movePosition(theSlider, _this.curDistance[index]);
						    }, 100);

						}else if(_this.curDistance[index] + _this.offsetSum < _this.oversizeBorder){
						    _this.curDistance[index] = _this.oversizeBorder;
						    setTimeout(function(){
						        _this.movePosition(theSlider, _this.curDistance[index]);
						    }, 100);
						}
						_this.transitionEnd(_this.getIndexArr(),_this.getCurValue());

					}

			        _this.clickStatus = false;
 			        if(_this.cascade){
				        _this.checkRange(index, _this.getIndexArr());
			    	}
	    			break;

	    		case "mousemove":
			        event.preventDefault();
			        if(_this.clickStatus){
				        _this.moveY = event.clientY;
				        _this.offset = _this.moveY - _this.oldMoveY;
				        _this.updateCurDistance(theSlider, index);
				        _this.curDistance[index] = _this.curDistance[index] + _this.offset;
				        _this.movePosition(theSlider, _this.curDistance[index]);
				        _this.oldMoveY = _this.moveY;
			        }
	    			break;
	    	}
	    },
        strTrim: function(str) {

            return str.replace(/(^\s*)|(\s*$)/g, '');
        },
        changeTag: function(wheelsData, tagIndex) {
            var _this = this;
            var tempHTML = '';

            _this.mobileWindowSetting['tagIndexSelected'] = tagIndex;

            // console.log('tag wheelsData[0].data[tagIndex] == ', wheelsData[0].data[tagIndex]);

            // _this.checkDataType()

            // _this.checkDataType(wheelsData[0].data[tagIndex]);



            var arrOptions = wheelsData[0].data[tagIndex];

            // console.log('arrOptions === ', arrOptions);

            _this.checkDataType(arrOptions[0]);

            // console.log('_this.dataTypeInit === ', _this.dataTypeInit);

            if(arrOptions[0] instanceof Array) {
                var ulAccount = arrOptions.length;
                for(var i=0; i<ulAccount; i++) {
                    // for(var i=0; i<wheelsData.length; i++){
                    //列
                    tempHTML += '<div class="wheel"><ul class="selectContainer">';
                    // console.log(_this.jsonType);

                    // console.log('循环遍历', wheelsData[i].data[0][0]);

                    // if(wheelsData[i].data[0][0] instanceof Array) {
                    //
                    // } else {


                    if (_this.jsonType && _this.dataTypeInit === 'object') {
                        // for(var j=0; j<wheelsData[i].data[0].length; j++){
                        for (var j = 0; j < wheelsData[i].data[0].length; j++) {
                            //行

                            console.log(wheelsData[i].data[0][j]);
                            tempHTML += '<li data-id="' + wheelsData[i].data[0][j][_this.keyMap.id] + '">' + wheelsData[i].data[0][j][_this.keyMap.value] + '</li>';
                        }
                    }
                    else {

                        // for(var j=0; j<wheelsData[i].data[0].length; j++){

                        for (var j = 0; j < arrOptions[i].length; j++) {
                            //行
                            // tempHTML += '<li>'+wheelsData[i].data[0][0][j]+'</li>';


                            tempHTML += '<li>' + arrOptions[i][j] + '</li>';
                        }
                    }
                    // }


                    tempHTML += '</ul></div>';
                }

                _this.mobileSelect.querySelector('.wheels').innerHTML = tempHTML;

            } else {
                for(var i=0; i<wheelsData.length; i++){
                    // for(var i=0; i<wheelsData.length; i++){
                    //列
                    tempHTML += '<div class="wheel"><ul class="selectContainer">';
                    // console.log(_this.jsonType);
                    if(_this.jsonType && _this.dataTypeInit === 'object'){
                        for(var j=0; j<wheelsData[i].data[tagIndex].length; j++){
                            //行
                            console.log(wheelsData[i].data[tagIndex][j]);
                            tempHTML += '<li data-id="'+wheelsData[i].data[tagIndex][j][_this.keyMap.id]+'">'+wheelsData[i].data[tagIndex][j][_this.keyMap.value]+'</li>';
                        }
                    }
                    else {

                        for(var j=0; j<wheelsData[i].data[tagIndex].length; j++){
                            //行
                            tempHTML += '<li>'+wheelsData[i].data[tagIndex][j]+'</li>';
                        }
                    }
                    tempHTML += '</ul></div>';
                }

                _this.mobileSelect.querySelector('.wheels').innerHTML = tempHTML;
            }




            _this.initPosition.push(0);
            _this.setCurDistance(_this.initPosition);

            // _this.setStyle(config);

			// console.log('changeTag === ', _this.titleText[1]);

			// console.log(_this.mobileWindowSetting.titles);

            _this.setTitle(_this.mobileSelect, _this.mobileWindowSetting.titles[tagIndex]);
            _this.checkIsPC();
            _this.checkCascade();
            _this.addListenerAll();

            _this.popUp.addEventListener('click',function(){
                event.stopPropagation();
            });

            _this.fixRowStyle(); //修正列数

		},
        validateRegex: function(objRegex) {
            // console.log('objRegex === ', objRegex);
            var result = false;
            if(objRegex['type'] === 'number') {
                var regInt = /^(\d*)$/g;
                if(regInt.test(objRegex['value'])) {
                    result = true;
                } else {
                    result = false;
                }
            }
            return result;

        }
	};

	if (typeof exports =="object") {
		// module.exports = MobileSelect;
        module.exports = MobileWindow;
	} else if (typeof define == "function" && define.amd) {
		define([], function () {
			// return MobileSelect;
			return MobileWindow;
		})
	} else {
		// window.MobileSelect = MobileSelect;
        window.MobileWindow = MobileWindow;
	}
})();
